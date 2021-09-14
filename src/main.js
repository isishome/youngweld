import { createApp, defineAsyncComponent } from 'vue'
import App from './App.vue'
import { Quasar, Cookies } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'
import routes from './routes'
import store from './store'
import { setupI18n, setI18nLanguage, loadLocaleMessages, numberFormats } from './i18n'
import axios from 'axios'

// create app
const app = createApp(App)

// components...
const Layout = defineAsyncComponent(() => import(/* webpackChunkName: "group-component" */ '@/components/fourshome/Layout'))
const Product = defineAsyncComponent(() => import(/* webpackChunkName: "group-component" */ '@/components/fourshome/Product'))
app.component('f-layout', Layout)
app.component('f-product', Product)

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
  const lang = Cookies.has(`${prefix}.lang`) ? Cookies.get(`${prefix}.lang`) : Quasar.lang.getLocale().substring(0, 2)

  // load locale messages
  if (!i18n.global.availableLocales.includes(lang)) {
    await loadLocaleMessages(i18n.global.setLocaleMessage, lang)
  }

  // set i18n language
  setI18nLanguage(i18n, lang)

  return next()
})

// create vuex object
const storage = createStore(store)

// init vue-i18n
let i18n = null

axios.get('/static/locales/ko.json')
  .then(function (response) {
    const messages = { 'ko': response.data }
    i18n = setupI18n({
      legacy: false,
      locale: 'ko',
      fallback: 'en',
      messages,
      numberFormats
    })
  })
  .catch(function (error) {
    // handle error
    console.log(error)
  })
  .then(function () {

    // regist vue-router and vuex and i18n and components...
    app.use(Quasar, quasarUserOptions).use(router).use(storage).use(i18n).mount('#app')
  })
