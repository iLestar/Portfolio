import { createHash, randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
import { mkdir, readFile, rename, rm, stat } from 'node:fs/promises'
import { join } from 'node:path'

const require = createRequire(new URL('../server/package.json', import.meta.url))
const sharp = require('sharp')

// Solo las vistas pequeñas se comprimen. Las URL originales siguen disponibles al ampliar.
export async function optimizeImages(projects, publicDirectory) {
  const thumbnails = new Map()
  async function thumbnail(url) {
    if (!url || !/^\/(?:uploads|projects|brand)\/[\w./-]+\.(?:png|jpe?g|webp)$/i.test(url)) return undefined
    if (url.slice(1).split('/').some((part) => !part || part === '.' || part === '..')) throw new Error('Ruta de imagen no permitida.')
    if (thumbnails.has(url)) return thumbnails.get(url)
    const input = await readFile(join(publicDirectory, url))
    const hash = createHash('sha256').update('thumbnail-v1-960x1200-q82').update(input).digest('hex').slice(0, 24)
    const outputUrl = `/uploads/thumb-${hash}.webp`
    const output = join(publicDirectory, outputUrl)
    await mkdir(join(publicDirectory, 'uploads'), { recursive: true })
    if (!(await stat(output).catch(() => null))?.isFile()) {
      const temporary = `${output}.${randomUUID()}.tmp`
      try {
        await sharp(input).rotate().resize({ width: 960, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(temporary)
        await rename(temporary, output)
      } finally { await rm(temporary, { force: true }) }
    }
    thumbnails.set(url, outputUrl)
    return outputUrl
  }
  const result = []
  for (const project of projects) {
    const gallery = []
    for (const image of project.gallery ?? []) gallery.push({ ...image, thumbnail: await thumbnail(image.url) })
    result.push({ ...project, coverThumbnail: await thumbnail(project.cover), gallery })
  }
  return result
}
