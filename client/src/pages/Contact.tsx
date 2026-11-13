import { useState } from 'react'
import { useI18n } from '../i18n'
import { sendContact } from '../api'

// Formulario real → POST /api/contact (los mensajes caen en MySQL
// y se leen en el panel, sección Mensajes).
export default function Contact() {
  const { t } = useI18n()
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    const data = new FormData(e.currentTarget)
    try {
      await sendContact({
        name: String(data.get('name')),
        email: String(data.get('email')),
        message: String(data.get('message')),
      })
      setState('sent')
    } catch {
      setState('error')
    }
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
          <button type="submit" className="btn btn--primary" disabled={state === 'sending' || state === 'sent'}>
            {state === 'sending' ? t.contact.sending : `${t.contact.send} →`}
          </button>
          {state === 'sent' && (
            <p className="mono form__ok" role="status">{t.contact.sent}</p>
          )}
          {state === 'error' && (
            <p className="mono form__error" role="alert">
              {t.contact.error}
            </p>
          )}
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
