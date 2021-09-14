import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { Cookies } from 'quasar'
import axios from 'axios'

export function setupI18n(options = { locale: 'ko' }) {
  const i18n = createI18n(options)
  setI18nLanguage(i18n, options.locale)
  return i18n
}

export function setI18nLanguage(i18n, locale) {
  i18n.global.locale.value = locale
  document.querySelector('html').setAttribute('lang', locale)
}

export async function loadLocaleMessages(setLocaleMessage, locale) {
  await axios.get(`/static/locales/${locale}.json`)
    .then(function (response) {
      const prefix = process.env.VUE_APP_PREFIX
      Cookies.set(`${prefix}.lang`, locale, { path: '/', expires: 365 })
      setLocaleMessage(locale, response.data)
    })
    .catch(function (error) {
      // handle error
      console.log(error)
    })
    .then(function () {
      return nextTick()
    })
}

export const numberFormats = {
  'ko': {
    currency: {
      style: 'currency',
      currency: 'KRW',
      currencyDisplay: '₩'
    }
  },
  'en': {
    currency: {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: '$'
    }
  }
}