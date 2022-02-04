<template>
  <q-scroll-observer v-if="!leftDrawerOpen" :debounce="debounce" @scroll="onScroll" />
  <q-layout view="lHh lpr lFf">
    <q-header class="f--header row q-px-sm" :class="scrollMove ? 'scroll-move' : ''">
      <div class="row justify-start items-center col-xs-4 col-sm">
        <q-btn dense flat round class="lt-md" icon="menu" @click="toggleLeftDrawer" />
      </div>
      <div class="row justify-center items-center q-gutter-x-xs col-xs-4 col-sm-6 col-xl-4">
        <ul class="full-width f--tabs row items-center" :class="$q.screen.lt.md ? 'justify-center' : 'justify-between'">
          <slot name="logo"></slot>
          <slot name="tab"></slot>
        </ul>
      </div>

      <div class="row justify-end items-center q-gutter-x-sm col-xs-4 col-sm">
        <div class="gt-sm" style="padding: 2px 0 0 8vw;">
          <q-btn flat dense size="13px" icon="language" :label="$q.screen.gt.sm ? t('language') : ''">
            <q-popup-proxy>
              <q-list dense class="text-caption">
                <q-item v-for="loc in localeOptions" :key="loc.value" clickable v-close-popup @click="lang = loc.value">
                  <q-item-section>
                    <q-item-label>{{loc.label}}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-popup-proxy>
          </q-btn>
        </div>
        <div>
          <q-toggle dense v-model="isDark" size="md" icon="dark_mode" color="grey-7"
            @update:model-value="onChangeDark" />
        </div>
      </div>
    </q-header>
    <q-drawer class="f--drawer" v-model="leftDrawerOpen" side="left" behavior="mobile" :width="250" bordered
      show-if-above no-swipe-open no-swipe-close no-swipe-backdrop overlay elevated>
      <q-list class="fit">
        <q-item>
          <q-item-section>
            <q-select dense outlined emit-value map-options behavior="menu" v-model="lang" :options="localeOptions"
              :label="t('language')" @update:model-value="leftDrawerOpen = false" />
          </q-item-section>
        </q-item>
        <q-separator />
        <slot name="drawer"></slot>
      </q-list>
    </q-drawer>
    <q-page-container>
      <q-page :style-fn="myTweak">
        <slot name="contents"></slot>
        <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 38]"
          style="position:fixed;z-index: 3;">
          <q-btn icon="keyboard_arrow_up" dense round size="md" text-color="grey-8" class="page-scroller" />
        </q-page-scroller>
      </q-page>
    </q-page-container>
    <footer ref="footer">
      <slot name="footer"></slot>
    </footer>
  </q-layout>

</template>

<script>
  import { ref, reactive, computed, watch } from 'vue'
  import { useQuasar } from 'quasar'
  import { useI18n } from 'vue-i18n'

  export default {
    setup() {
      // global
      const prefix = process.env.VUE_APP_PREFIX
      const $q = useQuasar()
      const footer = ref(null)
      const myTweak = (offset) => {
        return { minHeight: offset ? `calc(100vh - ${footer.value ? offset + footer.value.offsetHeight : offset}px)` : '100vh' }
      }

      // tabs
      const tabs = reactive([])
      const tab = ref(null)

      // scroll
      let debounce = ref(0)
      const scrollMove = ref(false)
      const onScroll = (info) => {
        debounce.value = info.position.top > 0 ? 300 : 0
        scrollMove.value = info.position.top > 0
      }

      // language
      const { t, tm, locale } = useI18n({ useScope: 'global' })
      const localeOptions = computed(() => Object.entries(tm('languageList')).map(([key, value]) => { return { value: key, label: value } }))
      const lang = ref($q.cookies.has(`${prefix}.lang`) ? $q.cookies.get(`${prefix}.lang`) : $q.lang.getLocale().substring(0, 2))

      watch(() => lang.value, (val, old) => {

        if (val !== old) {
          locale.value = val
          document.querySelector('html').setAttribute('lang', val)
          $q.cookies.set(`${prefix}.lang`, val, { path: '/', expires: 365 })
        }
      })

      // dark
      const isDark = ref($q.cookies.has(`${prefix}.dark`) ? $q.cookies.get(`${prefix}.dark`) : false)
      $q.dark.set(isDark.value)
      const onChangeDark = () => {
        $q.dark.set(isDark.value)
        $q.cookies.set(`${prefix}.dark`, isDark.value, { path: '/', expires: 365 })
      }

      // draw
      const leftDrawerOpen = ref(false)
      watch(() => leftDrawerOpen.value, (val) => {
        document.body.style.overflow = val ? 'hidden' : ''
      })

      return {
        footer,
        myTweak,
        tabs,
        tab,
        debounce,
        scrollMove,
        onScroll,
        lang,
        t,
        localeOptions,
        isDark,
        onChangeDark,
        leftDrawerOpen,
        toggleLeftDrawer() {
          leftDrawerOpen.value = !leftDrawerOpen.value
        }
      }
    }
  }
</script>
<style scoped>
  .page-scroller {
    box-shadow: inset 0 0 1px 1px rgba(120, 120, 120, 1);
    backdrop-filter: saturate(100%) blur(20px);
    -webkit-backdrop-filter: saturate(100%) blur(20px);
    right: 20vw
  }

  @media screen and (max-width:1023px) {
    .page-scroller {
      right: 0;
    }
  }

  @media screen and (min-width:1024px) and (max-width:1439px) {
    .page-scroller {
      right: 10vw;
    }
  }

  @media screen and (min-width:1440px) and (max-width:1919px) {
    .page-scroller {
      right: 15vw;
    }
  }
</style>