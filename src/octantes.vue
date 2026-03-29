<script setup> 
import { ref } from 'vue'
import { useStore } from './04/store.js'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import Navigation from './01/navigation.vue'
import Status from './01/status.vue'
import Portada from './02/portada.vue'

const store = useStore()
const route = useRoute()
const { computedFullscreen } = storeToRefs(store)
const portadaExpanded = ref(false)

</script>

<template> 

  <div class="pagina">

    <div class="layout" :class="{ fullscreen: computedFullscreen || route.path === '/portfolio' }" >

      <template v-if="!computedFullscreen && route.path !== '/portfolio'">

        <Portada class="portada" @update:expanded="portadaExpanded = $event" />
        <Navigation class="navigation" :disabled="store.processing" />

      </template>
      
      <RouterView v-slot="{ Component }" >
        
        <component class="articulos" :class="{ 'portada-collapsed': !portadaExpanded }" :is="Component" @updateProcessing="store.setProcessing" />
        
      </RouterView>


    </div>

    <div class="footer" v-if="route.path !== '/portfolio'">

        <Status />
        
    </div>

  </div>

</template>

<style> 

.pagina { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; max-width: 1600px; max-height: 2000px; margin: 0 auto; }

.layout { 

  /* LAYOUT */ display: grid; grid-template-columns: 4fr 4fr; flex: 1 1 auto; grid-template-rows: auto 1fr;
  /* BOX    */ width: 100%; min-height: 0; padding: 1rem; column-gap: 1rem; row-gap: 0;

  &.fullscreen { display: flex;  flex-direction: column; overflow-y: hidden; width: 100%; height: 100%; gap: 0; }

}

.layout.fullscreen .articulos { width: 100%; height: 100%; border: none; }

.navigation { grid-column: 1; overflow-y: auto; min-height: 0; grid-row: 1 / span 2; }
.portada    { grid-column: 2; overflow-y: auto; min-height: 0; grid-row: 1;          }
.articulos  { grid-column: 2; overflow-y: auto; min-height: 0; grid-row: 2;          }

.footer     { padding: 0rem 1rem 1rem 1rem; flex-shrink: 0; }

.articulos.portada-collapsed .post { border-top: none; border-top-left-radius: 0; border-top-right-radius: 0; }

@media (max-width: 1080px) { 

  .pagina { max-width: 100%; }

  .layout { display: flex; flex-direction: column; height: 100%; overflow-y: auto; row-gap: 0; &.fullscreen { overflow-y: hidden; } }

  .navigation, .portada, .articulos  { overflow-y: visible; min-height: auto; height: auto; }
  .navigation { order: 1; margin-bottom: 1rem; } .portada { order: 2; } .articulos { order: 3; }
  
  .footer  { padding: 1rem; }
  .content { height: auto; scrollbar-width: none; -ms-overflow-style: none; &::-webkit-scrollbar { display: none; } }

}

@media (max-width: 1400px) { .layout { grid-template-columns: 4fr 4fr; } }

</style>