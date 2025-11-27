<script setup> 
import { onMounted, onUnmounted } from 'vue'
import { useStore } from './04/store.js'
import { storeToRefs } from 'pinia'
import Navigation from './01/navigation.vue'
import Status from './01/status.vue'
import Side from './01/side.vue'
import Portada from './02/portada.vue'

const store = useStore()
const { computedPortada, computedFullscreen } = storeToRefs(store)

onMounted(() => { window.addEventListener('resize', handleResize); handleResize() })
onUnmounted(() => { window.removeEventListener('resize', handleResize) })

function handleResize() { 

  if (window.innerWidth <= 1080) { store.isCentered = true  }
  if (window.innerWidth >= 1080) { store.isCentered = false }

}

</script>

<template> 

  <div class="pagina">

    <div class="layout" :class="{ centered: store.isCentered, fullscreen: computedFullscreen }" >

      <template v-if="!computedFullscreen">

        <Portada class="portada" :metadata="computedPortada" />
        <Navigation class="navigation" :disabled="store.processing" :is-centered="store.isCentered" />
        <Side v-if="store.isCentered" class="side" :disabled="store.processing" />

      </template>

      
      <RouterView v-slot="{ Component }" >
        
        <component class="articulos" :is="Component" @updateProcessing="store.setProcessing" />
        
      </RouterView>


    </div>

    <div class="footer">

        <Status />
        
    </div>

  </div>

</template>

<style> 

.pagina { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; }

.layout { 

  /* LAYOUT */ display: grid; grid-template-columns: 5fr 3fr; flex: 1 1 auto; grid-template-rows: auto 1fr;
  /* BOX    */ width: 100%; min-height: 0; padding: 1rem; gap: 1rem;

  &.centered   { grid-template-columns: 2.5fr 3fr 2.5fr; grid-template-rows: auto 1fr;      }
  &.fullscreen { display: flex;  flex-direction: column; overflow-y: hidden; width: 100%; height: 100%; gap: 0; }

}

.layout.fullscreen .articulos { width: 100%; height: 100%; padding: 0; border: none; }

.navigation { grid-column: 1; overflow-y: auto; min-height: 0; grid-row: 1 / span 2; }
.portada    { grid-column: 2; overflow-y: auto; min-height: 0; grid-row: 1;          }
.articulos  { grid-column: 2; overflow-y: auto; min-height: 0; grid-row: 2;          }
.side       { grid-column: 3; overflow-y: auto; min-height: 0; grid-row: 1 / span 2; }

.footer     { padding: 0rem 1rem 1rem 1rem; flex-shrink: 0; }

@media (max-width: 1080px) { 

  .layout            { display: flex; flex-direction: column; height: 100%; overflow-y: auto; &.fullscreen { overflow-y: hidden; padding-bottom: 0; } }

  .navigation, .portada, .articulos, .side { overflow-y: visible; min-height: auto; height: auto; }

  .portada { order: 1; } .navigation { order: 2; } .articulos { order: 3; } .side { order: 4; }

  .footer            { padding: 1rem;     }
  .content           { height: 40rem; }

}

</style>