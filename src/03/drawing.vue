<script>

const read = new Map()

</script>

<script setup>

import { ref, shallowRef, computed, onMounted, onBeforeUnmount } from 'vue'
import { readDrawing } from './svg.js'
import Sketch from './sketch.vue'

const props = defineProps({ src: String })

const root    = ref(null)
const drawing = shallowRef(null)
const seen    = ref(false)
const drawn   = ref(false)

let watcher = null

const scene = computed(() => drawing.value && { id: props.src, seed: props.src, layout: { size: drawing.value.size, items: itemsOf(drawing.value) } })
const marks = computed(() => drawing.value?.marks.filter(m => m.kind === 'text' || m.kind === 'image') ?? [])

function itemsOf({ size: [w, h], marks }) {
  const box = [0, 0, w, h], unit = ([x, y]) => [x / w, y / h]
  const closed = run => Math.hypot(run[0][0] - run.at(-1)[0], run[0][1] - run.at(-1)[1]) < 2 ? [...run, run[1]] : run
  return marks.flatMap(m => m.runs?.map((run, k) => ({
    id: `${m.order}-${k}`, box, order: m.order, decor: true, strokes: [closed(run).map(unit)],
    ...(m.kind === 'stroke' ? { fill: 'none', ink: m.color, pen: m.width } : { fill: m.color, bare: true }),
  })) ?? [])
}

function place([x, y, w, h]) {
  const [bw, bh] = drawing.value.size
  return { left: `${x / bw * 100}%`, top: `${y / bh * 100}%`, width: `${w / bw * 100}%`, height: `${h / bh * 100}%` }
}

function lettering(m) {
  const per = m.box[3] / m.lines.length, bw = drawing.value.size[0]
  return { ...place(m.box), color: m.color, fontFamily: m.family, fontWeight: m.weight, fontSize: `${m.size / bw * 100}cqw`, lineHeight: `${per / bw * 100}cqw` }
}

function assetOf(href) { return new URL(href, new URL(props.src, window.location.href)).href }

async function load() {
  if (!read.has(props.src)) read.set(props.src, fetch(props.src).then(r => r.text()).then(readDrawing))
  drawing.value = await read.get(props.src)
}

onMounted(() => {
  load()
  watcher = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { seen.value = true; watcher.disconnect() } }, { threshold: .25 })
  watcher.observe(root.value)
})

onBeforeUnmount(() => watcher?.disconnect())

</script>

<template>

  <div class="drawing" ref="root" :style="drawing && { aspectRatio: `${drawing.size[0]} / ${drawing.size[1]}` }">

    <Sketch v-if="seen && scene" :scene="scene" :framed="false" :surface="false" @busy="busy => { if (!busy) drawn = true }" />

    <div v-if="drawing" class="layer" :class="{ shown: drawn }">
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
