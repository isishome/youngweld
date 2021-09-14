<template>
  <q-scroll-observer debounce="100" @scroll="onScroll" />
  <div class="row full-width">
    <q-img class="top-image" src="/static/images/products/top.jpg">
      <div class="gt-sm sub-area left">
        <div class="sub-title text-uppercase">{{t('menu.product')}}</div>
      </div>
    </q-img>
    <div class="lt-md row justify-start col-12 col-sm-8 offset-sm-2 col-lg-6 offset-lg-3 q-px-lg q-py-sm">
      <div class="row items-center justify-start full-width">
        <div class="text-h5 text-uppercase text-weight-bold">{{t('menu.product')}}</div>
      </div>
    </div>
    <q-separator class="full-width" />
    <div class="section-wrap f--header row justify-start full-width" :class="sticky" :style="`top:${fixedTop}px`">
      <div class="col-12 col-sm-10 offset-sm-1 col-md-6 offset-md-3 col-lg-4 offset-lg-4 col-xl-4 offset-xl-4"
        :class="$q.screen.lt.md ? 'q-pa-xs' : 'q-px-lg q-py-xs'">
        <div class="full-width">
          <div class="row justify-between" :class="$q.screen.lt.md ? 'q-col-gutter-xs' : 'q-col-gutter-lg'">
            <div class="col-3" v-for="(s, index) in tm('section')" :key="index">
              <q-btn dense flat class="full-width section-btn" :class="s.code === sec ? 'selected' : ''"
                @click="selectSection(s.code)">
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
      <q-separator inset class="full-width" />
    </div>
    <div class="col-12 col-sm-10 offset-sm-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3 non-selectable q-mt-xl"
      :class="$q.screen.lt.md ? 'q-pa-xs' : 'q-pa-lg'">
      <!-- Product List Start -->
      <div class="full-width">
        <div class="product-wrap row" :class="$q.screen.lt.md ? 'q-col-gutter-xs' : 'q-col-gutter-lg'">
          <template v-for="p in products.slice().reverse()" :key="p.code">
            <div v-if="sec === p.sec || !sec" class="col-12 col-sm-6 col-md-4">
              <q-card flat class="product bg-transparent" :id="p.code"
                :class="p.code && code && p.code.toLowerCase() === code.toLowerCase() ? 'marker' : ''">
                <q-separator class="q-mt-xl" />
                <div class="img-wrap " :class="$q.screen.lt.md ? 'q-py-md' : 'q-py-xl'">
                  <q-img :src="p.src" :ratio="1" :width="$q.screen.lt.md ? '80%' : '60%'" />
                </div>
                <q-card-section class="no-padding">
                  <q-chip size="sm" v-if="p.type" :color="$q.dark.isActive ? 'grey-8' : 'blue-6'" text-color="white">
                    {{p.type.name}}
                  </q-chip>
                  <q-chip size="sm" v-else color="transparent" text-color="transparent">
                  </q-chip>
                </q-card-section>
                <q-card-section class="no-padding">
                  <div class="text-h6 product-name ellipsis">
                    {{p.name}}
                  </div>
                </q-card-section>
                <q-card-section class="q-px-none q-pt-none">
                  <div class="text-body2 product-name text-subtitle1 text-weight-bold ellipsis"
                    style="letter-spacing: 2px;">
                    {{p.code}}
                  </div>
                </q-card-section>
                <template v-if="p.manual">
                  <q-separator inset />
                  <q-card-section class="q-px-none">
                    <div>
                      <a class="manual text-h6 product-name text-subtitle1 text-red-8 ellipsis" :href="p.manual"
                        :download="`${p.code}_${t('product.manual')}.pdf`">
                        <q-icon size="30px" name="picture_as_pdf" />
                        {{t('product.manual')}}
                      </a>
                    </div>
                  </q-card-section>
                </template>
                <q-separator v-if="p.desc" inset />
                <q-card-section class="q-px-none q-py-sm" v-for="(d, index) in p.desc" :key="index">
                  <div class="column">
                    <div class="text-subtitle2 text-grey-7">{{d.name}}</div>
                    <div class="text-caption ellipsis-3-lines text-wrap" v-html="d.contents"></div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>
        </div>
        <!-- Product List End -->
      </div>
    </div>
  </div>
</template>
<script>
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'

  export default {
    props: {
      sec: {
        type: String,
        default: null
      },
      code: {
        type: String,
        default: null
      },
      top: {
        type: String,
        default: '0'
      }
    },
    setup(props) {
      const { locale, t, tm } = useI18n({ useScope: 'global' })

      const router = useRouter()
      const fixedTop = ref(0)
      const topHeight = ref(0)
      const sticky = ref('')

      const onScroll = (info) => {
        fixedTop.value = document.querySelector('header').offsetHeight
        topHeight.value = document.querySelector('div.top-image').offsetHeight
        sticky.value = info.position.top > topHeight.value ? 'scroll-move' : ''
      }

      const selectSection = (sec) => {
        if (props.sec === sec)
          router.push({ name: 'product', params: { top: topHeight.value } }).catch(() => { })
        else
          router.push({ name: 'product-section', params: { sec: sec, top: topHeight.value } }).catch(() => { })
      }

      const products = computed(() => { return tm('product.list') })

      return {
        onScroll,
        locale,
        t,
        tm,
        fixedTop,
        sticky,
        selectSection,
        products
      }
    }
  }
</script>
<style scoped>
  .section-wrap {
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

  .product {
    border-radius: 0 0 20px 20px;
    text-align: center;
    background-color: transparent;
    flex-wrap: wrap;
  }

  @media screen and (max-width:599px) {
    .product-name {
      font-size: 1em;
    }
  }

  .manual {
    text-decoration: none;
  }

  .body--light .marker {
    background-color: rgba(0, 64, 138, 0.1) !important;
  }

  .body--dark .marker {
    background-color: rgb(50, 50, 50, .5) !important;
  }
</style>