<script setup>

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import { pageOf, pathOf } from '../04/pages.js'
import { WALLS, LANDING_WALL, layoutWall } from '../04/walls.js'
import Guide from '../02/guide.vue'
import Hint from '../02/hint.vue'

const route  = useRoute()
const router = useRouter()
const store  = useStore()

store.land(route)

const index = computed(() => WALLS.findIndex(w => w.id === (pageOf(route).id ?? LANDING_WALL)))
const wall  = computed(() => WALLS[index.value])

const room   = ref(null)
const bounds = ref([1712, 866])
const layout = computed(() => layoutWall(wall.value, ...bounds.value))

const hovered = ref(null)
const armed   = ref(null)
const at      = ref(null)
const hot     = computed(() => hovered.value ?? armed.value)
const halo    = computed(() => layout.value.items.find(i => i.id === hot.value))
const hint    = computed(() => at.value && halo.value)

watch(() => wall.value.id, () => { hovered.value = armed.value = at.value = null })

let sizes = null

function turn(step) { router.push(pathOf({ kind: 'wall', id: WALLS[(index.value + step + WALLS.length) % WALLS.length].id }, store.lang)) }

function pick(item, e) {
  if (e.pointerType === 'touch' && armed.value !== item.id) { armed.value = item.id; return }
  armed.value = null
  if (item.to) router.push(item.to)
}

function enter(item, e) { hovered.value = item.id; track(e) }

function leave() { hovered.value = at.value = null }

function track(e) { at.value = e.pointerType === 'mouse' ? [e.clientX, e.clientY] : null }

function onKey(e) { if (e.key === 'ArrowLeft') turn(-1); if (e.key === 'ArrowRight') turn(1) }

onMounted(() => {
  sizes = new ResizeObserver(([entry]) => { bounds.value = [entry.contentRect.width, entry.contentRect.height] })
  sizes.observe(room.value)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => { sizes?.disconnect(); window.removeEventListener('keydown', onKey) })

</script>

<template>

  <div class="frame page">

    <div class="room" ref="room" role="main">

      <svg class="wall" :viewBox="`0 0 ${layout.size[0]} ${layout.size[1]}`" aria-hidden="true">
        <rect class="surface" x="9" y="9" :width="layout.size[0] - 18" :height="layout.size[1] - 18" rx="24" :fill="wall.color" @click="armed = null" />
        <template v-for="item in layout.items" :key="item.id">
          <rect v-if="item.decor" class="item decor" :x="item.box[0]" :y="item.box[1]" :width="item.box[2]" :height="item.box[3]" rx="10" :fill="item.fill" />
          <rect v-else class="item" :x="item.box[0]" :y="item.box[1]" :width="item.box[2]" :height="item.box[3]" rx="10" :fill="item.fill"
                @pointerenter="enter(item, $event)" @pointermove="track" @pointerleave="leave" @click="pick(item, $event)" />
        </template>
        <rect v-if="halo" class="halo" :x="halo.box[0]" :y="halo.box[1]" :width="halo.box[2]" :height="halo.box[3]" rx="10" />
      </svg>

      <Guide :wall="wall" :hot="hot" :place="`${index + 1}/${WALLS.length}`" @hover="hovered = $event" @pick="pick" @turn="turn">
        <Hint v-if="halo && !at" :item="halo" />
      </Guide>

      <Hint v-if="hint" :item="hint" :at="at" />

    </div>

  </div>

</template>

<style scoped>

.room {

  /* LAYOUT */ position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden;
  /* BORDER */ border: var(--small-outline) var(--carbon-a15); border-radius: var(--radius-ss);

}

.wall    { position: absolute; inset: 0; width: 100%; height: 100%; }

.surface { stroke: var(--carbon); stroke-width: 18; }

.item    { stroke: var(--carbon); stroke-width: 18; cursor: pointer; }

.decor   { pointer-events: none; }

.halo    { fill: none; stroke: var(--lirio); stroke-width: 18; pointer-events: none; }

</style>
