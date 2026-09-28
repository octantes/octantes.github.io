<script setup>

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { BRUSH, seedOf, trace, ribbon, shape } from './brush.js'
import { LINE } from '../04/walls.js'

const props = defineProps({ step: Number, label: String, kick: Object, lit: Boolean })
const emit  = defineEmits(['turn'])

const CORNERS = [[.9, .05], [.1, .5], [.9, .95]]
const CURVE   = { cut: .25, steps: 8 }

function rounded(corners) {
  return corners.flatMap((c, i) => {
    const [p, n] = [corners.at(i - 1), corners[(i + 1) % corners.length]]
    const [a, b] = [p, n].map(o => [c[0] + (o[0] - c[0]) * CURVE.cut, c[1] + (o[1] - c[1]) * CURVE.cut])
    return Array.from({ length: CURVE.steps + 1 }, (_, k) => {
      const t = k / CURVE.steps
      return [0, 1].map(d => (1 - t) ** 2 * a[d] + 2 * (1 - t) * t * c[d] + t * t * b[d])
    })
  })
}

const CHEVRON = rounded(CORNERS)
const BOX     = [12, 20, 96, 200]

const frame  = ref(0)
const kicked = ref(false)
let ticker   = 0

const variants = computed(() => {
  const seed = seedOf(`arrow${props.step}`)
  const stroke = props.step > 0 ? CHEVRON.map(([u, v]) => [1 - u, v]) : CHEVRON
  return Array.from({ length: BRUSH.frames }, (_, v) => { const line = trace(stroke, BOX, seed, v, true, 1.5); return { fill: shape(line), ink: ribbon(line, seed + v, LINE, false) } })
})

watch(() => props.kick, kick => { if (kick?.step !== props.step) return; kicked.value = false; requestAnimationFrame(() => { kicked.value = true }) })

onMounted(()       => { ticker = setInterval(() => { frame.value = (frame.value + 1) % BRUSH.frames }, 1000 / BRUSH.fps) })
onBeforeUnmount(() => clearInterval(ticker))

</script>

<template>

  <button class="arrow" :class="{ kicked, lit, back: step < 0 }" :title="label" :aria-label="label" @click="emit('turn', step)" @animationend="kicked = false">
    <svg viewBox="0 0 120 240" aria-hidden="true"><path class="fill" :d="variants[frame].fill" /><path class="ink" :d="variants[frame].ink" /></svg>
  </button>

</template>

<style scoped>

.arrow {

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ display: flex; align-items: center; justify-content: center; flex: 0 0 auto;
  /* BOX    */ width: 5rem; padding: 0;
  /* FILL   */ background: none; color: var(--carbon);
  /* BORDER */ border: none;
  /* MOTION */ transition: color var(--animate-fast);

  &:hover, &:focus-visible, &.lit { color: var(--lirio); }
  &:focus { box-shadow: none; outline: none; }

  & svg   { width: 100%; height: auto; max-height: 10rem; overflow: visible; }
  & .fill { fill: var(--carbon); }
  & .ink  { fill: currentColor; }

  &.kicked      svg { animation: kick .25s ease-out; }
  &.kicked.back svg { animation-name: kick-back; }

}

@keyframes kick      { 50% { transform: translateX(.5rem);  } }
@keyframes kick-back { 50% { transform: translateX(-.5rem); } }

</style>
