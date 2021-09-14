<template>
  <div class="full-width q-px-md text-center absolute-center font-size text-weight-bold text-wrap">
    <div>{{t('pnf')}}</div>
  </div>
</template>
<script>
  import { useI18n } from 'vue-i18n'
  export default {
    setup() {
      const { t } = useI18n({ useScope: 'global' })

      return {
        t
      }
    }
  }
</script>
<style scoped>
  .font-size {
    font-size: calc(2vw + 10px);
  }
</style>