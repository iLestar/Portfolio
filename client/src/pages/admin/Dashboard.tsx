import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { admin, clearToken } from '../../api'
import type { AdminProject } from '../../api'

// Listado admin: todos los proyectos (incluidos borradores) + acciones.
export default function Dashboard() {
  const navigate = useNavigate()
  const [items, setItems] = useState<AdminProject[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    admin.list().then(setItems).catch((e) => setError(String(e)))
  }, [])

  async function onDelete(p: AdminProject) {
    if (!confirm(`¿Borrar "${p.title}"? Esto no se puede deshacer.`)) return
    await admin.remove(p.id)
    setItems((prev) => prev.filter((x) => x.id !== p.id))
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

      <Link to="/admin/panel/nuevo" className="btn btn--primary admin-new">
        + Nuevo proyecto
      </Link>

      {error && <p className="form__error mono">{error}</p>}

      <ul className="admin-list">
        {items.map((p) => (
          <li key={p.id} className="admin-list__item">
            <div className="admin-list__info">
              <strong>{p.title}</strong>
              <span className="mono">
                {p.category} · {p.year} · {p.kind}
                {p.featured ? ' · ★' : ''}
                {!p.published ? ' · borrador' : ''}
              </span>
            </div>
            <div className="admin-list__actions">
              <Link to={`/admin/panel/editar/${p.id}`} className="mono admin-bar__link">
                Editar
              </Link>
              <button className="mono admin-bar__link danger" onClick={() => onDelete(p)}>
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
