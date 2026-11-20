// Evita publicar la API con las claves de ejemplo.
export function validateEnvironment(env: Record<string, unknown>) {
  if (env.NODE_ENV !== 'production') return env
  for (const key of ['ADMIN_USER', 'ADMIN_PASSWORD', 'JWT_SECRET']) {
    const value = env[key]
    if (typeof value !== 'string' || !value.trim() || /cambia_esto|dev-secret/.test(value)) {
      throw new Error(`Configura ${key} con un valor de producción.`)
    }
  }
  if (String(env.JWT_SECRET).length < 32 || String(env.ADMIN_PASSWORD).length < 12) {
    throw new Error('JWT_SECRET necesita al menos 32 caracteres y ADMIN_PASSWORD al menos 12.')
  }
  return env
}
