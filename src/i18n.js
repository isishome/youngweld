export const SUPPORT_LOCALES = ['ko', 'en']

export const resolveLocale = (cookieLocale, browserLocale = 'ko') => {
  const locale = String(cookieLocale || browserLocale)
    .toLowerCase()
    .split('-')[0]
  return SUPPORT_LOCALES.includes(locale) ? locale : 'ko'
}

export const setI18nLanguage = (i18n, locale) => {
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
}
