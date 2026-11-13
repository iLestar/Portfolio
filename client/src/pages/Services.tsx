import { useI18n } from '../i18n'
import { Link } from 'react-router-dom'

export default function Services() {
  const { t } = useI18n()

  return (
    <section className="wrap page">
      <h1 className="page__title">{t.services.title}</h1>
      <p className="page__intro">
        {t.services.intro}
      </p>

      <ol className="services">
        {t.services.items.map((s, i) => (
          <li key={s.title} className="services__item">
            <span className="services__num mono">{String(i + 1).padStart(2, '0')}</span>
            <h2>{s.title}</h2>
            <p>{s.desc}</p>
          </li>
        ))}
      </ol>
      <Link to="/contacto" className="btn btn--ghost">{t.home.ctaContact} ↗</Link>
    </section>
  )
}
