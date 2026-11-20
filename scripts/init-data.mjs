import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const root = fileURLToPath(new URL('../', import.meta.url))
try { process.loadEnvFile(join(root, 'server/.env')) }
catch (error) { if (error.code !== 'ENOENT') throw error }
const directory = resolve(root, 'server', process.env.DATA_DIR || 'data')
await mkdir(directory, { recursive: true })
const catalog = JSON.parse(await readFile(join(root, 'client/src/data/projects.json'), 'utf8'))
const projects = catalog.map((p, index) => {
  const project = {
    id: index + 1, slug: p.slug, title: p.title, year: p.year, category: p.category,
    categories: p.categories ?? [p.category], kind: p.kind, cover: p.cover ?? null,
    tools: p.tools ?? [], summaryEs: p.summary.es, summaryEn: p.summary.en,
    bodyEs: p.body?.es ?? null, bodyEn: p.body?.en ?? null,
    creditsEs: p.credits?.es ?? null, creditsEn: p.credits?.en ?? null,
    contributors: p.contributors ?? [], gallery: p.gallery ?? [],
    documentUrl: p.documentUrl ?? null, attachments: p.attachments ?? [],
    sections: p.sections?.map((s) => ({ key: s.key, image: s.image ?? null, es: s.body.es, en: s.body.en })) ?? null,
    featured: Boolean(p.featured), published: true, sortOrder: index,
    translationStatus: 'pending', translationError: null, translationSourceHash: null,
  }
  const pairs = [[project.summaryEs, project.summaryEn], [project.bodyEs, project.bodyEn], [project.creditsEs, project.creditsEn], ...project.gallery.map((row) => [row.es, row.en])]
  if (pairs.every(([es, en]) => !es?.trim() || en?.trim())) {
    project.translationStatus = 'reviewed'
    project.translationSourceHash = createHash('sha256').update(JSON.stringify([project.summaryEs ?? '', project.bodyEs ?? '', project.creditsEs ?? '', project.gallery.map((row) => [row.url, row.es])])).digest('hex')
  }
  return project
})
for (const [name, items] of [['projects', projects], ['messages', []]]) {
  try {
    await writeFile(join(directory, `${name}.json`), JSON.stringify({ nextId: Math.max(0, ...items.map((p) => p.id)) + 1, items }, null, 2) + '\n', { flag: 'wx', mode: 0o600 })
    console.log(`Creado ${name}.json.`)
  } catch (error) {
    if (error.code !== 'EEXIST') throw error
    console.log(`${name}.json ya existe: se conserva sin cambios.`)
  }
}
