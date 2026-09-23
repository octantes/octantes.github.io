<script setup>

import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  tile:     { type: Number,  default: 22 },
  radius:   { type: Number,  default: 1.125 },
  driftX:   { type: Number,  default: 40 },
  driftY:   { type: Number,  default: 60 },
  viewport: { type: Boolean, default: false },
})

const root   = ref(null)
const slide  = ref(null)
const canvas = ref(null)

let host  = null
let watch = null
let sig   = ''
let refit = 0
let anims = []

const stillness = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null

function fit() {

  const el = root.value
  const cv = canvas.value
  if (!host || !el || !cv) return

  const box    = props.viewport ? document.documentElement : host
  const width  = box.clientWidth
  const height = box.clientHeight
  if (!width || !height) return

  const dpr  = window.devicePixelRatio || 1
  const next = width + 'x' + height + '@' + dpr
  if (next === sig) { pin(); return }
  sig = next

  const ink    = getComputedStyle(cv).getPropertyValue('--niebla').trim() || '#D8DADE'
  const step   = Math.max(1, Math.round(props.tile * dpr))
  const period = step / dpr
  const cols   = Math.ceil(width  * dpr / step) + 1
  const rows   = Math.ceil(height * dpr / step) + 1

  if (!props.viewport) { el.style.width = width + 'px'; el.style.height = height + 'px' }

  cv.width  = (cols + 1) * step
  cv.height = (rows + 1) * step
  cv.style.width  = cv.width  / dpr + 'px'
  cv.style.height = cv.height / dpr + 'px'
  slide.value.style.left = slide.value.style.top = -period + 'px'

  const r    = props.radius * dpr
  const size = 2 * Math.ceil(r) + 2
  const half = size / 2

  const sprite = document.createElement('canvas')
  sprite.width = sprite.height = size
  const sctx = sprite.getContext('2d')
  sctx.fillStyle = ink
  sctx.beginPath()
  sctx.arc(half, half, r, 0, Math.PI * 2)
  sctx.fill()

  const row = document.createElement('canvas')
  row.width  = cv.width
  row.height = size
  const rctx = row.getContext('2d')
  for (let i = 0; i <= cols + 1; i++) rctx.drawImage(sprite, i * step - half, 0)

  const ctx = cv.getContext('2d')
  ctx.clearRect(0, 0, cv.width, cv.height)
  for (let j = 0; j <= rows + 1; j++) ctx.drawImage(row, 0, j * step - half)

  drift(step, period, dpr)
  pin()

}

function drift(step, period, dpr) {

  for (const a of anims) a.cancel()
  anims = []
  if (stillness?.matches) return

  const axis = (el, speed, prop) => {
    if (!speed) return
    anims.push(el.animate([{ transform: `${prop}(0px)` }, { transform: `${prop}(${period}px)` }],
      { duration: step / (speed * dpr) * 1000, iterations: Infinity, easing: `steps(${step}, jump-end)` }))
  }

  axis(slide.value,  props.driftX, 'translateX')
  axis(canvas.value, props.driftY, 'translateY')

}

function queue() {

  if (refit) return
  refit = requestAnimationFrame(() => { refit = 0; fit() })

}

function pin() {

  const el = root.value
  if (host && el && !props.viewport) el.style.transform = host.scrollTop ? `translateY(${host.scrollTop}px)` : ''

}

onMounted(() => {
  host = root.value?.parentElement || null
  fit()
  if (typeof ResizeObserver !== 'undefined' && host) { watch = new ResizeObserver(queue); watch.observe(props.viewport ? document.documentElement : host) }
  window.addEventListener('resize', queue)
  host?.addEventListener('scroll', pin, { passive: true })
})

onBeforeUnmount(() => {
  watch?.disconnect(); watch = null
  for (const a of anims) a.cancel()
  anims = []
  cancelAnimationFrame(refit); refit = 0
  window.removeEventListener('resize', queue)
  host?.removeEventListener('scroll', pin)
  host = null
})

</script>

<template>

  <div ref="root" class="dotgrid" :class="{ viewport }" aria-hidden="true">
    <div ref="slide" class="slide"><canvas ref="canvas"></canvas></div>
  </div>

</template>

<style scoped>

.dotgrid {

  /* LAYOUT */ position: absolute; top: 0; left: 0; overflow: hidden; pointer-events: none;

  &.viewport { position: fixed; inset: 0; }

}

.slide  { position: absolute; will-change: transform; }

canvas  { display: block; will-change: transform; }

</style>
