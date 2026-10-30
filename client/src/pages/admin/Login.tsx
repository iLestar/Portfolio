import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { admin, getToken } from '../../api'
import type { FormEvent } from 'react'

// Login del panel — un solo usuario (definido en server/.env).
export default function AdminLogin() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (getToken()) {
    navigate('/admin/panel', { replace: true })
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = new FormData(e.currentTarget)
    try {
      await admin.login(String(data.get('user')), String(data.get('password')))
      navigate('/admin/panel')
    } catch {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="wrap page admin-login">
      <h1 className="page__title">Panel</h1>
      <form className="form" onSubmit={onSubmit}>
        <label className="form__field">
          <span className="mono">Usuario</span>
          <input name="user" type="text" required autoComplete="username" />
        </label>
        <label className="form__field">
          <span className="mono">Contraseña</span>
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        <button className="btn btn--primary" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar →'}
        </button>
        {error && <p className="form__error mono">{error}</p>}
      </form>
    </section>
  )
}
