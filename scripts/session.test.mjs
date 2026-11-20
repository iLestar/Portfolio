import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { getToken, setToken } from '../client/src/session.ts'
import { request } from '../client/src/request.ts'

const originals = { storage: Object.getOwnPropertyDescriptor(globalThis, 'localStorage'), window: Object.getOwnPropertyDescriptor(globalThis, 'window'), fetch: globalThis.fetch }
let redirects
const token = (exp) => `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`
beforeEach(() => {
  const values = new Map()
  redirects = []
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) } })
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { replace: (path) => redirects.push(path) } } })
})
afterEach(() => {
  for (const [key, descriptor] of [['localStorage', originals.storage], ['window', originals.window]]) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor)
    else delete globalThis[key]
  }
  globalThis.fetch = originals.fetch
})

test('expired or malformed stored sessions cannot redirect the login to the panel', () => {
  for (const stored of [token(Date.now() / 1000 - 1), token(undefined), token('tomorrow'), 'broken']) {
    setToken(stored)
    assert.equal(getToken(), null)
    assert.equal(localStorage.getItem('lestar-admin'), null)
  }
  const valid = token(Date.now() / 1000 + 3600)
  setToken(valid)
  assert.equal(getToken(), valid)
})

test('a protected 401 clears the rejected session and returns to login once', async () => {
  const stored = token(Date.now() / 1000 + 3600)
  setToken(stored)
  globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Token inválido o expirado' }), { status: 401 })
  await assert.rejects(request('/projects/admin/all', { headers: { Authorization: `Bearer ${stored}` } }), /Vuelve a iniciar sesión/)
  await assert.rejects(request('/messages', { headers: { Authorization: `Bearer ${stored}` } }))
  assert.equal(getToken(), null)
  assert.deepEqual(redirects, ['/admin?sesion=expirada'])
})

test('incorrect login credentials and server failures do not log out another valid session', async () => {
  const stored = token(Date.now() / 1000 + 3600)
  setToken(stored)
  globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Usuario o contraseña incorrectos' }), { status: 401 })
  await assert.rejects(request('/auth/login', { method: 'POST' }), /Usuario o contraseña incorrectos/)
  globalThis.fetch = async () => new Response('Unavailable', { status: 503 })
  await assert.rejects(request('/projects/admin/all', { headers: { Authorization: `Bearer ${stored}` } }))
  assert.equal(getToken(), stored)
  assert.deepEqual(redirects, [])
})

test('a late 401 does not invalidate a newer login', async () => {
  const previous = token(Date.now() / 1000 + 3600)
  const current = token(Date.now() / 1000 + 7200)
  setToken(current)
  globalThis.fetch = async () => new Response('', { status: 401 })
  await assert.rejects(request('/messages', { headers: { Authorization: `Bearer ${previous}` } }))
  assert.equal(getToken(), current)
  assert.deepEqual(redirects, [])
})

test('a session that expires while the editor is open also returns to login', async () => {
  setToken(token(Date.now() / 1000 - 1))
  assert.equal(getToken(), null)
  globalThis.fetch = async () => new Response('', { status: 401 })
  await assert.rejects(request('/projects/admin/2', { method: 'PUT', headers: { Authorization: '' } }))
  assert.deepEqual(redirects, ['/admin?sesion=expirada'])
})
