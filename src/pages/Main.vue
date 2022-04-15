<!-- pages/Main.vue -->
<template>
  <div class="gt-sm q-mt-lg"></div>
  <div class="lt-md q-mt-md"></div>
  <div class="row full-width">
    <div class="col-12 col-sm-10 offset-sm-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3 q-gutter-y-lg q-gutter-y-lg">
      <div class="column top relative-position"
        :class="!$q.dark.isActive && index%2 === 0 ? 'body--dark text-white' : ''" v-intersection.once="options"
        :data-id="index" v-for="(t, index) in tm('main.top')" :key="index">
        <div class="top-contents row justify-center items-center content-center text-center fit"
          :class="t.direction === 'left' ? 'reverse' : ''">
          <div class="col-5 col-sm-6 full-height row justify-center items-center">
            <img :src="t.src"
              :class="[`animate__animated ${inView.includes((index).toString()) ? 'animate__zoomIn' : ''}` ]" />
          </div>
          <div class="col-7 col-sm-6 full-height column justify-center" style="--animate-duration: .8s;"
            :class="[`text-${t.align}`, `animate__animated ${inView.includes((index).toString()) ? `animate__fadeIn${capitalize(t.direction)}` : ''}` ]">
            <p class="title text-wrap">{{t.title}}</p>
            <p class="desc text-wrap">{{t.desc}}</p>
            <p class="code">{{t.code}}</p>
            <div>
              <q-btn class="detail" color="yellow-8 text-black"
                :class="[`animate__animated animate__delay-3s ${inView.includes((index).toString()) ? 'animate__flipInX' : ''}` ]"
                rounded unelevated :label="tm('main.detail')" :to="JSON.parse(t.to)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="gt-sm q-mt-lg"></div>
  <div class="lt-md q-mt-md"></div>
  <div class="non-selectable bg-transparent">
    <template v-for="(s, idx1) in tm('main.section')" :key="`s_${idx1}`">
      <div class="section-wrap row full-width">
        <div class="col-12 col-sm-10 offset-sm-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3">
          <div class="row justify-center q-col-gutter-lg full-width">
            <router-link class="col-12 col-sm-6 col-lg-4 q-px-md" v-for="(p, idx2) in s" :key="`p_${idx1}_${idx2}`"
              :to="p.to" v-intersection="options" :data-id="`p_${idx1}_${idx2}`">
              <f-product content-class="product" :title="p.title" :desc="p.desc" :etc="p.etc" :src="p.src"
                :show="action(`p_${idx1}_${idx2}`)" :delay="$q.screen.gt.xs ? idx2 : 0" :duration="0.5"
                :data="{id:`p_${idx1}_${idx2}`, list:infos}" />
            </router-link>
          </div>
        </div>
      </div>
      <q-separator class="gt-xs q-mb-lg" />
    </template>
  </div>
</template>
<script>
  import { useI18n } from 'vue-i18n'
  import { useQuasar, format } from 'quasar'
  import { ref } from 'vue'
  const { capitalize } = format

  const thresholds = []

  for (let i = 0; i <= 1.0; i += 0.01) {
    thresholds.push(i)
  }

  export default {
    setup() {
      const { locale, tm } = useI18n({ useScope: 'global' })

      // about top image -------------------------------------------------------
      const $q = useQuasar()
      const imageFile = (name) => {
        if (!name)
          return name

        if ($q.screen.lt.sm)
          return name.replace(/^(.*)(\.)(.*)$/gi, '$1_600.$3')
        else if ($q.screen.lt.md)
          return name.replace(/^(.*)(\.)(.*)$/gi, '$1_1024.$3')
        else if ($q.screen.lt.lg)
          return name.replace(/^(.*)(\.)(.*)$/gi, '$1_1440.$3')
        else if ($q.screen.lt.xl)
          return name.replace(/^(.*)(\.)(.*)$/gi, '$1_1920.$3')
        else
          return name
      }

      // intersection -------------------------------------------------------
      const inView = ref([])
      const options = {
        handler(entry) {
          if (entry.intersectionRatio * 100 > 10) {
            add(entry.target.dataset.id)
          }
          else {
            remove(entry.target.dataset.id)
          }
        },
        cfg: {
          threshold: thresholds
        }
      }

      function add(i) {
        remove(i)
        inView.value.push(i)
        inView.value.sort(sortAtoi)
      }

      function remove(i) {
        let index
        while ((index = inView.value.indexOf(i)) > -1) {
          inView.value.splice(index, 1)
          inView.value.sort(sortAtoi)
        }
      }

      function sortAtoi(a, b) {
        return Number(a) - Number(b)
      }

      const action = (id) => {
        return inView.value.includes(id)
      }

      const infos = ref([])

      return {
        locale,
        tm,
        imageFile,
        options,
        inView,
        action,
        infos,
        capitalize
      }
    }
  }

</script>
<style scoped>
  .top {
    height: 400px;
    overflow: hidden;
    box-shadow: inset 0 0 0 1px rgba(100, 100, 100, 0.2);
    border-radius: 4px;
  }

  .top-contents {
    padding: 1vw 4vw;
  }

  .top-contents p {
    margin-bottom: 8px;
  }

  .top-contents img {
    --animate-duration: 1s;
    height: 80%;
  }

  .title {
    font-size: 34px;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .desc {
    font-size: 24px;
    letter-spacing: -1px;
  }

  .code {
    font-size: 15px;
    letter-spacing: 10px;
    font-weight: bold;
  }

  @media screen and (max-width:599px) {
    .top {
      height: 140px;
    }

    .top-contents p {
      margin-bottom: 4px;
    }

    .top-contents img {
      height: 70%;
    }

    .title {
      font-size: 14px;
      letter-spacing: 0;
    }

    .desc {
      font-size: 10px;
      letter-spacing: 0;
    }

    .code {
      font-size: 10px;
      letter-spacing: 4px;
    }

    .detail {
      font-size: 10px;
      padding: 2px 6px !important;
      border-radius: 2px;
    }
  }

  @media screen and (min-width:600px) and (max-width:1023px) {
    .top {
      height: 300px;
    }

    .title {
      font-size: 17px;
    }

    .desc {
      font-size: 14px;
    }

    .code {
      font-size: 12px;
    }
  }

  @media screen and (min-width:1024px) and (max-width:1439px) {
    .top {
      height: 340px;
    }

    .title {
      font-size: 30px;
    }

    .desc {
      font-size: 22px;
    }

    .code {
      font-size: 14px;
    }
  }

  .section-wrap {
    position: relative;
  }

  .section-wrap::after {
    content: '';
    position: absolute;
    z-index: 1;
    height: 20px;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .section-wrap a {
    text-decoration: none;
    color: inherit;
    text-align: center;
  }

  .body--light .section-wrap::after {
    background-color: rgba(250, 250, 250, 1);
  }

  .body--dark .section-wrap::after {
    background-color: rgba(20, 20, 20, 1);
  }

  .body--light.section-wrap::after {
    background-color: rgba(250, 250, 250, 1) !important;
  }

  .body--dark.section-wrap::after {
    background-color: rgba(20, 20, 20, 1) !important;
  }

  .product {
    padding: 16px;
  }

  @media screen and (max-width:599px) {
    .block {
      height: 100vh;
      overflow: hidden;
    }
  }
</style>