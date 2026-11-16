<template>
  <div class="row">
    <q-img alt="" class="top-image" src="/static/images/company/top.webp">
      <div class="gt-sm sub-area row justify-center items-center">
        <h1 class="col-12 page-title sub-title text-uppercase">
          {{ t('menu.company') }}
        </h1>
      </div>
    </q-img>
    <div
      class="lt-md col-12 col-sm-10 offset-sm-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3 q-pa-lg"
    >
      <div class="row items-center justify-between full-width">
        <h1 class="page-title text-h5 text-uppercase text-weight-bold">
          {{ t('menu.company') }}
        </h1>
      </div>
      <q-separator />
    </div>
    <div
      class="row justify-start col-12 col-sm-10 offset-sm-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3 q-pa-lg non-selectable"
    >
      <!-- TimeLine Start -->
      <q-timeline :layout="layout">
        <template
          v-for="(t, index) in tm('company.timeline')"
          :key="`t_${index}`"
        >
          <q-timeline-entry heading tag="h2" :color="t.color">
            {{ t.title }}
          </q-timeline-entry>
          <q-timeline-entry
            v-for="(td, index) in t.children"
            :key="`td_${index}`"
            :subtitle="td.time"
            :side="index % 2 === 0 ? 'right' : 'left'"
            :color="td.color"
            :icon="td.icon"
          >
            <!-- Quasar는 title 속성을 h6로 고정하므로 제목 순서를 맞추기 위해 h3를 직접 둔다. -->
            <h3 class="q-timeline__title text-h6">{{ td.label }}</h3>
            <div v-html="td.desc"></div>
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
        return $q.screen.lt.sm
          ? 'dense'
          : $q.screen.lt.md
            ? 'comfortable'
            : 'loose'
      }),
    }
  },
}
</script>
<style scoped>
/* QTimelineEntry는 title이 없어도 빈 h6를 만들므로 화면과 보조기기에서 숨긴다. */
:deep(h6.q-timeline__title:empty) {
  display: none;
}

/* 날짜 글자 대비를 4.5:1 이상으로 맞춘다. */
:deep(.q-timeline__subtitle) {
  opacity: 0.8;
}

/* 연도 제목을 h2로 바꿔도 기존 h3 크기를 유지한다. */
:deep(.q-timeline__heading-title) {
  font-size: 3rem;
  font-weight: 400;
  line-height: 3.125rem;
  letter-spacing: normal;
}
</style>
