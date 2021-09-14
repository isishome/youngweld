<template>
  <div class="row">
    <q-img class="top-image" src="/static/images/company/top.jpg">
      <div class="gt-sm sub-area row justify-center items-center">
        <div class="col-12 sub-title text-uppercase">{{t('menu.company')}}</div>
      </div>
    </q-img>
    <div class="lt-md col-12 col-sm-10 offset-sm-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3 q-pa-lg">
      <div class="row items-center justify-between full-width">
        <div class="text-h5 text-uppercase text-weight-bold">{{t('menu.company')}}</div>
      </div>
      <q-separator />
    </div>
    <div
      class="row justify-start col-12 col-sm-10 offset-sm-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3 q-pa-lg non-selectable">
      <!-- TimeLine Start -->
      <q-timeline :layout="layout">
        <template v-for="(t, index) in tm('company.timeline')" :key="`t_${index}`">
          <q-timeline-entry heading :color="t.color">
            {{t.title}}
          </q-timeline-entry>
          <q-timeline-entry v-for="(td, index) in t.children" :key="`td_${index}`" :title="td.label" :subtitle="td.time"
            :side="index%2 === 0 ? 'right' : 'left'" :color="td.color" :icon="td.icon">
            <div v-html="td.desc">
            </div>
          </q-timeline-entry>
        </template>
      </q-timeline>
      <!-- TimeLine End -->
    </div>
  </div>
</template>
<script>
  import { useI18n } from 'vue-i18n'
  import { useQuasar } from 'quasar'
  import { computed } from 'vue'

  export default {
    setup() {
      const $q = useQuasar()
      const { locale, t, tm } = useI18n({ useScope: 'global' })

      return {
        locale,
        t,
        tm,
        layout: computed(() => {
          return $q.screen.lt.sm ? 'dense' : ($q.screen.lt.md ? 'comfortable' : 'loose')
        })
      }
    }
  }
</script>
<style scoped>

</style>