import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Project } from './project.js'
import { JsonFile, writeJson } from '../json-file.js'
import type { JsonData } from '../json-file.js'
import { CreateProjectDto, UpdateProjectDto } from './dto.js'
import { translateProject, translationSourceHash } from './translation.js'
import { uploadsDirectory } from '../storage-paths.js'

// Shape que el frontend consume (igual que client/src/data/projects.ts).
function toApi(p: Project) {
  return {
    slug: p.slug,
    title: p.title,
    year: p.year,
    category: p.category,
    categories: p.categories?.length ? p.categories : [p.category],
    credits: { es: p.creditsEs ?? '', en: p.creditsEn ?? '' },
    contributors: p.contributors ?? [],
    gallery: p.gallery ?? [],
    documentUrl: p.documentUrl,
    translationStatus: p.translationStatus,
    translationError: p.translationError,
    kind: p.kind,
    cover: p.cover ?? undefined,
    tools: p.tools ?? [],
    summary: { es: p.summaryEs, en: p.summaryEn },
    body:
      p.bodyEs || p.bodyEn
        ? { es: p.bodyEs ?? '', en: p.bodyEn ?? '' }
        : undefined,
    sections:
      p.sections?.map((s) => ({
        key: s.key,
        image: s.image ?? undefined,
        body: { es: s.es, en: s.en },
      })) ?? undefined,
    attachments: p.attachments ?? undefined,
    featured: p.featured,
    published: p.published,
    sortOrder: p.sortOrder,
  }
}

@Injectable()
export class ProjectsService implements OnModuleInit {
  private readonly store: JsonFile<Project>
  private readonly logger = new Logger(ProjectsService.name)
  private readonly clientDir: string
  constructor(config: ConfigService) {
    this.store = new JsonFile(resolve(config.get<string>('DATA_DIR', 'data'), 'projects.json'))
    this.clientDir = config.get<string>('STATIC_CLIENT_DIR', resolve('../client'))
  }

  async onModuleInit() { await this.store.read() }

  async refreshStatic() { await this.exportStatic((await this.store.read()).items) }

  private sorted(rows: Project[]) {
    return rows.sort((a, b) => a.sortOrder - b.sortOrder || b.year - a.year || a.id - b.id)
  }

  // Público: solo publicados, ordenados.
  async findPublished() {
    const rows = this.sorted((await this.store.read()).items.filter((p) => p.published))
    return rows.map(toApi)
  }

  async findFeatured() {
    const rows = (await this.store.read()).items.filter((p) => p.published && p.featured).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    return rows.map(toApi)
  }

  // Admin: todos, incluidos borradores.
  async findAll() {
    const rows = this.sorted((await this.store.read()).items)
    return rows.map((p) => ({ id: p.id, ...toApi(p) }))
  }

  async findBySlug(slug: string, includeDrafts = false) {
    const p = (await this.store.read()).items.find((p) => p.slug === slug)
    if (!p || (!includeDrafts && !p.published)) {
      throw new NotFoundException(`No existe el proyecto "${slug}"`)
    }
    return toApi(p)
  }

  async create(dto: CreateProjectDto) {
    const p = { translationStatus: 'pending', translationSourceHash: null, translationError: null, ...dto } as Project
    await translateProject(p)
    const { value, staticExportError } = await this.change((data) => {
      p.id = data.nextId++
      this.uniqueSlug(p, data.items)
      data.items.push(p)
      return p
    })
    return { id: value.id, ...toApi(value), staticExportError }
  }

  async update(id: number, dto: UpdateProjectDto) {
    const { value, staticExportError } = await this.change(async (data) => {
      const p = data.items.find((p) => p.id === id)
      if (!p) throw new NotFoundException(`No existe el proyecto #${id}`)
      const { translationReviewed, ...changes } = dto
      // class-transformer incluye campos opcionales undefined; conservar los existentes.
      Object.assign(p, Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined)))
      if (translationReviewed) {
        const pairs = [[p.summaryEs, p.summaryEn], [p.bodyEs, p.bodyEn], [p.creditsEs, p.creditsEn], ...(p.gallery ?? []).map((row) => [row.es, row.en])]
        if (pairs.some(([es, en]) => es?.trim() && !en?.trim())) throw new BadRequestException('Faltan textos en inglés para marcar la traducción como revisada.')
        p.translationStatus = 'reviewed'
        p.translationSourceHash = translationSourceHash(p)
        p.translationError = null
      }
      await translateProject(p)
      this.uniqueSlug(p, data.items)
      return p
    })
    return { id: value.id, ...toApi(value), staticExportError }
  }

  async remove(id: number) {
    const { staticExportError } = await this.change((data) => {
      const index = data.items.findIndex((p) => p.id === id)
      if (index === -1) throw new NotFoundException(`No existe el proyecto #${id}`)
      data.items.splice(index, 1)
    })
    return { deleted: true, staticExportError }
  }

  private uniqueSlug(project: Project, rows: Project[]) {
    const base = project.slug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120)
    if (base.length < 2) throw new BadRequestException('El enlace del proyecto necesita al menos dos letras o números.')
    project.slug = base
    let suffix = 1
    while (rows.some((p) => p.slug === project.slug && p.id !== project.id)) {
      const ending = `-${++suffix}`
      project.slug = base.slice(0, 120 - ending.length) + ending
    }
  }

  private async change<R>(operation: (data: JsonData<Project>) => R | Promise<R>) {
    let staticExportError: string | null = null
    const value = await this.store.update(operation, async (data) => {
      try { await this.exportStatic(data.items) }
      catch (error) {
        this.logger.error(error)
        staticExportError = 'El proyecto se guardó en JSON, pero no se pudo actualizar la copia pública. Comprueba los archivos y vuelve a guardar.'
      }
    })
    return { value, staticExportError }
  }

  private async exportStatic(rows: Project[]) {
    if (!this.clientDir || !(await stat(this.clientDir).catch(() => null))?.isDirectory()) return
    let projects = this.sorted(rows.filter((p) => p.published)).map((p) => {
      const { published, sortOrder, translationStatus, translationError, ...publicProject } = toApi(p)
      return publicProject
    })
    const assets = new Set(projects.flatMap((p) => [p.cover, p.documentUrl, ...p.gallery.map((row) => row.url), ...(p.attachments ?? []).map((row) => row.url), ...(p.sections ?? []).map((row) => row.image)]).filter((url): url is string => Boolean(url)))
    await mkdir(join(this.clientDir, 'public/uploads'), { recursive: true })
    for (const url of assets) {
      if (!url.startsWith('/uploads/')) continue
      if (!/^\/uploads\/[\w.-]+$/.test(url) || url.includes('..')) throw new Error('Ruta de archivo no permitida.')
      const source = join(uploadsDirectory(), url.slice('/uploads/'.length))
      const target = join(this.clientDir, 'public', url)
      const original = await stat(source)
      // Los nombres de subida son únicos: no copiar cientos de MB en cada guardado.
      if ((await stat(target).catch(() => null))?.size !== original.size) await copyFile(source, target)
    }
    const { optimizeImages } = await import(pathToFileURL(resolve('../scripts/optimize-images.mjs')).href)
    projects = await optimizeImages(projects, join(this.clientDir, 'public'))
    const path = join(this.clientDir, 'src/data/projects.json')
    if (await readFile(path, 'utf8').catch(() => '') !== JSON.stringify(projects, null, 2) + '\n') await writeJson(path, projects)
  }
}
