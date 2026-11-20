import { spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { copyFile, lstat, mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { localAssets } from './export-static.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
export const managedBy = 'lestar-portfolio-pages-v1'

export function pagesTarget(repository) {
  if (!/^[\w-]+\/[\w.-]+$/.test(repository) || repository.split('/').some((part) => part === '.' || part === '..')) throw new Error('El repositorio debe tener el formato usuario/repositorio.')
  const [owner, name] = repository.split('/')
  const base = name.toLowerCase() === `${owner.toLowerCase()}.github.io` ? '/' : `/${name}/`
  return { repository, base, url: `https://${owner.toLowerCase()}.github.io${base}`, settingsUrl: `https://github.com/${repository}/settings/pages` }
}

export async function finishPages(directory, projects, target, revision) {
  if (!Array.isArray(projects) || !projects.length || projects.some((p) => ['id', 'published', 'translationError', 'translationSourceHash'].some((key) => key in p))) throw new Error('El catálogo público no es válido.')
  const referenced = new Set(localAssets(projects).map((path) => path.slice(1)))
  let bytes = 0
  let files = 0
  const paths = []
  async function inspect(folder) {
    for (const entry of await readdir(folder)) {
      const path = join(folder, entry)
      const relative = path.slice(directory.length + 1).split(sep).join('/')
      const info = await lstat(path)
      if (info.isSymbolicLink()) throw new Error('La publicación no admite enlaces simbólicos.')
      if (info.isDirectory()) { await inspect(path); continue }
      if (relative.startsWith('uploads/') && !referenced.has(relative)) { await unlink(path); continue }
      if (!(relative === 'index.html' || relative === 'favicon.svg' || relative === 'icons.svg' || /^assets\/[\w.-]+\.(?:js|css|woff2?|ttf|png|svg|webp)$/.test(relative) || /^brand\/[\w.-]+\.(?:png|svg|jpe?g|webp)$/.test(relative) || referenced.has(relative))) throw new Error(`Archivo inesperado en la salida pública: ${relative}`)
      if (info.size > 100 * 1024 * 1024) throw new Error(`${relative} supera los 100 MiB permitidos por archivo. Optimízalo antes de publicar.`)
      bytes += info.size
      files++
      paths.push(relative)
    }
  }
  await inspect(directory)
  const html = await readFile(join(directory, 'index.html'))
  const routes = ['proyectos', 'sobre-mi', 'servicios', 'desarrollo', 'contacto', ...projects.map((p) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) throw new Error('Un proyecto tiene un enlace no válido.')
    return `proyectos/${p.slug}`
  })]
  for (const route of routes) {
    const destination = join(directory, route, 'index.html')
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, html)
    paths.push(`${route}/index.html`)
  }
  await copyFile(join(directory, 'index.html'), join(directory, '404.html'))
  await writeFile(join(directory, '.nojekyll'), '')
  paths.push('404.html', '.nojekyll', 'lestar-publication.json')
  bytes += html.length * (routes.length + 1)
  if (bytes > 1_000_000_000 - 65536) throw new Error('La publicación supera el cupo de 1 GB. Reduce el tamaño de los archivos antes de enviarla.')
  const catalogHash = createHash('sha256').update(JSON.stringify(projects)).digest('hex')
  const manifest = { managedBy, revision, preparedAt: new Date().toISOString(), repository: target.repository, base: target.base, catalogHash, projectCount: projects.length, bytes, fileCount: files + routes.length + 3, files: paths }
  await writeFile(join(directory, 'lestar-publication.json'), JSON.stringify(manifest, null, 2) + '\n')
  return manifest
}

async function main() {
  const revision = process.argv[4] || randomUUID()
  const directory = resolve(process.argv[2] || join(root, 'tmp', `lestar-publication-${revision}`, 'site'))
  if (!directory.startsWith(join(root, 'tmp') + sep)) throw new Error('La carpeta de publicación debe estar dentro de tmp/.')
  const target = pagesTarget(process.argv[3] || process.env.PAGES_REPOSITORY || 'iLestar/Portfolio')
  const snapshot = await readFile(join(root, 'client/src/data/projects.json'), 'utf8')
  const hash = (value) => createHash('sha256').update(value).digest('hex')
  const npm = process.env.npm_execpath
  if (!npm?.endsWith('npm-cli.js')) throw new Error('Inicia la API con npm run dev:server o ejecuta npm run pages:prepare.')
  await mkdir(directory, { recursive: true })
  const child = spawn(process.execPath, [npm, '--prefix', join(root, 'client'), 'run', 'build', '--', '--outDir', directory, '--emptyOutDir'], { cwd: root, env: { ...process.env, VITE_PUBLIC_SITE: 'true', PAGES_BASE: target.base }, windowsHide: true, stdio: 'inherit' })
  await new Promise((done, fail) => { child.once('error', fail); child.once('exit', (code) => code === 0 ? done() : fail(new Error('No se pudo compilar la versión pública.'))) })
  if (hash(snapshot) !== hash(await readFile(join(root, 'client/src/data/projects.json'), 'utf8'))) throw new Error('El contenido cambió durante la preparación. Vuelve a preparar la publicación.')
  const manifest = await finishPages(directory, JSON.parse(snapshot), target, revision)
  console.log(`Publicación preparada: ${manifest.projectCount} proyectos, ${(manifest.bytes / 1024 / 1024).toFixed(1)} MiB. No se ha enviado nada a internet.`)
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch((error) => { console.error(error.message); process.exitCode = 1 })
