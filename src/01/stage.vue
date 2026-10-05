<script setup>

import { defineAsyncComponent, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from '../04/store.js'
import { stage, leave } from '../04/stage.js'

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
    <button class="leave" :aria-label="store.t.stage.leave" @click="leave">{{ store.t.stage.leave }}</button>
  </div>

</template>

<style scoped>

.stage { position: fixed; inset: 0; z-index: 5; display: flex; flex-direction: column; }

.leave {

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ position: absolute; top: 1rem; right: 1rem; z-index: 3;
  /* BOX    */ padding: .4rem .8rem;
  /* FILL   */ background: var(--carbon-a95); color: var(--humo);
  /* BORDER */ border: none; border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-mono); font-size: .9rem;

  &:hover, &:focus-visible { color: var(--lirio); }
  &:focus { box-shadow: none; outline: none; }

}

</style>
