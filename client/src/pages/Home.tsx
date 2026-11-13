import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { getFeatured } from '../api'
import type { Project } from '../data/projects'
import ProjectCard from '../components/ProjectCard'

// Lestar: expressive typography, personal signature and selected work.
export default function Home() {
  const { t } = useI18n()
  const [featured, setFeatured] = useState<Project[]>([])

  useEffect(() => {
    getFeatured().then(setFeatured)
  }, [])

  return (
    <>
      <section className="hero hero--expressive">
        <div className="wrap">
          <p className="hero__eyebrow mono">Juan Guillermo Gómez / {t.home.role}</p>
          <h1 className="hero__title">LESTAR<span className="hero__statement">{t.home.statementFirst}<br />{t.home.statementLast}</span></h1>
          <div className="hero__row">
            <p className="hero__claim">{t.home.claim}</p>
            <div className="hero__ctas">
              <Link to="/proyectos" className="btn btn--primary">
                {t.home.ctaProjects} →
              </Link>
              <Link to="/contacto" className="btn btn--ghost">
                {t.home.ctaContact}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap featured expressive-featured">
        <h2 className="section-title">
          {t.home.featuredTitle}
          <span className="section-title__num mono">
            {String(featured.length).padStart(2, '0')}
          </span>
        </h2>
        <div className="featured__grid">
          {featured.map((p, i) => (
            <ProjectCard
              key={p.slug}
              project={p}
              index={i}
            />
          ))}
        </div>
        <Link className="home-all mono" to="/proyectos">{t.home.ctaProjects} ↗</Link>
      </section>
    </>
  )
}
