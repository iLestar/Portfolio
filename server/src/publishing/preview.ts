import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'

const types: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2' }

export async function previewSite(directory: string, base: string) {
  const server = createServer(async (req, res) => {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return }
      const url = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname)
      if (!url.startsWith(base)) { res.writeHead(404).end(); return }
      let path = resolve(directory, url.slice(base.length))
      if (path !== directory && !path.startsWith(directory + sep)) { res.writeHead(404).end(); return }
      let info = await stat(path).catch(() => null)
      if (info?.isDirectory()) { path = join(path, 'index.html'); info = await stat(path).catch(() => null) }
      if (!info?.isFile()) { res.writeHead(404).end(); return }
      res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
      if (req.method === 'HEAD') res.end()
      else createReadStream(path).on('error', () => res.destroy()).pipe(res)
    } catch { if (!res.headersSent) res.writeHead(400); res.end() }
  })
  await new Promise<void>((done, fail) => { server.once('error', fail); server.listen(0, '127.0.0.1', done) })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('No se pudo abrir la vista previa.')
  return { server, url: `http://127.0.0.1:${address.port}${base}` }
}
