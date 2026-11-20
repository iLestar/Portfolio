const TOKEN_KEY = 'lestar-admin'

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('Invalid token')
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number }
    if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp) || payload.exp <= Date.now() / 1000) throw new Error('Expired token')
    return token
  } catch {
    clearToken()
    return null
  }
}

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// La firma la verifica la API. Un 401 invalida también tokens aún no caducados.
export function expireSession(rejectedToken: string | null) {
  // Una petición antigua no debe cerrar una sesión recién iniciada.
  if (localStorage.getItem(TOKEN_KEY) !== rejectedToken) return
  clearToken()
  window.location.replace('/admin?sesion=expirada')
}
