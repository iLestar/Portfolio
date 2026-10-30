// ============================================================
// DATOS DE PROYECTOS — placeholders marcados [PENDIENTE].
// Cuando el backend exista (etapa 4), este archivo se reemplaza
// por fetch() a la API; el modelo de abajo ES el esquema MySQL.
// ============================================================

export type Category = 'branding' | 'ilustracion' | 'editorial' | 'otros'
export type ProjectKind = 'result' | 'process'

export interface Localized {
  es: string
  en: string
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
  kind: ProjectKind
  cover?: string // sin valor → placeholder
  tools: string[]
  summary: Localized
  body?: Localized
  sections?: ProcessSection[] // solo cuando kind === 'process'
  attachments?: Attachment[] // enlaces descargables (PDF, INDD…)
  featured?: boolean
}

export const CATEGORIES: Category[] = ['branding', 'ilustracion', 'editorial', 'otros']

export const projects: Project[] = [
  {
    slug: 'ambar-maison-boutique',
    title: 'Ámbar Maison Boutique',
    year: 2024,
    category: 'branding',
    kind: 'process',
    tools: ['Illustrator', 'Photoshop', 'InDesign'],
    summary: {
      es: '[PENDIENTE] Identidad completa para marca de fragancias: naming, isologo, sistema visual y aplicaciones.',
      en: '[TBD] Full identity for a fragrance brand: naming, logo, visual system and applications.',
    },
    sections: [
      {
        key: 'briefing',
        body: {
          es: '[PENDIENTE] El encargo: una boutique de fragancias que necesitaba sonar tan cara como huele.',
          en: '[TBD] The brief: a fragrance boutique that needed to look as expensive as it smells.',
        },
      },
      {
        key: 'bocetos',
        body: {
          es: '[PENDIENTE] Exploraciones: rutas serif vs. geométricas, el ámbar como color y como forma.',
          en: '[TBD] Explorations: serif vs. geometric routes, amber as color and as shape.',
        },
      },
      {
        key: 'decisiones',
        body: {
          es: '[PENDIENTE] Qué se descartó y por qué: la ruta final y los criterios que la sostienen.',
          en: '[TBD] What was discarded and why: the final route and the criteria behind it.',
        },
      },
      {
        key: 'resultado',
        body: {
          es: '[PENDIENTE] Sistema final: isologo, paleta, tipografías y aplicaciones de marca.',
          en: '[TBD] Final system: logo, palette, typefaces and brand applications.',
        },
      },
    ],
    featured: true,
  },
  {
    slug: 'musea',
    title: 'MUSEA',
    year: 2024,
    category: 'branding',
    kind: 'process',
    tools: ['Illustrator'],
    summary: {
      es: '[PENDIENTE] Isologo para MUSEA: construcción geométrica, retícula y versiones.',
      en: '[TBD] MUSEA logotype: geometric construction, grid and versions.',
    },
    sections: [
      {
        key: 'briefing',
        body: {
          es: '[PENDIENTE] Qué pedía el proyecto y qué debía evocar la marca.',
          en: '[TBD] What the project asked for and what the brand had to evoke.',
        },
      },
      {
        key: 'bocetos',
        body: {
          es: '[PENDIENTE] De la hoja al vector: rondas de exploración del isologo.',
          en: '[TBD] From paper to vector: exploration rounds for the logotype.',
        },
      },
      {
        key: 'decisiones',
        body: {
          es: '[PENDIENTE] Construcción sobre retícula: la geometría que sostiene la marca.',
          en: '[TBD] Built on a grid: the geometry holding the brand together.',
        },
      },
      {
        key: 'resultado',
        body: {
          es: '[PENDIENTE] Isologo final, versiones y reglas de uso.',
          en: '[TBD] Final logotype, versions and usage rules.',
        },
      },
    ],
    featured: true,
  },
  {
    slug: 'freedom',
    title: 'Freedom',
    year: 2024,
    category: 'ilustracion',
    kind: 'result',
    tools: ['Photoshop', 'Illustrator'],
    summary: {
      es: '[PENDIENTE] Pieza basada en “Freedom” de Rage Against The Machine: energía traducida a imagen.',
      en: '[TBD] Piece based on “Freedom” by Rage Against The Machine: energy translated into image.',
    },
    body: {
      es: '[PENDIENTE] Descripción del proyecto y la pieza final.',
      en: '[TBD] Project description and final piece.',
    },
  },
  {
    slug: 'periodico-alternativo',
    title: 'Periódico alternativo',
    year: 2024,
    category: 'editorial',
    kind: 'process',
    tools: ['InDesign', 'Illustrator', 'Photoshop'],
    summary: {
      es: '[PENDIENTE] Sistema editorial completo: retícula, tipografías, secciones y portadas.',
      en: '[TBD] Full editorial system: grid, typefaces, sections and covers.',
    },
    sections: [
      {
        key: 'briefing',
        body: {
          es: '[PENDIENTE] Un medio alternativo necesita verse distinto desde la primera página.',
          en: '[TBD] An alternative outlet needs to look different from page one.',
        },
      },
      {
        key: 'bocetos',
        body: {
          es: '[PENDIENTE] Retículas probadas y descartadas; ritmo de página.',
          en: '[TBD] Tested and discarded grids; page rhythm.',
        },
      },
      {
        key: 'decisiones',
        body: {
          es: '[PENDIENTE] Jerarquía, cabeceras de sección y sistema de titulares.',
          en: '[TBD] Hierarchy, section headers and headline system.',
        },
      },
      {
        key: 'resultado',
        body: {
          es: '[PENDIENTE] Páginas finales: portada y pliegos interiores.',
          en: '[TBD] Final pages: cover and inside spreads.',
        },
      },
    ],
  },
  {
    slug: 'proyecto-placeholder-1',
    title: '[PENDIENTE] Proyecto 5',
    year: 2023,
    category: 'otros',
    kind: 'result',
    tools: ['[PENDIENTE]'],
    summary: {
      es: '[PENDIENTE] Trabajo anterior por documentar.',
      en: '[TBD] Older work to be documented.',
    },
  },
]

export const featured = projects.filter((p) => p.featured)

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}
