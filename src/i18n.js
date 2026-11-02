import { nextTick } from 'vue'
import { Quasar } from 'quasar'
import { LOCALE_OPTIONS } from './locales/registry.js'

const messages = import.meta.glob('./locales/*.json')
const packs = {
  'ko-KR': () => import('quasar/lang/ko-KR.js'),
  'en-US': () => import('quasar/lang/en-US.js'),
  'zh-TW': () => import('quasar/lang/zh-TW.js'),
  'zh-CN': () => import('quasar/lang/zh-CN.js'),
  ja: () => import('quasar/lang/ja.js'),
  de: () => import('quasar/lang/de.js'),
  fr: () => import('quasar/lang/fr.js'),
  es: () => import('quasar/lang/es.js'),
  it: () => import('quasar/lang/it.js'),
  pl: () => import('quasar/lang/pl.js'),
  'pt-BR': () => import('quasar/lang/pt-BR.js'),
  ru: () => import('quasar/lang/ru.js'),
}

export const setI18nLanguage = async (composer, locale) => {
  const option = LOCALE_OPTIONS.find(({ value }) => value === locale)
  if (!option) throw new Error('지원하지 않는 언어입니다.')
  const [message, pack] = await Promise.all([
    composer.availableLocales.includes(locale)
      ? null
      : messages[`./locales/${locale}.json`](),
    packs[option.pack](),
  ])
  if (message) composer.setLocaleMessage(locale, message.default)
  Quasar.lang.set(pack.default)
  composer.locale.value = locale
  document.documentElement.lang = option.language
  await nextTick()
}
