<script setup>

import { defineAsyncComponent, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from '../04/store.js'
import { stage, leave } from '../04/stage.js'
import Corner from '../02/corner.vue'
import { wear } from '../03/tone.js'

const GAMES = { havitat: () => import('../../games/havitat/game.vue') }

const store = useStore()
const Game  = defineAsyncComponent(GAMES[stage.value.game])
onMounted(() => { store.groundLight = wear(stage.value.ground) })

onBeforeUnmount(() => {
  document.documentElement.style.removeProperty('--page')
  store.groundLight = null
})

</script>

<template>

  <div class="stage">
    <component :is="Game" />
    <Corner :label="store.t.stage.leave" stacked @close="leave" />
  </div>

</template>

<style scoped>

.stage { position: fixed; inset: 0; z-index: 5; display: flex; flex-direction: column; }

</style>