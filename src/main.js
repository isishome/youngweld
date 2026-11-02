import { createApp } from 'vue'
import App from './App.vue'
import { Quasar, Cookies } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes/index.js'
import { resolveLocale, setI18nLanguage } from './i18n.js'
import { normalizeEntryUrl } from './routes/entry-url.js'
import { createI18n } from 'vue-i18n'
import ko from './locales/ko.json'
import en from './locales/en.json'
import Layout from './components/fourshome/Layout.vue'
import Product from './components/fourshome/Product.vue'

normalizeEntryUrl()

const app = createApp(App)

app.component('f-layout', Layout)
app.component('f-product', Product)

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'ko',
  messages: {
    ko,
    en,
  },
})

const router = createRouter({
  history: createWebHashHistory('/'),
  routes,
  scrollBehavior(to) {
    if (to.name && to.query.top)
      return { top: Number(to.query.top), behavior: 'smooth' }
    else if (to.name && to.params.code) {
      return {
        el: `#${to.params.code}`,
        top: window.innerWidth < 599 ? 216 : 1100,
        behavior: 'smooth',
      }
    } else return { top: 0 }
  },
})

router.beforeEach(() => {
  const prefix = import.meta.env.VITE_APP_PREFIX
  const locale = resolveLocale(
    Cookies.get(`${prefix}.lang`),
    Quasar.lang.getLocale(),
  )
  setI18nLanguage(i18n, locale)
})

app.use(Quasar, quasarUserOptions).use(router).use(i18n).mount('#app')
