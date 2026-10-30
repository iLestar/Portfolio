// Seed — vuelca los proyectos placeholder a MySQL.
// Uso: `npm run seed` (con la base arriba y .env configurado).
// No borra nada: si ya hay proyectos, solo informa y sale.
import 'dotenv/config'
import { DataSource } from 'typeorm'
import { Project } from './projects/project.entity.js'
import { Message } from './contact/message.entity.js'

const seed: Partial<Project>[] = [
  {
    slug: 'ambar-maison-boutique',
    title: 'Ámbar Maison Boutique',
    year: 2024,
    category: 'branding',
    kind: 'process',
    tools: ['Illustrator', 'Photoshop', 'InDesign'],
    summaryEs:
      '[PENDIENTE] Identidad completa para marca de fragancias: naming, isologo, sistema visual y aplicaciones.',
    summaryEn:
      '[TBD] Full identity for a fragrance brand: naming, logo, visual system and applications.',
    sections: [
      {
        key: 'briefing',
        image: null,
        es: '[PENDIENTE] El encargo: una boutique de fragancias que necesitaba sonar tan cara como huele.',
        en: '[TBD] The brief: a fragrance boutique that needed to look as expensive as it smells.',
      },
      {
        key: 'bocetos',
        image: null,
        es: '[PENDIENTE] Exploraciones: rutas serif vs. geométricas, el ámbar como color y como forma.',
        en: '[TBD] Explorations: serif vs. geometric routes, amber as color and as shape.',
      },
      {
        key: 'decisiones',
        image: null,
        es: '[PENDIENTE] Qué se descartó y por qué: la ruta final y los criterios que la sostienen.',
        en: '[TBD] What was discarded and why: the final route and the criteria behind it.',
      },
      {
        key: 'resultado',
        image: null,
        es: '[PENDIENTE] Sistema final: isologo, paleta, tipografías y aplicaciones de marca.',
        en: '[TBD] Final system: logo, palette, typefaces and brand applications.',
      },
    ],
    featured: true,
    sortOrder: 1,
  },
  {
    slug: 'musea',
    title: 'MUSEA',
    year: 2024,
    category: 'branding',
    kind: 'process',
    tools: ['Illustrator'],
    summaryEs:
      '[PENDIENTE] Isologo para MUSEA: construcción geométrica, retícula y versiones.',
    summaryEn:
      '[TBD] MUSEA logotype: geometric construction, grid and versions.',
    sections: [
      {
        key: 'briefing',
        image: null,
        es: '[PENDIENTE] Qué pedía el proyecto y qué debía evocar la marca.',
        en: '[TBD] What the project asked for and what the brand had to evoke.',
      },
      {
        key: 'bocetos',
        image: null,
        es: '[PENDIENTE] De la hoja al vector: rondas de exploración del isologo.',
        en: '[TBD] From paper to vector: exploration rounds for the logotype.',
      },
      {
        key: 'decisiones',
        image: null,
        es: '[PENDIENTE] Construcción sobre retícula: la geometría que sostiene la marca.',
        en: '[TBD] Built on a grid: the geometry holding the brand together.',
      },
      {
        key: 'resultado',
        image: null,
        es: '[PENDIENTE] Isologo final, versiones y reglas de uso.',
        en: '[TBD] Final logotype, versions and usage rules.',
      },
    ],
    featured: true,
    sortOrder: 2,
  },
  {
    slug: 'freedom',
    title: 'Freedom',
    year: 2024,
    category: 'ilustracion',
    kind: 'result',
    tools: ['Photoshop', 'Illustrator'],
    summaryEs:
      '[PENDIENTE] Pieza basada en “Freedom” de Rage Against The Machine: energía traducida a imagen.',
    summaryEn:
      '[TBD] Piece based on “Freedom” by Rage Against The Machine: energy translated into image.',
    bodyEs: '[PENDIENTE] Descripción del proyecto y la pieza final.',
    bodyEn: '[TBD] Project description and final piece.',
    sortOrder: 3,
  },
  {
    slug: 'periodico-alternativo',
    title: 'Periódico alternativo',
    year: 2024,
    category: 'editorial',
    kind: 'process',
    tools: ['InDesign', 'Illustrator', 'Photoshop'],
    summaryEs:
      '[PENDIENTE] Sistema editorial completo: retícula, tipografías, secciones y portadas.',
    summaryEn:
      '[TBD] Full editorial system: grid, typefaces, sections and covers.',
    sections: [
      { key: 'briefing', image: null, es: '[PENDIENTE] Un medio alternativo necesita verse distinto desde la primera página.', en: '[TBD] An alternative outlet needs to look different from page one.' },
      { key: 'bocetos', image: null, es: '[PENDIENTE] Retículas probadas y descartadas; ritmo de página.', en: '[TBD] Tested and discarded grids; page rhythm.' },
      { key: 'decisiones', image: null, es: '[PENDIENTE] Jerarquía, cabeceras de sección y sistema de titulares.', en: '[TBD] Hierarchy, section headers and headline system.' },
      { key: 'resultado', image: null, es: '[PENDIENTE] Páginas finales: portada y pliegos interiores.', en: '[TBD] Final pages: cover and inside spreads.' },
    ],
    sortOrder: 4,
  },
  {
    slug: 'proyecto-placeholder-1',
    title: '[PENDIENTE] Proyecto 5',
    year: 2023,
    category: 'otros',
    kind: 'result',
    tools: ['[PENDIENTE]'],
    summaryEs: '[PENDIENTE] Trabajo anterior por documentar.',
    summaryEn: '[TBD] Older work to be documented.',
    sortOrder: 5,
  },
]

async function main() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER ?? 'lestar',
    password: process.env.DB_PASSWORD ?? 'lestar_dev',
    database: process.env.DB_NAME ?? 'portfolio',
    entities: [Project, Message],
    synchronize: true,
  })
  await ds.initialize()

  const repo = ds.getRepository(Project)
  const count = await repo.count()
  if (count > 0) {
    console.log(`Ya hay ${count} proyectos — seed omitido (nada borrado).`)
  } else {
    await repo.save(seed.map((s) => repo.create(s)))
    console.log(`Seed listo: ${seed.length} proyectos insertados.`)
  }
  await ds.destroy()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
