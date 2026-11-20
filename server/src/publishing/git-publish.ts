import { execFile } from 'node:child_process'
import { copyFile, lstat, mkdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)
export async function runGit(args: string[], cwd: string) {
  const result = await exec('git', args, { cwd, windowsHide: true, timeout: 300000, maxBuffer: 2 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } })
  return result.stdout.trim()
}

// Rama dedicada, sin tocar el checkout de trabajo ni forzar actualizaciones remotas.
export async function publishDirectory(site: string, worktree: string, repository: string, run = runGit) {
  if (!/^[\w-]+\/[\w.-]+$/.test(repository)) throw new Error('Repositorio no válido.')
  await mkdir(worktree, { recursive: true })
  await run(['init', '--initial-branch=gh-pages'], worktree)
  await run(['remote', 'add', 'origin', `https://github.com/${repository}.git`], worktree)
  const existing = await run(['ls-remote', '--heads', 'origin', 'refs/heads/gh-pages'], worktree)
  if (existing) {
    // status/commit necesitan también los archivos retirados de la versión anterior.
    // Una copia completa del último commit evita lecturas de objetos ausentes.
    await run(['fetch', '--depth=1', 'origin', 'refs/heads/gh-pages'], worktree)
    // No reemplazar una web ajena que ya ocupe esa rama.
    const manifest = JSON.parse(await run(['show', 'FETCH_HEAD:lestar-publication.json'], worktree))
    if (manifest.managedBy !== 'lestar-portfolio-pages-v1') throw new Error('La rama gh-pages no pertenece a este publicador.')
    await run(['reset', '--mixed', 'FETCH_HEAD'], worktree)
  }
  const manifest = JSON.parse(await readFile(join(site, 'lestar-publication.json'), 'utf8')) as { managedBy?: string; files?: string[] }
  if (manifest.managedBy !== 'lestar-portfolio-pages-v1' || !Array.isArray(manifest.files)) throw new Error('La versión preparada no es válida.')
  for (const file of manifest.files) {
    if (!/^[\w./-]+$/.test(file) || file.split('/').some((part) => !part || part === '..' || (part.startsWith('.') && file !== '.nojekyll'))) throw new Error('Ruta de publicación no permitida.')
    const info = await lstat(join(site, file))
    if (!info.isFile() || info.isSymbolicLink() || info.size > 100 * 1024 * 1024) throw new Error('Archivo de publicación no permitido.')
    await mkdir(dirname(join(worktree, file)), { recursive: true })
    await copyFile(join(site, file), join(worktree, file))
  }
  await run(['add', '--all', '--force'], worktree)
  if (await run(['status', '--porcelain'], worktree)) {
    await run(['-c', 'user.name=Lestar Portfolio', '-c', `user.email=${repository.split('/')[0]}@users.noreply.github.com`, '-c', 'commit.gpgsign=false', 'commit', '-m', 'Publicar portafolio desde el editor local'], worktree)
  }
  await run(['push', 'origin', 'HEAD:refs/heads/gh-pages'], worktree)
  return run(['rev-parse', 'HEAD'], worktree)
}
