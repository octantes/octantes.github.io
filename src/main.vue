<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Portal from './03/portal.vue'
import DotGrid from './03/dotgrid.vue'
import { veilOn, veilOpaque, registerVeil } from './03/veil.js'
import { pageOf, themeOf, inRoom } from './04/pages.js'
import { useStore } from './04/store.js'

const ARRIVAL = { rise: .85, pace: 600, finish: 400, unlocked: 1000 }

const route = useRoute()
const store = useStore()
const light = computed(() => themeOf(pageOf(route)) === 'light')

const arrive = ref(1)
const landed = ref(false)

watchEffect(() => document.documentElement.classList.toggle('light', light.value))

function fadeIn() {

  const start = performance.now()
  let locked = false, released = 0, from = 0

  const step = now => {
    locked ||= store.processing
    if (!released && (locked ? !store.processing : now - start > ARRIVAL.unlocked)) { released = now; from = arrive.value }
    arrive.value = released
      ? from + (1 - from) * Math.min(1, (now - released) / ARRIVAL.finish)
      : ARRIVAL.rise * (1 - Math.exp(-(now - start) / ARRIVAL.pace))
    if (arrive.value < 1) requestAnimationFrame(step)
  }

  arrive.value = 0
  requestAnimationFrame(step)

}

useRouter().afterEach((to, from) => {
  if (inRoom(pageOf(to)) || to.matched[0]?.components.default === from.matched[0]?.components.default) return
  landed.value = !from.matched.length
  fadeIn()
})
</script>

<template>

  <div class="pagina" :class="{ arriving: arrive < 1, landed }" :style="{ '--arrive': arrive }">

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

.arriving :is(.navigation, .footer, .portal-glow, .portfolio), .arriving:not(.landed) .portada { opacity: var(--arrive); }

@media (--mobile) { .pagina { max-width: 100%; } }

</style>
