<script setup>

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  shader:    { type: Object, default: null },                                   // the Shader component ref
  container: { type: Object, default: null },                                   // element the pointer events arrive on
  enabled:   { type: Boolean, default: true },                                  // false while the field is not the thing on screen
})

/* TUNING */

const CURSOR_RADIUS = 7                                                         // cells the cursor's shadow reaches
const CURSOR_BANDS  = ['0.04', '0.14', '0.30', '0.50', '0.72', '0.88']          // char alpha, centre outward
const CURSOR_RGB    = '152,108,152'                                             // COLOR_PORTAL, so a dimmed cell reads as the same char
const RING_RGB      = '188,232,238'                                             // COLOR_RAIN lifted - see composeRings
const RING_STEP_MS  = 45                                                        // one cell of radius per tick
const RING_MAX      = 20                                                        // cells of radius before it dies
const RING_ALPHA    = 1.0                                                       // at full strength, see RING_HOLD
const RING_STEPS    = 8                                                         // quantised, see composeRings
const RING_WIDTH    = 1.2                                                       // cells thick
const RING_HOLD     = 0.45                                                      // fraction of its life spent at full strength

/* STATE */

const cells  = new Map()                                                        // the map the shader reads
const cursor = new Map()                                                        // this effect's own cells
const rings  = new Map()                                                        // and this one's

let grid    = null                                                              // { cols, rows, fontSize, rect }
let at      = null                                                              // pointer, in cells
let ripples = []                                                                // { cx, cy, born }
let frame   = 0
let live    = false                                                             // is the pointer layer wanted at all

function compose() {
  cells.clear()
  for (const [k, v] of cursor) cells.set(k, v)
  for (const [k, v] of rings)  cells.set(k, v)
}

function readGrid() { grid = props.shader?.gridInfo?.() || null; return grid }

function toCell(ev) {
  if (!grid) return null
  const x = Math.floor((ev.clientX - grid.rect.left) / grid.fontSize)
  const y = Math.floor((ev.clientY - grid.rect.top)  / grid.fontSize)
  if (x < 0 || y < 0 || x >= grid.cols || y >= grid.rows) return null
  return { cx: x, cy: y }
}

function buildCursor() {
  cursor.clear()
  if (!at || !grid) return
  const { cols, rows } = grid
  for (let dy = -CURSOR_RADIUS; dy <= CURSOR_RADIUS; dy++) {
    const y = at.cy + dy
    if (y < 0 || y >= rows) continue
    for (let dx = -CURSOR_RADIUS; dx <= CURSOR_RADIUS; dx++) {
      const x = at.cx + dx
      if (x < 0 || x >= cols) continue
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d > CURSOR_RADIUS) continue
      const band = Math.min(CURSOR_BANDS.length - 1, Math.floor(d / CURSOR_RADIUS * CURSOR_BANDS.length))
      cursor.set(y * cols + x, { color: `rgba(${CURSOR_RGB},${CURSOR_BANDS[band]})` })
    }
  }
}

function composeRings(now) {
  rings.clear()
  if (!grid) return
  const { cols, rows } = grid
  ripples = ripples.filter(rp => (now - rp.born) / RING_STEP_MS < RING_MAX)
  for (const rp of ripples) {
    const r = (now - rp.born) / RING_STEP_MS
    const fade = Math.min(1, (1 - r / RING_MAX) / RING_HOLD)
    const step = Math.max(1, Math.round(fade * RING_STEPS))
    const color = `rgba(${RING_RGB},${(RING_ALPHA * step / RING_STEPS).toFixed(3)})`
    const hi = r + RING_WIDTH / 2, lo = Math.max(0, r - RING_WIDTH / 2)
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
      for (const [a, b] of spans) {
        const x0 = Math.max(0, Math.ceil(a)), x1 = Math.min(cols - 1, Math.floor(b))
        for (let x = x0; x <= x1; x++) rings.set(y * cols + x, { color })
      }
    }
  }
}

function tick(now) {
  composeRings(now)
  compose()
  frame = ripples.length ? requestAnimationFrame(tick) : 0
}

function start() { if (!frame) frame = requestAnimationFrame(tick) }

/* EVENTS */

function onEnter() { readGrid() }

function onMove(ev) {
  if (!live) return
  if (!grid && !readGrid()) return
  const c = toCell(ev)
  if (!c) { if (at) { at = null; buildCursor(); compose() } return }
  if (at && c.cx === at.cx && c.cy === at.cy) return                             // still the same cell, nothing to redraw
  at = c
  buildCursor()
  compose()
}

function onLeave() { at = null; buildCursor(); compose() }

function onDown(ev) {
  if (!live) return
  if (!grid && !readGrid()) return
  const c = toCell(ev)
  if (!c) return
  ripples.push({ cx: c.cx, cy: c.cy, born: performance.now() })
  start()
}

function onResize() { grid = null; at = null; cursor.clear(); compose() }

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
watch(() => props.enabled, () => { checkLive(); if (!live) { at = null; ripples = []; cursor.clear(); rings.clear(); compose() } })

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
  ripples = []
  cursor.clear(); rings.clear(); cells.clear()
  props.shader?.attachOverlay?.(null)
})

</script>

<template><span class="typewriter" aria-hidden="true" hidden /></template>
