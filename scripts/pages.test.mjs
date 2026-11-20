import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, stat, truncate, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { finishPages, pagesTarget } from './prepare-pages.mjs'
import { assetUrl } from '../client/src/asset-url.ts'

const root = fileURLToPath(new URL('../', import.meta.url))
async function fixture(run) {
  const parent = join(root, 'tmp')
  await mkdir(parent, { recursive: true })
  const directory = await mkdtemp(join(parent, 'pages-test-'))
  try { await writeFile(join(directory, 'index.html'), '<html>Public portfolio</html>'); await run(directory) }
  finally { assert(resolve(directory).startsWith(resolve(parent) + sep)); await rm(directory, { recursive: true, force: true }) }
}

test('supports repository and account Pages addresses without breaking external links', () => {
  assert.equal(pagesTarget('iLestar/Portfolio').base, '/Portfolio/')
  assert.equal(pagesTarget('iLestar/iLestar.github.io').base, '/')
  assert.equal(assetUrl('/uploads/a.pdf', '/Portfolio/'), '/Portfolio/uploads/a.pdf')
  assert.equal(assetUrl('/uploads/a.pdf', '/'), '/uploads/a.pdf')
  assert.equal(assetUrl('https://example.com/a.pdf', '/Portfolio/'), 'https://example.com/a.pdf')
  for (const repository of ['../Portfolio', 'user/..', 'https://example.com', '-option']) assert.throws(() => pagesTarget(repository))
})

test('builds direct project URLs and removes files not referenced by published projects', async () => fixture(async (directory) => {
  await mkdir(join(directory, 'uploads'))
  await writeFile(join(directory, 'uploads/cover.jpg'), 'image')
  await writeFile(join(directory, 'uploads/private-draft.jpg'), 'unpublished')
  const project = { title: 'Musea', slug: 'musea', cover: '/uploads/cover.jpg' }
  const manifest = await finishPages(directory, [project], pagesTarget('iLestar/Portfolio'), 'test-revision')
  assert.equal(await readFile(join(directory, 'proyectos/musea/index.html'), 'utf8'), '<html>Public portfolio</html>')
  assert.equal(await stat(join(directory, 'uploads/private-draft.jpg')).catch(() => null), null)
  assert(manifest.files.includes('.nojekyll'))
  assert(!manifest.files.some((path) => path.includes('private-draft')))
  assert.equal(manifest.projectCount, 1)
  assert(manifest.catalogHash)
}))

test('refuses private files and oversized uploads before anything is sent', async () => fixture(async (directory) => {
  await writeFile(join(directory, '.env'), 'private')
  await assert.rejects(finishPages(directory, [{ slug: 'musea' }], pagesTarget('iLestar/Portfolio'), 'test'), /Archivo inesperado/)
  await rm(join(directory, '.env'))
  await mkdir(join(directory, 'uploads'))
  const big = join(directory, 'uploads/big.pdf')
  await writeFile(big, '')
  await truncate(big, 100 * 1024 * 1024 + 1)
  await assert.rejects(finishPages(directory, [{ slug: 'musea', documentUrl: '/uploads/big.pdf' }], pagesTarget('iLestar/Portfolio'), 'test'), /100 MiB/)
}))
