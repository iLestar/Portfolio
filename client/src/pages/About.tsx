import { useI18n } from '../i18n'
import { Link } from 'react-router-dom'

export default function About() {
  const { t } = useI18n()

  return (
    <section className="wrap page">
      <h1 className="page__title">{t.about.title}</h1>

      <div className="about">
        <div className="about__bio">
          {t.about.bio.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <aside className="about__col">
          <h2 className="mono about__subtitle">{t.about.educationTitle}</h2>
          <ul className="lines">
            {t.about.education.map((e) => (
              <li key={e.title}>
                <strong>{e.title}</strong>
                <span className="mono">{e.detail}</span>
              </li>
            ))}
          </ul>

          <h2 className="mono about__subtitle">{t.about.toolsTitle}</h2>
          <ul className="tagrow">
            {t.about.tools.map((tool) => (
              <li key={tool} className="tag mono">
                {tool}
              </li>
            ))}
          </ul>

          <Link to="/desarrollo" className="mono">{t.about.devNote}</Link>
        </aside>
      </div>
    </section>
  )
}
