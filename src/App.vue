<template>
  <f-layout>
    <template #logo>
      <li>
        <router-link
          class="company row q-pl-none items-center"
          :to="{ name: 'main' }"
          :aria-label="t('company.name')"
        >
          <img src="/static/images/logo.webp" alt="" width="40" height="40" />
          <div class="gt-sm skew" aria-hidden="true">
            {{ t('company.name') }}
          </div>
        </router-link>
      </li>
    </template>
    <template #tab>
      <li
        v-ripple:grey-5
        v-for="(value, key) in tm('menu')"
        :key="key"
        class="tab gt-sm text-subtitle1 relative-position"
      >
        <router-link :to="{ name: key }">
          {{ value }}
        </router-link>
      </li>
    </template>
    <template #drawer>
      <q-item
        role="link"
        :inset-level="0.5"
        :active="key === $route.name"
        :active-class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
        clickable
        v-ripple:grey-5
        v-for="(value, key) in tm('menu')"
        :key="key"
        :to="{ name: key }"
      >
        <q-item-section>
          {{ value }}
        </q-item-section>
      </q-item>
    </template>
    <template #contents>
      <router-view />
    </template>
    <template #footer>
      <div class="footer column items-center q-px-md q-py-lg text-caption">
        <address class="contact column items-center text-center">
          <span class="text-wrap">{{ t('location.address') }}</span>
          <span class="row justify-center items-center q-gutter-x-md">
            <a class="row items-center" :href="PHONE_HREF">
              <q-icon name="phone_enabled" size="14px" aria-hidden="true" />
              <span class="visually-hidden">{{ t('support.phone.name') }}</span>
              <span class="q-ml-xs">{{ t('location.phone') }}</span>
            </a>
            <span class="row items-center">
              <q-icon name="print" size="14px" aria-hidden="true" />
              <span class="q-ml-xs">{{ t('location.fax') }}</span>
            </span>
          </span>
        </address>
        <div class="row justify-center items-center q-gutter-x-xs q-mt-sm">
          <img src="/static/images/logo.webp" alt="" width="30" height="30" />
          <div>{{ t('company.copyright1', { year }) }}</div>
          <div>{{ t('company.copyright2') }}</div>
        </div>
      </div>
    </template>
  </f-layout>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { PHONE_HREF } from './contact.js'

export default {
  setup() {
    const { t, tm } = useI18n({ useScope: 'global' })
    const year = new Date().getFullYear()

    return {
      t,
      tm,
      year,
      PHONE_HREF,
    }
  },
}
</script>
<style scoped>
.body--light .company img {
  filter: brightness(0.6) hue-rotate(180deg) grayscale(0.7);
}

.body--dark .company img {
  filter: hue-rotate(12deg) grayscale(0.6);
}

.company {
  padding-left: 0;
}

.company img {
  width: 40px;
}

.company .skew {
  color: #a74b00;
}

.body--dark .company .skew {
  color: #ff9d42;
}

.company .skew:not(:lang(ko)) {
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
  transition: 0.3s;
  font-size: 0.9em;
}

.tab:lang(ko) a {
  letter-spacing: -1px !important;
}

.body--light .tab a {
  color: rgba(60, 80, 110, 1);
}

.body--dark .tab a {
  color: #b89c5b;
}

.tab a.router-link-active::before {
  margin-left: -14px;
  position: absolute;
  content: '✓';
  font-size: 10px;
  font-family: sans-serif;
}

.body--light .tab a.router-link-active {
  font-weight: 500;
  filter: brightness(0.6);
}

.body--dark .tab a.router-link-active {
  font-weight: 500;
  filter: brightness(1.3);
}

.footer img {
  width: 30px;
  filter: grayscale(100%);
}

.footer .contact {
  gap: 4px;
  font-style: normal;
}

.footer .contact a {
  padding: 0;
  color: inherit;
}

.footer .contact a:hover,
.footer .contact a:focus-visible {
  text-decoration: underline;
}

.body--light .footer {
  background-color: rgba(240, 240, 240, 1);
}

.body--dark .footer {
  background-color: rgba(30, 30, 30, 1);
}
</style>
