<script>

let sketches = 0

</script>

<script setup>

import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { BRUSH, MOTION, REEL, STILL, seedOf, trace, ribbon, shape, span, cut, sketchBox, useBoil } from './brush.js'

const props = defineProps({ scene: Object, hot: String, interactive: Boolean, framed: { type: Boolean, default: true }, surface: { type: Boolean, default: true }, appear: { type: Boolean, default: true } })
const uid   = `sketch${sketches++}`
const emit  = defineEmits(['hover', 'pick', 'clear', 'busy'])

const VARIANTS = Array.from({ length: BRUSH.frames }, (_, v) => v)

const frame   = useBoil()
const clock   = ref(0)
const reel    = ref(0)
const motion  = shallowRef(null)
const current = shallowRef(props.scene)

let raf      = 0
let leaving  = null
let spinning = false

const clamp = t => Math.min(1, Math.max(0, t))
const ease  = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
const rgb   = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
const mix   = (a, b, t) => `rgb(${rgb(a).map((c, i) => Math.round(c + (rgb(b)[i] - c) * t)).join(' ')})`
const token = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
const blank = () => token('--niebla')
const reeled = entry => !!entry.item.reel
const pen    = entry => !reeled(entry)
const traced = new Map()
const tintOf = item => item.ink ? { fill: item.ink } : item.bare ? { fill: item.fill } : null

function strokesAt(item, box, seed, strokes) {
  const sketch = strokes ? { outline: strokes[0], ink: strokes } : sketchBox(box[2], box[3], seed, item.hidden)
  return {
    lines:   VARIANTS.map(v => sketch.ink.map((stroke, k) => trace(stroke, box, seed + k * 13, v))),
    outline: VARIANTS.map(v => trace(sketch.outline, box, seed, v, true)),
  }
}

function inked({ seed, item }, line, k, v) { return ribbon(line, seed + k * 13 + v, k && item.marker ? item.marker : item.pen ?? (item.bare ? BRUSH.thin : BRUSH.width)) }

function prepare({ seed: prefix, layout }) {
  return layout.items.map((item, index) => {
    const seed = seedOf(prefix + item.id)
    if (item.reel) return { item, index, seed }
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
  return groups.map(members => ({ members: members.sort((x, y) => (x.item.order ?? 0) - (y.item.order ?? 0) || y.total - x.total), total: members.reduce((sum, m) => sum + m.total, 0) }))
}

function timed(groups, [a, b], incoming, length) {
  const window = (b - a) * length
  const speed  = Math.max(...groups.flatMap(g => g.members.map(m => m.total))) / window
  return groups.map(g => { const duration = Math.min(window, Math.max(window * MOTION.slowest, g.total / speed)); return { ...g, duration, start: incoming ? b * length - duration : a * length } })
}

function play(from, to, end = blank()) {
  if (STILL) return
  const windows = from && to ? MOTION.turn : MOTION.alone
  const [before, after] = [from ? prepare(from) : [], to ? prepare(to) : []], length = to?.pace ?? from?.pace ?? MOTION.length
  motion.value = {
    length,
    out: from ? timed(clusters(before.filter(pen)), windows.out, false, length) : [],
    in:  to ? timed(clusters(after.filter(pen)), windows.in, true, length) : [],
    reels: { out: before.filter(reeled), in: after.filter(reeled) },
    colours: [from?.color ?? blank(), to?.color ?? end],
    start: performance.now(),
  }
  clock.value = 0
  spin([...before, ...after].some(reeled))
  emit('busy', true)
  raf = requestAnimationFrame(tick)
}

function tick() {
  clock.value = performance.now() - motion.value.start
  if (clock.value < motion.value.length) { raf = requestAnimationFrame(tick); return }
  motion.value = null
  spin(prepared.value.some(reeled))
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
    if (b > a) ink.push(inked(entry, cut(line, (a - at) / length, (b - at) / length), k, frame.value))
    at += length
  })
  return { id: entry.item.id, index: entry.index, tint: tintOf(entry.item), marker: !!entry.item.marker, fill: shape(entry.outline[frame.value]), color: entry.item.fill, opacity: clamp(((hi - lo) / entry.total - .8) / .2), ink }
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
    colour: mix(...m.colours, ease(clamp(t / m.length))),
    poses: [m.out.flatMap(g => poses(g, 1 - progress(g), false)), m.in.flatMap(g => poses(g, progress(g), true))].flatMap(side => side.filter(Boolean).sort((x, y) => x.index - y.index)),
  }
})

const inside = computed(() => { const [w, h] = current.value.layout.size, m = props.framed ? BRUSH.width / 2 : 0; return [m, m, w - 2 * m, h - 2 * m] })

const prepared = computed(() => prepare(current.value))

const drawn = computed(() => prepared.value.filter(pen).map(entry => ({
  item: entry.item, tint: tintOf(entry.item), variants: entry.lines.map((strokes, v) => ({ fill: shape(entry.outline[v]), ink: strokes.map((line, k) => inked(entry, line, k, v)) })),
})))

const backdrop = computed(() => {
  const m = motion.value, shown = m ? ease(clamp(clock.value / m.length)) : 1
  const layers = m ? [...m.reels.out.map(e => [e, 1 - shown]), ...m.reels.in.map(e => [e, shown])] : prepared.value.filter(reeled).map(e => [e, 1])
  return layers.map(([entry, opacity]) => ({ item: entry.item, tint: tintOf(entry.item), opacity, ...reelFrame(entry, reel.value) }))
})

function reelFrame(entry, f) {
  const key = `${entry.seed}|${entry.item.box}|${f}`
  if (!traced.has(key)) {
    const lines = entry.item.reel(f).map((loop, k) => trace(loop, entry.item.box, entry.seed + k * 13, 0, true))
    traced.set(key, { fill: lines.map(shape).join(''), ink: lines.map((line, k) => inked(entry, line, k, 0)) })
  }
  return traced.get(key)
}

function spin(on) { spinning = on && !STILL }

watch(frame, () => { if (spinning) reel.value = (reel.value + 1) % REEL.frames })

const edge  = computed(() => {
  const seed = seedOf(current.value.seed)
  const [ex, ey] = [BRUSH.width * 3 / inside.value[2], BRUSH.width * 3 / inside.value[3]]
  const run = (from, to) => Array.from({ length: 5 }, (_, i) => [from[0] + (to[0] - from[0]) * i / 4, from[1] + (to[1] - from[1]) * i / 4])
  const sides = [run([-ex, 0], [1 + ex, 0]), run([1, -ey], [1, 1 + ey]), run([1 + ex, 1], [-ex, 1]), run([0, 1 + ey], [0, -ey])]
  return VARIANTS.map(v => sides.map((side, k) => ribbon(trace(side, inside.value, seed + k * 7, v), seed + k * 7 + v, BRUSH.width * 1.4)).join(''))
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
  const held = (item.holds ?? []).map(id => drawn.value.find(d => d.item.id === id)).filter(Boolean)
  const lines = v => item.marker ? pose.lines[v].slice(0, 1) : pose.lines[v]
  return { item, held, variants: VARIANTS.map(v => ({ fill: shape(pose.outline[v]), ink: lines(v).map((line, k) => k ? inked(entry, line, k, v) : ribbon(line, seed + v, BRUSH.width)) })) }
})

watch(() => props.scene, next => {
  if (STILL || next.id === current.value.id) { current.value = next; return }
  if (motion.value) return
  play(current.value, next)
  current.value = next
})

onMounted(() => { if (props.appear) play(null, current.value); else spin(prepared.value.some(reeled)) })

onBeforeUnmount(() => cancelAnimationFrame(raf))

</script>

<template>

  <svg class="sketch" :class="{ focused: lit }" :viewBox="`0 0 ${current.layout.size[0]} ${current.layout.size[1]}`" aria-hidden="true">

    <clipPath :id="`${uid}-inside`"><rect :x="inside[0]" :y="inside[1]" :width="inside[2]" :height="inside[3]" /></clipPath>

    <rect v-if="surface" class="surface" :x="inside[0]" :y="inside[1]" :width="inside[2]" :height="inside[3]" :fill="moving ? moving.colour : current.color ?? blank()" @click="emit('clear')" />

    <g :clip-path="`url(#${uid}-inside)`">
      <g v-for="r in backdrop" :key="r.item.id" :opacity="r.opacity">
        <path :d="r.fill" :fill="r.item.fill" fill-rule="evenodd" />
        <path v-for="(ink, k) in r.ink" :key="k" class="ink" :style="r.tint" :d="ink" />
      </g>
    </g>

    <g v-if="moving" :clip-path="`url(#${uid}-inside)`">
      <g v-for="p in moving.poses" :key="p.id">
        <clipPath v-if="p.marker" :id="`${uid}-in-${p.id}`"><path :d="p.fill" /></clipPath>
        <path :d="p.fill" :fill="p.color" :fill-opacity="p.opacity" />
        <path v-for="(ink, k) in p.ink" :key="k" class="ink" :style="p.tint" :d="ink" :clip-path="p.marker && k ? `url(#${uid}-in-${p.id})` : null" />
      </g>
    </g>

    <g v-else class="items" :clip-path="`url(#${uid}-inside)`">
      <g v-for="v in VARIANTS" :key="v" v-show="v === frame">
        <g v-for="d in drawn" :key="d.item.id">
          <clipPath v-if="d.item.marker" :id="`${uid}-in-${d.item.id}-${v}`"><path :d="d.variants[v].fill" /></clipPath>
          <path :d="d.variants[v].fill" :fill="d.item.fill" />
          <path v-for="(ink, k) in d.variants[v].ink" :key="k" class="ink" :style="d.tint" :d="ink" :clip-path="d.item.marker && k ? `url(#${uid}-in-${d.item.id}-${v})` : null" />
        </g>
      </g>
      <template v-for="d in drawn" :key="d.item.id">
        <path v-if="interactive && !d.item.decor" class="hit" :d="d.variants[0].fill"
              @pointerenter="emit('hover', d.item.id, $event)" @pointerleave="emit('hover', null, $event)" @click="emit('pick', d.item, $event)" />
      </template>
    </g>

    <g v-if="lit" class="lit" :clip-path="`url(#${uid}-inside)`">
      <g v-for="v in VARIANTS" :key="v" v-show="v === frame">
        <path :d="lit.variants[v].fill" :fill="lit.item.fill" />
        <path v-for="(ink, k) in lit.variants[v].ink" :key="k" :class="k ? 'ink' : 'ink outline'" :d="ink" />
        <g v-for="h in lit.held" :key="h.item.id">
          <path :d="h.variants[v].fill" :fill="h.item.fill" />
          <path v-for="(ink, k) in h.variants[v].ink" :key="k" class="ink" :style="h.tint" :d="ink" />
        </g>
      </g>
    </g>

    <g v-if="framed" class="edge">
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