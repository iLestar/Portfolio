import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import { CATEGORIES, projects } from '../data/projects'
import type { Category } from '../data/projects'
import ProjectCard from '../components/ProjectCard'

// Índice filtrable — lectura rápida para el reclutador.
export default function Projects() {
  const { t } = useI18n()
  const [filter, setFilter] = useState<Category | null>(null)

  const visible = useMemo(
    () => (filter ? projects.filter((p) => p.category === filter) : projects),
    [filter],
  )

  return (
    <section className="wrap page">
      <header className="page__head">
        <h1 className="page__title">{t.projects.title}</h1>
        <p className="mono">{t.projects.count(visible.length)}</p>
      </header>

      <div className="filters" role="group" aria-label="Filtrar por categoría">
        <button
          className={`chip mono${filter === null ? ' chip--active' : ''}`}
          onClick={() => setFilter(null)}
        >
          {t.projects.all}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip mono${filter === c ? ' chip--active' : ''}`}
            onClick={() => setFilter(filter === c ? null : c)}
            aria-pressed={filter === c}
          >
            {t.projects.categories[c]}
          </button>
        ))}
      </div>

      <div className="grid">
        {visible.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>
    </section>
  )
}
