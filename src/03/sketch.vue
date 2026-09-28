<script setup>

import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useBoil } from './boil.js'
import { BRUSH, MOTION, STILL, seedOf, trace, ribbon, shape, span, cut, sketchBox } from './brush.js'
import { LINE } from '../04/drawings.js'

const props = defineProps({ scene: Object, hot: String, interactive: Boolean })
const emit  = defineEmits(['hover', 'pick', 'clear', 'busy'])

const VARIANTS = Array.from({ length: BRUSH.frames }, (_, v) => v)

const frame   = useBoil()
const clock   = ref(0)
const motion  = shallowRef(null)
const current = shallowRef(props.scene)

let raf     = 0
let leaving = null

const clamp = t => Math.min(1, Math.max(0, t))
const ease  = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
const rgb   = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
const mix   = (a, b, t) => `rgb(${rgb(a).map((c, i) => Math.round(c + (rgb(b)[i] - c) * t)).join(' ')})`
const token = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
const blank = () => token('--niebla')

function strokesAt(item, box, seed, strokes) {
  const sketch = strokes ? { outline: strokes[0], ink: strokes } : sketchBox(box[2], box[3], seed, item.hidden)
  return {
    lines:   VARIANTS.map(v => sketch.ink.map((stroke, k) => trace(stroke, box, seed + k * 13, v))),
    outline: VARIANTS.map(v => trace(sketch.outline, box, seed, v, true)),
  }
}

function inked(seed, line, k, v) { return ribbon(line, seed + k * 13 + v) }

function prepare({ seed: prefix, layout }) {
  return layout.items.map((item, index) => {
    const seed = seedOf(prefix + item.id)
    const { lines, outline } = strokesAt(item, item.box, seed, item.strokes)
    return { item, index, seed, lines, outline, total: lines[0].reduce((sum, line) => sum + span(line), 0) }
  })
}

function overlapping({ item: { box: a } }, { item: { box: b } }) {
  const w = Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])
  const h = Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1])
  return w > 0 && h > 0 && w * h > MOTION.overlap * Math.min(a[2] * a[3], b[2] * b[3])
}

function clusters(entries) {
  const groups = []
  for (const entry of entries) {
    const joined = groups.filter(group => !entry.item.solo && group.some(member => !member.item.solo && overlapping(member, entry)))
    joined.forEach(group => groups.splice(groups.indexOf(group), 1))
    groups.push([entry, ...joined.flat()])
  }
  return groups.map(members => ({ members: members.sort((x, y) => y.total - x.total), total: members.reduce((sum, m) => sum + m.total, 0) }))
}

function timed(groups, [a, b], incoming) {
  const window = (b - a) * MOTION.length
  const speed  = Math.max(...groups.flatMap(g => g.members.map(m => m.total))) / window
  return groups.map(g => { const duration = Math.min(window, Math.max(window * MOTION.slowest, g.total / speed)); return { ...g, duration, start: incoming ? b * MOTION.length - duration : a * MOTION.length } })
}

function play(from, to, end = blank()) {
  if (STILL) return
  const windows = from && to ? MOTION.turn : MOTION.alone
  motion.value = {
    out: from ? timed(clusters(prepare(from)), windows.out, false) : [],
    in:  to ? timed(clusters(prepare(to)), windows.in, true) : [],
    colours: [from?.color ?? blank(), to?.color ?? end],
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
  if (leaving) { leaving(); return }
  if (props.scene.id === current.value.id) { emit('busy', false); return }
  play(current.value, props.scene)
  current.value = props.scene
}

function pose(entry, lo, hi) {
  if (hi <= lo) return null
  const lines = entry.lines[frame.value]
  const ink = []
  let at = 0
  lines.forEach((line, k) => {
    const length = span(line), [a, b] = [Math.max(lo, at), Math.min(hi, at + length)]
    if (b > a) ink.push(inked(entry.seed, cut(line, (a - at) / length, (b - at) / length), k, frame.value))
    at += length
  })
  return { id: entry.item.id, index: entry.index, fill: shape(entry.outline[frame.value]), color: entry.item.fill, opacity: clamp(((hi - lo) / entry.total - .8) / .2), ink }
}

function poses(group, shown, incoming) {
  const [lo, hi] = incoming ? [0, shown * group.total] : [(1 - shown) * group.total, group.total]
  let at = 0
  return group.members.map(member => { const p = pose(member, Math.max(0, lo - at), Math.min(member.total, hi - at)); at += member.total; return p })
}

const moving = computed(() => {
  const m = motion.value
  if (!m) return null
  const t = clock.value
  const progress = e => ease(clamp((t - e.start) / e.duration))
  return {
    colour: mix(...m.colours, ease(clamp(t / MOTION.length))),
    poses: [m.out.flatMap(g => poses(g, 1 - progress(g), false)), m.in.flatMap(g => poses(g, progress(g), true))].flatMap(side => side.filter(Boolean).sort((x, y) => x.index - y.index)),
  }
})

const inside = computed(() => [LINE / 2, LINE / 2, current.value.layout.size[0] - LINE, current.value.layout.size[1] - LINE])

const prepared = computed(() => prepare(current.value))

const drawn = computed(() => prepared.value.map(entry => ({
  item: entry.item, variants: entry.lines.map((strokes, v) => ({ fill: shape(entry.outline[v]), ink: strokes.map((line, k) => inked(entry.seed, line, k, v)) })),
})))

const edge  = computed(() => {
  const seed = seedOf(current.value.seed)
  const [ex, ey] = [LINE * 3 / inside.value[2], LINE * 3 / inside.value[3]]
  const run = (from, to) => Array.from({ length: 5 }, (_, i) => [from[0] + (to[0] - from[0]) * i / 4, from[1] + (to[1] - from[1]) * i / 4])
  const sides = [run([-ex, 0], [1 + ex, 0]), run([1, -ey], [1, 1 + ey]), run([1 + ex, 1], [-ex, 1]), run([0, 1 + ey], [0, -ey])]
  return VARIANTS.map(v => sides.map((side, k) => ribbon(trace(side, inside.value, seed + k * 7, v), seed + k * 7 + v, LINE * 1.4)).join(''))
})

function leave() {
  const end = token('--carbon')
  const gone = { id: 'gone', seed: '', color: end, layout: { size: current.value.layout.size, items: [] } }
  return new Promise(resolve => {
    leaving = () => { current.value = gone; resolve() }
    if (STILL) { leaving(); return }
    play(current.value, null, end)
  })
}

defineExpose({ leave })

const lit = computed(() => {
  const entry = !motion.value && prepared.value.find(e => e.item.id === props.hot)
  if (!entry) return null
  const { item, seed } = entry
  const [x, y, w, h] = item.box, [fx, fy, fw, fh] = item.hover?.box ?? [0, 0, 1, 1]
  const pose = item.hover ? strokesAt(item, [x + fx * w, y + fy * h, fw * w, fh * h], seed, item.hover.strokes) : entry
  return { item, variants: VARIANTS.map(v => ({ fill: shape(pose.outline[v]), ink: pose.lines[v].map((line, k) => inked(seed, line, k, v)) })) }
})

watch(() => props.scene, next => {
  if (STILL || next.id === current.value.id) { current.value = next; return }
  if (motion.value) return
  play(current.value, next)
  current.value = next
})

onMounted(() => play(null, current.value))

onBeforeUnmount(() => cancelAnimationFrame(raf))

</script>

<template>

  <svg class="sketch" :class="{ focused: lit }" :viewBox="`0 0 ${current.layout.size[0]} ${current.layout.size[1]}`" aria-hidden="true">

    <clipPath id="inside"><rect :x="inside[0]" :y="inside[1]" :width="inside[2]" :height="inside[3]" /></clipPath>

    <rect class="surface" :x="inside[0]" :y="inside[1]" :width="inside[2]" :height="inside[3]" :fill="moving ? moving.colour : current.color ?? blank()" @click="emit('clear')" />

    <g v-if="moving" clip-path="url(#inside)">
      <g v-for="p in moving.poses" :key="p.id">
        <path :d="p.fill" :fill="p.color" :fill-opacity="p.opacity" />
        <path v-for="(ink, k) in p.ink" :key="k" class="ink" :d="ink" />
      </g>
    </g>

    <g v-else class="items" clip-path="url(#inside)">
      <g v-for="v in VARIANTS" :key="v" v-show="v === frame">
        <g v-for="d in drawn" :key="d.item.id">
          <path :d="d.variants[v].fill" :fill="d.item.fill" />
          <path v-for="(ink, k) in d.variants[v].ink" :key="k" class="ink" :d="ink" />
        </g>
      </g>
      <template v-for="d in drawn" :key="d.item.id">
        <path v-if="interactive && !d.item.decor" class="hit" :d="d.variants[0].fill"
              @pointerenter="emit('hover', d.item.id, $event)" @pointerleave="emit('hover', null, $event)" @click="emit('pick', d.item, $event)" />
      </template>
    </g>

    <g v-if="lit" class="lit" clip-path="url(#inside)">
      <g v-for="v in VARIANTS" :key="v" v-show="v === frame">
        <path :d="lit.variants[v].fill" :fill="lit.item.fill" />
        <path v-for="(ink, k) in lit.variants[v].ink" :key="k" :class="k ? 'ink' : 'ink outline'" :d="ink" />
      </g>
    </g>

    <g class="edge">
      <path v-for="v in VARIANTS" :key="v" v-show="v === frame" :d="edge[v]" />
    </g>

  </svg>

</template>

<style scoped>

.sketch  { position: absolute; inset: 0; width: 100%; height: 100%; }

.ink     { fill: var(--carbon); }
.outline { fill: var(--lirio); }
.hit     { fill: transparent; cursor: pointer; }
.lit     { pointer-events: none; }
.edge    { fill: var(--carbon); pointer-events: none; }

.items   { transition: opacity var(--animate-fast); }
.focused .items { opacity: .35; }

</style>
