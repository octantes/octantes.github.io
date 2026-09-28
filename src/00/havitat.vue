<script setup>

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import { pageOf, pathOf } from '../04/pages.js'
import { WALLS, LANDING_WALL, LINE, layoutWall, layoutDepth } from '../04/walls.js'
import Guide from '../02/guide.vue'
import Hint from '../02/hint.vue'
import Sketch from '../03/sketch.vue'
import Arrow from '../03/arrow.vue'
import { placeHint } from '../04/hint.js'

const route  = useRoute()
const router = useRouter()
const store  = useStore()

store.land(route)

const page  = computed(() => pageOf(route))
const index = computed(() => WALLS.findIndex(w => w.id === (page.value.id ?? LANDING_WALL)))
const wall  = computed(() => WALLS[index.value])
const depth = computed(() => page.value.kind === 'depth' ? wall.value.items.find(i => i.id === page.value.item) : null)

const room   = ref(null)
const bounds = ref(null)
const layout = computed(() => bounds.value && layoutWall(wall.value, ...bounds.value))
const scene  = computed(() => bounds.value && (depth.value
  ? { id: `${wall.value.id}/${depth.value.id}`, seed: wall.value.id, color: depth.value.depth?.color ?? null, layout: layoutDepth(wall.value, depth.value, ...bounds.value) }
  : { id: wall.value.id, seed: wall.value.id, color: wall.value.color, layout: layout.value }))

watch(() => page.value.kind, kind => { if (kind === 'notfound') router.replace('/havitat') }, { immediate: true })

const hovered = ref(null)
const armed   = ref(null)
const hot     = computed(() => hovered.value ?? armed.value)
const docked  = computed(() => layout.value?.items.find(i => i.id === armed.value))

const tip = computed(() => {

  const item = layout.value?.items.find(i => i.id === hovered.value)
  if (!item || item.id === armed.value) return null

  const frame = room.value.getBoundingClientRect(), scale = bounds.value[0] / layout.value.size[0]
  const [x, y, w, h] = [item.box[0] - LINE / 2, item.box[1] - LINE / 2, item.box[2] + LINE, item.box[3] + LINE].map(v => v * scale)
  return { item, ...placeHint(frame, [frame.left + x, frame.top + y, w, h]) }

})

let sizes = null

const kick  = ref(null)
const aimed = ref(null)

function turn(step) { kick.value = { step }; router.push(pathOf({ kind: 'wall', id: WALLS[(index.value + step + WALLS.length) % WALLS.length].id }, store.lang)) }

function pick(item, e) {
  if (e.pointerType === 'touch' && armed.value !== item.id) { armed.value = item.id; return }
  if (e.pointerType === 'touch') hovered.value = null
  armed.value = null
  router.push(item.to ?? pathOf({ kind: 'depth', id: wall.value.id, item: item.id }, store.lang))
}

function back() { router.push(pathOf({ kind: 'wall', id: wall.value.id }, store.lang)) }

function hover(id, e) { if (e?.pointerType !== 'touch') hovered.value = id }

function lock(busy) { store.setProcessing(busy); if (busy) hovered.value = armed.value = null }

const SWIPE = 50
let touched = null

function swipeStart(e) { touched = e.touches.length === 1 ? [e.touches[0].clientX, e.touches[0].clientY] : null }

function swipeEnd(e) {
  if (!touched || store.processing || depth.value) return
  const [dx, dy] = [e.changedTouches[0].clientX - touched[0], e.changedTouches[0].clientY - touched[1]]
  touched = null
  if (Math.abs(dx) > SWIPE && Math.abs(dx) > 1.5 * Math.abs(dy)) turn(dx < 0 ? 1 : -1)
}

function onKey(e) {
  if (store.processing) return
  if (depth.value) { if (e.key === 'Escape') back(); return }
  if (e.key === 'ArrowLeft') turn(-1)
  if (e.key === 'ArrowRight') turn(1)
}

onMounted(() => {
  bounds.value = [room.value.clientWidth, room.value.clientHeight]
  sizes = new ResizeObserver(([entry]) => { bounds.value = [entry.contentRect.width, entry.contentRect.height] })
  sizes.observe(room.value)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => { sizes?.disconnect(); window.removeEventListener('keydown', onKey) })

</script>

<template>

  <div class="frame page">

    <div class="stage">

      <Arrow class="side" :class="{ hidden: depth }" :inert="store.processing || !!depth" :step="-1" :label="store.t.havitat.prev" :kick="kick" :lit="aimed === -1" @turn="turn" />

      <div class="room" ref="room" role="main" @touchstart.passive="swipeStart" @touchend="swipeEnd">

        <Sketch v-if="scene" :scene="scene" :hot="hot" :interactive="!depth" @hover="hover" @pick="pick" @clear="armed = null" @busy="lock" />

        <Guide :inert="store.processing" :wall="wall" :depth="depth" :hot="hot" :place="`${index + 1}/${WALLS.length}`" @hover="hover" @pick="pick" @turn="turn" @back="back" @aim="aimed = $event">
          <Hint v-if="depth ?? docked" :item="depth ?? docked" :named="!depth" />
        </Guide>

        <Hint v-if="tip" :item="tip.item" :tip="tip" />

      </div>

      <Arrow class="side" :class="{ hidden: depth }" :inert="store.processing || !!depth" :step="1" :label="store.t.havitat.next" :kick="kick" :lit="aimed === 1" @turn="turn" />

    </div>

  </div>

</template>

<style scoped>

.room {

  /* LAYOUT */ position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden;
  /* BORDER */ border: var(--small-outline) var(--carbon-a15); border-radius: var(--radius-ss);
  /* TOUCH  */ touch-action: pan-y;

}

.stage  { display: flex; align-items: center; flex: 1 1 auto; min-height: 0; gap: 1rem; }

.room   { align-self: stretch; }

.hidden { visibility: hidden; }

@media (--mobile) { .side { display: none; } }

</style>
