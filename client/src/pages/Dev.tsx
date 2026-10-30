import { useI18n } from '../i18n'

// Perfil técnico — el desarrollo tiene su propio apartado,
// sin quitarle protagonismo al diseño (y sin esconderlo).
export default function Dev() {
  const { t } = useI18n()

  return (
    <section className="wrap page">
      <h1 className="page__title">{t.dev.title}</h1>
      <p className="page__intro">{t.dev.intro}</p>

      <div className="dev">
        <div className="dev__block">
          <h2 className="mono dev__subtitle">{t.dev.stackTitle}</h2>
          <ul className="tagrow">
            {t.dev.stack.map((s) => (
              <li key={s} className="tag mono">
                {s}
              </li>
            ))}
          </ul>
          <p>{t.dev.thisSite}</p>
        </div>

        <div className="dev__block">
          <h2 className="mono dev__subtitle">{t.dev.reposTitle}</h2>
          <p className="mono">{t.dev.reposNote}</p>
          <span className="pending-tag">[PENDIENTE · enlaces GitHub]</span>
        </div>
      </div>
    </section>
  )
}
