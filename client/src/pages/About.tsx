import { useI18n } from '../i18n'
import PlaceholderImage from '../components/PlaceholderImage'

export default function About() {
  const { t } = useI18n()

  return (
    <section className="wrap page">
      <h1 className="page__title">{t.about.title}</h1>

      <div className="about">
        <PlaceholderImage label={t.about.photoAlt} ratio="3 / 4" />

        <div className="about__col">
          <p className="about__bio">{t.about.bio}</p>
          <span className="pending-tag">[PENDIENTE · bio — borrador]</span>

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

          <p className="mono">{t.about.devNote}</p>
        </div>
      </div>
    </section>
  )
}
