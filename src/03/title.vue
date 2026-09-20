<script setup>

import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({ text: { type: String, default: '' } })                                                                    // the note's own title

const host   = ref(null)
const canvas = ref(null)

const CELL     = 6                                                                                                                    // px per character cell
const LINE     = 15                                                                                                                   // cells per line of title
const RAMP     = ' ..::--==++**##%%@@'                                                                                                // coverage to character
const FILL     = 0.92                                                                                                                 // share of the width the title aims for
const MAX_LINE = 2                                                                                                                    // lines allowed on a wide column
const MAX_NARROW = 4                                                                                                                  // a phone column is a third as wide, so it takes more

let observer = null

function token(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() }

function hash(text) { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }

/* The title is drawn once at cell resolution - one pixel per character - and
   then read back, so any string in any language lands on the grid without a
   glyph table to maintain. What the reader sees is the same character field the
   portal is made of, shaped by the letters of the note's own name. */

function render() {

  const el = canvas.value, box = host.value
  if (!el || !box || !props.text) return

  const width = Math.floor(box.getBoundingClientRect().width)
  if (width < 80) return

  const cols = Math.floor(width / CELL)
  const dpr  = Math.min(window.devicePixelRatio || 1, 2)

  const probe = document.createElement('canvas').getContext('2d')
  const face  = token('--font-grotesk') || 'sans-serif'
  const words = props.text.toUpperCase().split(/\s+/).filter(Boolean)

  /* wrap before shrinking: a long title squeezed onto one line stops being a
     title and becomes a stripe, so it takes a second line first */

  let size = LINE * 0.78, lines = [props.text.toUpperCase()]
  const widthOf = (str, px) => { probe.font = `700 ${px}px ${face}`; return probe.measureText(str).width }

  const maxLines = cols < 90 ? MAX_NARROW : MAX_LINE

  for (let n = 1; n <= maxLines; n++) {
    const per = Math.ceil(words.length / n)
    const test = []
    for (let i = 0; i < words.length; i += per) test.push(words.slice(i, i + per).join(' '))
    const widest = Math.max(...test.map(l => widthOf(l, size)))
    if (widest <= cols * FILL || n === maxLines) {
      lines = test
      if (widest > cols * FILL) size *= (cols * FILL) / widest
      break
    }
  }

  const rows = Math.max(4, Math.ceil(size * 1.3 * lines.length))

  const src = document.createElement('canvas')
  src.width = cols; src.height = rows
  const sctx = src.getContext('2d', { willReadFrequently: true })
  sctx.font = `700 ${size}px ${face}`
  sctx.textBaseline = 'middle'
  sctx.textAlign = 'center'
  sctx.fillStyle = '#fff'
  lines.forEach((l, i) => sctx.fillText(l, cols / 2, (rows / lines.length) * (i + 0.5)))

  const data = sctx.getImageData(0, 0, cols, rows).data

  el.width  = cols * CELL * dpr
  el.height = rows * CELL * dpr
  el.style.width  = cols * CELL + 'px'
  el.style.height = rows * CELL + 'px'

  const ctx = el.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cols * CELL, rows * CELL)
  ctx.font = `${CELL}px ${token('--font-mono') || 'monospace'}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'

  const ink   = token('--humo')   || '#AAABAC'
  const accent= token('--lirio')  || '#986C98'
  const seed  = hash(props.text)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {

      const a = data[(y * cols + x) * 4 + 3] / 255
      if (a < 0.08) continue

      const step = Math.min(RAMP.length - 1, Math.floor(a * RAMP.length))
      const ch   = RAMP[step]
      if (ch === ' ') continue

      const n = ((x * 73856093) ^ (y * 19349663) ^ seed) >>> 0                                                                        // stable per title, so it never reshuffles
      ctx.fillStyle = (n % 23 === 0) ? accent : ink
      ctx.globalAlpha = 0.45 + a * 0.55
      ctx.fillText(ch, x * CELL + CELL / 2, y * CELL + CELL / 2)

    }
  }

  ctx.globalAlpha = 1

}

onMounted(async () => {
  await nextTick()
  if (document.fonts?.ready) await document.fonts.ready
  render()
  if (typeof ResizeObserver !== 'undefined' && host.value) {
    observer = new ResizeObserver(() => render())
    observer.observe(host.value)
  }
})

onBeforeUnmount(() => { observer?.disconnect(); observer = null })

watch(() => props.text, async () => { await nextTick(); render() })

</script>

<template>

  <div class="notetitle" ref="host" role="heading" aria-level="2" :aria-label="text">
    <canvas ref="canvas" aria-hidden="true"></canvas>
  </div>

</template>

<style scoped>

.notetitle {

  /* LAYOUT */ display: flex; justify-content: center; width: 100%;
  /* BOX    */ padding-block: var(--space-ll) var(--space-mm);

}

canvas { display: block; }

</style>
