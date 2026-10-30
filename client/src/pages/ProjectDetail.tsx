import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../i18n'
import { getProject } from '../api'
import type { Project } from '../data/projects'
import PlaceholderImage from '../components/PlaceholderImage'
import NotFound from './NotFound'

// Ficha dual: kind 'result' → resultado + galería;
// kind 'process' → además desfila briefing → bocetos → decisiones → resultado.
export default function ProjectDetail() {
  const { slug } = useParams()
  const { t, pick } = useI18n()
  const [project, setProject] = useState<Project | null | undefined>(undefined)

  useEffect(() => {
    if (slug) getProject(slug).then((p) => setProject(p ?? null))
  }, [slug])

  if (project === undefined) return null // cargando
  if (project === null) return <NotFound />

  return (
    <article className="wrap page detail">
      <Link to="/proyectos" className="mono detail__back">
        {t.project.back}
      </Link>

      <header className="detail__head">
        <h1 className="detail__title">{project.title}</h1>
        <dl className="meta mono">
          <div>
            <dt>{t.project.meta.category}</dt>
            <dd>{t.projects.categories[project.category]}</dd>
          </div>
          <div>
            <dt>{t.project.meta.year}</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>{t.project.meta.type}</dt>
            <dd>{t.project.kind[project.kind]}</dd>
          </div>
          <div>
            <dt>{t.project.meta.tools}</dt>
            <dd>{project.tools.join(' · ')}</dd>
          </div>
        </dl>
      </header>

      {project.cover ? (
        <img className="detail__hero" src={project.cover} alt={project.title} />
      ) : (
        <PlaceholderImage label={project.title} ratio="16 / 9" />
      )}

      {project.kind === 'result' ? (
        <div className="detail__body">
          <p className="detail__summary">{pick(project.summary)}</p>
          {project.body && <p>{pick(project.body)}</p>}
        </div>
      ) : (
        <div className="process">
          {project.sections?.map((s, i) => (
            <section key={s.key} className="process__step">
              <div className="process__rail mono">
                <span className="process__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="process__name">
                  {t.project.sections[s.key]}
                </span>
              </div>
              <div className="process__content">
                <p>{pick(s.body)}</p>
                {s.image ? (
                  <img src={s.image} alt={`${project.title} — ${t.project.sections[s.key]}`} loading="lazy" />
                ) : (
                  <PlaceholderImage
                    label={`${project.title} — ${t.project.sections[s.key]}`}
                    ratio="4 / 3"
                  />
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </article>
  )
}
