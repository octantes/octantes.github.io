<script setup>

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  shader:    { type: Object, default: null },                                   // the Shader component ref
  container: { type: Object, default: null },                                   // element the pointer events arrive on
  enabled:   { type: Boolean, default: true },                                  // false while the field is not the thing on screen
})

/* TUNING */

const HOVER_COLOR  = '#8AB6BB'                                                  // COLOR_RAIN, the field's own teal
const RIPPLE_RGB   = '138,182,187'                                              // the same teal, for the ring
const SHADOW_RGB   = '152,108,152'                                              // COLOR_PORTAL, so a dimmed cell reads as the same char
const RIPPLE_MS    = 70                                                         // one cell of radius per tick
const RIPPLE_MAX   = 12                                                         // cells of radius before it dies
const RIPPLE_WIDTH = 1                                                          // cells thick
const RIPPLE_HOLD  = 0.5                                                        // fraction of its life spent at full strength
const SHADOW_MIN   = 0.10                                                       // char alpha immediately behind the front
const SHADOW_DEPTH = 4                                                          // cells of wake trailing the front
const STEPS        = 8                                                          // alpha quantisation, see composeRipples

/* STATE */

const cells   = new Map()                                                       // the map the shader reads
const hover   = new Map()                                                       // this effect's own cells
const ripples = new Map()                                                       // and this one's

let grid   = null                                                               // { cols, rows, fontSize, rect }
let at     = null                                                               // pointer, in cells
let live   = false                                                              // is the pointer layer wanted at all
let active = []                                                                 // { cx, cy, born }
let frame  = 0

function compose() {
  cells.clear()
  for (const [k, v] of hover)   cells.set(k, v)
  for (const [k, v] of ripples) cells.set(k, v)
}

function readGrid() { grid = props.shader?.gridInfo?.() || null; return grid }

function toCell(ev) {
  if (!grid) return null
  const x = Math.floor((ev.clientX - grid.rect.left) / grid.fontSize)
  const y = Math.floor((ev.clientY - grid.rect.top)  / grid.fontSize)
  if (x < 0 || y < 0 || x >= grid.cols || y >= grid.rows) return null
  return { cx: x, cy: y }
}

const HOVER_SHAPE = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]

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

function composeRipples(now) {
  ripples.clear()
  if (!grid) return
  const { cols, rows } = grid
  active = active.filter(rp => (now - rp.born) / RIPPLE_MS < RIPPLE_MAX)
  for (const rp of active) {
    const r = (now - rp.born) / RIPPLE_MS
    const fade = Math.min(1, (1 - r / RIPPLE_MAX) / RIPPLE_HOLD)
    const hi = r + RIPPLE_WIDTH / 2, lo = Math.max(0, r - RIPPLE_WIDTH / 2)

    const y0 = Math.max(0, Math.ceil(rp.cy - hi)), y1 = Math.min(rows - 1, Math.floor(rp.cy + hi))

    for (let y = y0; y <= y1; y++) {
      const dy = y - rp.cy
      const outer = hi * hi - dy * dy
      if (outer < 0) continue
      const xo = Math.sqrt(outer)
      const inner = lo * lo - dy * dy
      const xi = inner > 0 ? Math.sqrt(inner) : -1

      // the wake: a band trailing the front, not everything behind it
      if (xi >= 0) {
        const back = Math.max(0, lo - SHADOW_DEPTH)
        const wi = back > 0 ? Math.sqrt(Math.max(0, back * back - dy * dy)) : 0
        const spansW = wi > 0
          ? [[rp.cx - xi, rp.cx - wi], [rp.cx + wi, rp.cx + xi]]
          : [[rp.cx - xi, rp.cx + xi]]
        for (const [p0, p1] of spansW) {
          const w0 = Math.max(0, Math.ceil(p0)), w1 = Math.min(cols - 1, Math.floor(p1))
          for (let x = w0; x <= w1; x++) {
            const d = Math.sqrt((x - rp.cx) * (x - rp.cx) + dy * dy)
            const u = Math.min(1, Math.max(0, (d - back) / Math.max(0.001, lo - back)))
            const depth = 1 - (1 - SHADOW_MIN) * u * u * Math.sqrt(u)              // darkest just behind the front, gone further in
            const a = Math.round((1 - (1 - depth) * fade) * STEPS) / STEPS
            if (a < 1) ripples.set(y * cols + x, { color: `rgba(${SHADOW_RGB},${a})` })
          }
        }
      }

      // the front itself
      const ring = `rgba(${RIPPLE_RGB},${(Math.max(1, Math.round(fade * STEPS)) / STEPS).toFixed(3)})`
      const spans = xi < 0
        ? [[rp.cx - xo, rp.cx + xo]]
        : [[rp.cx - xo, rp.cx - xi], [rp.cx + xi, rp.cx + xo]]
      for (const [p0, p1] of spans) {
        const x0 = Math.max(0, Math.ceil(p0)), x1 = Math.min(cols - 1, Math.floor(p1))
        for (let x = x0; x <= x1; x++) ripples.set(y * cols + x, { color: ring })
      }
    }
  }
}

function tick(now) {
  composeRipples(now)
  compose()
  frame = active.length ? requestAnimationFrame(tick) : 0
}

function start() { if (!frame) frame = requestAnimationFrame(tick) }

/* EVENTS */

function onEnter() { readGrid() }

function onMove(ev) {
  if (!live) return
  if (!grid && !readGrid()) return
  const c = toCell(ev)
  if (!c) { if (at) { at = null; buildHover(); compose() } return }
  if (at && c.cx === at.cx && c.cy === at.cy) return                             // still the same cell, nothing to redraw
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

function onResize() { grid = null; at = null; hover.clear(); compose() }

function checkLive() { live = props.enabled && window.innerWidth > 1080 }

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
watch(() => props.enabled, () => { checkLive(); if (!live) { at = null; active = []; hover.clear(); ripples.clear(); compose() } })

onMounted(() => {
  checkLive()
  window.addEventListener('resize', onResize)
  window.addEventListener('resize', checkLive)
})

onBeforeUnmount(() => {
  unbind()
  window.removeEventListener('resize', onResize)
  window.removeEventListener('resize', checkLive)
  if (frame) cancelAnimationFrame(frame)
  active = []
  hover.clear(); ripples.clear(); cells.clear()
  props.shader?.attachOverlay?.(null)
})

</script>

<template><span class="typewriter" aria-hidden="true" hidden /></template>
