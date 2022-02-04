import { createApp, defineAsyncComponent } from 'vue'
import App from './App.vue'
import { Quasar, Cookies } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import routes from './routes'
import store from './store'
import { SUPPORT_LOCALES, loadLocaleMessages, setI18nLanguage } from './i18n'
import { createI18n } from 'vue-i18n'
import ko from './locales/ko'
import en from './locales/en'

// create app
const app = createApp(App)

// components...
const Layout = defineAsyncComponent(() => import(/* webpackChunkName: "group-component" */ '@/components/fourshome/Layout'))
const Product = defineAsyncComponent(() => import(/* webpackChunkName: "group-component" */ '@/components/fourshome/Product'))
app.component('f-layout', Layout)
app.component('f-product', Product)

// call with I18n option
const i18n = createI18n({
  legacy: false, // you must specify 'legacy: false' option
  locale: 'ko',
  messages: {
    ko,
    en
  }
})

// create router object...
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to) {
    if (to.name && to.params.top)
      return { top: to.params.top, behavior: 'smooth' }
    else if (to.name && to.params.code) {
      return { el: `#${to.params.code}`, top: window.innerWidth < 599 ? 216 : 1100, behavior: 'smooth' }
    }
    else
      return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  const prefix = process.env.VUE_APP_PREFIX
  const paramsLocale = Cookies.has(`${prefix}.lang`) ? Cookies.get(`${prefix}.lang`) : Quasar.lang.getLocale().substring(0, 2)

  // use locale if paramsLocale is not in SUPPORT_LOCALES
  if (!SUPPORT_LOCALES.includes(paramsLocale)) {
    return next(`/${paramsLocale}`)
  }

  // load locale messages
  if (!i18n.global.availableLocales.includes(paramsLocale)) {
    await loadLocaleMessages(i18n, paramsLocale)
  }

  // set i18n language
  setI18nLanguage(i18n, paramsLocale)

  return next()
})

// create vuex object
const storage = createStore(store)

app.use(Quasar, quasarUserOptions).use(router).use(storage).use(i18n).mount('#app')