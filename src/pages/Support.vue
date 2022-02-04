<template>
  <q-scroll-observer debounce="100" @scroll="onScroll" />
  <div class="row">
    <q-img class="top-image" src="/static/images/support/top.jpg">
      <div class="gt-sm sub-area row justify-center items-center">
        <div class="col-12 sub-title text-uppercase">{{t('menu.support')}}</div>
        <div class="col-12 row justify-center full-width bg-transparent">
          <q-input spellcheck="false" class="col-md-4 col-lg-3 col-xl-2"
            :class="$q.dark.isActive ? 'body--dark' : 'body--light'" outlined color="transparent"
            :placeholder="t('support.searchSupport')" v-model="searchText" />
        </div>
      </div>
    </q-img>
    <div
      class="lt-md row justify-start col-12 col-sm-10 offset-sm-1 col-md-6 offset-md-3 col-lg-4 offset-lg-4 col-xl-4 offset-xl-4 q-pa-lg">
      <div class="row items-center justify-between full-width">
        <div class="text-h5 text-uppercase text-weight-bold">{{t('menu.support')}}</div>
        <div class="col-6">
          <q-input type="search" dense spellcheck="false" :class="$q.dark.isActive ? 'body--dark' : 'body--light'"
            outlined color="grey-9" :placeholder="t('support.searchSupport')" v-model="searchText" />
        </div>
      </div>
    </div>
    <div class="product-wrap f--header row justify-start full-width" :class="sticky" :style="`top:${fixedTop}px`">
      <div class="col-12 col-sm-10 offset-sm-1 col-md-6 offset-md-3 col-lg-4 offset-lg-4 col-xl-4 offset-xl-4"
        :class="$q.screen.lt.md ? 'q-pa-xs' : 'q-px-lg q-py-xs'">
        <div class="full-width">
          <div class="row justify-between" :class="$q.screen.lt.md ? 'q-col-gutter-xs' : 'q-col-gutter-lg'">
            <div class="col-3" v-for="(s, index) in tm('section')" :key="index">
              <q-btn dense flat class="full-width section-btn" :class="s.code === sec ? 'selected' : ''"
                @click="select(s.code)">
                <q-card flat class="bg-transparent">
                  <q-card-section :class="$q.screen.lt.md ? 'q-pa-xs' : ''">
                    <q-img class="section-img" :src="s.icon" width="50px" />
                  </q-card-section>
                  <q-card-section class="no-padding no-margin" :class="$q.screen.lt.md ? 'text-caption' : ''">
                    {{s.name}}
                  </q-card-section>
                </q-card>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row justify-start col-12 col-sm-10 offset-sm-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3 q-pa-lg">
      <!-- Tree Start -->
      <q-tree class="non-selectable" :nodes="qna" node-key="label" :filter="searchText" :filter-method="filterSupport"
        :no-results-label="tm('support.message.noData')" :no-connectors="$q.screen.lt.sm" default-expand-all>
        <template v-slot:header-root="prop">
          <div class="row items-center">
            <div class="text-weight-bold text-h6 text-uppercase">{{ prop.node.label }}</div>
          </div>
        </template>
        <template v-slot:header-question="prop">
          <div class="row justify-start no-wrap items-center">
            <q-icon name="help_outline" color="grey-6" size="28px" class="q-mr-sm" />
            <div class="text-subtitle1 text-left">{{ prop.node.label }}</div>
          </div>
        </template>
        <template v-slot:header-answer="prop">
          <div class="row justify-start no-wrap items-center q-gutter-sm">
            <q-avatar style="width:24px;height: 24px;" class="text-weight-bold"
              :class="$q.dark.isActive ? 'body--light' : 'body--dark'">
              A
            </q-avatar>
            <div class="text-subtitle1 text-left">{{ prop.node.label }}</div>
          </div>
        </template>
      </q-tree>
      <!-- Tree End -->
    </div>
    <q-separator inset class="q-my-xs full-width" />
    <div class="row justify-start col-12 col-sm-8 offset-sm-2 col-lg-6 offset-lg-3 q-pa-lg">
      <q-card class="q-my-md full-width shadow-1">
        <q-card-section
          :class="[$q.dark.isActive ? 'bg-grey-9 text-grey-5' : 'bg-light-blue-10 text-white',$q.screen.lt.sm ? 'text-body1' : 'text-h6']">
          <div>{{t('support.title')}}</div>
        </q-card-section>
        <q-card-section>
          <div class="column items-start q-gutter-y-sm">
            <div v-for="(info, index) in tm('support.contact')" :key="index" class="row">
              <div>ㆍ</div>
              <div class="col text-wrap">{{info}}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
      <div class="full-width">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-card class="shadow-1">
              <q-card-section :class="$q.dark.isActive ? 'bg-grey-9 text-grey-5' : 'bg-cyan-8 text-white'">
                <div class="row q-gutter-x-md text-h6">
                  <q-icon :name="tm('support.email.icon')" size="md" />
                  <div>{{t('support.email.name')}}</div>
                </div>
              </q-card-section>
              <q-card-section class="support-contents" style="letter-spacing: 2px;">
                {{t('support.email.value')}}
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-6">
            <q-card class="shadow-1">
              <q-card-section :class="$q.dark.isActive ? 'bg-grey-9 text-grey-5' : 'bg-teal-8 text-white'">
                <div class="row q-gutter-x-md text-h6">
                  <q-icon :name="tm('support.phone.icon')" size="md" />
                  <div>{{t('support.phone.name')}}</div>
                </div>
              </q-card-section>
              <q-card-section class="support-contents">
                {{t('support.phone.value')}}
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { ref, watch, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'

  export default {
    props: {
      sec: {
        type: String,
        default: null
      },
      top: {
        type: String,
        default: '0'
      }
    },
    setup(props) {
      const searchText = ref(null)
      const { locale, t, tm } = useI18n({ useScope: 'global' })
      const children = ref([])

      watch(() => searchText.value, (val, old) => {
        if (val !== old)
          children.value = []
      })

      const qna = computed(() => {
        if (props.sec) {
          return tm(`support.section.${props.sec.toLowerCase()}`)
        }
        else {
          return Object.entries(tm('support.section')).map(([key, value]) => {
            return {
              label: key,
              header: 'root',
              children: value
            }
          })
        }
      })

      const route = useRoute()
      const router = useRouter()

      watch(() => route.params.sec, (val, old) => {
        if (val !== old)
          searchText.value = null
      })

      const select = (id) => {
        if (props.sec === id)
          router.push({ name: 'support', params: { top: topHeight.value } }).catch(() => { })
        else
          router.push({ name: 'support-section', params: { sec: id, top: topHeight.value } }).catch(() => { })
      }

      const fixedTop = ref(0)
      const topHeight = ref(0)
      const sticky = ref('')

      const onScroll = (info) => {
        fixedTop.value = document.querySelector('header').offsetHeight
        topHeight.value = document.querySelector('div.top-image').offsetHeight
        sticky.value = info.position.top > topHeight.value ? 'scroll-move' : ''
      }

      return {
        searchText,
        filterSupport(node, filter) {
          const filt = filter.toLowerCase()
          let result = false
          if (node.label && node.label.toLowerCase().indexOf(filt) > -1) {
            result = true
            if (node.children)
              children.value = [...children.value, ...node.children]
          }
          else if (children.value.includes(node))
            result = true
          return result
        },
        onScroll,
        locale,
        t,
        tm,
        fixedTop,
        sticky,
        qna,
        select,
        propsSec: computed(() => { return props.sec })
      }
    }
  }
</script>
<style>
  @media screen and (max-width:599px) {
    .q-tree .q-tree__children {
      padding-left: 10px;
    }

    .q-tree .text-subtitle1 {
      font-size: 0.8em;
    }
  }
</style>
<style scoped>
  .product-wrap {
    position: sticky;
    z-index: 2000;
  }

  .section-btn {
    border-radius: 10px;
  }

  .body--light .section-btn.selected {
    background-color: rgba(100, 100, 100, .2);
  }

  .body--dark .section-btn.selected {
    background-color: rgba(100, 100, 100, .4);
  }

  .body--dark .section-img {
    filter: brightness(.6) !important;
  }

  .body--light .section-img {
    filter: brightness(.4) !important;
  }

  .section-name {
    line-height: 1.2em;
    word-break: keep-all;
  }

  .q-tree {
    text-align: center;
    width: 100%;
  }

  .q-tree::first-line {
    font-size: 1.2em;
  }

  .support-contents {
    font-size: 2em;
    letter-spacing: 1px;
    font-weight: bold;
    text-align: center;
    padding: 2em 0 2em 0;
    word-break: break-all;
  }

  @media screen and (max-width:599px) {
    .support-contents {
      font-size: 1.2em;
    }
  }

  @media screen and (min-width:600px) and (max-width:1023px) {
    .support-contents {
      font-size: 1.4em;
    }
  }

  @media screen and (min-width:1024px) and (max-width:1439px) {
    .support-contents {
      font-size: 1.6em;
    }
  }

  @media screen and (min-width:1440px) and (max-width:1919px) {
    .support-contents {
      font-size: 1.8em;
    }
  }

  .faq-wrap {
    background-color: rgba(10, 10, 10, .5);
  }
</style>