import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import es from './es'
import type { Dict } from './es'
import en from './en'

export type Lang = 'es' | 'en'
const dictionaries: Record<Lang, Dict> = { es, en }

interface I18nValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: Dict // diccionario del idioma activo
  // pick() resuelve contenido localizado (proyectos, textos largos)
  pick: (l: { es: string; en: string }) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('lestar-lang')
    return saved === 'en' || saved === 'es' ? saved : 'es'
  })

  useEffect(() => {
    localStorage.setItem('lestar-lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: dictionaries[lang],
      pick: (l) => l[lang] || l.es,
    }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n debe usarse dentro de <LanguageProvider>')
  return ctx
}
