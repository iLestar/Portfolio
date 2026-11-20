import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toStaticProjects, localAssets } from './export-static.mjs'
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

test('exports JSON preserving bilingual content and excluding drafts and private fields', () => {
  const published = { published: true, id: 2, sortOrder: 1, year: 2026, slug: 'musea', category: 'editorial', tools: ['InDesign', 'Photoshop'], summaryEs: 'Revista de Medellín', summaryEn: 'A magazine', contributors: [{ name: 'Juan', url: null }], translationError: 'private', translationSourceHash: 'private' }
  const result = toStaticProjects([{ ...published, published: false, slug: 'draft' }, published])
  assert.deepEqual(result.map((p) => p.slug), ['musea'])
  assert.deepEqual(result[0].summary, { es: 'Revista de Medellín', en: 'A magazine' })
  assert.deepEqual(result[0].tools, published.tools)
  assert.deepEqual(result[0].contributors, published.contributors)
  for (const key of ['id', 'published', 'translationError', 'translationSourceHash']) assert(!(key in result[0]))
})
test('collects and deduplicates project assets without allowing path traversal', () => {
  assert.deepEqual(localAssets([{ cover: '/uploads/cover.png', gallery: [{ url: '/uploads/cover.png' }], documentUrl: '/uploads/musea.pdf#page=5' }]), ['/uploads/cover.png', '/uploads/musea.pdf'])
  for (const cover of ['/uploads/../private.env', '/uploads/%2e%2e/private.env', '/uploads/a\\b']) assert.throws(() => localAssets([{ cover }]))
})

test('initializes JSON from the public catalog and never overwrites existing private data', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const temporaryRoot = join(root, 'tmp')
  await mkdir(temporaryRoot, { recursive: true })
  const directory = await mkdtemp(join(temporaryRoot, 'init-json-test-'))
  const run = () => {
    const result = spawnSync(process.execPath, [join(root, 'scripts/init-data.mjs')], { cwd: root, env: { ...process.env, DATA_DIR: directory }, encoding: 'utf8', windowsHide: true })
    assert.equal(result.status, 0, result.stderr)
  }
  try {
    run()
    const path = join(directory, 'projects.json')
    const projects = JSON.parse(await readFile(path, 'utf8'))
    const catalog = JSON.parse(await readFile(join(root, 'client/src/data/projects.json'), 'utf8'))
    assert.equal(projects.items.length, catalog.length)
    assert.deepEqual(projects.items.map((p) => p.slug), catalog.map((p) => p.slug))
    const original = JSON.stringify({ nextId: 2, items: [{ id: 1, title: 'Borrador privado', published: false }] })
    await writeFile(path, original)
    run()
    assert.equal(await readFile(path, 'utf8'), original)
  } finally {
    assert(resolve(directory).startsWith(resolve(temporaryRoot) + sep))
    await rm(directory, { recursive: true, force: true })
  }
})
