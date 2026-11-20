// Catálogo real exportado para funcionar sin backend ni base de datos.
import projectData from './projects.json'
import { assetUrl } from '../asset-url'

export type Category = 'branding' | 'ilustracion' | 'editorial' | 'fotografia' | 'retoque' | 'desarrollo' | 'otros'
export type ProjectKind = 'result' | 'process'

export interface Localized {
  es: string
  en: string
}

export interface Contributor {
  name: string
  url: string | null
}

// Adjunto descargable de la ficha (PDF, INDD, AI…).
export interface Attachment {
  url: string
  name: string
}

// Una sección de la ficha "proceso completo":
// briefing → bocetos → decisiones → resultado.
export interface ProcessSection {
  key: 'briefing' | 'bocetos' | 'decisiones' | 'resultado'
  body: Localized
  image?: string // URL de imagen; sin valor → bloque [PENDIENTE]
}

export interface Project {
  slug: string
  title: string
  year: number
  category: Category
  categories?: Category[]
  credits?: Localized
  contributors?: Contributor[]
  gallery?: { url: string; thumbnail?: string; es: string; en: string }[]
  documentUrl?: string | null
  translationStatus?: string
  translationError?: string | null
  kind: ProjectKind
  cover?: string // sin valor → placeholder
  coverThumbnail?: string
  tools: string[]
  summary: Localized
  body?: Localized
  sections?: ProcessSection[] // solo cuando kind === 'process'
  attachments?: Attachment[] // enlaces descargables (PDF, INDD…)
  featured?: boolean
}

export const CATEGORIES: Category[] = ['branding', 'editorial', 'ilustracion', 'fotografia', 'retoque', 'desarrollo', 'otros']

export const projects: Project[] = (projectData as Project[]).map((project) => ({
  ...project,
  cover: assetUrl(project.cover, import.meta.env.BASE_URL),
  coverThumbnail: assetUrl(project.coverThumbnail, import.meta.env.BASE_URL),
  documentUrl: assetUrl(project.documentUrl, import.meta.env.BASE_URL),
  gallery: project.gallery?.map((row) => ({ ...row, url: assetUrl(row.url, import.meta.env.BASE_URL), thumbnail: assetUrl(row.thumbnail, import.meta.env.BASE_URL) })),
  attachments: project.attachments?.map((row) => ({ ...row, url: assetUrl(row.url, import.meta.env.BASE_URL) })),
  sections: project.sections?.map((row) => ({ ...row, image: assetUrl(row.image, import.meta.env.BASE_URL) })),
}))

export const featured = projects.filter((p) => p.featured)

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}
