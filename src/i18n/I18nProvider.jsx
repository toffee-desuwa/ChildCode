import { useState, useCallback } from 'react'
import { I18nContext } from './context'
import en from './en'
import zh from './zh'

const LANG_KEY = 'childcode_lang'
const translations = { en, zh }

function getStoredLang() {
  try {
    const lang = localStorage.getItem(LANG_KEY)
    return lang && translations[lang] ? lang : 'en'
  } catch {
    return 'en'
  }
}

/**
 * Provides i18n context to the app.
 * Stores language preference in localStorage, defaults to English.
 */
export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getStoredLang)

  const setLang = useCallback((newLang) => {
    if (translations[newLang]) {
      setLangState(newLang)
      try { localStorage.setItem(LANG_KEY, newLang) } catch { /* quota */ }
    }
  }, [])

  const t = useCallback((key, params) => {
    const str = translations[lang]?.[key] || translations.en[key] || key
    if (!params) return str
    return str.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`)
  }, [lang])

  return (
    <I18nContext.Provider value={{ t, lang, setLang }}>
      {children}
    </I18nContext.Provider>
  )
}
