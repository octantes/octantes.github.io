<script setup>

import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { BRUSH, seedOf, trace, ribbon, shape, span, cut, sketchBox } from './brush.js'
import { LINE } from '../04/walls.js'

const props = defineProps({ wall: Object, layout: Object, hot: String })
const emit  = defineEmits(['hover', 'pick', 'clear', 'busy'])

const VARIANTS = Array.from({ length: BRUSH.frames }, (_, v) => v)
const MOTION   = { length: 1300, stagger: .6, alone: { out: [0, 1], in: [0, 1] }, turn: { out: [0, .45], in: [.35, 1] } }

const frame   = ref(0)
const clock   = ref(0)
const motion  = shallowRef(null)
const current = shallowRef({ wall: props.wall, layout: props.layout })

let ticker = 0
let raf    = 0

const clamp = t => Math.min(1, Math.max(0, t))
const ease  = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
const rgb   = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
const mix   = (a, b, t) => `rgb(${rgb(a).map((c, i) => Math.round(c + (rgb(b)[i] - c) * t)).join(' ')})`
const blank = () => getComputedStyle(document.documentElement).getPropertyValue('--niebla').trim()

function prepare({ wall, layout }) {
  return layout.items.map(item => {
    const seed  = seedOf(wall.id + item.id)
    const lines = VARIANTS.map(v => (item.strokes ?? [sketchBox(item.box[2], item.box[3], seed)]).map((stroke, k) => trace(stroke, item.box, seed + k * 13, v)))
    return { item, seed, lines, total: lines[0].reduce((sum, line) => sum + span(line), 0) }
  })
}

function timed(entries, [a, b], incoming) {
  const [from, to] = [a * MOTION.length, b * MOTION.length]
  const order = [...entries].sort((x, y) => y.total - x.total)
  const step  = MOTION.stagger * (to - from) / Math.max(1, entries.length - 1)
  return entries.map(e => {
    const offset = order.indexOf(e) * step
    return incoming ? { ...e, start: from + offset, duration: to - from - offset } : { ...e, start: from, duration: to - from - offset }
  })
}

function play(from, to) {
  const windows = from && to ? MOTION.turn : MOTION.alone
  motion.value = {
    out: from ? timed(prepare(from), windows.out, false) : [],
    in:  to ? timed(prepare(to), windows.in, true) : [],
    colours: [from?.wall.color ?? blank(), to?.wall.color ?? blank()],
    start: performance.now(),
  }
  clock.value = 0
  emit('busy', true)
  raf = requestAnimationFrame(tick)
}

function tick() {
  clock.value = performance.now() - motion.value.start
  if (clock.value < MOTION.length) { raf = requestAnimationFrame(tick); return }
  motion.value = null
  if (props.wall.id === current.value.wall.id) { emit('busy', false); return }
  const next = { wall: props.wall, layout: props.layout }
  play(current.value, next)
  current.value = next
}

function pose(entry, shown, incoming) {
  if (shown <= 0) return null
  const lines = entry.lines[frame.value]
  const [lo, hi] = incoming ? [0, shown * entry.total] : [(1 - shown) * entry.total, entry.total]
  const ink = []
  let at = 0
  lines.forEach((line, k) => {
    const length = span(line), [a, b] = [Math.max(lo, at), Math.min(hi, at + length)]
    if (b > a) ink.push(ribbon(cut(line, (a - at) / length, (b - at) / length), entry.seed + k * 13 + frame.value))
    at += length
  })
  return { id: entry.item.id, fill: shape(lines[0]), color: entry.item.fill, opacity: clamp((shown - .8) / .2), ink }
}

const scene = computed(() => {
  const m = motion.value
  if (!m) return null
  const t = clock.value
  const progress = e => clamp((t - e.start) / e.duration)
  return {
    colour: mix(...m.colours, ease(clamp(t / MOTION.length))),
    poses: [...m.out.map(e => pose(e, 1 - progress(e), false)), ...m.in.map(e => pose(e, progress(e), true))].filter(Boolean),
  }
})

const inside = computed(() => [LINE / 2, LINE / 2, current.value.layout.size[0] - LINE, current.value.layout.size[1] - LINE])

const drawn = computed(() => prepare(current.value).map(({ item, seed, lines }) => ({
  item, variants: lines.map((strokes, v) => ({ fill: shape(strokes[0]), ink: strokes.map((line, k) => ribbon(line, seed + k * 13 + v)) })),
})))

const edge  = computed(() => {
  const seed = seedOf(current.value.wall.id)
  const [ex, ey] = [LINE * 3 / inside.value[2], LINE * 3 / inside.value[3]]
  const run = (from, to) => Array.from({ length: 5 }, (_, i) => [from[0] + (to[0] - from[0]) * i / 4, from[1] + (to[1] - from[1]) * i / 4])
  const sides = [run([-ex, 0], [1 + ex, 0]), run([1, -ey], [1, 1 + ey]), run([1 + ex, 1], [-ex, 1]), run([0, 1 + ey], [0, -ey])]
  return VARIANTS.map(v => sides.map((side, k) => ribbon(trace(side, inside.value, seed + k * 7, v), seed + k * 7 + v, LINE * 1.4)).join(''))
})

const lit = computed(() => !motion.value && drawn.value.find(d => d.item.id === props.hot))

watch(() => props.layout, layout => {
  const next = { wall: props.wall, layout }
  if (next.wall.id === current.value.wall.id) { current.value = next; return }
  if (motion.value) return
  play(current.value, next)
  current.value = next
})

onMounted(() => {
  ticker = setInterval(() => { frame.value = (frame.value + 1) % BRUSH.frames }, 1000 / BRUSH.fps)
  play(null, current.value)
})

onBeforeUnmount(() => { clearInterval(ticker); cancelAnimationFrame(raf) })

</script>

<template>

  <svg class="sketch" :class="[`boil-${frame}`, { focused: lit }]" :viewBox="`0 0 ${current.layout.size[0]} ${current.layout.size[1]}`" aria-hidden="true">

    <clipPath id="inside"><rect :x="inside[0]" :y="inside[1]" :width="inside[2]" :height="inside[3]" /></clipPath>

    <rect class="surface" :x="inside[0]" :y="inside[1]" :width="inside[2]" :height="inside[3]" :fill="scene ? scene.colour : current.wall.color" @click="emit('clear')" />

    <g v-if="scene" clip-path="url(#inside)">
      <g v-for="p in scene.poses" :key="p.id">
        <path :d="p.fill" :fill="p.color" :fill-opacity="p.opacity" />
        <path v-for="(ink, k) in p.ink" :key="k" class="ink" :d="ink" />
      </g>
    </g>

    <g v-else class="items" clip-path="url(#inside)">
      <g v-for="v in VARIANTS" :key="v" :class="`v${v}`">
        <g v-for="d in drawn" :key="d.item.id">
          <path :d="d.variants[v].fill" :fill="d.item.fill" />
          <path v-for="(ink, k) in d.variants[v].ink" :key="k" class="ink" :d="ink" />
        </g>
      </g>
      <template v-for="d in drawn" :key="d.item.id">
        <path v-if="!d.item.decor" class="hit" :d="d.variants[0].fill"
              @pointerenter="emit('hover', d.item.id, $event)" @pointerleave="emit('hover', null, $event)" @click="emit('pick', d.item, $event)" />
      </template>
    </g>

    <g v-if="lit" class="lit" clip-path="url(#inside)">
      <g v-for="v in VARIANTS" :key="v" :class="`v${v}`">
        <path :d="lit.variants[v].fill" :fill="lit.item.fill" />
        <path v-for="(ink, k) in lit.variants[v].ink" :key="k" :class="k ? 'ink' : 'ink outline'" :d="ink" />
      </g>
    </g>

    <g class="edge">
      <path v-for="v in VARIANTS" :key="v" :class="`v${v}`" :d="edge[v]" />
    </g>

  </svg>

</template>

<style scoped>

.sketch  { position: absolute; inset: 0; width: 100%; height: 100%; }

.v0, .v1, .v2 { display: none; }
.boil-0 .v0, .boil-1 .v1, .boil-2 .v2 { display: inline; }

.ink     { fill: var(--carbon); }
.outline { fill: var(--lirio); }
.hit     { fill: transparent; cursor: pointer; }
.lit     { pointer-events: none; }
.edge    { fill: var(--carbon); pointer-events: none; }

.items   { transition: opacity var(--animate-fast); }
.focused .items { opacity: .35; }

</style>
