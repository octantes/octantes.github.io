<script setup>

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { BRUSH, seedOf, trace, ribbon, shape, sketchBox } from './brush.js'
import { LINE } from '../04/walls.js'

const props = defineProps({ wall: Object, layout: Object, hot: String })
const emit  = defineEmits(['hover', 'pick', 'clear'])

const VARIANTS = Array.from({ length: BRUSH.frames }, (_, v) => v)

const frame = ref(0)
let ticker  = 0

function draw(strokes, box, seed) {
  return VARIANTS.map(v => {
    const lines = strokes.map((stroke, k) => trace(stroke, box, seed + k * 13, v))
    return { fill: shape(lines[0]), ink: lines.map((line, k) => ribbon(line, seed + k * 13 + v)) }
  })
}

const inside = computed(() => [LINE / 2, LINE / 2, props.layout.size[0] - LINE, props.layout.size[1] - LINE])

const drawn = computed(() => props.layout.items.map(item => {
  const seed = seedOf(props.wall.id + item.id)
  return { item, variants: draw(item.strokes ?? [sketchBox(item.box[2], item.box[3], seed)], item.box, seed) }
}))

const edge  = computed(() => {
  const seed = seedOf(props.wall.id)
  const [ex, ey] = [LINE * 3 / inside.value[2], LINE * 3 / inside.value[3]]
  const run = (from, to) => Array.from({ length: 5 }, (_, i) => [from[0] + (to[0] - from[0]) * i / 4, from[1] + (to[1] - from[1]) * i / 4])
  const sides = [run([-ex, 0], [1 + ex, 0]), run([1, -ey], [1, 1 + ey]), run([1 + ex, 1], [-ex, 1]), run([0, 1 + ey], [0, -ey])]
  return VARIANTS.map(v => sides.map((side, k) => ribbon(trace(side, inside.value, seed + k * 7, v), seed + k * 7 + v, LINE * 1.4)).join(''))
})

const lit = computed(() => drawn.value.find(d => d.item.id === props.hot))

onMounted(()       => { ticker = setInterval(() => { frame.value = (frame.value + 1) % BRUSH.frames }, 1000 / BRUSH.fps) })
onBeforeUnmount(() => clearInterval(ticker))

</script>

<template>

  <svg class="sketch" :class="[`boil-${frame}`, { focused: hot }]" :viewBox="`0 0 ${layout.size[0]} ${layout.size[1]}`" aria-hidden="true">

    <clipPath id="inside"><rect :x="inside[0]" :y="inside[1]" :width="inside[2]" :height="inside[3]" /></clipPath>

    <rect class="surface" :x="inside[0]" :y="inside[1]" :width="inside[2]" :height="inside[3]" :fill="wall.color" @click="emit('clear')" />

    <g class="items" clip-path="url(#inside)">
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
