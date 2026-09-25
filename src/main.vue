<script setup>
import Portal from './03/portal.vue'
import DotGrid from './03/dotgrid.vue'
import { veilOn, veilHides, registerVeil } from './03/veil.js'
</script>

<template>

  <div class="pagina" :class="{ veiled: veilHides }">

    <DotGrid viewport />

    <h1 class="a11y-only">octantes</h1>

    <RouterView />

    <div v-if="veilOn" class="veil" aria-hidden="true"><Portal :ref="registerVeil" /></div>

  </div>

</template>

<style>

.pagina { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; max-width: 1600px; max-height: 2000px; margin: 0 auto; position: relative; isolation: isolate; }

.pagina > .dotgrid { z-index: -1; opacity: .1; }

.page       { flex: 1 1 auto; width: 100%; min-height: 0; }

.veil       { position: fixed; inset: 0; z-index: 9998; pointer-events: none; }

.pagina.veiled > .veil { background: var(--carbon); }

@media (--mobile) { .pagina { max-width: 100%; } }

</style>