import { NavLink, Outlet } from 'react-router-dom'
import { useI18n } from '../i18n'
import type { Lang } from '../i18n'
import Monogram from './Monogram'

// Marco del sitio: skip-link, nav, contenido, footer.
export default function Layout() {
  const { t, lang, setLang } = useI18n()

  const links = [
    { to: '/proyectos', label: t.nav.projects },
    { to: '/sobre-mi', label: t.nav.about },
    { to: '/servicios', label: t.nav.services },
    { to: '/desarrollo', label: t.nav.dev },
    { to: '/contacto', label: t.nav.contact },
  ]

  return (
    <div className="site">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <header className="site-header">
        <div className="wrap site-header__row">
          <NavLink to="/" className="brand" aria-label="Lestar — inicio">
            <Monogram />
            <span className="brand__word">LESTAR</span>
          </NavLink>

          <nav className="nav" aria-label="Principal">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `nav__link${isActive ? ' nav__link--active' : ''}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="lang" role="group" aria-label={t.nav.langLabel}>
            {(['es', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                className={`lang__btn mono${lang === l ? ' lang__btn--active' : ''}`}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="contenido">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="wrap site-footer__row">
          <Monogram size={26} />
          <p className="mono">© {new Date().getFullYear()} Lestar — {t.footer.made}</p>
          <p className="mono">{t.footer.rights}</p>
        </div>
      </footer>
    </div>
  )
}
