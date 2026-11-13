import 'reflect-metadata'
import { afterEach, expect, it, vi } from 'vitest'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { CreateProjectDto, UpdateProjectDto } from './dto.js'
import { translateProject, translationSourceHash } from './translation.js'
import type { Project } from './project.entity.js'
import { ProjectsService } from './projects.service.js'

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

it('preserves reviewed English on unrelated saves and retranslates after Spanish changes', async () => {
  vi.stubEnv('TRANSLATE_URL', 'http://localhost:5000/translate')
  const fetcher = vi.fn().mockResolvedValue({ ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({ translatedText: ['Updated magazine'] }) })
  vi.stubGlobal('fetch', fetcher)
  const project = { summaryEs: 'Revista', summaryEn: 'Reviewed magazine', translationStatus: 'reviewed' } as Project
  project.translationSourceHash = translationSourceHash(project)
  await translateProject(project)
  expect(fetcher).not.toHaveBeenCalled()
  expect(project.summaryEn).toBe('Reviewed magazine')
  project.summaryEs = 'Revista actualizada'
  await translateProject(project)
  expect(fetcher).toHaveBeenCalledOnce()
  expect(project.summaryEn).toBe('Updated magazine')
})

it('accepts team names with optional web profiles and rejects blank names or unsafe protocols', async () => {
  const dto = plainToInstance(UpdateProjectDto, { contributors: [
    { name: ' Mariajosé Hernández ', url: 'https://www.instagram.com/example/' },
    { name: 'Jose Montoya', url: '' },
  ] })
  expect(await validate(dto)).toHaveLength(0)
  expect(dto.contributors?.[0].name).toBe('Mariajosé Hernández')
  expect(dto.contributors?.[1].url).toBeNull()
  for (const person of [{ name: '  ', url: null }, { name: 'Let', url: 'javascript:alert(1)' }, { name: 'Let', url: 'ftp://example.com/file' }]) {
    const invalid = plainToInstance(UpdateProjectDto, { contributors: [person] })
    expect((await validate(invalid)).map((error) => error.property)).toContain('contributors')
  }
})

it('returns saved team members and preserves the existing credit text', async () => {
  vi.stubEnv('TRANSLATE_URL', '')
  const project = { id: 1, slug: 'musea', title: 'Musea', summaryEs: '', creditsEs: 'Mi aporte: portada', tools: [] }
  const repo = { findOne: vi.fn().mockResolvedValue(project), merge: Object.assign, save: vi.fn(async (p) => p) }
  const service = new ProjectsService(repo as never)
  const contributors = [{ name: 'Let', url: null }, { name: 'Mariajosé Hernández', url: 'https://www.instagram.com/example/' }]
  const saved = await service.update(1, { contributors })
  expect(saved.contributors).toEqual(contributors)
  expect(saved.credits.es).toBe('Mi aporte: portada')
  expect((await service.update(1, { contributors: [] })).contributors).toEqual([])
})

it('accepts multiple disciplines, defaults to draft, rejects unsafe gallery and PDF URLs', async () => {
  const data = { title: 'Musea', slug: 'musea', year: 2026, category: 'editorial', categories: ['editorial', 'branding', 'retoque'], kind: 'result', summaryEs: '', summaryEn: '' }
  const draft = plainToInstance(CreateProjectDto, data)
  expect(await validate(draft)).toHaveLength(0)
  expect(draft.published).toBe(false)
  const invalid = plainToInstance(CreateProjectDto, { ...data, categories: ['unknown'], gallery: [{ url: 'javascript:alert(1)', es: '', en: '' }], documentUrl: 'https://untrusted.example/x.pdf' })
  expect((await validate(invalid)).map((error) => error.property)).toEqual(expect.arrayContaining(['categories', 'gallery', 'documentUrl']))
})

it('keeps Spanish content when translation is unavailable', async () => {
  vi.stubEnv('TRANSLATE_URL', '')
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher)
  const project = { summaryEs: 'Revista', summaryEn: '', bodyEs: null, creditsEs: 'Equipo de tres', gallery: [] } as unknown as Project
  await translateProject(project)
  expect(project.summaryEs).toBe('Revista')
  expect(project.translationStatus).toBe('pending')
  expect(fetcher).not.toHaveBeenCalled()
})

it('translates summary, credits and image captions in one request', async () => {
  vi.stubEnv('TRANSLATE_URL', 'http://localhost:5000/translate')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({ translatedText: ['Magazine', 'Team of three', 'My cover'] }) }))
  const project = { summaryEs: 'Revista', bodyEs: null, creditsEs: 'Equipo de tres', gallery: [{ url: '/uploads/cover.jpg', es: 'Mi portada', en: '' }] } as unknown as Project
  await translateProject(project)
  expect(project.summaryEn).toBe('Magazine')
  expect(project.gallery?.[0].en).toBe('My cover')
  expect(project.translationStatus).toBe('complete')
})

it('never exposes a draft through the public slug endpoint', async () => {
  const repo = { findOne: vi.fn().mockResolvedValue({ slug: 'musea', published: false }) }
  const service = new ProjectsService(repo as never)
  await expect(service.findBySlug('musea')).rejects.toThrow('No existe')
})

it('reports HTML from an invalid endpoint without overwriting existing English', async () => {
  vi.stubEnv('TRANSLATE_URL', 'http://localhost:5000/translate')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, headers: new Headers({ 'content-type': 'text/html' }) }))
  const project = { summaryEs: 'Revista', summaryEn: 'Magazine' } as Project
  await translateProject(project)
  expect(project.translationStatus).toBe('error')
  expect(project.translationError).toContain('página web')
  expect(project.summaryEn).toBe('Magazine')
})

it('does not apply partial translations when the response is incomplete', async () => {
  vi.stubEnv('TRANSLATE_URL', 'http://localhost:5000/translate')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({ translatedText: ['New summary'] }) }))
  const project = { summaryEs: 'Revista', summaryEn: 'Existing summary', bodyEs: 'Descripción', bodyEn: 'Existing body' } as Project
  await translateProject(project)
  expect(project.translationStatus).toBe('error')
  expect(project.summaryEn).toBe('Existing summary')
  expect(project.bodyEn).toBe('Existing body')
})

it('assigns a unique URL for a new project with an existing name without overwriting it', async () => {
  vi.stubEnv('TRANSLATE_URL', '')
  const original = { id: 1, slug: 'musea' }
  const repo = {
    create: (dto: object) => ({ ...dto }),
    findOne: vi.fn(async ({ where }: { where: { slug: string } }) => where.slug === 'musea' ? original : where.slug === 'musea-2' ? { id: 2, slug: 'musea-2' } : null),
    save: vi.fn(async (p) => ({ ...p, id: 3 })),
  }
  const service = new ProjectsService(repo as never)
  const saved = await service.create(plainToInstance(CreateProjectDto, { slug: 'musea', title: 'Musea', year: 2026, category: 'editorial', kind: 'result', summaryEs: '', summaryEn: '' }))
  expect(saved.slug).toBe('musea-3')
  expect(saved.id).toBe(3)
  expect(original.slug).toBe('musea')
})

it('keeps the URL when editing the same project and turns a simultaneous collision into 409', async () => {
  vi.stubEnv('TRANSLATE_URL', '')
  const project = { id: 1, slug: 'musea', title: 'Musea', summaryEs: '', tools: [] }
  const repo = {
    findOne: vi.fn().mockResolvedValue(project),
    merge: Object.assign,
    save: vi.fn().mockResolvedValue(project),
  }
  const service = new ProjectsService(repo as never)
  expect((await service.update(1, {})).slug).toBe('musea')
  repo.save.mockRejectedValueOnce({ code: 'ER_DUP_ENTRY' })
  await expect(service.update(1, {})).rejects.toMatchObject({ status: 409 })
})
