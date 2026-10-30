import { useState } from 'react'
import { useI18n } from '../i18n'

// Formulario real — por ahora solo valida y avisa;
// el POST a /api/contact llega con el backend (etapa 5).
export default function Contact() {
  const { t } = useI18n()
  const [sent, setSent] = useState(false)

  return (
    <section className="wrap page">
      <h1 className="page__title">{t.contact.title}</h1>
      <p className="page__intro">{t.contact.intro}</p>

      <div className="contact">
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <label className="form__field">
            <span className="mono">{t.contact.name}</span>
            <input type="text" name="name" required autoComplete="name" />
          </label>
          <label className="form__field">
            <span className="mono">{t.contact.email}</span>
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <label className="form__field">
            <span className="mono">{t.contact.message}</span>
            <textarea name="message" rows={6} required />
          </label>
          <button type="submit" className="btn btn--primary">
            {t.contact.send} →
          </button>
          {sent && <p className="mono">{t.contact.pendingNote}</p>}
          <p className="mono">{t.contact.pendingNote}</p>
        </form>

        <aside>
          <h2 className="mono dev__subtitle">{t.contact.socialsTitle}</h2>
          <ul className="lines">
            {t.contact.socials.map((s) => (
              <li key={s.name}>
                <a href={s.url} className="contact__social">
                  {s.name}
                  <span className="mono">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <span className="pending-tag">[PENDIENTE · URLs reales]</span>
        </aside>
      </div>
    </section>
  )
}
