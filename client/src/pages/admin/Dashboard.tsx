import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { admin, clearToken } from '../../api'
import type { AdminProject } from '../../api'
import PublicationPanel from './PublicationPanel'

// Listado admin: todos los proyectos (incluidos borradores) + acciones.
export default function Dashboard() {
  const navigate = useNavigate()
  const [items, setItems] = useState<AdminProject[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)
  const saving = useRef(false)

  useEffect(() => {
    admin.list().then(setItems).catch((e) => setError(String(e)))
  }, [])

  async function onDelete(p: AdminProject) {
    if (!confirm(`¿Borrar "${p.title}"? Esto no se puede deshacer.`)) return
    await admin.remove(p.id)
    setItems((prev) => prev.filter((x) => x.id !== p.id))
  }

  async function onVisibility(p: AdminProject) {
    if (saving.current) return
    saving.current = true
    setSavingId(p.id); setError(''); setNotice('')
    try {
      const updated = await admin.update(p.id, { published: !p.published })
      setItems((prev) => prev.map((item) => item.id === p.id ? updated : item))
      setNotice(`«${p.title}» ${updated.published ? 'se mostrará' : 'quedará oculto'}. Prepara y publica la actualización para aplicar el cambio en internet.`)
      if (updated.staticExportError) setError(updated.staticExportError)
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cambiar la visibilidad del proyecto.') }
    finally { saving.current = false; setSavingId(null) }
  }

  return (
    <section className="wrap page">
      <header className="page__head">
        <h1 className="page__title">Panel</h1>
        <div className="admin-bar">
          <Link to="/admin/panel/mensajes" className="mono admin-bar__link">
            Mensajes
          </Link>
          <button
            className="mono admin-bar__link"
            onClick={() => {
              clearToken()
              navigate('/admin')
            }}
          >
            Salir
          </button>
        </div>
      </header>

      <PublicationPanel />

      <Link to="/admin/panel/nuevo" className="btn btn--primary admin-new">
        + Nuevo proyecto
      </Link>

      <p role="status">{notice}</p>
      {error && <p role="alert" className="form__error mono">{error}</p>}

      <ul className="admin-list">
        {items.map((p) => (
          <li key={p.id} className="admin-list__item">
            <div className="admin-list__info">
              <strong>{p.title}</strong>
              <span className="mono">
                {p.category} · {p.year}
                {p.featured ? ' · ★' : ''}
                {p.published ? ' · visible' : ' · oculto / borrador'}
              </span>
            </div>
            <div className="admin-list__actions">
              <button type="button" className="mono admin-bar__link" aria-label={`${p.published ? 'Ocultar' : 'Mostrar'} ${p.title}`} aria-disabled={savingId !== null} onClick={() => { void onVisibility(p) }}>
                {savingId === p.id ? 'Guardando…' : p.published ? 'Ocultar' : 'Mostrar'}
              </button>
              <Link to={`/admin/panel/editar/${p.id}`} className="mono admin-bar__link">
                Editar
              </Link>
              <button className="mono admin-bar__link danger" disabled={savingId !== null} onClick={() => onDelete(p)}>
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
