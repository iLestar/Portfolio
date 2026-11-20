import { expect, it } from 'vitest'
import { validateEnvironment } from './environment.js'

it('requires production credentials while keeping local development unchanged', () => {
  expect(validateEnvironment({})).toEqual({})
  const env = { NODE_ENV: 'production', ADMIN_USER: 'admin', ADMIN_PASSWORD: 'a-long-admin-password', JWT_SECRET: 'a'.repeat(64) }
  expect(validateEnvironment(env)).toBe(env)
  for (const key of ['ADMIN_USER', 'ADMIN_PASSWORD', 'JWT_SECRET']) {
    expect(() => validateEnvironment({ ...env, [key]: '' })).toThrow()
  }
  expect(() => validateEnvironment({ ...env, ADMIN_PASSWORD: 'cambia_esto' })).toThrow()
  expect(() => validateEnvironment({ ...env, JWT_SECRET: 'short' })).toThrow()
  expect(() => validateEnvironment({ ...env, ADMIN_PASSWORD: 'short' })).toThrow()
})
