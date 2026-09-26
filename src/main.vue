<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import Portal from './03/portal.vue'
import DotGrid from './03/dotgrid.vue'
import { veilOn, veilOpaque, registerVeil } from './03/veil.js'
import { pageOf, themeOf } from './04/pages.js'

const route = useRoute()
const light = computed(() => themeOf(pageOf(route)) === 'light')

watchEffect(() => document.documentElement.classList.toggle('light', light.value))
</script>

<template>

  <div class="pagina">

    <DotGrid viewport :ink="light ? 'var(--carbon)' : 'var(--niebla)'" />

    <h1 class="a11y-only">octantes</h1>

    <RouterView />

    <div v-if="veilOn" class="veil" :class="{ opaque: veilOpaque }" aria-hidden="true"><Portal :ref="registerVeil" /></div>

  </div>

</template>

<style>

.pagina { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; max-width: 1600px; max-height: 2000px; margin: 0 auto; position: relative; isolation: isolate; }

.pagina > .dotgrid { z-index: -1; opacity: .1; }

.page       { flex: 1 1 auto; width: 100%; min-height: 0; }

.frame      { display: flex; flex-direction: column; height: 100%; overflow-y: hidden; padding: 1rem; }

.veil       { position: fixed; inset: 0; z-index: 9998; pointer-events: none; }

.veil.opaque { background: var(--carbon); }

@media (--mobile) { .pagina { max-width: 100%; } .frame { padding-bottom: 2rem; } }

</style>