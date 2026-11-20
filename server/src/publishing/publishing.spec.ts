import { expect, it } from 'vitest'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { publishDirectory, runGit } from './git-publish.js'
import { previewSite } from './preview.js'

async function fixture(run: (directory: string) => Promise<void>) {
  const root = resolve('../tmp')
  await mkdir(root, { recursive: true })
  const directory = await mkdtemp(join(root, 'publishing-test-'))
  try { await run(directory) }
  finally { if (!directory.startsWith(root + sep)) throw new Error('Ruta inesperada.'); await rm(directory, { recursive: true, force: true }) }
}

it('publishes only manifest files, preserves main, and refuses an unrelated deployment branch', async () => fixture(async (directory) => {
  const remote = join(directory, 'remote.git')
  const source = join(directory, 'source')
  const site = join(directory, 'site')
  await mkdir(source); await mkdir(site)
  await runGit(['init', '--bare', remote], directory)
  // file:// y filtros habilitados reproducen el comportamiento del remoto de GitHub.
  await runGit(['config', 'uploadpack.allowFilter', 'true'], remote)
  await runGit(['init', '--initial-branch=main'], source)
  await writeFile(join(source, 'README.md'), 'Source code is preserved')
  await runGit(['add', '.'], source)
  await runGit(['-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', 'commit', '-m', 'source'], source)
  await runGit(['remote', 'add', 'origin', remote], source)
  await runGit(['push', 'origin', 'main'], source)
  const main = await runGit(['rev-parse', 'main'], source)
  const localGit = async (args: string[], cwd: string) => {
    const result = await runGit(args[0] === 'remote' && args[1] === 'add' ? ['remote', 'add', 'origin', pathToFileURL(remote).href] : args, cwd)
    if (args[0] === 'fetch') {
      // La comparación debe funcionar sin descargar objetos adicionales sobre la marcha.
      expect(await runGit(['rev-list', '--objects', '--missing=print', 'FETCH_HEAD'], cwd)).not.toMatch(/^\?/m)
    }
    return result
  }
  await writeFile(join(site, 'index.html'), 'Version one')
  await writeFile(join(site, 'old.css'), 'Previous stylesheet')
  await writeFile(join(site, '.env'), 'This must never be uploaded')
  await writeFile(join(site, 'lestar-publication.json'), JSON.stringify({ managedBy: 'lestar-portfolio-pages-v1', files: ['index.html', 'old.css', 'lestar-publication.json'] }))
  await publishDirectory(site, join(directory, 'first'), 'owner/portfolio', localGit)
  expect(await runGit(['show', 'gh-pages:index.html'], remote)).toBe('Version one')
  expect(await runGit(['ls-tree', '-r', '--name-only', 'gh-pages'], remote)).not.toContain('.env')
  await writeFile(join(site, 'index.html'), 'Version two')
  await writeFile(join(site, 'new.css'), 'New stylesheet')
  await writeFile(join(site, 'lestar-publication.json'), JSON.stringify({ managedBy: 'lestar-portfolio-pages-v1', files: ['index.html', 'new.css', 'lestar-publication.json'] }))
  await publishDirectory(site, join(directory, 'second'), 'owner/portfolio', localGit)
  expect(await runGit(['show', 'gh-pages:index.html'], remote)).toBe('Version two')
  expect(await runGit(['ls-tree', '-r', '--name-only', 'gh-pages'], remote)).not.toContain('old.css')
  expect(await runGit(['show', 'gh-pages:new.css'], remote)).toBe('New stylesheet')
  expect(await runGit(['rev-parse', 'main'], remote)).toBe(main)
  await runGit(['update-ref', 'refs/heads/gh-pages', main], remote)
  await expect(publishDirectory(site, join(directory, 'foreign'), 'owner/portfolio', localGit)).rejects.toThrow()
  expect(await runGit(['rev-parse', 'gh-pages'], remote)).toBe(main)
}), 30000)

it('serves a loopback preview under the Pages prefix without exposing sibling files', async () => fixture(async (directory) => {
  const site = join(directory, 'site')
  await mkdir(site)
  await writeFile(join(site, 'index.html'), 'Preview')
  await writeFile(join(directory, 'private.txt'), 'Do not serve')
  const preview = await previewSite(site, '/Portfolio/')
  try {
    const response = await fetch(preview.url)
    expect(await response.text()).toBe('Preview')
    expect(response.headers.get('content-type')).toContain('text/html')
    expect((await fetch(new URL('/private.txt', preview.url))).status).toBe(404)
    expect((await fetch(preview.url + '%2e%2e/private.txt')).status).toBe(404)
  } finally { preview.server.closeAllConnections(); await new Promise<void>((done) => preview.server.close(() => done())) }
}))
