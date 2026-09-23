<script setup>

import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  tile:     { type: Number,  default: 22 },
  radius:   { type: Number,  default: 1.125 },
  driftX:   { type: Number,  default: 40 },
  driftY:   { type: Number,  default: 60 },
  viewport: { type: Boolean, default: false },
})

const canvas = ref(null)

let host  = null
let watch = null
let geo   = null
let raf   = 0
let t0    = 0

const stillness = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null

function fit() {

  const cv = canvas.value
  if (!host || !cv) return

  const box    = props.viewport ? document.documentElement : host
  const width  = box.clientWidth
  const height = box.clientHeight
  if (!width || !height) return

  const ink  = getComputedStyle(cv).getPropertyValue('--niebla').trim() || '#D8DADE'
  const dpr  = window.devicePixelRatio || 1
  const cols = Math.max(1, Math.round(width  / props.tile))
  const rows = Math.max(1, Math.round(height / props.tile))

  cv.width  = Math.round(width  * dpr)
  cv.height = Math.round(height * dpr)
  cv.style.width  = width  + 'px'
  cv.style.height = height + 'px'

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

  const xs = [], ys = []
  for (let i = 0; i < cols; i++) xs.push(Math.round(i * width  / cols * dpr))
  for (let j = 0; j < rows; j++) ys.push(Math.round(j * height / rows * dpr))

  const frame = document.createElement('canvas')
  frame.width  = cv.width
  frame.height = cv.height
  const fctx = frame.getContext('2d')

  for (const x of lane(xs, 0, frame.width, half)) for (const y of lane(ys, 0, frame.height, half)) fctx.drawImage(sprite, x - half, y - half)

  geo = { frame, w: cv.width, h: cv.height, ctx: cv.getContext('2d'),
          vx: props.driftX * dpr, vy: props.driftY * dpr }

  pin()
  draw(0, 0)
  run()

}

function pin() {

  const cv = canvas.value
  if (host && cv && !props.viewport) cv.style.transform = host.scrollTop ? `translateY(${host.scrollTop}px)` : ''

}

function lane(bases, phase, span, half) {

  const out = []

  for (const base of bases) {
    const v = ((base + phase) % span + span) % span
    out.push(v)
    if (v < half) out.push(v + span)
  }

  return out

}

function draw(px, py) {

  const g = geo
  if (!g) return

  const x = (px % g.w + g.w) % g.w
  const y = (py % g.h + g.h) % g.h

  g.ctx.clearRect(0, 0, g.w, g.h)
  g.ctx.drawImage(g.frame, x - g.w, y - g.h)
  g.ctx.drawImage(g.frame, x,       y - g.h)
  g.ctx.drawImage(g.frame, x - g.w, y)
  g.ctx.drawImage(g.frame, x,       y)

}

function step(now) {

  const g = geo
  if (!g) return

  if (!t0) t0 = now
  const secs = (now - t0) / 1000

  draw(Math.round(secs * g.vx), Math.round(secs * g.vy))
  raf = requestAnimationFrame(step)

}

function run() {

  cancelAnimationFrame(raf)
  raf = 0
  t0  = 0

  const g = geo
  if (!g || (!g.vx && !g.vy) || stillness?.matches) return

  raf = requestAnimationFrame(step)

}

onMounted(() => {
  host = canvas.value?.parentElement || null
  fit()
  if (typeof ResizeObserver !== 'undefined' && host) { watch = new ResizeObserver(fit); watch.observe(props.viewport ? document.documentElement : host) }
  window.addEventListener('resize', fit)
  host?.addEventListener('scroll', pin, { passive: true })
})

onBeforeUnmount(() => {
  watch?.disconnect(); watch = null
  cancelAnimationFrame(raf); raf = 0; geo = null
  window.removeEventListener('resize', fit)
  host?.removeEventListener('scroll', pin)
  host = null
})

</script>

<template>

  <canvas ref="canvas" class="dotgrid" :class="{ viewport }" aria-hidden="true"></canvas>

</template>

<style scoped>

.dotgrid {

  /* LAYOUT */ position: absolute; top: 0; left: 0; pointer-events: none;

  &.viewport { position: fixed; }

}

</style>
