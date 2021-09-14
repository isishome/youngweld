<template>
  <div v-touch-pan.vertical.prevent="handlePan" class="product-wrap column items-center" :data-id="data.id">
    <div class="col-1">&nbsp;</div>
    <div class="col-3 column justify-center full-width">
      <div class="title animate__animated" :class="[`animate__delay-${parsDelay}s`, show ? 'animate__fadeInDown' : '']"
        :style="`word-wrap:keep-all;--animate-duration: ${duration}s;`">{{title}}</div>
      <div class="desc q-mb-md animate__animated"
        :class="[`animate__delay-${parsDelay}s`, show ? 'animate__fadeInRight' : '']"
        :style="`word-wrap:keep-all;--animate-duration: ${duration}s;`">
        {{desc}}&nbsp;</div>
    </div>
    <template v-for="(e, index) in etc" :key="`etc_${index}`">
      <div class="col-1 etc text-primary animate__animated"
        :class="[`animate__delay-${parsDelay}s`, show ? 'animate__flipInY' : '']"
        :style="`--animate-duration: ${duration}s;`">
        {{e}}
      </div>
    </template>
    <div class="img-wrap col">
      <img :src="src" :style="`width:70%;--animate-duration: ${duration}s;`" class="animate__animated"
        :class="[contentClass, `animate__delay-${parsDelay}s`, show ? 'animate__slideInUp' : '']" />
    </div>
    <div class="col-1">&nbsp;</div>
  </div>
</template>
<script>
  import { computed } from 'vue'
  import { scroll } from 'quasar'
  const { getScrollTarget, setVerticalScrollPosition } = scroll

  const scrollToPosition = (to) => {
    const target = getScrollTarget(document.body)
    const duration = 200
    setVerticalScrollPosition(target, to, duration)
  }

  export default {
    props: {
      contentClass: {
        type: String,
        default: null
      },
      title: {
        type: String,
        defailt: null
      },
      desc: {
        type: String,
        default: null
      },
      etc: {
        type: Array,
        default: () => { }
      },
      src: {
        type: String,
        required: true
      },
      show: {
        type: Boolean,
        default: false
      },
      duration: {
        type: Number,
        default: 1
      },
      delay: {
        type: Number,
        default: 0
      },
      data: {
        type: Object,
        default: () => { }
      }
    },
    setup(props) {
      const parsDelay = computed(() => {
        const temp = Math.round(props.delay)
        return temp > 3 ? 3 : temp < 0 ? 0 : temp
      })

      return {
        parsDelay,
        handlePan({ ...info }) {
          if (info.isFinal) {
            let dest = null
            const exists = props.data.list.find(i => i.id === props.data.id)
            const direction = info.direction === 'down' ? -1 : 1

            if (exists) {
              const idx = props.data.list.indexOf(exists)
              if ((idx === 0 && direction === -1) || (idx + 1 === props.data.list.length && direction === 1))
                ''
              else {
                if ((info.duration < 150 || info.distance.y > 130))
                  dest = props.data.list[idx + direction].pos
                else
                  dest = exists.pos
              }

              if (dest)
                scrollToPosition(dest)
            }
          }
        }
      }
    }
  }
</script>
<style scoped>
  .product-wrap {
    user-select: none;
    overflow: hidden;
    background-color: rgba(50, 50, 50, .02);
    position: relative;
    word-break: keep-all;
    border-radius: 4px;
  }

  @media screen and (max-width:599px) {
    .product-wrap {
      height: 100vh;
      padding-left: 0;
      padding-right: 0;
    }

    .product-wrap div {
      pointer-events: none;
    }
  }

  .title {
    font-size: 1.4em;
    font-weight: bold;
    letter-spacing: -1px;
  }

  .body--dark .title {
    color: rgba(220, 220, 220, 1);
  }

  .desc {
    font-size: 1.1em;
    letter-spacing: -1px;
  }

  .etc {
    font-size: 1em;
    font-weight: bold;
    letter-spacing: 3px;
  }

  .img-wrap {
    position: relative;
  }

  .img-wrap::after {
    transition: 1s;
    content: '';
    z-index: 1;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 100%;
    right: 100%;
    opacity: 0;
    box-shadow: inset 1px 1px 0 0 rgba(150, 150, 150, 1);
  }

  .img-wrap:hover::after {
    opacity: 1;
    bottom: 80%;
    right: 85%;
  }
</style>