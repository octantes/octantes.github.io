<script setup>

import { ref, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import Drawing from '../03/drawing.vue'

const BLEND  = .25
const FLIGHT = 4000
const GLIDE  = .12
const INK    = { shade: .1 }
const TOUCH  = matchMedia('(hover: none)').matches

const route  = useRoute()
const router = useRouter()
const store  = useStore()

store.land(route)

const entries  = ref([])
const active   = ref(null)
const hovered  = ref(null)
const flying   = ref(null)
const opened   = ref(false)
const scroller = ref(null)
const sheet    = ref(null)
const grounds  = reactive({})

let spy     = null
let frame   = 0
let landed  = 0
let target  = null
let gliding = 0

const token = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
const rgb   = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
const mix   = (a, b, t) => '#' + rgb(a).map((c, i) => Math.round(c + (rgb(b)[i] - c) * t).toString(16).padStart(2, '0')).join('')
const clamp = t => Math.min(1, Math.max(0, t))
const luma  = hex => { const [r, g, b] = rgb(hex); return (r * .299 + g * .587 + b * .114) / 255 }
const light = hex => luma(hex) > .5
const tone  = hex => hex && token(light(hex) ? '--niebla' : '--carbon')

function groundAt() {
  const box = scroller.value.getBoundingClientRect(), middle = box.top + box.height / 2, band = box.height * BLEND
  const tops = [...scroller.value.querySelectorAll('.entry')].map(el => el.getBoundingClientRect().top)
  const of = i => grounds[entries.value[i]?.id] ?? token('--carbon')
  const i = Math.max(0, tops.findLastIndex(top => top <= middle))
  if (tops[i + 1] !== undefined && middle > tops[i + 1] - band) return mix(of(i), of(i + 1), clamp((middle - tops[i + 1] + band) / (2 * band)))
  if (i > 0 && middle < tops[i] + band) return mix(of(i - 1), of(i), clamp((middle - tops[i] + band) / (2 * band)))
  return of(i)
}

function paint() {
  frame = 0
  if (!scroller.value || !entries.value.length) return
  const ground = groundAt(), [dark, bright, humo] = [token('--carbon'), token('--niebla'), token('--humo')]
  const t = clamp((luma(ground) - luma(dark)) / (luma(bright) - luma(dark)))
  document.documentElement.style.setProperty('--page', ground)
  sheet.value.style.setProperty('--ink', t < .5 ? mix(humo, bright, t * 2) : mix(mix(dark, humo, INK.shade), dark, (t - .5) * 2))
  store.groundLight = light(ground)
}

function repaint() { frame ||= requestAnimationFrame(paint) }

function settle() { flying.value = null; clearTimeout(landed) }

function glide() {
  const s = scroller.value, now = s.scrollTop
  s.scrollTop = Math.abs(target - now) < 2 ? target : now + (target - now) * GLIDE
  if (s.scrollTop !== target && s.scrollTop !== now) { gliding = requestAnimationFrame(glide); return }
  gliding = 0
  target  = null
  settle()
}

function glideTo(top) {
  const s = scroller.value
  target  = Math.max(0, Math.min(s.scrollHeight - s.clientHeight, top))
  gliding ||= requestAnimationFrame(glide)
}

function wheel(e) {
  if (e.ctrlKey) return
  e.preventDefault()
  const s = scroller.value, step = { 0: 1, 1: 40, 2: s.clientHeight }[e.deltaMode]
  glideTo((target ?? s.scrollTop) + e.deltaY * step)
}

function go(id) {
  const s = scroller.value, el = document.getElementById(id)
  if (!el) return
  flying.value = id
  landed = setTimeout(settle, FLIGHT)
  glideTo(el.getBoundingClientRect().top - s.getBoundingClientRect().top + s.scrollTop - parseFloat(getComputedStyle(el).scrollMarginTop))
  router.replace({ hash: `#${id}` })
}

function pick(e, event) {
  if (event.pointerType === 'touch' && !opened.value) { opened.value = true; return }
  opened.value = false
  go(e.id)
}

function outside(event) { if (!event.target.closest('.rail')) opened.value = false }

watch(grounds, repaint)

onMounted(async () => {
  entries.value = await (await fetch('/vitacora.json')).json()
  active.value  = entries.value[0]?.id ?? null
  await nextTick()
  spy = new IntersectionObserver(seen => { for (const entry of seen) if (entry.isIntersecting) active.value = entry.target.id }, { root: scroller.value, rootMargin: '-45% 0px -45% 0px' })
  for (const el of scroller.value.querySelectorAll('.entry')) spy.observe(el)
  scroller.value.addEventListener('scroll', repaint, { passive: true })
  scroller.value.addEventListener('scrollend', () => { if (!gliding) settle() })
  scroller.value.addEventListener('wheel', wheel, { passive: false })
  window.addEventListener('pointerdown', outside)
  if (route.hash) document.getElementById(decodeURIComponent(route.hash.slice(1)))?.scrollIntoView({ block: 'start' })
  repaint()
})

onBeforeUnmount(() => {
  spy?.disconnect()
  cancelAnimationFrame(frame)
  cancelAnimationFrame(gliding)
  clearTimeout(landed)
  window.removeEventListener('pointerdown', outside)
  document.documentElement.style.removeProperty('--page')
  store.groundLight = null
})

</script>

<template>

  <div class="frame page" ref="sheet">

    <main class="board" ref="scroller">
      <article v-for="e in entries" :id="e.id" :key="e.id" class="entry">
        <header class="divider" :class="{ open: TOUCH || hovered === e.id }" @pointerenter="hovered = e.id" @pointerleave="hovered = null">
          <time class="day" :datetime="e.date">{{ e.date }}</time>
          <span class="rule" />
          <h2 class="name">{{ e.title }}</h2>
        </header>
        <Drawing v-if="e.kind === 'svg'" :src="e.src" :size="e.size" :instant="!!flying && flying !== e.id" @ground="grounds[e.id] = tone($event)" />
        <div v-else class="prose" v-html="e.html" />
      </article>
    </main>

    <nav class="rail" :class="{ open: opened }" aria-label="vitacora" @pointerleave="hovered = null">
      <button v-for="e in entries" :key="e.id" class="mark" :class="{ active: active === e.id }" @pointerenter="hovered = e.id" @focus="hovered = e.id" @blur="hovered = null" @click="pick(e, $event)">
        <span class="label"><span class="day">{{ e.date }}</span>{{ e.title }}</span>
        <span class="tick" />
      </button>
    </nav>

  </div>

</template>

<style scoped>

.page   { --ink: var(--humo); position: relative; }

.board  { flex: 1 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 3rem; padding: 0 3rem 50vh 0; scrollbar-width: none; }

.entry  { display: flex; flex-direction: column; gap: 1.5rem; scroll-margin-top: 1rem; }

.divider {

  /* LAYOUT */ display: flex; align-items: center; gap: 0; min-height: 2rem;
  /* FILL   */ color: var(--lirio);
  /* FONT   */ font-family: var(--font-mono); font-size: .9rem;

  & .rule { flex: 1; height: 1px; color: var(--lirio); background: currentColor; transition: color var(--animate-fast); }
  & .day, & .name { max-width: 0; overflow: hidden; white-space: nowrap; opacity: 0; transition: max-width var(--animate-fast), opacity var(--animate-fast); }
  & .name { margin: 0; font: inherit; font-weight: 700; }

  &:hover, &.open {
    gap: 1rem;
    & .rule { color: var(--cristal); background: repeating-linear-gradient(90deg, currentColor 0 .5rem, transparent .5rem .9rem); }
    & .day, & .name { max-width: 30rem; opacity: 1; }
  }

}

.prose  { max-width: 42rem; font-family: var(--font-mono); color: var(--ink); line-height: 1.6; }

.rail {

  /* LAYOUT */ position: fixed; top: 50%; right: 1rem; z-index: 2; transform: translateY(-50%); display: flex; flex-direction: column; align-items: flex-end; gap: .15rem;
  /* BOX    */ max-height: 70%; overflow-y: auto; padding: .75rem 1rem; scrollbar-width: none;
  /* FILL   */ color: var(--humo);
  /* BORDER */ border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-mono); font-size: .9rem;
  /* MOTION */ transition: background var(--animate-fast);

  &:hover, &:focus-within, &.open { background: var(--carbon-a95); }

}

.mark {

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ display: flex; align-items: center; justify-content: flex-end; gap: .75rem;
  /* BOX    */ min-height: 1.4em; padding: .1rem 0; line-height: 1.4;
  /* FILL   */ background: none; color: var(--humo);
  /* BORDER */ border: none;
  /* FONT   */ font: inherit; text-align: right;

  & .tick  { width: 1rem; height: 2px; background: color-mix(in srgb, var(--ink) 60%, transparent); transition: width var(--animate-fast), background var(--animate-fast); }
  & .label { display: none; white-space: nowrap; }
  & .day   { color: var(--humo-a60); margin-right: .5rem; }

  &.active { color: var(--cristal); & .tick { width: 1.6rem; background: var(--cristal); } }
  &:hover, &:focus-visible { color: var(--lirio); & .tick { background: var(--lirio); } }
  &:focus { box-shadow: none; outline: none; }

}

.rail:hover .label, .rail:focus-within .label, .rail.open .label { display: inline; }

.rail:is(:hover, :focus-within, .open) .mark:not(.active, :hover, :focus-visible) .tick { background: var(--humo-a60); }

@media (--mobile) { .board { padding-right: 2rem; } .rail { right: .25rem; } }

</style>
