import type { Project } from './project.entity.js'
import { Logger } from '@nestjs/common'
import { createHash } from 'node:crypto'

const logger = new Logger('Translation')

export function translationSourceHash(project: Project) {
  return createHash('sha256').update(JSON.stringify([project.summaryEs ?? '', project.bodyEs ?? '', project.creditsEs ?? '', (project.gallery ?? []).map((row) => [row.url, row.es])])).digest('hex')
}

// LibreTranslate can run locally or on a configured server. No third-party
// request is made unless the owner configures TRANSLATE_URL.
export async function translateProject(project: Project) {
  const targets = [
    { es: project.summaryEs, set: (en: string) => { project.summaryEn = en } },
    { es: project.bodyEs, set: (en: string) => { project.bodyEn = en } },
    { es: project.creditsEs, set: (en: string) => { project.creditsEn = en } },
    ...(project.gallery ?? []).map((row) => ({ es: row.es, set: (en: string) => { row.en = en } })),
  ].filter((row) => row.es?.trim())
  const sourceHash = translationSourceHash(project)
  if (project.translationStatus === 'reviewed' && project.translationSourceHash === sourceHash) return
  project.translationStatus = 'pending'
  project.translationError = null
  if (!targets.length) { project.translationStatus = 'complete'; return }
  const url = process.env.TRANSLATE_URL
  if (!url) { project.translationError = 'Falta configurar el servicio de traducción.'; return }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: targets.map((row) => row.es), source: 'es', target: 'en', format: 'text', api_key: process.env.TRANSLATE_API_KEY }),
      signal: AbortSignal.timeout(60000),
    })
    if (!response.ok) throw new Error(`El traductor respondió con HTTP ${response.status}.`)
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('La dirección configurada devuelve una página web, no una API de traducción JSON.')
    }
    const data = await response.json() as { translatedText?: unknown }
    if (!Array.isArray(data.translatedText) || data.translatedText.length !== targets.length || !data.translatedText.every((text) => typeof text === 'string' && text.trim())) {
      throw new Error('El traductor devolvió una respuesta incompleta o inválida.')
    }
    data.translatedText.forEach((text: string, index: number) => targets[index].set(text))
    project.translationStatus = 'complete'
    project.translationSourceHash = sourceHash
  } catch (error) {
    project.translationStatus = 'error'
    project.translationError = error instanceof Error && error.name === 'TimeoutError'
      ? 'El traductor tardó más de un minuto. Vuelve a guardar para reintentar.'
      : error instanceof TypeError ? 'No se pudo conectar con el traductor. Comprueba que Docker y LibreTranslate estén activos.'
      : error instanceof Error ? error.message : 'No se pudo traducir el proyecto.'
    logger.warn(`Proyecto ${project.id ?? 'nuevo'}: ${project.translationError}`)
    // Saving the original Spanish must survive a translation outage.
  }
}
