// ============================================================
// API CLIENT — toda la comunicación con el backend en un archivo.
// Las lecturas públicas caen al archivo local si la API no responde:
// el portafolio no se cae aunque el servidor esté apagado.
// ============================================================
import { projects as localProjects, getProject as localGet } from './data/projects'
import type { ProcessSection, Project } from './data/projects'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json() as Promise<T>
}

// ---------- Lectura pública (con respaldo local) ----------

export async function getProjects(): Promise<Project[]> {
  try {
    return await request<Project[]>('/projects')
  } catch {
    return localProjects
  }
}

export async function getFeatured(): Promise<Project[]> {
  try {
    return await request<Project[]>('/projects/featured')
  } catch {
    return localProjects.filter((p) => p.featured)
  }
}

export async function getProject(slug: string): Promise<Project | undefined> {
  try {
    return await request<Project>(`/projects/${slug}`)
  } catch {
    return localGet(slug)
  }
}

// ---------- Contacto ----------

export function sendContact(data: { name: string; email: string; message: string }) {
  return request<{ ok: boolean }>('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

// ---------- Admin ----------

const TOKEN_KEY = 'lestar-admin'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

function authInit(init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${getToken()}`,
    },
  }
}

// El proyecto tal como lo devuelve la lista admin (incluye id interno
// y los campos de administración que el público no necesita).
export type AdminProject = Project & {
  id: number
  featured: boolean
  published: boolean
  sortOrder: number
}

export const admin = {
  async login(user: string, password: string) {
    const res = await request<{ token: string }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, password }),
    })
    setToken(res.token)
  },

  list: () => request<AdminProject[]>('/projects/admin/all', authInit()),

  create: (dto: ProjectPayload) =>
    request<AdminProject>('/projects/admin', {
      method: 'POST',
      ...authInit({ headers: { 'Content-Type': 'application/json' } }),
      body: JSON.stringify(dto),
    }),

  update: (id: number, dto: Partial<ProjectPayload>) =>
    request<AdminProject>(`/projects/admin/${id}`, {
      method: 'PUT',
      ...authInit({ headers: { 'Content-Type': 'application/json' } }),
      body: JSON.stringify(dto),
    }),

  remove: (id: number) =>
    request<{ deleted: boolean }>(`/projects/admin/${id}`, {
      method: 'DELETE',
      ...authInit(),
    }),

  async upload(file: File) {
    const form = new FormData()
    form.append('file', file)
    return request<{ url: string }>('/upload', authInit({
      method: 'POST',
      body: form,
    }))
  },

  messages: () =>
    request<{ id: number; name: string; email: string; body: string; createdAt: string }[]>(
      '/messages',
      authInit(),
    ),
}

// El shape que el formulario del admin envía al API
// (aplana el modelo: summary_es/en, sections con es/en planos).
export interface ProjectPayload {
  slug: string
  title: string
  year: number
  category: string
  kind: string
  cover: string | null
  tools: string[]
  summaryEs: string
  summaryEn: string
  bodyEs: string | null
  bodyEn: string | null
  sections: { key: ProcessSection['key']; image: string | null; es: string; en: string }[] | null
  featured: boolean
  published: boolean
  sortOrder: number
}
