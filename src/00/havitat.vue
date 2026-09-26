<script setup>

import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import { pageOf, pathOf } from '../04/pages.js'
import { WALLS, LANDING_WALL } from '../04/walls.js'

const route  = useRoute()
const router = useRouter()
const store  = useStore()

store.land(route)

const index = computed(() => WALLS.findIndex(w => w.id === (pageOf(route).id ?? LANDING_WALL)))
const wall  = computed(() => WALLS[index.value])

function turn(step) { router.push(pathOf({ kind: 'wall', id: WALLS[(index.value + step + WALLS.length) % WALLS.length].id }, store.lang)) }

function onKey(e) { if (e.key === 'ArrowLeft') turn(-1); if (e.key === 'ArrowRight') turn(1) }

onMounted(()       => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

</script>

<template>

  <div class="frame page">

    <div class="room" role="main">

      <svg class="wall" :viewBox="`0 0 ${wall.size[0]} ${wall.size[1]}`" preserveAspectRatio="xMidYMid meet" :aria-label="wall[store.lang]">
        <rect class="surface" x="18" y="18" :width="wall.size[0] - 36" :height="wall.size[1] - 36" rx="24" :fill="wall.color" />
        <rect v-for="item in wall.items" :key="item.id" class="item" :x="item.box[0]" :y="item.box[1]" :width="item.box[2]" :height="item.box[3]" rx="10" :fill="item.fill" />
      </svg>

    </div>

  </div>

</template>

<style scoped>

.room {

  /* LAYOUT */ position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden; display: flex; align-items: center; justify-content: center;
  /* BOX    */ padding: 1rem;
  /* BORDER */ border: var(--small-outline) var(--carbon-a15); border-radius: var(--radius-ss);

}

.wall    { display: block; width: 100%; height: auto; max-height: 100%; }

.surface { stroke: var(--carbon); stroke-width: 36; }

.item    { stroke: var(--carbon); stroke-width: 18; }

@media (--mobile) { .room { align-items: flex-end; } }

</style>
