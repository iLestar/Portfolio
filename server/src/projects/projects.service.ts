import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Project } from './project.entity.js'
import { CreateProjectDto, UpdateProjectDto } from './dto.js'
import { translateProject, translationSourceHash } from './translation.js'

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
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
  ) {}

  // Público: solo publicados, ordenados.
  async findPublished() {
    const rows = await this.repo.find({
      where: { published: true },
      order: { sortOrder: 'ASC', year: 'DESC', id: 'ASC' },
    })
    return rows.map(toApi)
  }

  async findFeatured() {
    const rows = await this.repo.find({
      where: { published: true, featured: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    })
    return rows.map(toApi)
  }

  // Admin: todos, incluidos borradores.
  async findAll() {
    const rows = await this.repo.find({
      order: { sortOrder: 'ASC', year: 'DESC', id: 'ASC' },
    })
    return rows.map((p) => ({ id: p.id, ...toApi(p) }))
  }

  async findBySlug(slug: string, includeDrafts = false) {
    const p = await this.repo.findOne({ where: { slug } })
    if (!p || (!includeDrafts && !p.published)) {
      throw new NotFoundException(`No existe el proyecto "${slug}"`)
    }
    return toApi(p)
  }

  async create(dto: CreateProjectDto) {
    const p = this.repo.create(dto)
    await translateProject(p)
    const saved = await this.saveWithUniqueSlug(p)
    return { id: saved.id, ...toApi(saved) }
  }

  async update(id: number, dto: UpdateProjectDto) {
    const p = await this.repo.findOne({ where: { id } })
    if (!p) throw new NotFoundException(`No existe el proyecto #${id}`)
    const { translationReviewed, ...changes } = dto
    this.repo.merge(p, changes)
    if (translationReviewed) {
      const pairs = [[p.summaryEs, p.summaryEn], [p.bodyEs, p.bodyEn], [p.creditsEs, p.creditsEn], ...(p.gallery ?? []).map((row) => [row.es, row.en])]
      if (pairs.some(([es, en]) => es?.trim() && !en?.trim())) throw new BadRequestException('Faltan textos en inglés para marcar la traducción como revisada.')
      p.translationStatus = 'reviewed'
      p.translationSourceHash = translationSourceHash(p)
      p.translationError = null
    }
    await translateProject(p)
    const saved = await this.saveWithUniqueSlug(p)
    return { id: saved.id, ...toApi(saved) }
  }

  async remove(id: number) {
    const result = await this.repo.delete(id)
    if (!result.affected) {
      throw new NotFoundException(`No existe el proyecto #${id}`)
    }
    return { deleted: true }
  }

  private async saveWithUniqueSlug(project: Project) {
    const base = project.slug
    let suffix = 1
    let existing = await this.repo.findOne({ where: { slug: project.slug } })
    while (existing && existing.id !== project.id) {
      const ending = `-${++suffix}`
      project.slug = base.slice(0, 120 - ending.length) + ending
      existing = await this.repo.findOne({ where: { slug: project.slug } })
    }
    try {
      return await this.repo.save(project)
    } catch (error) {
      // A simultaneous save may claim the URL after the availability check.
      if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Otro proyecto acaba de utilizar este enlace. Vuelve a guardar para generar uno disponible.')
      }
      throw error
    }
  }
}
