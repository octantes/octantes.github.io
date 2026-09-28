<script setup>

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { BRUSH, seedOf, trace, ribbon } from './brush.js'
import { LINE } from '../04/walls.js'

const props = defineProps({ step: Number, label: String })
const emit  = defineEmits(['turn'])

const arm     = (from, to) => Array.from({ length: 6 }, (_, i) => [from[0] + (to[0] - from[0]) * i / 5, from[1] + (to[1] - from[1]) * i / 5])
const CHEVRON = [...arm([.85, .05], [.15, .5]), ...arm([.15, .5], [.85, .95]).slice(1)]
const BOX     = [20, 20, 80, 200]

const frame  = ref(0)
const kicked = ref(false)
let ticker   = 0

const variants = computed(() => {
  const seed = seedOf(`arrow${props.step}`)
  const stroke = props.step > 0 ? CHEVRON.map(([u, v]) => [1 - u, v]) : CHEVRON
  return Array.from({ length: BRUSH.frames }, (_, v) => ribbon(trace(stroke, BOX, seed, v), seed + v, LINE * 1.4))
})

function press() { kicked.value = false; requestAnimationFrame(() => { kicked.value = true }); emit('turn', props.step) }

onMounted(()       => { ticker = setInterval(() => { frame.value = (frame.value + 1) % BRUSH.frames }, 1000 / BRUSH.fps) })
onBeforeUnmount(() => clearInterval(ticker))

</script>

<template>

  <button class="arrow" :class="{ kicked, back: step < 0 }" :title="label" :aria-label="label" @click="press" @animationend="kicked = false">
    <svg viewBox="0 0 120 240" aria-hidden="true"><path :d="variants[frame]" /></svg>
  </button>

</template>

<style scoped>

.arrow {

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ display: flex; align-items: center; justify-content: center; flex: 0 0 auto;
  /* BOX    */ width: 4.5rem; padding: 0;
  /* FILL   */ background: none; color: var(--carbon);
  /* BORDER */ border: none;
  /* MOTION */ transition: color var(--animate-fast);

  &:hover { color: var(--lirio); }

  & svg  { width: 100%; height: auto; max-height: 9rem; fill: currentColor; }

  &.kicked      svg { animation: kick .25s ease-out; }
  &.kicked.back svg { animation-name: kick-back; }

}

@keyframes kick      { 50% { transform: translateX(.5rem);  } }
@keyframes kick-back { 50% { transform: translateX(-.5rem); } }

</style>
