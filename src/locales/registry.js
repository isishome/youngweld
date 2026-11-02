export const LOCALE_OPTIONS = [
  { value: 'ko', label: '한국어', language: 'ko-KR', pack: 'ko-KR' },
  { value: 'en', label: 'English', language: 'en-US', pack: 'en-US' },
  { value: 'zh-TW', label: '繁體中文', language: 'zh-TW', pack: 'zh-TW' },
  { value: 'zh-CN', label: '简体中文', language: 'zh-CN', pack: 'zh-CN' },
  { value: 'ja', label: '日本語', language: 'ja-JP', pack: 'ja' },
  { value: 'de', label: 'Deutsch', language: 'de-DE', pack: 'de' },
  { value: 'fr', label: 'Français', language: 'fr-FR', pack: 'fr' },
  { value: 'es-ES', label: 'Español (España)', language: 'es-ES', pack: 'es' },
  { value: 'es-MX', label: 'Español (México)', language: 'es-MX', pack: 'es' },
  { value: 'it', label: 'Italiano', language: 'it-IT', pack: 'it' },
  { value: 'pl', label: 'Polski', language: 'pl-PL', pack: 'pl' },
  {
    value: 'pt-BR',
    label: 'Português (Brasil)',
    language: 'pt-BR',
    pack: 'pt-BR',
  },
  { value: 'ru', label: 'Русский', language: 'ru-RU', pack: 'ru' },
]

export const SUPPORT_LOCALES = LOCALE_OPTIONS.map(({ value }) => value)

export const resolveLocale = (cookieLocale, browserLocale = 'ko') => {
  const tag = String(cookieLocale || browserLocale)
    .replace(/_/g, '-')
    .toLowerCase()
  const exact = LOCALE_OPTIONS.find(
    ({ value, language }) =>
      value.toLowerCase() === tag || language.toLowerCase() === tag,
  )
  if (exact) return exact.value
  if (/^zh-(tw|hk|mo|hant)(-|$)/.test(tag)) return 'zh-TW'
  if (/^zh(-|$)/.test(tag)) return 'zh-CN'
  if (/^es-mx(-|$)/.test(tag)) return 'es-MX'
  if (/^es(-|$)/.test(tag)) return 'es-ES'
  if (/^pt(-|$)/.test(tag)) return 'pt-BR'
  const base = tag.split('-')[0]
  return SUPPORT_LOCALES.includes(base) ? base : 'ko'
}
