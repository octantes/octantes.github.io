<script setup>

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import { pageOf, pathOf } from '../04/pages.js'
import { WALLS, LANDING_WALL, layoutWall } from '../04/walls.js'

const route  = useRoute()
const router = useRouter()
const store  = useStore()

store.land(route)

const index = computed(() => WALLS.findIndex(w => w.id === (pageOf(route).id ?? LANDING_WALL)))
const wall  = computed(() => WALLS[index.value])

const room   = ref(null)
const bounds = ref([1712, 866])
const layout = computed(() => layoutWall(wall.value, ...bounds.value))

let sizes = null

function turn(step) { router.push(pathOf({ kind: 'wall', id: WALLS[(index.value + step + WALLS.length) % WALLS.length].id }, store.lang)) }

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

      <svg class="wall" :viewBox="`0 0 ${layout.size[0]} ${layout.size[1]}`" :aria-label="wall[store.lang]">
        <rect class="surface" x="18" y="18" :width="layout.size[0] - 36" :height="layout.size[1] - 36" rx="24" :fill="wall.color" />
        <rect v-for="item in layout.items" :key="item.id" class="item" :x="item.box[0]" :y="item.box[1]" :width="item.box[2]" :height="item.box[3]" rx="10" :fill="item.fill" />
      </svg>

    </div>

  </div>

</template>

<style scoped>

.room {

  /* LAYOUT */ position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden;
  /* BORDER */ border: var(--small-outline) var(--carbon-a15); border-radius: var(--radius-ss);

}

.wall    { position: absolute; inset: 0; width: 100%; height: 100%; }

.surface { stroke: var(--carbon); stroke-width: 36; }

.item    { stroke: var(--carbon); stroke-width: 18; }


</style>
