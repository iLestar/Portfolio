import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))

// Proyección pública del archivo JSON privado: los borradores y metadatos no salen.
export function toStaticProjects(rows) {
  return rows.filter((p) => p.published === true)
    .sort((a, b) => a.sortOrder - b.sortOrder || b.year - a.year || a.id - b.id)
    .map((p) => ({
      slug: p.slug, title: p.title, year: p.year, category: p.category,
      categories: p.categories?.length ? p.categories : [p.category],
      kind: p.kind, cover: p.cover ?? undefined, tools: p.tools ?? [],
      summary: { es: p.summaryEs, en: p.summaryEn },
      body: p.bodyEs || p.bodyEn ? { es: p.bodyEs ?? '', en: p.bodyEn ?? '' } : undefined,
      credits: { es: p.creditsEs ?? '', en: p.creditsEn ?? '' },
      contributors: p.contributors ?? [], gallery: p.gallery ?? [],
      documentUrl: p.documentUrl,
      sections: p.sections?.map((s) => ({ key: s.key, image: s.image ?? undefined, body: { es: s.es, en: s.en } })),
      attachments: p.attachments ?? [], featured: Boolean(p.featured),
    }))
}
export function localAssets(projects) {
  const urls = projects.flatMap((p) => [p.cover, p.coverThumbnail, p.documentUrl,
    ...(p.gallery ?? []).flatMap((image) => [image.url, image.thumbnail]),
    ...(p.attachments ?? []).map((file) => file.url),
    ...(p.sections ?? []).map((section) => section.image)])
  return [...new Set(urls.filter(Boolean).filter((url) => url.startsWith('/')).map((url) => {
    const path = url.split(/[?#]/)[0]
    if (!/^\/(?:uploads|projects|brand)\/[\w./-]+$/.test(path) || path.slice(1).split('/').some((part) => !part || part === '.' || part === '..')) throw new Error(`Ruta de archivo no permitida: ${url}`)
    return path
  }))]
}

async function main() {
  const input = resolve(process.argv[2] ?? join(root, 'server/data/projects.json'))
  const data = JSON.parse(await readFile(input, 'utf8'))
  if (!Array.isArray(data.items)) throw new Error('El archivo debe contener una colección JSON de proyectos.')
  const rows = data.items
  let projects = toStaticProjects(rows)
  if (!projects.length || new Set(projects.map((p) => p.slug)).size !== projects.length) throw new Error('Revisa los proyectos publicados y sus enlaces.')
  const assets = localAssets(projects)
  // Comprobar todo antes de escribir el catálogo; no copiar adjuntos huérfanos ni borradores.
  for (const asset of assets) {
    const source = asset.startsWith('/uploads/') ? join(root, 'server', asset) : join(root, 'client/public', asset)
    if (!(await stat(source)).isFile()) throw new Error(`Falta el archivo ${asset}`)
  }
  for (const asset of assets.filter((url) => url.startsWith('/uploads/'))) {
    const target = join(root, 'client/public', asset)
    await mkdir(dirname(target), { recursive: true })
    await copyFile(join(root, 'server', asset), target)
  }
  const { optimizeImages } = await import('./optimize-images.mjs')
  projects = await optimizeImages(projects, join(root, 'client/public'))
  await writeFile(join(root, 'client/src/data/projects.json'), JSON.stringify(projects, null, 2) + '\n')
  console.log(`Exportados ${projects.length} proyectos publicados y ${assets.length} archivos. Borradores excluidos: ${rows.length - projects.length}.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1 })
}
