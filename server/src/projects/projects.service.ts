import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Project } from './project.entity.js'
import { CreateProjectDto, UpdateProjectDto } from './dto.js'

// Shape que el frontend consume (igual que client/src/data/projects.ts).
function toApi(p: Project) {
  return {
    slug: p.slug,
    title: p.title,
    year: p.year,
    category: p.category,
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
    return toApi(await this.repo.save(p))
  }

  async update(id: number, dto: UpdateProjectDto) {
    const p = await this.repo.findOne({ where: { id } })
    if (!p) throw new NotFoundException(`No existe el proyecto #${id}`)
    this.repo.merge(p, dto)
    return toApi(await this.repo.save(p))
  }

  async remove(id: number) {
    const result = await this.repo.delete(id)
    if (!result.affected) {
      throw new NotFoundException(`No existe el proyecto #${id}`)
    }
    return { deleted: true }
  }
}
