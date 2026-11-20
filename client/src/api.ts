// ============================================================
// El catálogo público se distribuye con el frontend.
// Solo el editor local y la bandeja de mensajes utilizan la API.
// ============================================================
import { projects as localProjects, getProject as localGet } from './data/projects'
import type { Category, Contributor, ProcessSection, Project } from './data/projects'
import { request } from './request.ts'
import { getToken, setToken } from './session.ts'
export { getToken, setToken, clearToken } from './session.ts'

// ---------- Lectura pública estática (sin peticiones de red) ----------

export async function getProjects(): Promise<Project[]> { return localProjects }

export async function getFeatured(): Promise<Project[]> { return localProjects.filter((p) => p.featured) }

export async function getProject(slug: string): Promise<Project | undefined> { return localGet(slug) }

// ---------- Admin ----------

function authInit(init: RequestInit = {}): RequestInit {
  const token = getToken()
  return {
    ...init,
    headers: {
      ...init.headers,
      Authorization: token ? `Bearer ${token}` : '',
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
  staticExportError?: string | null
}

export interface Publication {
  phase: 'idle' | 'preparing' | 'ready' | 'uploading' | 'uploaded' | 'published' | 'error'
  busy: boolean
  repository: string
  url: string
  settingsUrl: string
  previewUrl: string | null
  revision: string | null
  projectCount: number
  bytes: number
  message: string
  error: string | null
  lastPublishedAt: string | null
}

export const admin = {
  publication: () => request<Publication>('/publishing', authInit()),
  preparePublication: () => request<Publication>('/publishing/prepare', { method: 'POST', ...authInit() }),
  publish: (revision: string) => request<Publication>('/publishing/publish', { method: 'POST', ...authInit({ headers: { 'Content-Type': 'application/json' } }), body: JSON.stringify({ revision }) }),
  checkPublication: () => request<Publication>('/publishing/check', { method: 'POST', ...authInit() }),
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
    return request<{ url: string; name: string }>('/upload', authInit({
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
  contributors?: Contributor[] | null
  categories?: Category[]
  creditsEs?: string | null
  creditsEn?: string | null
  gallery?: { url: string; es: string; en: string }[] | null
  documentUrl?: string | null
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
  attachments: { url: string; name: string }[] | null
  featured: boolean
  published: boolean
  sortOrder: number
}
