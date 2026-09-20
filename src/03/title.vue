<script setup> 

import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({ text: { type: String, default: '' } })

const shown = computed(() => props.text.split(' - ')[0].trim() || props.text)

const host  = ref(null)
const lines = ref(1)
let observer = null

async function countLines() {
  await nextTick()
  const el = host.value?.querySelector('.ink')
  if (!el) return
  const cs = getComputedStyle(el)
  const step = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.04
  lines.value = Math.max(1, Math.round(el.offsetHeight / step))
}

onMounted(async () => {
  if (document.fonts?.ready) await document.fonts.ready
  countLines()
  if (typeof ResizeObserver !== 'undefined' && host.value) {
    observer = new ResizeObserver(() => countLines())
    observer.observe(host.value)
  }
})

onBeforeUnmount(() => { observer?.disconnect(); observer = null })

watch(() => props.text, countLines)

const chars = computed(() => Math.max(shown.value.length, 1))
const word  = computed(() => Math.max(...shown.value.split(/\s+/).map(w => w.length), 1))

</script>

<template> 

  <h2 class="notetitle" v-if="text" ref="host" :style="{ '--chars': chars, '--word': word, '--lines': lines }"><span class="ink">{{ shown }}</span></h2>

</template>

<style scoped> 

.notetitle {

  /* LAYOUT */ display: block; width: 100%; text-align: center;
  /* BOX    */ margin: 0; padding-block: var(--space-max) var(--space-ll); padding-inline: var(--space-xxl);
  /* FONT   */ font-family: var(--font-display); font-weight: 400;
               font-size: clamp(1.4rem, min(10cqw, calc(118cqw / var(--word, 8)), calc(355cqw / var(--chars, 16))), 5rem);
               line-height: 1.04;
               letter-spacing: -0.055em; text-transform: uppercase;
               overflow-wrap: normal; word-break: normal; hyphens: none;

}

@media (max-width: 1080px) {

  .notetitle {
    /* BOX  */ padding-block: var(--space-xxl) var(--space-mm); padding-inline: var(--space-ll);
    /* FONT */ font-size: clamp(1.05rem, min(19cqw, calc(104cqw / var(--word, 8)), calc(380cqw / var(--chars, 16))), 5rem);
  }

}

.ink {

  /* LAYOUT */ display: inline-block; max-width: 100%;
  /* SHAPE  */ transform: scaleY(1.5); transform-origin: center;
  /* BOX    */ margin-block: calc(0.26em * var(--lines, 1)); padding-inline: 0.06em;
  /* FILL   */ background: linear-gradient(100deg, var(--cristal) 0%, var(--lirio) 100%);
               -webkit-background-clip: text; background-clip: text;
               -webkit-text-fill-color: transparent; color: transparent;

}

</style>
