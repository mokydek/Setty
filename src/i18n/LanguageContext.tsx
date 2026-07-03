import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { translations, type Language } from './translations'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (path: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'setty-language'

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'ru' || stored === 'en' ? stored : 'en'
}

function resolvePath(path: string, language: Language): string {
  const segments = path.split('.')
  let node: unknown = translations[language]

  for (const segment of segments) {
    if (typeof node === 'object' && node !== null && segment in node) {
      node = (node as Record<string, unknown>)[segment]
    } else {
      return path
    }
  }

  return typeof node === 'string' ? node : path
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (path: string) => resolvePath(path, language),
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
