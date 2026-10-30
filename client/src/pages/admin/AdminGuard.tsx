import { Navigate, Outlet } from 'react-router-dom'
import { getToken } from '../../api'

// Envuelve las rutas de admin: sin token → a /admin (login).
export default function AdminGuard() {
  return getToken() ? <Outlet /> : <Navigate to="/admin" replace />
}
