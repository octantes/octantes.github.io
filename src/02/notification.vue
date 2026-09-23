<script setup>

import { ref, onMounted } from 'vue'
import { useStore } from '../04/store.js'
import { MOBILE_MAX } from '../04/site-config.js'

const props = defineProps({ code: { type: [Number, String], default: 404 } })

const store  = useStore()

const GLYPHS = {
  '0': [' ██████╗ ', '██╔═████╗', '██║██╔██║', '████╔╝██║', '╚██████╔╝', ' ╚═════╝ '],
  '1': [' ██╗', '███║', '╚██║', ' ██║', ' ██║', ' ╚═╝'],
  '2': ['██████╗ ', '╚════██╗', ' █████╔╝', '██╔═══╝ ', '███████╗', '╚══════╝'],
  '3': ['██████╗ ', '╚════██╗', ' █████╔╝', ' ╚═══██╗', '██████╔╝', '╚═════╝ '],
  '4': ['██╗  ██╗', '██║  ██║', '███████║', '╚════██║', '     ██║', '     ╚═╝'],
  '5': ['███████╗', '██╔════╝', '███████╗', '╚════██║', '███████║', '╚══════╝'],
}

function figlet(code) {
  const digits = String(code).split('').map(d => GLYPHS[d]).filter(Boolean)
  if (!digits.length) return String(code)
  return [0, 1, 2, 3, 4, 5].map(r => digits.map(d => d[r]).join('')).join('\n')
}

const THROWS   = 20
const TRIES    = 14
const CROWD    = 0.34
const VSPREAD  = 1.22

function measurer(el) {
  const font = getComputedStyle(el).fontFamily
  const c = document.createElement('canvas').getContext('2d')
  return (text, px) => { c.font = `${px}px ${font}`; return c.measureText(text).width }
}

function shared(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  if (w <= 0 || h <= 0) return 0
  return (w * h) / Math.min(a.w * a.h, b.w * b.h)
}

function scatter(words, el, stage, card) {

  const W = stage.width, H = stage.height
  const px = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const width = measurer(el)

  const narrow = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches
  const room   = W * H - card.w * card.h
  const count  = narrow ? Math.max(8, Math.min(THROWS, Math.floor(room * 0.2 / 1100))) : THROWS

  const thrown = []
  for (let i = 0; i < count; i++) thrown.push(words[i % words.length])
  for (let i = thrown.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[thrown[i], thrown[j]] = [thrown[j], thrown[i]]
  }

  const giants = new Set()
  while (giants.size < Math.min(2, thrown.length)) giants.add(Math.floor(Math.random() * thrown.length))

  const half  = Math.ceil(thrown.length / 2)
  const step  = 180 / half
  const taken = []
  const out   = []

  thrown.forEach((text, i) => {

    const roll = Math.random()
    const tier = giants.has(i) ? 3 : roll < 0.31 ? 2 : roll < 0.66 ? 1 : 0
    const tierRem = tier === 3 ? 7.5 + Math.random() * 3.5
                  : tier === 2 ? 3.6 + Math.random() * 2.4
                  : tier === 1 ? 1.7 + Math.random() * 1.0
                  :              0.85 + Math.random() * 0.55
    const rem  = narrow ? 0.8 : tierRem
    const alpha = tier === 3 ? 0.045 + Math.random() * 0.035
                : tier === 2 ? 0.10  + Math.random() * 0.09
                : tier === 1 ? 0.24  + Math.random() * 0.22
                :              0.34  + Math.random() * 0.26
    const tilt = Math.random() * 18 - 9

    const size = rem * px
    const w0 = width(text, size), h0 = size * 1.15
    const rad = Math.abs(tilt) * Math.PI / 180
    const w = w0 * Math.cos(rad) + h0 * Math.sin(rad)
    const h = w0 * Math.sin(rad) + h0 * Math.cos(rad)

    let box, cx, cy, best = null

    for (let n = 0; n < TRIES * 2; n++) {
      const slice = n < TRIES ? Math.floor(i / 2) : Math.floor(Math.random() * half)
      const upper = n < TRIES ? i % 2 === 0 : Math.random() < 0.5
      const angle = ((upper ? 180 : 0) + step * slice + Math.random() * step) * Math.PI / 180
      const reach = tier === 3 ? 0.42 + Math.random() * 0.40
                  : tier === 2 ? 0.34 + Math.random() * 0.44
                  :              0.30 + Math.random() * 0.50
      cx = W / 2 + Math.cos(angle) * reach * W / 2
      cy = H / 2 + Math.sin(angle) * reach * VSPREAD * H / 2
      box = { x: cx - w / 2, y: cy - h / 2, w, h }
      if (shared(box, card) > 0) continue
      const crowd = taken.reduce((m, t) => Math.max(m, shared(box, t)), 0)
      if (crowd <= CROWD) { best = null; break }
      if (!best || crowd < best.crowd) best = { crowd, box, cx, cy }
    }

    if (best) ({ box, cx, cy } = best)

    taken.push(box)
    out.push({
      text,
      style: {
        left:      `${(cx / W) * 100}%`,
        top:       `${(cy / H) * 100}%`,
        transform: `translate(-50%, -50%) rotate(${tilt.toFixed(1)}deg)`,
        fontSize:  `${rem.toFixed(2)}rem`,
        opacity:   alpha.toFixed(2),
      },
    })

  })

  return out

}

const art   = figlet(props.code)
const copy  = store.t.notFound
const stage = ref(null)
const card  = ref(null)
const words = ref([])

onMounted(() => {
  const s = stage.value?.getBoundingClientRect()
  const c = card.value?.getBoundingClientRect()
  if (!s || !c) return
  words.value = scatter(
    (copy.byCode[String(props.code)] || copy.byCode.default).split(' '),
    stage.value,
    { width: s.width, height: s.height },
    { x: c.x - s.x - 24, y: c.y - s.y - 24, w: c.width + 48, h: c.height + 48 },
  )
})

</script>

<template>

  <div class="errorstate" ref="stage">

    <span v-for="(w, i) in words" :key="i" class="thrown" :style="w.style" aria-hidden="true">{{ w.text }}</span>

    <div class="errorcard" role="alert" ref="card">

      <pre class="errorart" aria-hidden="true">{{ art }}</pre>
      <p class="errorline">{{ copy.byCode[String(code)] || copy.byCode.default }}</p>
      <button class="errorback" @click="store.navHome()" :title="copy.back" :aria-label="copy.back">{{ copy.back }}</button>

    </div>

  </div>

</template>

<style scoped>

.errorstate {

  /* LAYOUT */ position: relative; display: flex; align-items: center; justify-content: center;
  /* BOX    */ width: 100%; min-height: 24rem; height: 100%; overflow: hidden;
  /* FONT   */ font-family: var(--font-mono);

}

.thrown {

  /* CURSOR */ user-select: none; pointer-events: none;
  /* LAYOUT */ position: absolute; white-space: nowrap;
  /* FILL   */ color: var(--humo);

}

.errorcard {

  /* LAYOUT */ position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center;
  /* BOX    */ padding: var(--space-xl) var(--space-xxl); gap: var(--space-mm);
  /* FILL   */ background-color: var(--carbon);
  /* BORDER */ border: var(--small-outline) var(--lirio-a40); border-radius: var(--radius-ss);
  /* FILL   */ box-shadow: 0 0 3.2rem -0.4rem var(--lirio-a21), 0 0 1rem -0.45rem var(--lirio-a15);

}

.errorart {

  /* LAYOUT */ margin: 0;
  /* FILL   */ color: var(--lirio);
  /* FONT   */ font-family: monospace; font-size: 0.62rem; line-height: 1.1; white-space: pre;
  /* FONT   */ font-variant-ligatures: none; letter-spacing: 0;

}

.errorline { margin: 0; color: var(--humo); font-size: var(--text-mm); text-align: center; }

.errorback {

  /* CURSOR */ cursor: pointer;
  /* BOX    */ padding: 0.35rem 0.9rem;
  /* FILL   */ background-color: transparent; color: var(--cristal);
  /* BORDER */ border: var(--small-outline) var(--cristal-a60); border-radius: 9999px; corner-shape: superellipse(1.4);
  /* FONT   */ font-family: var(--font-mono); font-size: var(--text-ss);
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { color: var(--carbon); background-color: var(--cristal); border-color: var(--cristal);
            box-shadow: 0 0 1rem 0 var(--cristal-a31), 0 0 .35rem 0 var(--cristal-a15); }

}

@media (--mobile) { .errorstate { min-height: clamp(28rem, 64svh, 38rem); } }

</style>