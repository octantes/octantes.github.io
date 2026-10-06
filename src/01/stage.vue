<script setup>

import { defineAsyncComponent, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from '../04/store.js'
import { stage, leave } from '../04/stage.js'
import Corner from '../02/corner.vue'

const GAMES = { havitat: () => import('../../juegos/havitat/game.vue') }

const store = useStore()
const Game  = defineAsyncComponent(GAMES[stage.value.game])
const paint = stage.value.ground?.startsWith('#') ? stage.value.ground : `var(--${stage.value.ground ?? 'carbon'})`

function light(hex) { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return (r * .299 + g * .587 + b * .114) / 255 > .5 }

onMounted(() => {
  document.documentElement.style.setProperty('--page', paint)
  store.groundLight = light(getComputedStyle(document.documentElement).getPropertyValue('--page').trim())
})

onBeforeUnmount(() => {
  document.documentElement.style.removeProperty('--page')
  store.groundLight = null
})

</script>

<template>

  <div class="stage">
    <component :is="Game" />
    <Corner :label="store.t.stage.leave" @close="leave" />
  </div>

</template>

<style scoped>

.stage { position: fixed; inset: 0; z-index: 5; display: flex; flex-direction: column; }

</style>