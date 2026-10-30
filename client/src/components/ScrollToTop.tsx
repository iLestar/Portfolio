import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Al cambiar de ruta, vuelve arriba (comportamiento esperado en un portafolio).
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
