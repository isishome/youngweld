import { createApp } from 'vue'
import App from './App.vue'
import { Quasar, Cookies } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes/index.js'
import { setI18nLanguage } from './i18n.js'
import { resolveLocale } from './locales/registry.js'
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
  fallbackLocale: 'en',
  messages: {
    ko,
    en,
  },
})

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // 목록 안에서 제품을 선택할 때는 현재 읽고 있는 위치를 유지한다.
    if (from.matched.some(({ name }) => name === 'product') && to.params.code)
      return false
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

let homeImagePreload

router.beforeEach((to) => {
  if (to.name === 'main' && !homeImagePreload) {
    homeImagePreload = document.createElement('link')
    homeImagePreload.rel = 'preload'
    homeImagePreload.as = 'image'
    homeImagePreload.href = ko.main.section[0][0].src
    homeImagePreload.fetchPriority = 'high'
    document.head.append(homeImagePreload)
  } else if (to.name !== 'main' && homeImagePreload) {
    homeImagePreload.remove()
    homeImagePreload = undefined
  }
})

app.use(Quasar, quasarUserOptions).use(i18n)
const initialLocale = resolveLocale(
  Cookies.get(`${import.meta.env.VITE_APP_PREFIX}.lang`),
  navigator.language,
)
try {
  await setI18nLanguage(i18n.global, initialLocale)
} catch {
  await setI18nLanguage(i18n.global, 'ko')
}
app.use(router)
await router.isReady()
app.mount('#app')
