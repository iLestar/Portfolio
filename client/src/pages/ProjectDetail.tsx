import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../i18n'
import { admin, getProject } from '../api'
import type { Project } from '../data/projects'
import PlaceholderImage from '../components/PlaceholderImage'
import NotFound from './NotFound'

// Ficha centrada en las piezas finales, la publicación y los créditos.
export default function ProjectDetail({ preview = false }: { preview?: boolean }) {
  const { slug, id } = useParams()
  const { t, pick, lang } = useI18n()
  const [project, setProject] = useState<Project | null | undefined>(undefined)

  useEffect(() => {
    let active = true
    setProject(undefined)
    const task = preview ? admin.list().then((rows) => rows.find((row) => row.id === Number(id))) : getProject(slug ?? '')
    task.then((p) => { if (active) setProject(p ?? null) }).catch(() => { if (active) setProject(null) })
    return () => { active = false }
  }, [slug, id, preview])

  if (project === undefined) return null // cargando
  if (project === null) return <NotFound />

  return (
    <article className="wrap page detail">
      {preview && <p className="preview-banner" role="status">Vista previa privada · <Link to={`/admin/panel/editar/${id}`}>Volver al editor</Link></p>}
      <Link to="/proyectos" className="mono detail__back">
        {t.project.back}
      </Link>

      <header className="detail__head">
        <h1 className="detail__title">{project.title}</h1>
        <dl className="meta mono">
          <div>
            <dt>{t.project.meta.category}</dt>
            <dd>{(project.categories ?? [project.category]).map((c) => t.projects.categories[c]).join(' · ')}</dd>
          </div>
          <div>
            <dt>{t.project.meta.year}</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>{t.project.meta.tools}</dt>
            <dd>{project.tools.join(' · ')}</dd>
          </div>
        </dl>
      </header>

      {project.cover ? (
        <a className="detail__cover-link" href={project.cover} target="_blank" rel="noopener noreferrer" aria-label={lang === 'es' ? `Ampliar portada de ${project.title}` : `Enlarge ${project.title} cover`}>
          <img className="detail__hero" src={project.cover} alt={project.title} />
        </a>
      ) : (
        <PlaceholderImage label={project.title} ratio="16 / 9" />
      )}

      <div className="detail__body">
        <p className="detail__summary">{pick(project.summary)}</p>
        {project.body && <p className="preserve-lines">{pick(project.body)}</p>}
      </div>

      {!!project.gallery?.length && <section className="project-gallery" aria-label={t.project.gallery}>
        <h2>{lang === 'es' ? 'Una mirada al proyecto' : 'A closer look'}</h2>
        {project.gallery.map((image) => <figure key={image.url}>
          <a href={image.url} target="_blank" rel="noopener"><img src={image.url} alt={pick(image)} loading="lazy" /></a>
          <figcaption>{pick(image)}</figcaption>
        </figure>)}
      </section>}

      {project.documentUrl && <section className="project-document">
        <h2>{lang === 'es' ? 'Explora la publicación completa' : 'Explore the full publication'}</h2>
        <p><a href={project.documentUrl} target="_blank" rel="noopener">{lang === 'es' ? 'Abrir PDF en otra pestaña ↗' : 'Open PDF in a new tab ↗'}</a></p>
        <iframe src={project.documentUrl} title={`${project.title} — PDF`} loading="lazy" />
      </section>}

      {(project.contributors?.length || (project.credits && pick(project.credits))) ? <section className="project-credits">
        <h2>{lang === 'es' ? 'Créditos y participación' : 'Credits and contributions'}</h2>
        {!!project.contributors?.length && <ul className="project-contributors">
          {project.contributors.map((person, index) => <li key={index}>
            {person.url && /^https?:\/\//i.test(person.url) ? <a href={person.url} target="_blank" rel="noopener noreferrer">{person.name} <span aria-hidden="true">↗</span></a> : person.name}
          </li>)}
        </ul>}
        {project.credits && <p className="preserve-lines">{pick(project.credits)}</p>}
      </section> : null}

      {project.attachments && project.attachments.length > 0 && (
        <div className="attach">
          <h2 className="mono attach__title">{t.project.files}</h2>
          <ul className="attach__list">
            {project.attachments.map((a) => (
              <li key={a.url}>
                {/* PDF se abre en el visor del navegador; INDD/AI/PSD se descargan */}
                <a className="attach__link mono" href={a.url} target="_blank" rel="noreferrer">
                  {a.name} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
