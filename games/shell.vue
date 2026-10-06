<script setup>

import { computed, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from '@/04/store.js'
import DotGrid from '@/03/dotgrid.vue'
import Corner from '@/02/corner.vue'
import Game from '@game'
import { wear } from '@/03/tone.js'
import { desktop, fullscreen, quit } from './desktop.js'

const store = useStore()
store.groundLight = wear(__GAME__.ground)

const ink = computed(() => store.groundLight ? 'var(--carbon)' : 'var(--niebla)')

const KEYS = { F11: fullscreen, Escape: quit }

function key(e) { if (!KEYS[e.key]) return; e.preventDefault(); KEYS[e.key]() }

onMounted(() => { if (desktop) window.addEventListener('keydown', key) })

onBeforeUnmount(() => window.removeEventListener('keydown', key))

watchEffect(() => { document.title = __GAME__.title[store.lang]; document.documentElement.classList.toggle('light', store.groundLight) })

</script>

<template>

  <div class="juego">
    <DotGrid viewport :ink="ink" />
    <Game />
    <Corner :label="desktop ? store.t.stage.leave : null" stacked @close="quit" />
  </div>

</template>

<style>

.juego { position: fixed; inset: 0; isolation: isolate; display: flex; flex-direction: column; }

.juego > .dotgrid { z-index: -1; opacity: .1; }

</style>