import { createContext, useContext } from 'react'

export const I18nContext = createContext(null)

/**
 * Hook to access translation function and language controls.
 * Returns { t, lang, setLang }
 */
export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
