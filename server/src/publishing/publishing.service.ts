import { ConflictException, ForbiddenException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { execFile } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { readFile, rm } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import type { Server } from 'node:http'
import { promisify } from 'node:util'
import { ProjectsService } from '../projects/projects.service.js'
import { writeJson } from '../json-file.js'
import { publishDirectory } from './git-publish.js'
import { previewSite } from './preview.js'

type Phase = 'idle' | 'preparing' | 'ready' | 'uploading' | 'uploaded' | 'published' | 'error'
interface Publication {
  phase: Phase; repository: string; url: string; settingsUrl: string; previewUrl: string | null
  revision: string | null; projectCount: number; bytes: number; message: string; error: string | null
  lastPublishedAt: string | null
}
const exec = promisify(execFile)

@Injectable()
export class PublishingService implements OnModuleInit, OnModuleDestroy {
  private readonly root = resolve('..')
  private readonly logger = new Logger(PublishingService.name)
  private readonly statePath: string
  private readonly repository: string
  private readonly base: string
  private state: Publication
  private artifact: { folder: string; site: string; hash: string; revision: string } | null = null
  private preview: Server | null = null
  private job: Promise<void> | null = null

  constructor(private readonly config: ConfigService, private readonly projects: ProjectsService) {
    this.repository = config.get<string>('PAGES_REPOSITORY', 'iLestar/Portfolio')
    if (!/^[\w-]+\/[\w.-]+$/.test(this.repository)) throw new Error('PAGES_REPOSITORY debe tener el formato usuario/repositorio.')
    const [owner, name] = this.repository.split('/')
    this.base = name.toLowerCase() === `${owner.toLowerCase()}.github.io` ? '/' : `/${name}/`
    this.statePath = resolve(config.get<string>('DATA_DIR', 'data'), 'publication.json')
    this.state = { phase: 'idle', repository: this.repository, url: `https://${owner.toLowerCase()}.github.io${this.base}`, settingsUrl: `https://github.com/${this.repository}/settings/pages`, previewUrl: null, revision: null, projectCount: 0, bytes: 0, message: 'Prepara una vista previa antes de publicar en internet.', error: null, lastPublishedAt: null }
  }

  async onModuleInit() {
    try {
      const previous = JSON.parse(await readFile(this.statePath, 'utf8')) as Publication
      if (previous.repository === this.repository) this.state.lastPublishedAt = previous.lastPublishedAt
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') this.logger.warn('No se pudo leer el estado anterior de publicación.') }
  }

  status() { return { ...this.state, busy: Boolean(this.job) } }

  prepare() {
    this.assertLocalAndIdle()
    this.state = { ...this.state, phase: 'preparing', previewUrl: null, revision: null, error: null, message: 'Preparando las fichas y comprobando sus archivos…' }
    this.job = this.prepareArtifact().catch((error) => this.fail(error, 'No se pudo preparar la publicación. Comprueba los archivos y vuelve a intentarlo.')).finally(() => { this.job = null })
    return this.status()
  }

  publish(revision: string) {
    this.assertLocalAndIdle()
    if (!this.artifact || this.state.phase !== 'ready' || this.artifact.revision !== revision) throw new ConflictException('Prepara y revisa una vista previa actual antes de publicar.')
    this.state = { ...this.state, phase: 'uploading', error: null, message: 'Enviando la versión revisada a GitHub Pages. La primera subida puede tardar unos minutos…' }
    this.job = this.uploadArtifact().catch((error) => this.fail(error, 'No se pudo enviar a GitHub. Comprueba tu conexión y el acceso de Git a tu cuenta. Tu trabajo local sigue guardado.')).finally(() => { this.job = null })
    return this.status()
  }

  check() {
    this.assertLocalAndIdle()
    if (!this.artifact || this.state.phase !== 'uploaded') throw new ConflictException('Primero envía una versión preparada.')
    this.job = this.verifySite().then(async (visible) => {
      if (!visible) { this.state.message = 'GitHub todavía no muestra esta versión. Comprueba la activación de Pages o espera unos minutos y vuelve a comprobar.'; await this.persist() }
    }).catch((error) => this.fail(error, 'No se pudo comprobar la publicación. Vuelve a intentarlo.')).finally(() => { this.job = null })
    return this.status()
  }

  private assertLocalAndIdle() {
    if (this.config.get<string>('NODE_ENV') === 'production') throw new ForbiddenException('La publicación se gestiona desde el editor de tu computador.')
    if (this.job) throw new ConflictException('Ya hay una publicación en curso. Espera a que termine.')
  }

  private async prepareArtifact() {
    const clientDir = this.config.get<string>('STATIC_CLIENT_DIR', resolve('../client'))
    if (!clientDir || resolve(clientDir) !== join(this.root, 'client')) throw new Error('STATIC_CLIENT_DIR debe apuntar al frontend de este proyecto para preparar la publicación.')
    await this.closePreview()
    await this.cleanupArtifact()
    await this.projects.refreshStatic()
    const revision = randomUUID()
    const folder = join(this.root, 'tmp', `lestar-publication-${revision}`)
    const site = join(folder, 'site')
    this.artifact = { folder, site, hash: '', revision }
    await exec(process.execPath, [join(this.root, 'scripts/prepare-pages.mjs'), site, this.repository, revision], { cwd: this.root, windowsHide: true, timeout: 180000, maxBuffer: 2 * 1024 * 1024, env: process.env })
    const manifest = JSON.parse(await readFile(join(site, 'lestar-publication.json'), 'utf8')) as { projectCount: number; bytes: number; catalogHash: string }
    this.artifact = { folder, site, hash: manifest.catalogHash, revision }
    const preview = await previewSite(site, this.base)
    this.preview = preview.server
    this.state = { ...this.state, phase: 'ready', revision, previewUrl: preview.url, projectCount: manifest.projectCount, bytes: manifest.bytes, message: 'Vista previa lista. Revísala y pulsa «Publicar en internet» cuando esté bien.' }
    await this.persist()
  }

  private async uploadArtifact() {
    const artifact = this.artifact!
    if (artifact.hash !== await this.catalogHash()) throw new Error('El catálogo cambió. Vuelve a preparar la publicación antes de enviarla.')
    await publishDirectory(artifact.site, join(artifact.folder, 'git'), this.repository)
    this.state = { ...this.state, phase: 'uploaded', message: 'Archivos enviados. Si es la primera vez, activa GitHub Pages usando la rama gh-pages y la carpeta /(root). Después, las actualizaciones se publican desde este botón.' }
    await this.persist()
    // Un push correcto no significa que el alojamiento haya terminado de desplegar.
    for (let attempt = 0; attempt < 12; attempt++) {
      if (await this.verifySite()) return
      await new Promise((done) => setTimeout(done, 5000))
    }
  }

  private async verifySite() {
    try {
      const response = await fetch(`${this.state.url}lestar-publication.json?revision=${this.artifact!.revision}`, { signal: AbortSignal.timeout(5000), cache: 'no-store' })
      if (response.ok && (await response.json() as { revision?: string }).revision === this.artifact!.revision) {
        this.state = { ...this.state, phase: 'published', lastPublishedAt: new Date().toISOString(), message: 'Tu portafolio está publicado y la versión nueva se ha verificado en internet.' }
        await this.persist()
        return true
      }
    } catch { /* El alojamiento puede seguir desplegando o necesitar activación inicial. */ }
    return false
  }

  private async catalogHash() {
    return createHash('sha256').update(JSON.stringify(JSON.parse(await readFile(join(this.root, 'client/src/data/projects.json'), 'utf8')))).digest('hex')
  }
  private async persist() { await writeJson(this.statePath, this.state) }
  private async fail(error: unknown, message: string) {
    this.logger.error(error)
    this.state = { ...this.state, phase: 'error', error: message, message }
    await this.persist().catch(() => {})
  }
  private async closePreview() {
    const preview = this.preview
    this.preview = null
    if (preview) { preview.closeAllConnections(); await new Promise<void>((done) => preview.close(() => done())) }
  }
  private async cleanupArtifact() {
    if (!this.artifact) return
    const folder = resolve(this.artifact.folder)
    if (!folder.startsWith(join(this.root, 'tmp') + sep) || !/^lestar-publication-[\w-]+$/.test(folder.split(sep).at(-1)!)) throw new Error('Carpeta de publicación inesperada.')
    await rm(folder, { recursive: true, force: true })
    this.artifact = null
  }
  async onModuleDestroy() {
    await this.job
    await this.closePreview()
    await this.cleanupArtifact()
  }
}
