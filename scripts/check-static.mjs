import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { localAssets } from './export-static.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const projects = JSON.parse(await readFile(join(root, 'client/src/data/projects.json'), 'utf8'))
assert(projects.length > 0, 'Falta el catálogo de proyectos.')
assert.equal(new Set(projects.map((p) => p.slug)).size, projects.length, 'Hay enlaces duplicados.')
for (const p of projects) {
  assert(p.title && p.slug && p.category && p.year, `Ficha incompleta: ${p.slug}`)
  assert(typeof p.summary.es === 'string' && typeof p.summary.en === 'string', `Resumen inválido: ${p.slug}`)
  for (const field of [p.summary, p.body, p.credits, ...(p.gallery ?? [])].filter(Boolean)) {
    assert(!/\[PENDIENTE\]|\[TBD\]/.test(field.es + field.en), `Contenido de ejemplo en ${p.slug}`)
  }
  assert(!('id' in p) && !('published' in p) && !('translationError' in p), 'El catálogo contiene datos de administración.')
}
const assets = localAssets(projects)
let bytes = 0
for (const asset of assets) {
  const file = await stat(join(root, 'client/public', asset)).catch(() => null)
  assert(file?.isFile(), `Falta ${asset}. Restaura client/public/uploads desde la exportación o el respaldo antes de compilar.`)
  bytes += file.size
}
const pending = projects.filter((p) => [p.summary, p.body, p.credits, ...(p.gallery ?? [])].filter(Boolean).some((field) => field.es?.trim() && !field.en?.trim()))
console.log(`Catálogo estático verificado: ${projects.length} proyectos, ${assets.length} archivos (${(bytes / 1024 / 1024).toFixed(1)} MiB).`)
if (pending.length) console.warn(`Traducciones pendientes (se mostrará el español): ${pending.map((p) => p.title).join(', ')}`)
