import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

// Sección de la ficha "proceso": guardada como JSON en una sola columna.
export interface ProcessSectionRow {
  key: 'briefing' | 'bocetos' | 'decisiones' | 'resultado'
  image: string | null
  es: string
  en: string
}

// Adjunto descargable de la ficha (PDF, INDD, AI, PSD…).
export interface AttachmentRow {
  url: string
  name: string
}

// Espejo del modelo del frontend (client/src/data/projects.ts):
// lo plano vive en columnas; lo bilingüe se aplana en *_es / *_en.
@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number

  // Tipos explícitos en todas las columnas: el seed corre con tsx/esbuild,
  // que no emite la metadata de tipos que TypeORM usaría para adivinarlos.
  @Column({ type: 'varchar', unique: true, length: 120 })
  slug: string

  @Column({ type: 'varchar', length: 200 })
  title: string

  @Column('smallint')
  year: number

  @Column({ type: 'varchar', length: 30 })
  category: 'branding' | 'ilustracion' | 'editorial' | 'fotografia' | 'retoque' | 'desarrollo' | 'otros'

  @Column('json', { nullable: true })
  categories: string[] | null

  @Column('text', { nullable: true })
  creditsEs: string | null

  @Column('text', { nullable: true })
  creditsEn: string | null

  @Column('json', { nullable: true })
  contributors: { name: string; url: string | null }[] | null

  @Column('json', { nullable: true })
  gallery: { url: string; es: string; en: string }[] | null

  @Column({ type: 'varchar', length: 500, nullable: true })
  documentUrl: string | null

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  translationStatus: string

  @Column('text', { nullable: true })
  translationError: string | null

  @Column({ type: 'varchar', length: 64, nullable: true })
  translationSourceHash: string | null

  // 'result' = solo resultado final · 'process' = ficha con proceso completo
  @Column({ type: 'varchar', length: 10 })
  kind: 'result' | 'process'

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover: string | null

  @Column('simple-array')
  tools: string[]

  @Column('text')
  summaryEs: string

  @Column('text')
  summaryEn: string

  @Column('text', { nullable: true })
  bodyEs: string | null

  @Column('text', { nullable: true })
  bodyEn: string | null

  @Column('json', { nullable: true })
  sections: ProcessSectionRow[] | null

  @Column('json', { nullable: true })
  attachments: AttachmentRow[] | null

  @Column({ type: 'boolean', default: false })
  featured: boolean

  @Column({ type: 'boolean', default: true })
  published: boolean

  @Column({ type: 'int', default: 0 })
  sortOrder: number
}
