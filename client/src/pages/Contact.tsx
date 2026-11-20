import { useI18n } from '../i18n'

// Prepara un correo; no envía ni guarda mensajes en un servidor.
export default function Contact() {
  const { t } = useI18n()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const body = `${t.contact.name}: ${data.get('name')}\n${t.contact.email}: ${data.get('email')}\n\n${data.get('message')}`
    window.location.href = `mailto:${t.contact.publicEmail}?subject=${encodeURIComponent(t.contact.subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <section className="wrap page">
      <h1 className="page__title">{t.contact.title}</h1>
      <p className="page__intro">{t.contact.intro}</p>

      <div className="contact">
        <form className="form" onSubmit={onSubmit}>
          <label className="form__field">
            <span className="mono">{t.contact.name}</span>
            <input type="text" name="name" minLength={2} maxLength={200} required autoComplete="name" />
          </label>
          <label className="form__field">
            <span className="mono">{t.contact.email}</span>
            <input type="email" name="email" maxLength={200} required autoComplete="email" />
          </label>
          <label className="form__field">
            <span className="mono">{t.contact.message}</span>
            <textarea name="message" rows={6} minLength={5} maxLength={5000} required />
          </label>
          <p>{t.contact.emailHint}</p>
          <button type="submit" className="btn btn--primary">
            {t.contact.prepareEmail} →
          </button>
        </form>

        <aside>
          <h2 className="mono dev__subtitle">{t.contact.email}</h2>
          <a className="contact__email" href={`mailto:${t.contact.publicEmail}`}>{t.contact.publicEmail}</a>
          <h2 className="mono dev__subtitle">{t.contact.socialsTitle}</h2>
          <ul className="lines">
            {t.contact.socials.map((s) => (
              <li key={s.name}>
                <a href={s.url} className="contact__social" target="_blank" rel="noopener noreferrer">
                  {s.name}
                  <span className="mono">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}
