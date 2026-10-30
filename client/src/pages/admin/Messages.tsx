import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { admin } from '../../api'

// Bandeja de mensajes del formulario de contacto.
export default function Messages() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Awaited<ReturnType<typeof admin.messages>>>([])
  const [error, setError] = useState('')

  useEffect(() => {
    admin.messages().then(setItems).catch((e) => setError(String(e)))
  }, [])

  return (
    <section className="wrap page">
      <header className="page__head">
        <h1 className="page__title">Mensajes</h1>
        <button className="mono admin-bar__link" onClick={() => navigate('/admin/panel')}>
          ← Panel
        </button>
      </header>
      {error && <p className="form__error mono">{error}</p>}
      {items.length === 0 && !error && <p className="mono">Sin mensajes todavía.</p>}
      <ul className="admin-list">
        {items.map((m) => (
          <li key={m.id} className="admin-list__item admin-list__item--block">
            <div className="admin-list__info">
              <strong>{m.name}</strong>
              <a className="mono" href={`mailto:${m.email}`}>{m.email}</a>
              <p>{m.body}</p>
              <span className="mono">{new Date(m.createdAt).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
