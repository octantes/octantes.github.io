<script setup> 
import { onMounted, onUnmounted } from 'vue'
import { useStore } from './04/store.js'
import { storeToRefs } from 'pinia'
import Navigation from './01/navigation.vue'
import Status from './01/status.vue'
import Side from './01/side.vue'
import Portada from './02/portada.vue'

const store = useStore()
const { computedPortada } = storeToRefs(store)

onMounted(() => { window.addEventListener('resize', handleResize); handleResize() })
onUnmounted(() => { window.removeEventListener('resize', handleResize) })

function handleResize() {

  if (window.innerWidth <= 1080) { store.isCentered = true  }
  if (window.innerWidth >= 1080) { store.isCentered = false }

}

</script>

<template> 

  <div class="pagina">

    <div class="layout" :class="{ centered: store.isCentered }" >

      <Portada class="portada" :metadata="computedPortada" />

      <Navigation class="navigation" :disabled="store.processing" :is-centered="store.isCentered" />

      <RouterView v-slot="{ Component }" >

        <component class="articulos" :is="Component" @updateProcessing="store.setProcessing" />
        
      </RouterView>

      <Side v-if="store.isCentered" class="side" :disabled="store.processing" />

    </div>

    <div class="footer">

        <Status />
        
    </div>

  </div>

</template>

<style> 

.pagina { 

  /* LAYOUT */ display: flex; flex-direction: column;
  /* BOX    */ width: 100%; height: 100%; padding: 1rem; gap: 1rem; overflow: hidden;

}

.layout { 

  /* LAYOUT */ display: grid; grid-template-columns: 5fr 3fr; flex: 1 1 auto; grid-template-rows: auto 1fr;
  /* BOX    */ width: 100%; min-height: 0; gap: 1rem;

  &.centered { grid-template-columns: 2.5fr 3fr 2.5fr; grid-template-rows: auto 1fr; }

}

.navigation { grid-column: 1; overflow-y: auto; min-height: 0; grid-row: 1 / span 2; }
.portada    { grid-column: 2; overflow-y: auto; min-height: 0; grid-row: 1;          }
.articulos  { grid-column: 2; overflow-y: auto; min-height: 0; grid-row: 2;          }
.side       { grid-column: 3; overflow-y: auto; min-height: 0; grid-row: 1 / span 2; }

@media (max-width: 1080px) {

  .layout          { grid-template-columns: 1fr; grid-auto-rows: auto auto 1fr auto; }
  .layout.centered { grid-template-columns: 1fr; grid-auto-rows: auto auto 1fr auto; }

  .portada    { grid-column: 1; grid-row: 1;               }
  .navigation { grid-column: 1; grid-row: 2; height: auto; }
  .articulos  { grid-column: 1; grid-row: 3;               }
  .side       { grid-column: 1; grid-row: 4;               }

  /* .content    { aspect-ratio: 3/5;                         } */
  .pagina     { height: auto;                              }
  
}

</style>