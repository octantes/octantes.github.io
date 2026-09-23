<script setup> 
import { ref } from 'vue'
import { useStore } from './04/store.js'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import Navigation from './01/navigation.vue'
import Status from './01/status.vue'
import Portada from './02/portada.vue'
import Portal from './03/portal.vue'
import DotGrid from './03/dotgrid.vue'
import { veilOn, registerVeil } from './03/veil.js'
import { MOBILE_MAX } from './04/site-config.js'

const store = useStore()
const route = useRoute()
const { currentPost } = storeToRefs(store)
const portadaExpanded = ref(window.innerWidth <= MOBILE_MAX)

</script>

<template> 

  <div class="pagina">

    <DotGrid viewport />

    <h1 class="a11y-only">octantes</h1>

    <div class="layout" :class="{ fullscreen: route.path === '/portfolio' }" >

      <template v-if="route.path !== '/portfolio'">

        <div class="portal-glow" aria-hidden="true" />
        <Portada role="banner" class="portada" :class="{ 'mobile-gap': !currentPost }" @update:expanded="portadaExpanded = $event" />
        <Navigation role="navigation" :aria-label="store.t.nav.search" class="navigation" :disabled="store.processing" />

      </template>
      
      <RouterView v-slot="{ Component }" >
        
        <component role="main" class="articulos" :class="{ 'portada-collapsed': !portadaExpanded }" :is="Component" @updateProcessing="store.setProcessing" />
        
      </RouterView>

    </div>

    <div v-if="veilOn" class="veil" aria-hidden="true"><Portal :ref="registerVeil" /></div>

    <div class="footer" role="contentinfo" v-if="route.path !== '/portfolio'">

        <Status />
        
    </div>

  </div>

</template>

<style> 

.pagina { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; max-width: 1600px; max-height: 2000px; margin: 0 auto; position: relative; isolation: isolate; }

.pagina > .dotgrid { z-index: -1; opacity: .1; }

.layout { 

  /* LAYOUT */ display: grid; grid-template-columns: 4fr 4fr; flex: 1 1 auto; grid-template-rows: auto 1fr;
  /* BOX    */ width: 100%; min-height: 0; padding: 1rem; column-gap: 1rem; row-gap: 0;
  /* FILL   */ --portal-glow: radial-gradient(ellipse 46% 44% at 50% 49%,
      color-mix(in srgb, var(--lirio) 13.0%, transparent) 0%,
      color-mix(in srgb, var(--lirio) 12.7%, transparent) 10%,
      color-mix(in srgb, var(--lirio) 12.0%, transparent) 20%,
      color-mix(in srgb, var(--lirio) 10.8%, transparent) 30%,
      color-mix(in srgb, var(--lirio) 9.2%, transparent) 40%,
      color-mix(in srgb, var(--lirio) 7.3%, transparent) 50%,
      color-mix(in srgb, var(--lirio) 5.3%, transparent) 60%,
      color-mix(in srgb, var(--lirio) 3.4%, transparent) 70%,
      color-mix(in srgb, var(--lirio) 1.7%, transparent) 80%,
      color-mix(in srgb, var(--lirio) 0.5%, transparent) 90%,
      transparent 100%);

  &.fullscreen { display: flex;  flex-direction: column; overflow-y: hidden; width: 100%; height: 100%; gap: 0; }

}

.layout.fullscreen .articulos { width: 100%; height: 100%; border: none; }
.layout.fullscreen .portal-glow { display: none; }

.navigation { grid-column: 1; overflow-y: auto; min-height: 0; grid-row: 1 / span 2; position: relative; z-index: 1; }
.portada    { grid-column: 2; overflow-y: auto; min-height: 0; grid-row: 1; position: relative; z-index: 1; }
.articulos  { grid-column: 2; overflow-y: auto; min-height: 0; grid-row: 2; position: relative; z-index: 1; }

.layout:not(.fullscreen) > .articulos { background: var(--portal-glow) -1rem -2rem / calc(100% + 2rem) calc(100% + 4rem) no-repeat, var(--carbon); }

.portal-glow {

  /* LAYOUT */ grid-column: 2; grid-row: 2; z-index: 0; pointer-events: none;
  /* BOX    */ margin: -2rem -1rem;
  /* FILL   */ background: var(--portal-glow);

}

.footer     { padding: 0rem 1rem 1rem 1rem; flex-shrink: 0; }

.veil       { position: fixed; inset: 0; z-index: 9998; pointer-events: none; }

@media (--desktop) { .articulos.portada-collapsed .post { border-top: none; border-top-left-radius: 0; border-top-right-radius: 0; } }

@media (--mobile) { 

  .pagina { max-width: 100%; }

  .layout { display: flex; flex-direction: column; height: 100%; overflow-y: auto; row-gap: 0; &.fullscreen { overflow-y: hidden; } }

  .navigation, .portada, .articulos  { overflow-y: visible; min-height: auto; height: auto; }

  .portal-glow { display: none; }
  .layout:not(.fullscreen) > .articulos { background: var(--carbon); }
  .portada { order: 1; } .portada.mobile-gap { margin-bottom: 1rem; border-radius: var(--radius-ss); } .articulos { order: 2; margin-bottom: 1rem; } .navigation { order: 3; }
  
  .footer  { padding: 0 1rem 1rem; }
  .content { height: auto; scrollbar-width: none; -ms-overflow-style: none; &::-webkit-scrollbar { display: none; } }

}

@media (max-width: 1400px) { .layout { grid-template-columns: 4fr 4fr; } }

</style>