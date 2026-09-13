<script setup>

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from '../04/store.js'

const store = useStore()

const props = defineProps({
  shader:    { type: Object, default: null },
  container: { type: Object, default: null },
  enabled:   { type: Boolean, default: true },
})

/* TUNING */

const HOVER_COLOR  = '#8AB6BB'
const RIPPLE_COLOR = '#8AB6BB'
const SHADOW_RGB   = '152,108,152'
const RIPPLE_MS    = 70
const RIPPLE_MAX   = 9
const RIPPLE_WIDTH = 1
const RIPPLE_FADE  = 0.35
const SHADOW_MIN   = 0.10
const STEPS        = 8

const POEM_COLOR   = '#8AB6BB'
const POEM_TYPE_MS = 55
const POEM_HOLD_MS = 8500
const POEM_VOID    = 13
const POEM_VOID_MS = 700
const POEM_FLOOR   = 0.55
const POEM_LIFT    = 2.5
const POEM_CLICKS  = 5
const POEM_WINDOW  = 2500
const POEM_IDLE_MS = 60000
const POEM_BEAT_MS = 1000

const POEMS = {

  es: [
    [ { text: 'nadie es dueño', dx:  -12, dy: -5 },
      { text: 'de la luz', dx:   -2, dy: -1 },
      { text: 'que emite', dx:   -7, dy:  2 },
      { text: 'tu pantalla', dx:    1, dy:  5 } ],

    [ { text: 'ruido', dx:   -6, dy: -5 },
      { text: 'en la red', dx:    1, dy: -1 },
      { text: 'silencio', dx:   -5, dy:  2 },
      { text: 'en el nodo', dx:   -1, dy:  5 } ],

    [ { text: 'lo que el monolito', dx:  -15, dy: -5 },
      { text: 'esconde', dx:   -2, dy: -1 },
      { text: 'el cable', dx:    0, dy:  2 },
      { text: 'lo revela', dx:   -6, dy:  5 } ],

    [ { text: 'en el repo', dx:  -10, dy: -5 },
      { text: 'el código muere', dx:   -4, dy: -1 },
      { text: 'en el runtime', dx:  -10, dy:  2 },
      { text: 'es presente continuo', dx:   -8, dy:  5 } ],

    [ { text: 'solo tres colores', dx:  -11, dy: -4 },
      { text: 'contienen', dx:    1, dy:  0 },
      { text: 'millones', dx:   -8, dy:  4 } ],

    [ { text: 'cuando se apaga', dx:  -11, dy: -5 },
      { text: 'la ciudad', dx:   -5, dy: -1 },
      { text: 'se enciende', dx:    0, dy:  2 },
      { text: 'la mente', dx:   -2, dy:  5 } ],
  ],

  en: [
    [ { text: 'no one owns', dx:  -10, dy: -5 },
      { text: 'the light', dx:   -2, dy: -1 },
      { text: 'your screen', dx:   -8, dy:  2 },
      { text: 'gives off', dx:    2, dy:  5 } ],

    [ { text: 'noise', dx:   -6, dy: -5 },
      { text: 'on the network', dx:   -2, dy: -1 },
      { text: 'silence', dx:   -4, dy:  2 },
      { text: 'in the node', dx:   -1, dy:  5 } ],

    [ { text: 'what the monolith', dx:  -14, dy: -5 },
      { text: 'hides', dx:   -1, dy: -1 },
      { text: 'the cable', dx:    0, dy:  2 },
      { text: 'reveals', dx:   -5, dy:  5 } ],

    [ { text: 'in the repo', dx:  -10, dy: -5 },
      { text: 'the code dies', dx:   -3, dy: -1 },
      { text: 'in the runtime', dx:  -11, dy:  2 },
      { text: 'it is present tense', dx:   -7, dy:  5 } ],

    [ { text: 'only three colours', dx:  -12, dy: -4 },
      { text: 'hold', dx:    3, dy:  0 },
      { text: 'millions', dx:   -8, dy:  4 } ],

    [ { text: 'when the city', dx:  -10, dy: -5 },
      { text: 'goes dark', dx:   -5, dy: -1 },
      { text: 'the mind', dx:    1, dy:  2 },
      { text: 'lights up', dx:   -2, dy:  5 } ],
  ],

}
const SHADOW_STEP  = Array.from({ length: STEPS + 1 }, (_, i) => `rgba(${SHADOW_RGB},${i / STEPS})`)

/* STATE */

const cells   = new Map()
const hover   = new Map()
const ripples = new Map()
const poem    = new Map()

let grid   = null
let at     = null
let live   = false
let active = []
let recital = null
let recitalKey = null
let frame  = 0

function compose() {
  cells.clear()
  for (const [k, v] of hover)   cells.set(k, v)
  for (const [k, v] of ripples) cells.set(k, v)
  for (const [k, v] of poem)    cells.set(k, v)
}

function readGrid() { grid = props.shader?.gridInfo?.() || null; return grid }

function toCell(ev) {
  if (!grid) return null
  const x = Math.floor((ev.clientX - grid.rect.left) / grid.fontSize)
  const y = Math.floor((ev.clientY - grid.rect.top)  / grid.fontSize)
  if (x < 0 || y < 0 || x >= grid.cols || y >= grid.rows) return null
  return { cx: x, cy: y }
}

const HOVER_PLUS    = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]
const HOVER_DIAMOND = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1],
                       [-1, -1], [1, -1], [-1, 1], [1, 1],
                       [-2, 0], [2, 0], [0, -2], [0, 2]]
const HOVER_SHAPE   = HOVER_PLUS

function buildHover() {
  hover.clear()
  if (!at || !grid) return
  const { cols, rows } = grid
  for (const [dx, dy] of HOVER_SHAPE) {
    const x = at.cx + dx, y = at.cy + dy
    if (x < 0 || y < 0 || x >= cols || y >= rows) continue
    hover.set(y * cols + x, { color: HOVER_COLOR })
  }
}

function dither(x, y) { return ((x * 73856093) ^ (y * 19349663)) >>> 24 }

function composeRipples(now) {
  ripples.clear()
  if (!grid) return
  active = active.filter(rp => (now - rp.born) / RIPPLE_MS < RIPPLE_MAX)
  if (!active.length) return

  for (const rp of active) shadowOf(rp, now)
  for (const rp of active) frontOf(rp, now)
}

function ringGeometry(rp, now) {
  const r = (now - rp.born) / RIPPLE_MS
  return {
    r,
    fade: Math.min(1, (1 - r / RIPPLE_MAX) / RIPPLE_FADE),
    hi: r + RIPPLE_WIDTH / 2,
    lo: Math.max(0, r - RIPPLE_WIDTH / 2),
  }
}

function shadowOf(rp, now) {
  const { cols, rows } = grid
  const { fade, hi, lo } = ringGeometry(rp, now)
  if (lo <= 0) return
  const y0 = Math.max(0, Math.ceil(rp.cy - lo)), y1 = Math.min(rows - 1, Math.floor(rp.cy + lo))
  for (let y = y0; y <= y1; y++) {
    const dy = y - rp.cy
    const inner = lo * lo - dy * dy
    if (inner <= 0) continue
    const xi = Math.sqrt(inner)
    const x0 = Math.max(0, Math.ceil(rp.cx - xi)), x1 = Math.min(cols - 1, Math.floor(rp.cx + xi))
    for (let x = x0; x <= x1; x++) {
      const dx = x - rp.cx
      const t = Math.sqrt(dx * dx + dy * dy) / lo
      const base = SHADOW_MIN + (1 - SHADOW_MIN) * t * t * Math.sqrt(t)
      const a = Math.round((1 - (1 - base) * fade) * STEPS) / STEPS
      if (a < 1) ripples.set(y * cols + x, { color: SHADOW_STEP[Math.round(a * STEPS)] })
    }
  }
}

function frontOf(rp, now) {
  const { cols, rows } = grid
  const { fade, hi, lo } = ringGeometry(rp, now)
  const y0 = Math.max(0, Math.ceil(rp.cy - hi)), y1 = Math.min(rows - 1, Math.floor(rp.cy + hi))
  for (let y = y0; y <= y1; y++) {
    const dy = y - rp.cy
    const outer = hi * hi - dy * dy
    if (outer < 0) continue
    const xo = Math.sqrt(outer)
    const inner = lo * lo - dy * dy
    const xi = inner > 0 ? Math.sqrt(inner) : -1
    const spans = xi < 0
      ? [[rp.cx - xo, rp.cx + xo]]
      : [[rp.cx - xo, rp.cx - xi], [rp.cx + xi, rp.cx + xo]]
    for (const [p0, p1] of spans) {
      const x0 = Math.max(0, Math.ceil(p0)), x1 = Math.min(cols - 1, Math.floor(p1))
      for (let x = x0; x <= x1; x++) {
        if (fade < 1 && dither(x, y) >= fade * 256) continue
        ripples.set(y * cols + x, { color: RIPPLE_COLOR })
      }
    }
  }
}

function layout(g, lines) {
  const glyphs = []
  for (const line of lines) {
    for (let i = 0; i < line.text.length; i++) glyphs.push({ ch: line.text[i], x: line.dx + i, y: line.dy })
  }
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
  for (const p of glyphs) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y }

  const ox = Math.round((g.cols - 1 - x0 - x1) / 2)
  const oy = Math.round((g.rows - POEM_LIFT - 1 - y0 - y1) / 2)
  return {
    glyphs: glyphs.filter(p => p.ch !== ' ').map(p => ({ ch: p.ch, x: p.x + ox, y: p.y + oy })),
    cx: (x0 + x1) / 2 + ox, cy: (y0 + y1) / 2 + oy,
    rx: (x1 - x0) / 2 + POEM_VOID, ry: (y1 - y0) / 2 + POEM_VOID,
  }
}

let pending = 0
let lastPoem = -1

function recite() {
  if (!live) { pending = performance.now(); return }
  if (!grid && !readGrid()) return
  const list = POEMS[store.lang] || POEMS.es
  if (list.length > 1) { let i; do { i = Math.floor(Math.random() * list.length) } while (i === lastPoem); lastPoem = i }
  else lastPoem = 0
  recital = { ...layout(grid, list[lastPoem]), born: performance.now() }
  recitalKey = null
  start()
}

function buildPoem(now) {
  if (!recital) { if (poem.size) { poem.clear(); recitalKey = null } return }
  if (!live) { recital = null; poem.clear(); recitalKey = null; return }

  const n = recital.glyphs.length
  const type = n * POEM_TYPE_MS
  const e = now - recital.born

  const tOpen = POEM_VOID_MS
  const tIn   = tOpen + type
  const tHold = tIn + POEM_HOLD_MS
  const tOut  = tHold + type
  const tEnd  = tOut + POEM_VOID_MS

  if (e >= tEnd) { recital = null; poem.clear(); recitalKey = null; return }

  const raw = e < tOpen ? e / tOpen : e < tOut ? 1 : 1 - (e - tOut) / POEM_VOID_MS
  const presence = Math.round(Math.min(1, Math.max(0, raw)) * STEPS) / STEPS

  const from = e < tHold ? 0 : Math.min(n, Math.floor((e - tHold) / POEM_TYPE_MS))
  const to   = e < tOpen ? 0
             : e < tIn   ? Math.min(n, Math.floor((e - tOpen) / POEM_TYPE_MS))
             : n

  const key = from + ':' + to + ':' + presence
  if (key === recitalKey) return
  recitalKey = key

  poem.clear()
  const { cols, rows } = grid
  const { cx, cy, rx, ry } = recital

  if (presence > 0) {
    const y0 = Math.max(0, Math.ceil(cy - ry)), y1 = Math.min(rows - 1, Math.floor(cy + ry))
    for (let y = y0; y <= y1; y++) {
      const ny = (y - cy) / ry
      const span = 1 - ny * ny
      if (span <= 0) continue
      const half = rx * Math.sqrt(span)
      const x0 = Math.max(0, Math.ceil(cx - half)), x1 = Math.min(cols - 1, Math.floor(cx + half))
      for (let x = x0; x <= x1; x++) {
        const nx = (x - cx) / rx
        const d = Math.sqrt(nx * nx + ny * ny)
        const k = Math.max(0, (d - POEM_FLOOR) / (1 - POEM_FLOOR))
        const base = SHADOW_MIN + (1 - SHADOW_MIN) * Math.pow(k, 1.6)
        const a = Math.round((1 - (1 - base) * presence) * STEPS) / STEPS
        if (a < 1) poem.set(y * cols + x, { color: SHADOW_STEP[Math.round(a * STEPS)] })
      }
    }
  }

  for (let i = from; i < to; i++) {
    const p = recital.glyphs[i]
    if (p.x < 0 || p.y < 0 || p.x >= cols || p.y >= rows) continue
    poem.set(p.y * cols + p.x, { ch: p.ch, color: POEM_COLOR })
  }
}

function tick(now) {
  composeRipples(now)
  buildPoem(now)
  compose()
  frame = (active.length || recital) ? requestAnimationFrame(tick) : 0
}

function start() { if (!frame) frame = requestAnimationFrame(tick) }

/* EVENTS */

function onEnter() { readGrid() }

function onMove(ev) {
  if (!live) return
  if (!grid && !readGrid()) return
  const c = toCell(ev)
  if (!c) { if (at) { at = null; buildHover(); compose() } return }
  if (at && c.cx === at.cx && c.cy === at.cy) return
  at = c
  buildHover()
  compose()
}

function onLeave() { at = null; buildHover(); compose() }

function onDown(ev) {
  if (!live) return
  if (!grid && !readGrid()) return
  const c = toCell(ev)
  if (!c) return
  active.push({ cx: c.cx, cy: c.cy, born: performance.now() })
  start()
}

function onResize() { grid = null; at = null; hover.clear(); recital = null; poem.clear(); compose() }

let knocks = 0, firstKnock = 0
let watched = 0, beat = 0

function onDocClick(ev) {
  if (!ev.target?.closest?.('.logo-xx')) return
  const now = performance.now()
  if (now - firstKnock > POEM_WINDOW) { firstKnock = now; knocks = 0 }
  if (++knocks >= POEM_CLICKS) { knocks = 0; recite() }
}

const stillness = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

function checkLive() { live = props.enabled && window.innerWidth > 1080 && !(stillness && stillness.matches) }

let bound = null

function bind(el) {
  if (bound === el) return
  unbind()
  if (!el) return
  el.addEventListener('pointerenter', onEnter)
  el.addEventListener('pointermove',  onMove)
  el.addEventListener('pointerleave', onLeave)
  el.addEventListener('pointerdown',  onDown)
  bound = el
}

function unbind() {
  if (!bound) return
  bound.removeEventListener('pointerenter', onEnter)
  bound.removeEventListener('pointermove',  onMove)
  bound.removeEventListener('pointerleave', onLeave)
  bound.removeEventListener('pointerdown',  onDown)
  bound = null
}

watch(() => props.shader,    s => { if (s?.attachOverlay) s.attachOverlay(cells) }, { immediate: true })
watch(() => props.container, el => bind(el), { immediate: true })
watch(() => props.enabled, () => {
  checkLive()
  if (!live) { at = null; active = []; recital = null; watched = 0; hover.clear(); ripples.clear(); poem.clear(); compose(); return }
  if (pending && performance.now() - pending < POEM_WINDOW) { pending = 0; grid = null; recite() } else { pending = 0 }
})

function onBeat() {
  if (!live || recital || document.hidden) return
  watched += POEM_BEAT_MS
  if (watched >= POEM_IDLE_MS) { watched = 0; recite() }
}

onMounted(() => {
  checkLive()
  window.addEventListener('resize', onResize)
  window.addEventListener('resize', checkLive)
  document.addEventListener('click', onDocClick)
  beat = setInterval(onBeat, POEM_BEAT_MS)
})

onBeforeUnmount(() => {
  unbind()
  window.removeEventListener('resize', onResize)
  window.removeEventListener('resize', checkLive)
  document.removeEventListener('click', onDocClick)
  clearInterval(beat)
  if (frame) cancelAnimationFrame(frame)
  active = []; recital = null
  hover.clear(); ripples.clear(); poem.clear(); cells.clear()
  props.shader?.attachOverlay?.(null)
})

</script>

<template><span class="typewriter" aria-hidden="true" hidden /></template>