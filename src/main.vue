<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Portal from './03/portal.vue'
import Stage from './01/stage.vue'
import DotGrid from './03/dotgrid.vue'
import { veilOn, veilOpaque, registerVeil } from './03/veil.js'
import { pageOf, themeOf, inRoom } from './04/map.js'
import { useStore } from './04/store.js'
import { stage } from './04/stage.js'

const ARRIVAL = { settle: 1000, finish: 400 }

const route = useRoute()
const store = useStore()
const baked = document.documentElement.classList.contains('light')
const light = computed(() => store.groundLight ?? (route.matched.length ? themeOf(pageOf(route)) === 'light' : baked))

const fade   = ref(null)
const landed = ref(false)

let locked = false
let timer  = 0

watchEffect(() => document.documentElement.classList.toggle('light', light.value))

function phase(next) { clearTimeout(timer); fade.value = next }

function finish() { phase('finish'); timer = setTimeout(() => phase(null), ARRIVAL.finish) }

function fadeIn() {
  phase('hold')
  requestAnimationFrame(() => requestAnimationFrame(() => {
    phase('rise')
    locked = store.processing
    if (!locked) timer = setTimeout(finish, ARRIVAL.settle)
  }))
}

watch(() => store.processing, busy => {
  if (fade.value !== 'rise') return
  if (busy) { locked = true; clearTimeout(timer) } else if (locked) finish()
})

useRouter().afterEach((to, from) => {
  if (inRoom(pageOf(to)) || to.matched[0]?.components.default === from.matched[0]?.components.default) return
  landed.value = !from.matched.length
  fadeIn()
})
</script>

<template>

  <div class="pagina" :class="[fade && `fade-${fade}`, { landed, staged: stage }]">

    <DotGrid viewport :ink="light ? 'var(--carbon)' : 'var(--niebla)'" />

    <h1 class="a11y-only">octantes</h1>

    <RouterView />

    <Stage v-if="stage" />

    <div v-if="veilOn" class="veil" :class="{ opaque: veilOpaque }" aria-hidden="true"><Portal :ref="registerVeil" /></div>

  </div>

</template>

<style>

.pagina { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; max-width: 1600px; max-height: 2000px; margin: 0 auto; position: relative; isolation: isolate; }

.pagina > .dotgrid { z-index: -1; opacity: .1; }

.veil       { position: fixed; inset: 0; z-index: 9998; pointer-events: none; }

.veil.opaque { background: var(--carbon); }

.fade-hold   { --fade-to: 0;   --fade-time: 0s;                                         }
.fade-rise   { --fade-to: .85; --fade-time: 1.8s; --fade-curve: cubic-bezier(.2, .6, .35, 1); }
.fade-finish { --fade-to: 1;   --fade-time: .4s;  --fade-curve: ease-out;                  }

:is(.fade-hold, .fade-rise, .fade-finish) :is(.footer, .portal-glow),
:is(.fade-hold, .fade-rise, .fade-finish):not(.landed) :is(.portada, .navigation, .portfolio, .vitacora) { opacity: var(--fade-to); transition: opacity var(--fade-time) var(--fade-curve, linear); }

.staged > :not(.stage, .dotgrid, .veil) { visibility: hidden; }

@media (--mobile) { .pagina { max-width: 100%; } }

</style>