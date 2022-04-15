<template>
  <div class="row">
    <div class="row justify-start col-12 col-sm-10 offset-sm-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3 q-pa-lg">
      <div class="text-h5 col-12 q-mb-md">{{t('menu.location')}}
        <q-separator />
      </div>
      <div class="full-width relative-position">
        <iframe ref="iframe" class="shadow-1"
          :src="locale === 'ko' ? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3165.9379639803756!2d126.6558673162066!3d37.48579027981307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b792a4285dc2d%3A0xfc8a8a0faf808372!2z7JiB7J287KCE6riw!5e0!3m2!1sko!2skr!4v1650033507612!5m2!1sko!2skr' : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3165.867537015972!2d126.6539182160829!3d37.487452136409345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b792a4285dc2d%3A0xfc8a8a0faf808372!2z7JiB7J287KCE6riw!5e0!3m2!1sen!2skr!4v1625809841845!5m2!1sen!2skr'"
          width="100%" :style="`border:0;height:50vh;filter: invert(${$q.dark.isActive ? '90%' : 0})`"
          allowfullscreen="" loading="lazy"></iframe>
        <q-inner-loading :showing="visible">
          <q-spinner-facebook size="10vh" color="amber-8" />
        </q-inner-loading>
      </div>
      <q-card class="q-my-md full-width shadow-1">
        <q-card-section :class="$q.dark.isActive ? 'bg-grey-9 text-grey-5' : 'bg-yellow-7 text-black'">
          <div class="text-h6">{{t('location.contact')}}</div>
        </q-card-section>
        <q-card-section>
          <div class="row no-wrap items-center q-gutter-x-md">
            <q-icon name="location_on" size="xs" />
            <div class="text-wrap">{{t('location.address')}}</div>
          </div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          <div class="row items-center q-gutter-x-md">
            <q-icon name="phone_enabled" size="xs" />
            <div>{{t('location.phone')}}</div>
          </div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          <div class="row items-center q-gutter-x-md">
            <q-icon name="print" size="xs" />
            <div>{{t('location.fax')}}</div>
          </div>
        </q-card-section>
      </q-card>
      <div class="full-width">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-lg-6">
            <q-card class="shadow-1 card">
              <q-card-section :class="$q.dark.isActive ? 'bg-grey-9 text-grey-5' : 'bg-green-6 text-white'">
                <div class="text-h6">{{t('location.PublicTransport')}}</div>
              </q-card-section>
              <q-card-section>
                <div class="column items-start q-gutter-y-sm">
                  <div v-for="(info, index) in tm('location.PublicTransportInfo')" :key="index" class="row no-wrap">
                    <div>ㆍ</div>
                    <div class="text-wrap">{{info}}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-lg-6">
            <q-card class="shadow-1 card">
              <q-card-section :class="$q.dark.isActive ? 'bg-grey-9 text-grey-5' : 'bg-red-5 text-white'">
                <div class="text-h6">{{t('location.OwnCar')}}</div>
              </q-card-section>
              <q-card-section>
                <div class="column items-start q-gutter-y-sm">
                  <div v-for="(info, index) in tm('location.OwnCarInfo')" :key="index" class="row no-wrap">
                    <div>ㆍ</div>
                    <div class="text-wrap">{{info}}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12" style="height:10vh"></div>
  </div>
</template>
<script>
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'

  export default {
    setup() {
      const { locale, t, tm } = useI18n({ useScope: 'global' })
      const visible = ref(true)
      const iframe = ref(null)

      onMounted(() => {
        iframe.value.onload = () => {
          visible.value = false
        }
      })

      return {
        locale,
        t,
        tm,
        visible,
        iframe
      }
    }
  }
</script>
<style scoped>
  .text-wrap {
    word-break: keep-all;
  }

  @media screen and (min-width:1440px) {
    .card:lang(ko) {
      height: 260px;
    }

    .card:lang(en) {
      height: 300px;
    }
  }
</style>