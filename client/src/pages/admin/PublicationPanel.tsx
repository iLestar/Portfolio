import { useEffect, useRef, useState } from 'react'
import { admin } from '../../api'
import type { Publication } from '../../api'

export default function PublicationPanel() {
  const [publication, setPublication] = useState<Publication | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState<'prepare' | 'publish' | 'check' | null>(null)
  const requestPending = useRef(false)
  const requestVersion = useRef(0)
  useEffect(() => {
    let active = true
    const update = () => {
      if (requestPending.current) return
      const version = requestVersion.current
      return admin.publication().then((state) => { if (active && version === requestVersion.current) { setPublication(state); setError('') } }).catch(() => { if (active && version === requestVersion.current) setError('No se pudo consultar la publicación. Comprueba que el backend esté encendido.') })
    }
    void update()
    const timer = window.setInterval(() => { void update() }, 2500)
    return () => { active = false; window.clearInterval(timer) }
  }, [])

  async function act(publish: boolean) {
    if (requestPending.current || publication?.busy) return
    requestPending.current = true
    requestVersion.current++
    setSubmitting(publish ? 'publish' : 'prepare'); setError('')
    try {
      const state = publish && publication?.revision ? await admin.publish(publication.revision) : await admin.preparePublication()
      setPublication(state)
    } catch (error) { setError(error instanceof Error ? error.message : 'No se pudo completar la acción.') }
    finally { requestPending.current = false; setSubmitting(null) }
  }

  async function check() {
    if (requestPending.current || publication?.busy) return
    requestPending.current = true
    requestVersion.current++
    setSubmitting('check'); setError('')
    try { setPublication(await admin.checkPublication()) }
    catch (error) { setError(error instanceof Error ? error.message : 'No se pudo comprobar el sitio.') }
    finally { requestPending.current = false; setSubmitting(null) }
  }

  const busy = Boolean(submitting || publication?.busy)
  const preparing = submitting === 'prepare' || publication?.phase === 'preparing'
  const verifying = submitting === 'check' || (publication?.phase === 'uploaded' && busy)
  const publishing = submitting === 'publish' || publication?.phase === 'uploading'
  const progressTitle = preparing ? 'Preparando vista previa…' : verifying ? 'Comprobando la publicación…' : publishing ? 'Publicando en internet…' : publication?.phase === 'published' ? 'Publicación completada' : null
  const progressMessage = submitting === 'publish' ? 'Iniciando el envío a GitHub. No necesitas volver a pulsar el botón.' : submitting === 'prepare' ? 'Generando la vista previa con tus proyectos y archivos.' : submitting === 'check' ? 'Comprobando si la nueva versión ya está disponible en internet.' : publication?.message
  return <section className="publication-panel" aria-labelledby="publication-title">
    <div><p className="mono">TU PORTAFOLIO EN INTERNET</p><h2 id="publication-title">Revisa y publica</h2><p>Guardar una ficha actualiza tu copia local. Para que los demás vean los cambios, prepara y publica una versión completa.</p></div>
    {publication && <>
      <div className={`publication-panel__status${busy ? ' publication-panel__status--busy' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        {busy && <span className="publication-panel__spinner" aria-hidden="true" />}
        <div>{progressTitle && <strong>{progressTitle}</strong>}<p>{progressMessage}</p>{busy && <small>Este proceso puede tardar varios minutos. Mantén el backend encendido; el estado se actualiza automáticamente.</small>}</div>
      </div>
      {publication.revision && <p className="mono">{publication.projectCount} proyectos · {(publication.bytes / 1024 / 1024).toFixed(1)} MiB · solo contenido público</p>}
      <div className="publication-panel__actions">
        <button className="btn btn--ghost" disabled={busy} onClick={() => { void act(false) }}>{preparing ? 'Preparando…' : '1. Preparar vista previa'}</button>
        {publication.previewUrl && <a className="btn btn--ghost" href={publication.previewUrl} target="_blank" rel="noopener noreferrer">Revisar vista previa ↗</a>}
        <button className="btn btn--primary" disabled={busy || publication.phase !== 'ready'} onClick={() => { void act(true) }}>{publishing ? 'Publicando…' : verifying ? 'Verificando…' : '2. Publicar en internet'}</button>
        {publication.phase === 'uploaded' && <button className="btn btn--ghost" disabled={busy} onClick={() => { void check() }}>{verifying ? 'Comprobando…' : 'Comprobar publicación'}</button>}
      </div>
      <p><a href={publication.url} target="_blank" rel="noopener noreferrer">Ver sitio en internet ↗</a> · <a href={publication.settingsUrl} target="_blank" rel="noopener noreferrer">Activar GitHub Pages la primera vez ↗</a></p>
      <small>En GitHub, selecciona «Deploy from a branch», rama «gh-pages» y carpeta «/(root)» después del primer envío. No requiere contratar un plan.</small>
      {publication.lastPublishedAt && <p>Última publicación verificada: {new Date(publication.lastPublishedAt).toLocaleString()}.</p>}
    </>}
    {error && <p role="alert" className="form__error">{error}</p>}
  </section>
}
