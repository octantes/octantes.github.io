<script>

let introduced = false

const visit = Math.floor(Math.random() * 1000)

</script>

<script setup>

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useStore } from '../04/store.js'
import { pageOf, pathOf, inRoom } from '../04/map.js'
import { ERA } from '../04/config.js'
import { WALLS, LANDING_WALL, ROOM_TEXT, LINE, ARROW, CARDS, drawnWall, layoutWall, layoutDepth, layoutBoard } from '../04/rooms.js'
import { BRUSH, MOTION, STILL, seedOf, trace, ribbon, shape, useBoil, camo } from '../03/brush.js'
import Hud from '../02/hud.vue'
import Board from '../02/board.vue'
import Sketch from '../03/sketch.vue'

const props  = defineProps({ place: Object, watching: Boolean })
const emit   = defineEmits(['go'])
const route  = useRoute()
const router = useRouter()
const store  = useStore()

if (!props.place) store.land(route)

const page  = computed(() => props.place ?? pageOf(route))
const index = computed(() => WALLS.findIndex(w => w.id === (page.value.id ?? LANDING_WALL)))
const wall  = computed(() => drawnWall(WALLS[index.value]))
const depth = computed(() => page.value.kind === 'depth' ? wall.value.items.find(i => i.id === page.value.item) : null)

const room   = ref(null)
const sketch = ref(null)
const bounds = ref(null)
const layout = computed(() => bounds.value && layoutWall(wall.value, ...bounds.value))
const scene  = computed(() => bounds.value && (intro.value ? cardScene.value : passing.value ? wallScene(passing.value) : depth.value
  ? { id: `${wall.value.id}/${depth.value.id}`, seed: wall.value.id, color: depth.value.depth?.color ?? null, layout: board.value ? layoutBoard(tab.value, leaf.value, ...bounds.value) : layoutDepth(wall.value, depth.value, ...bounds.value) }
  : { id: wall.value.id, seed: wall.value.id, color: wall.value.color, layout: layout.value }))

// ROUTES

const stops   = ref([])
const passing = computed(() => stops.value[0] && drawnWall(WALLS.find(w => w.id === stops.value[0])))
const shown   = computed(() => ({ wall: passing.value ?? wall.value, depth: passing.value ? null : depth.value }))

function wallScene(drawn) { return { id: drawn.id, seed: drawn.id, color: drawn.color, layout: layoutWall(drawn, ...bounds.value) } }

watch(page, (to, from) => {
  const hop = !STILL && from?.kind === 'depth' && to.kind === 'depth' && (to.id !== from.id || to.item !== from.item)
  stops.value = hop ? [...new Set([from.id, to.id])] : []
})

// BOARD

const board = computed(() => depth.value?.depth?.layout === 'board')
const tab   = ref(0)
const leaf  = ref(0)

watch(() => depth.value?.id, () => { tab.value = leaf.value = 0 })

function openTab(i) { tab.value = i; leaf.value = 0 }

// INTRO

const intro     = ref(!introduced)
const waiting   = ref(false)
const card      = CARDS[ERA]
const door      = card.items.find(item => !item.decor && !item.layer).id
const cardScene = computed(() => {
  if (!bounds.value) return null
  const layout = layoutWall(card, ...bounds.value), reel = camo({ ...card.camo, seed: visit, aspect: Math.round(layout.size[0] / layout.size[1] * 20) / 20 })
  return { id: card.id, seed: card.id, color: card.color, layout: { ...layout, items: layout.items.map(item => item.layer ? { ...item, reel: reel[item.layer] } : item) } }
})

introduced = true

function wait() { waiting.value = true; store.setProcessing(false) }

function unveil() {
  if (!waiting.value) return
  waiting.value = intro.value = false
  hovered.value = null
}

watch(() => page.value.kind, kind => { if (kind === 'notfound') go({ kind: 'havitat' }) }, { immediate: true })

const hovered = ref(null)
const softly  = ref(false)
const armed   = ref(null)
const kicked  = ref({})
const aimed   = ref(null)
const hot     = computed(() => hovered.value ?? armed.value)
const docked  = computed(() => layout.value?.items.find(i => i.id === armed.value))
const shading = () => [document.documentElement, document.body, document.getElementById('octantes')]

const pointed = computed(() => {

  const item = scene.value?.layout.items.find(i => i.id === hovered.value)
  if (!item || item.id === armed.value) return null

  const frame = room.value.getBoundingClientRect(), scale = bounds.value[0] / scene.value.layout.size[0]
  const [x, y, w, h] = [item.box[0] - LINE / 2, item.box[1] - LINE / 2, item.box[2] + LINE, item.box[3] + LINE].map(v => v * scale)
  return { item, frame, box: [frame.left + x, frame.top + y, w, h] }

})

// ARROWS

const frame    = useBoil()
const chevrons = { [-1]: chevron(-1), 1: chevron(1) }

function chevron(step) {
  const seed = seedOf(`arrow${step}`)
  const stroke = step > 0 ? ARROW.stroke.map(([u, v]) => [1 - u, v]) : ARROW.stroke
  return Array.from({ length: BRUSH.frames }, (_, v) => { const line = trace(stroke, ARROW.box, seed, v, true, 1.5); return { fill: shape(line), ink: ribbon(line, seed + v, LINE, false) } })
}

function kick(step) { kicked.value[step] = false; requestAnimationFrame(() => { kicked.value[step] = true }) }

function arrow(step) {
  const label = ROOM_TEXT[store.lang][step < 0 ? 'prev' : 'next']
  return {
    class: ['arrow', 'side', { kicked: kicked.value[step], lit: aimed.value === step, back: step < 0, hidden: shown.value.depth || intro.value || props.watching }],
    inert: store.processing || !!depth.value, title: label, 'aria-label': label,
    onClick: () => turn(step), onAnimationend: () => { kicked.value[step] = false },
  }
}

// ROOM

let sizes   = null
let touched = null

const SWIPE = 50

function go(target) { if (props.place) emit('go', target); else router.push(typeof target === 'string' ? target : pathOf(target, store.lang)) }

function turn(step) { kick(step); go({ kind: 'wall', id: WALLS[(index.value + step + WALLS.length) % WALLS.length].id }) }

function pick(item, e) {
  if (intro.value) { unveil(); return }
  if (e.pointerType === 'touch' && armed.value !== item.id) { armed.value = item.id; return }
  if (e.pointerType === 'touch') hovered.value = null
  armed.value = null
  go(depth.value ? item.to : { kind: 'depth', id: wall.value.id, item: item.id })
}

if (!props.place) onBeforeRouteLeave(async to => {
  if (inRoom(pageOf(to))) return
  if (!STILL) for (const el of shading()) el.style.transition = `background-color ${MOTION.length}ms ease-in-out`
  document.documentElement.classList.remove('light')
  await sketch.value?.leave()
})

function back() { go({ kind: 'wall', id: wall.value.id }) }

function hover(id, e) { if (e?.pointerType !== 'touch') { softly.value = false; hovered.value = id } }

function lock(busy) {
  store.setProcessing(busy || stops.value.length > 0)
  if (busy) hovered.value = armed.value = null
  else if (intro.value) wait()
  else if (stops.value.length) stops.value = stops.value.slice(1)
}

function swipeStart(e) { touched = e.touches.length === 1 ? [e.touches[0].clientX, e.touches[0].clientY] : null }

function swipeEnd(e) {
  if (!touched || store.processing || depth.value || intro.value) return
  const [dx, dy] = [e.changedTouches[0].clientX - touched[0], e.changedTouches[0].clientY - touched[1]]
  touched = null
  if (Math.abs(dx) > SWIPE && Math.abs(dx) > 1.5 * Math.abs(dy)) turn(dx < 0 ? 1 : -1)
}

function onKey(e) {
  if (intro.value || store.processing) return
  if (depth.value) { if (e.key === 'Escape') back(); return }
  if (e.key === 'ArrowLeft') turn(-1)
  if (e.key === 'ArrowRight') turn(1)
}

defineExpose({ room: {
  state: () => ({ waiting: waiting.value, busy: store.processing, walls: WALLS.map(w => w.id), wall: wall.value.id, depth: depth.value, hovered: hovered.value, items: wall.value.items.filter(item => !item.decor) }),
  enter: unveil, hover: id => { softly.value = true; hovered.value = id }, open: item => pick(item, {}), back, visit: id => go({ kind: 'wall', id }),
} })

onMounted(() => {
  if (intro.value) { store.setProcessing(true); if (STILL) wait() }
  bounds.value = [room.value.clientWidth, room.value.clientHeight]
  sizes = new ResizeObserver(([entry]) => { bounds.value = [entry.contentRect.width, entry.contentRect.height] })
  sizes.observe(room.value)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  sizes?.disconnect()
  window.removeEventListener('keydown', onKey)
  for (const el of shading()) el.style.transition = ''
  store.setProcessing(false)
})

</script>

<template>

  <div class="frame page">

    <div class="stage">

      <button v-bind="arrow(-1)"><svg viewBox="0 0 120 240" aria-hidden="true"><path class="fill" :d="chevrons[-1][frame].fill" /><path class="ink" :d="chevrons[-1][frame].ink" /></svg></button>

      <div class="room" ref="room" role="main" @touchstart.passive="swipeStart" @touchend="swipeEnd">

        <Sketch v-if="scene" ref="sketch" :scene="scene" :hot="hot" :soft="softly" :interactive="intro ? waiting : !depth || !!depth.to" @hover="hover" @pick="pick" @clear="armed = null" @busy="lock" />

        <Board v-if="board && !intro && !store.processing && scene" :layout="scene.layout" :scale="bounds[0] / scene.layout.size[0]" :tab="tab" :page="leaf" @tab="openTab" @page="leaf = $event" />

        <button v-if="waiting" class="a11y-only enter" @click="unveil" @focus="hovered = door" @blur="hovered = null">{{ ROOM_TEXT[store.lang].enter }}</button>

        <Hud v-if="!intro" :bare="watching" :soft="softly" :wall="shown.wall" :depth="shown.depth" :hot="hot" :place="`${WALLS.findIndex(w => w.id === shown.wall.id) + 1}/${WALLS.length}`" :docked="shown.depth ?? docked" :pointed="pointed" @hover="hover" @pick="pick" @turn="turn" @back="back" @aim="aimed = $event" />

      </div>

      <button v-bind="arrow(1)"><svg viewBox="0 0 120 240" aria-hidden="true"><path class="fill" :d="chevrons[1][frame].fill" /><path class="ink" :d="chevrons[1][frame].ink" /></svg></button>

    </div>

  </div>

</template>

<style scoped>

.room {

  /* LAYOUT */ position: relative; flex: 1 1 auto; align-self: stretch; min-height: 0; overflow: hidden;
  /* BORDER */ border: var(--small-outline) var(--carbon-a15); border-radius: var(--radius-ss);
  /* TOUCH  */ touch-action: pan-y;

}

.stage  { display: flex; align-items: center; flex: 1 1 auto; min-height: 0; gap: 1rem; }

.hidden { visibility: hidden; }

.arrow {

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ display: flex; align-items: center; justify-content: center; flex: 0 0 auto;
  /* BOX    */ width: 5rem; padding: 0;
  /* FILL   */ background: none; color: var(--carbon);
  /* BORDER */ border: none;
  /* MOTION */ transition: color var(--animate-fast);

  &:hover, &:focus-visible, &.lit { color: var(--lirio); }
  &:focus { box-shadow: none; outline: none; }

  & svg   { width: 100%; height: auto; max-height: 10rem; overflow: visible; }
  & .fill { fill: var(--carbon); }
  & .ink  { fill: currentColor; }

  &.kicked      svg { animation: kick .25s ease-out; }
  &.kicked.back svg { animation-name: kick-back; }

}

@keyframes kick      { 50% { transform: translateX(.5rem);  } }
@keyframes kick-back { 50% { transform: translateX(-.5rem); } }

@media (--mobile) { .side { display: none; } }

</style>