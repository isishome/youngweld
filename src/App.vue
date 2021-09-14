<template>
  <f-layout>
    <template #logo>
      <li>
        <router-link class="company row q-pl-none items-center" :to="{ name: 'main' }">
          <img src="/static/images/logo.png" />
          <div class="gt-sm skew">{{t('company.name')}}</div>
        </router-link>
      </li>
    </template>
    <template #tab props="props">
      <li v-ripple:grey-5 v-for="(value, key) in tm('menu')" :key="key"
        class="tab gt-sm text-subtitle1 relative-position">
        <router-link :to="{ name: key }">
          {{value}}
        </router-link>
      </li>
    </template>
    <template #drawer>
      <q-item :inset-level=".5" :active="key === $route.name"
        :active-class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'" clickable v-ripple:grey-5
        v-for="(value, key) in tm('menu')" :key="key" :to="{ name: key }">
        <q-item-section>
          {{ value }}
        </q-item-section>
      </q-item>
    </template>
    <template #contents>
      <router-view />
    </template>
    <template #footer>
      <div class="footer row justify-center items-center q-gutter-x-xs q-py-md text-caption">
        <img src="/static/images/logo.png" />
        <div>{{t('company.copyright1')}}</div>
        <div>{{t('company.copyright2')}}</div>
      </div>
    </template>
  </f-layout>
</template>

<script>
  import { useI18n } from 'vue-i18n'

  export default {
    setup() {
      const { t, tm } = useI18n({ useScope: 'global' })

      return {
        t,
        tm
      }
    }
  }
</script>
<style scoped>
  .body--light .company {
    filter: brightness(.6) hue-rotate(180deg) grayscale(.7);
  }

  .body--dark .company {
    filter: hue-rotate(12deg) grayscale(.6);
  }

  .company {
    padding-left: 0;
  }

  .company img {
    width: 40px;
  }

  .company .skew {
    color: rgb(255, 123, 0);
  }

  .company .skew:lang(en) {
    font-size: 1.5em;
    font-family: 'Teko', sans-serif;
    padding-top: 4px;
    letter-spacing: 1px;
    transform: skewX(-20deg);
  }

  .company .skew:lang(ko) {
    margin-left: -4px;
    font-size: 1.1em;
    font-weight: 700;
    padding-top: 1px;
    letter-spacing: 2px;
    transform: skewX(-20deg) scaleX(85%);
  }

  li {
    border-radius: 10px;
    padding-top: 2px;
  }

  a {
    pointer-events: all;
    text-decoration: none;
    padding: 4px 4px 4px 16px;
  }

  .tab a {
    transition: .3s;
    font-size: 0.9em;
  }

  .tab:lang(ko) a {
    letter-spacing: -1px !important;
  }

  .body--light .tab a {
    color: rgba(60, 80, 110, 1);
  }

  .body--dark .tab a {
    color: rgba(184, 156, 91, .8);
  }

  .tab a.router-link-active::before {
    margin-left: -14px;
    position: absolute;
    content: '\e876';
    font-size: 10px;
    font-family: 'Material Icons';
  }

  .body--light .tab a.router-link-active {
    font-weight: 500;
    filter: brightness(.6);
  }

  .body--dark .tab a.router-link-active {
    font-weight: 500;
    filter: brightness(1.3);
  }

  .footer img {
    width: 30px;
    filter: grayscale(100%);
  }

  .body--light .footer {
    background-color: rgba(240, 240, 240, 1);
  }

  .body--dark .footer {
    background-color: rgba(30, 30, 30, 1);
  }
</style>