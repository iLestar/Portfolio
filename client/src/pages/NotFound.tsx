import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

export default function NotFound() {
  const { t } = useI18n()
  return (
    <section className="wrap page notfound">
      <h1 className="hero__title grad-text">{t.notFound.title}</h1>
      <p>{t.notFound.text}</p>
      <Link to="/" className="mono">
        {t.notFound.back}
      </Link>
    </section>
  )
}
