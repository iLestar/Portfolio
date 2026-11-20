import 'reflect-metadata'
import { afterEach, expect, it, vi } from 'vitest'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { CreateProjectDto, UpdateProjectDto } from './dto.js'
import { translateProject, translationSourceHash } from './translation.js'
import type { Project } from './project.js'
import { ProjectsService } from './projects.service.js'
import { ConfigService } from '@nestjs/config'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve, join, sep } from 'node:path'
import { JsonFile } from '../json-file.js'

const directories: string[] = []
const temporaryRoot = resolve('../tmp')
afterEach(async () => {
  vi.unstubAllEnvs(); vi.unstubAllGlobals()
  for (const directory of directories.splice(0)) {
    if (!resolve(directory).startsWith(temporaryRoot + sep)) throw new Error('Ruta temporal inesperada.')
    await rm(directory, { recursive: true, force: true })
  }
})

async function serviceFor(items: object[], exportStatic = false) {
  await mkdir(temporaryRoot, { recursive: true })
  const directory = await mkdtemp(join(temporaryRoot, 'json-test-'))
  directories.push(directory)
  const path = join(directory, 'projects.json')
  await writeFile(path, JSON.stringify({ nextId: Math.max(0, ...items.map((p) => (p as Project).id)) + 1, items }))
  const client = join(directory, 'client')
  if (exportStatic) await mkdir(join(client, 'src/data'), { recursive: true })
  return { service: new ProjectsService(new ConfigService({ DATA_DIR: directory, STATIC_CLIENT_DIR: exportStatic ? client : '' })), path, client }
}

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
  const { service } = await serviceFor([project])
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
  const { service } = await serviceFor([{ id: 1, slug: 'musea', published: false }])
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
  const { service } = await serviceFor([original, { id: 2, slug: 'musea-2' }])
  const saved = await service.create(plainToInstance(CreateProjectDto, { slug: 'musea', title: 'Musea', year: 2026, category: 'editorial', kind: 'result', summaryEs: '', summaryEn: '' }))
  expect(saved.slug).toBe('musea-3')
  expect(saved.id).toBe(3)
  expect(original.slug).toBe('musea')
})

it('keeps IDs and URLs after restarting the service and serializes simultaneous saves', async () => {
  vi.stubEnv('TRANSLATE_URL', '')
  const project = { id: 1, slug: 'musea', title: 'Musea', summaryEs: '', tools: [] }
  const { service, path } = await serviceFor([project])
  expect((await service.update(1, {})).slug).toBe('musea')
  expect((await service.update(1, plainToInstance(UpdateProjectDto, { title: 'Musea revisada' }))).slug).toBe('musea')
  const dto = plainToInstance(CreateProjectDto, { slug: 'musea', title: 'Musea', year: 2026, category: 'editorial', kind: 'result', summaryEs: '', summaryEn: '' })
  const created = await Promise.all([service.create(dto), service.create(dto)])
  expect(created.map((p) => p.slug)).toEqual(['musea-2', 'musea-3'])
  const reopened = new ProjectsService(new ConfigService({ DATA_DIR: resolve(path, '..'), STATIC_CLIENT_DIR: '' }))
  expect((await reopened.findAll()).map((p) => p.id).sort()).toEqual([1, 2, 3])
  expect(JSON.parse(await readFile(path + '.bak', 'utf8')).items).toHaveLength(2)
})

it('updates the static catalog on publish, edit, unpublish and delete without exposing drafts', async () => {
  vi.stubEnv('TRANSLATE_URL', '')
  const { service, client } = await serviceFor([], true)
  const dto = plainToInstance(CreateProjectDto, { slug: 'musea', title: 'Musea', year: 2026, category: 'editorial', kind: 'result', summaryEs: 'Revista', summaryEn: 'Magazine' })
  const saved = await service.create(dto)
  const catalog = async () => JSON.parse(await readFile(join(client, 'src/data/projects.json'), 'utf8'))
  expect(await catalog()).toEqual([])
  const published = await service.update(saved.id, { published: true })
  expect(published.staticExportError).toBeNull()
  expect((await catalog())[0].title).toBe('Musea')
  expect((await catalog())[0]).not.toHaveProperty('id')
  await service.update(saved.id, { title: 'Musea revisada' })
  expect((await catalog())[0].title).toBe('Musea revisada')
  await service.update(saved.id, { published: false })
  expect(await catalog()).toEqual([])
  expect((await service.findAll())[0]).toMatchObject({ id: saved.id, title: 'Musea revisada', published: false })
  await expect(service.findBySlug('musea')).rejects.toThrow('No existe')
  await service.update(saved.id, { published: true })
  expect((await catalog())[0].title).toBe('Musea revisada')
  expect((await service.findAll())[0].id).toBe(saved.id)
  await service.remove(saved.id)
  expect(await service.findAll()).toEqual([])
})

it('does not truncate JSON after a failed change or silently replace corrupted content', async () => {
  const { path } = await serviceFor([])
  const store = new JsonFile<Project>(path)
  const original = await readFile(path, 'utf8')
  await expect(store.update((data) => { data.nextId++; throw new Error('Invalid update') })).rejects.toThrow('Invalid update')
  expect(await readFile(path, 'utf8')).toBe(original)
  await writeFile(path, '{truncated')
  await expect(store.update(() => {})).rejects.toThrow()
  expect(await readFile(path, 'utf8')).toBe('{truncated')
})
