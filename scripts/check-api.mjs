import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import { createRequire } from 'node:module'

// API real compilada, con credenciales y archivos temporales independientes.
const root = fileURLToPath(new URL('../', import.meta.url))
const temporaryRoot = join(root, 'tmp')
await mkdir(temporaryRoot, { recursive: true })
const directory = await mkdtemp(join(temporaryRoot, 'check-api-'))
const dataDir = join(directory, 'data')
const uploadsDir = join(directory, 'uploads')
const clientDir = join(directory, 'client')
await mkdir(dataDir)
await mkdir(join(clientDir, 'src/data'), { recursive: true })
for (const name of ['projects', 'messages']) await writeFile(join(dataDir, `${name}.json`), JSON.stringify({ nextId: 1, items: [] }))
const socket = createServer()
socket.listen(0, '127.0.0.1')
await once(socket, 'listening')
const port = socket.address().port
await new Promise((done) => socket.close(done))
const password = randomBytes(24).toString('hex')
const env = { ...process.env, NODE_ENV: 'test', PORT: String(port), DATA_DIR: dataDir, UPLOADS_DIR: uploadsDir, STATIC_CLIENT_DIR: clientDir, ADMIN_USER: 'qa', ADMIN_PASSWORD: password, JWT_SECRET: randomBytes(32).toString('hex'), TRANSLATE_URL: '' }
let child
let logs = ''
const base = `http://127.0.0.1:${port}`

async function start() {
  child = spawn(process.execPath, ['dist/main.js'], { cwd: join(root, 'server'), env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  child.stdout.on('data', (chunk) => { logs += chunk })
  child.stderr.on('data', (chunk) => { logs += chunk })
  for (let attempt = 0; attempt < 80; attempt++) {
    if (child.exitCode !== null) throw new Error('La API no pudo arrancar: ' + logs)
    if (await fetch(base + '/api/projects').then((r) => r.ok, () => false)) return
    await new Promise((done) => setTimeout(done, 100))
  }
  throw new Error('La API no arrancó a tiempo.')
}
async function stop() {
  if (!child || child.exitCode !== null) return
  const exited = once(child, 'exit')
  child.kill()
  await exited
}
try {
  await start()
  const login = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: 'qa', password }) })
  assert.equal(login.status, 201)
  const { token } = await login.json()
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  assert.equal((await fetch(base + '/api/projects/admin/all')).status, 401)
  assert.equal((await fetch(base + '/api/publishing')).status, 401)
  assert.equal((await fetch(base + '/api/publishing/prepare', { method: 'POST' })).status, 401)
  assert.equal((await fetch(base + '/api/publishing', { headers })).status, 200)
  assert.equal((await fetch(base + '/api/publishing/publish', { method: 'POST', headers, body: JSON.stringify({ revision: 'not-prepared' }) })).status, 400)
  const wrongLogin = await fetch(base + '/api/auth/login', { method: 'POST', headers, body: JSON.stringify({ user: 'qa', password: 'incorrect' }) })
  assert.equal(wrongLogin.status, 401)
  const create = await fetch(base + '/api/projects/admin', { method: 'POST', headers, body: JSON.stringify({ title: 'Prueba JSON', slug: 'prueba-json', year: 2026, category: 'editorial', categories: ['editorial'], kind: 'result', summaryEs: 'Prueba', summaryEn: 'Test' }) })
  assert.equal(create.status, 201)
  const project = await create.json()
  assert.equal((await fetch(base + '/api/projects/prueba-json')).status, 404)
  assert.deepEqual(JSON.parse(await readFile(join(clientDir, 'src/data/projects.json'), 'utf8')), [])
  const file = new FormData()
  const sharp = createRequire(new URL('../server/package.json', import.meta.url))('sharp')
  const png = await sharp({ create: { width: 20, height: 10, channels: 3, background: 'blue' } }).png().toBuffer()
  file.append('file', new File([png], 'test.png', { type: 'image/png' }))
  const upload = await fetch(base + '/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: file })
  assert.equal(upload.status, 201)
  const { url } = await upload.json()
  const update = await fetch(base + '/api/projects/admin/' + project.id, { method: 'PUT', headers, body: JSON.stringify({ title: 'Proyecto editado', published: true, cover: url }) })
  assert.equal(update.status, 200)
  assert.equal((await update.json()).staticExportError, null)
  assert.equal((await fetch(base + url)).status, 200)
  assert.deepEqual(await readFile(join(clientDir, 'public', url)), png)
  assert.equal(JSON.parse(await readFile(join(dataDir, 'projects.json'), 'utf8')).items[0].title, 'Proyecto editado')
  const catalog = JSON.parse(await readFile(join(clientDir, 'src/data/projects.json'), 'utf8'))
  assert.equal(catalog[0].title, 'Proyecto editado')
  assert.equal(catalog[0].cover, url)
  assert.match(catalog[0].coverThumbnail, /^\/uploads\/thumb-[a-f0-9]+\.webp$/)
  assert.equal((await sharp(await readFile(join(clientDir, 'public', catalog[0].coverThumbnail))).metadata()).format, 'webp')
  assert(!('id' in catalog[0]))
  await stop()
  await start()
  assert.equal((await (await fetch(base + '/api/projects/prueba-json')).json()).title, 'Proyecto editado')
  const removed = await fetch(base + '/api/projects/admin/' + project.id, { method: 'DELETE', headers })
  assert.equal(removed.status, 200)
  assert.deepEqual(await (await fetch(base + '/api/projects')).json(), [])
  assert.deepEqual(JSON.parse(await readFile(join(clientDir, 'src/data/projects.json'), 'utf8')), [])
  console.log('API verificada: login, protección del panel, borradores, subidas, publicación, edición, persistencia tras reinicio y borrado. Datos reales intactos.')
} finally {
  await stop()
  if (!resolve(directory).startsWith(resolve(temporaryRoot) + sep)) throw new Error('Ruta temporal inesperada.')
  await rm(directory, { recursive: true, force: true })
}
