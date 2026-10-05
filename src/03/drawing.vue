<script>

const read = new Map()

</script>

<script setup>

import { ref, shallowRef, computed, onMounted, onBeforeUnmount } from 'vue'
import { readDrawing } from './svg.js'
import Sketch from './sketch.vue'

const PACE = { least: 1300, most: 9000, base: 900, per: 300 }

const props = defineProps({ src: String, size: Array, instant: Boolean })
const emit  = defineEmits(['ground'])

const root    = ref(null)
const drawing = shallowRef(null)
const near    = ref(false)
const seen    = ref(false)
const drawn   = ref(false)
const sudden  = ref(false)

let watchers = []

const size  = computed(() => drawing.value?.size ?? props.size)
const scene = computed(() => drawing.value && { id: props.src, seed: props.src, pace: paceOf(drawing.value), layout: { size: drawing.value.size, items: itemsOf(drawing.value) } })
const marks = computed(() => drawing.value?.marks.filter(m => m.kind === 'text' || m.kind === 'image') ?? [])

function itemsOf({ size: [w, h], marks }) {
  const box = [0, 0, w, h], unit = ([x, y]) => [x / w, y / h]
  const closed = run => Math.hypot(run[0][0] - run.at(-1)[0], run[0][1] - run.at(-1)[1]) < 2 ? [...run, run[1]] : run
  return marks.flatMap(m => m.runs?.map((run, k) => ({
    id: `${m.order}-${k}`, box, order: m.order, decor: true, strokes: [closed(run).map(unit)],
    ...(m.kind === 'stroke' ? { fill: 'none', ink: m.color, pen: m.width } : { fill: m.color, bare: true }),
  })) ?? [])
}

function paceOf({ size: [w, h], marks }) {
  const span = run => run.reduce((sum, p, i) => i ? sum + Math.hypot(p[0] - run[i - 1][0], p[1] - run[i - 1][1]) : 0, 0)
  const ink  = marks.reduce((sum, m) => sum + (m.runs ?? []).reduce((all, run) => all + span(run), 0), 0)
  return Math.min(PACE.most, Math.max(PACE.least, PACE.base + ink / Math.hypot(w, h) * PACE.per))
}

function place([x, y, w, h]) {
  const [bw, bh] = size.value
  return { left: `${x / bw * 100}%`, top: `${y / bh * 100}%`, width: `${w / bw * 100}%`, height: `${h / bh * 100}%` }
}

function lettering(m) {
  const per = m.box[3] / m.lines.length, bw = size.value[0]
  return { ...place(m.box), color: m.color, fontFamily: m.family, fontWeight: m.weight, fontSize: `${m.size / bw * 100}cqw`, lineHeight: `${per / bw * 100}cqw` }
}

function assetOf(href) { return new URL(href, new URL(props.src, window.location.href)).href }

function scrollerOf(el) {
  for (let at = el.parentElement; at; at = at.parentElement) if (/auto|scroll/.test(getComputedStyle(at).overflowY)) return at
  return null
}

async function load() {
  if (!read.has(props.src)) read.set(props.src, fetch(props.src).then(r => r.text()).then(readDrawing))
  drawing.value = await read.get(props.src)
  emit('ground', drawing.value.ground)
}

function arrive() { if (!seen.value) { seen.value = true; sudden.value = props.instant } }

onMounted(() => {
  const scroller = scrollerOf(root.value)
  watchers = [
    new IntersectionObserver(([e]) => { near.value = e.isIntersecting; if (near.value) load(); else drawing.value = null }, { root: scroller, rootMargin: '150% 0px' }),
    new IntersectionObserver(([e]) => { if (e.isIntersecting) arrive() }, { root: scroller, rootMargin: '-20% 0px' }),
  ]
  for (const w of watchers) w.observe(root.value)
})

onBeforeUnmount(() => { for (const w of watchers) w.disconnect() })

</script>

<template>

  <div class="drawing" ref="root" :style="size && { aspectRatio: `${size[0]} / ${size[1]}` }">

    <Sketch v-if="near && seen && scene" :scene="scene" :framed="false" :surface="false" :appear="!drawn && !sudden" @busy="busy => { if (!busy) drawn = true }" />

    <div v-if="near && drawing" class="layer" :class="{ shown: drawn || sudden }">
      <template v-for="m in marks" :key="m.order">
        <component :is="m.layer === 'title' ? 'h2' : 'p'" v-if="m.kind === 'text'" class="words" :style="lettering(m)"><template v-for="(line, i) in m.lines" :key="i"><br v-if="i">{{ line }}</template></component>
        <img v-else class="picture" :src="assetOf(m.href)" :style="place(m.box)" alt="">
      </template>
    </div>

  </div>

</template>

<style scoped>

.drawing { position: relative; width: 100%; container-type: inline-size; }

.layer {

  /* LAYOUT */ position: absolute; inset: 0; pointer-events: none;
  /* MOTION */ opacity: 0; transition: opacity var(--animate-fast);

  &.shown { opacity: 1; pointer-events: auto; }

}

.words   { position: absolute; margin: 0; white-space: nowrap; }
.picture { position: absolute; object-fit: fill; }

</style>
