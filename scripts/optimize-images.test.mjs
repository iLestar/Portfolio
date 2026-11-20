import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRequire } from 'node:module'
import { mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { optimizeImages } from './optimize-images.mjs'
import { localAssets } from './export-static.mjs'

const require = createRequire(new URL('../server/package.json', import.meta.url))
const sharp = require('sharp')
const parent = fileURLToPath(new URL('../tmp/', import.meta.url))

test('generates cached WebP thumbnails, preserves originals and invalidates changed images', async () => {
  await mkdir(parent, { recursive: true })
  const directory = await mkdtemp(join(parent, 'image-test-'))
  try {
    await mkdir(join(directory, 'uploads'))
    const original = join(directory, 'uploads/cover.png')
    await sharp({ create: { width: 2400, height: 3200, channels: 4, background: '#8555ff88' } }).png().toFile(original)
    const before = await readFile(original)
    const project = { cover: '/uploads/cover.png', gallery: [{ url: '/uploads/cover.png', es: 'Portada', en: 'Cover' }] }
    const [result] = await optimizeImages([project], directory)
    assert.equal(result.cover, project.cover)
    assert.equal(result.gallery[0].url, project.gallery[0].url)
    assert.equal(result.coverThumbnail, result.gallery[0].thumbnail)
    assert.deepEqual(await readFile(original), before)
    const thumbnail = join(directory, result.coverThumbnail)
    const metadata = await sharp(await readFile(thumbnail)).metadata()
    assert.equal(metadata.format, 'webp')
    assert(metadata.width <= 960 && metadata.height <= 1200 && metadata.hasAlpha)
    assert((await stat(thumbnail)).size < before.length)
    assert(localAssets([result]).includes(result.coverThumbnail))
    const modified = (await stat(thumbnail)).mtimeMs
    await optimizeImages([project], directory)
    assert.equal((await stat(thumbnail)).mtimeMs, modified)
    await sharp({ create: { width: 20, height: 10, channels: 3, background: 'red' } }).png().toFile(original)
    const [changed] = await optimizeImages([project], directory)
    assert.notEqual(changed.coverThumbnail, result.coverThumbnail)
    assert.equal((await sharp(await readFile(join(directory, changed.coverThumbnail))).metadata()).width, 20)
    assert.equal((await optimizeImages([{ cover: 'https://example.com/cover.jpg' }], directory))[0].coverThumbnail, undefined)
    await assert.rejects(optimizeImages([{ cover: '/uploads/../private.png' }], directory), /Ruta/)
  } finally {
    assert(resolve(directory).startsWith(resolve(parent) + sep))
    await rm(directory, { recursive: true, force: true })
  }
})
