<script setup>

import { computed, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from '@/04/store.js'
import DotGrid from '@/03/dotgrid.vue'
import Corner from '@/02/corner.vue'
import Game from '@game'
import { desktop, fullscreen, quit } from './desktop.js'

const store = useStore()
const paint = __GAME__.ground?.startsWith('#') ? __GAME__.ground : `var(--${__GAME__.ground ?? 'carbon'})`

function light(hex) { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return (r * .299 + g * .587 + b * .114) / 255 > .5 }

document.documentElement.style.setProperty('--page', paint)
store.groundLight = light(getComputedStyle(document.documentElement).getPropertyValue('--page').trim())

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
    <Corner :label="desktop ? store.t.stage.leave : null" @close="quit" />
  </div>

</template>

<style>

.juego { position: fixed; inset: 0; isolation: isolate; display: flex; flex-direction: column; }

.juego > .dotgrid { z-index: -1; opacity: .1; }

</style>