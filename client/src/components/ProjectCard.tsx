import { Link } from 'react-router-dom'
import type { Project } from '../data/projects'
import { useI18n } from '../i18n'
import PlaceholderImage from './PlaceholderImage'

// Tarjeta-póster de proyecto: índice grande, imagen, meta técnica.
export default function ProjectCard({
  project,
  index,
  tilt,
}: {
  project: Project
  index: number
  tilt?: 'a' | 'b' // rotación de los destacados en home
}) {
  const { t, pick } = useI18n()
  const cls = ['card', tilt ? `card--tilt-${tilt}` : ''].join(' ').trim()

  return (
    <Link to={`/proyectos/${project.slug}`} className={cls}>
      <div className="card__media">
        {project.cover ? (
          <img src={project.cover} alt={project.title} loading="lazy" />
        ) : (
          <PlaceholderImage label={project.title} />
        )}
        <span className="card__index mono">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="card__row">
        <h3 className="card__title">{project.title}</h3>
        <span className="card__kind mono">
          {t.project.kind[project.kind]}
        </span>
      </div>
      <p className="card__meta mono">
        {t.projects.categories[project.category]} · {project.year}
      </p>
      <p className="card__summary">{pick(project.summary)}</p>
    </Link>
  )
}
