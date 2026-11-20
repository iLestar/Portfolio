import { expireSession } from './session.ts'

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, init)
  if (!res.ok) {
    const authorization = new Headers(init?.headers).get('Authorization')
    if (res.status === 401 && authorization !== null) {
      expireSession(authorization.startsWith('Bearer ') ? authorization.slice(7) : null)
      throw new Error('Tu sesión caducó o dejó de ser válida. Vuelve a iniciar sesión.')
    }
    const text = await res.text().catch(() => '')
    let message = `No se pudo completar la solicitud (${res.status}).`
    try {
      const data = JSON.parse(text) as { message?: string | string[] }
      if (Array.isArray(data.message)) message = data.message.join('. ')
      else if (typeof data.message === 'string' && res.status !== 500) message = data.message
    } catch { /* Non-JSON errors use the readable default. */ }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}
