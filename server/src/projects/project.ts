export interface ProcessSectionRow {
  key: 'briefing' | 'bocetos' | 'decisiones' | 'resultado'
  image: string | null
  es: string
  en: string
}

export interface AttachmentRow { url: string; name: string }

// Formato de las fichas almacenadas en data/projects.json.
export interface Project {
  id: number
  slug: string
  title: string
  year: number
  category: 'branding' | 'ilustracion' | 'editorial' | 'fotografia' | 'retoque' | 'desarrollo' | 'otros'
  categories: string[] | null
  creditsEs: string | null
  creditsEn: string | null
  contributors: { name: string; url: string | null }[] | null
  gallery: { url: string; es: string; en: string }[] | null
  documentUrl: string | null
  translationStatus: string
  translationError: string | null
  translationSourceHash: string | null
  kind: 'result' | 'process'
  cover: string | null
  tools: string[]
  summaryEs: string
  summaryEn: string
  bodyEs: string | null
  bodyEn: string | null
  sections: ProcessSectionRow[] | null
  attachments: AttachmentRow[] | null
  featured: boolean
  published: boolean
  sortOrder: number
}
