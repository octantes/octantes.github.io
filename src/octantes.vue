<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Navigation from './01/navigation.vue'
import Status from './01/status.vue'
import Side from './01/side.vue'

const processing = ref(false)
const isCentered = ref(false)

onMounted(() => { window.addEventListener('resize', handleResize); handleResize() })
onUnmounted(() => { window.removeEventListener('resize', handleResize) })

function handleResize() { if (window.innerWidth <= 1080) { isCentered.value = false } }
function updateProcessing(val) { processing.value = val }
function toggleView() { isCentered.value = !isCentered.value }

</script>

<template> 

  <div class="pagina">

    <div class="layout" :class="{ centered: isCentered }" >

        <Navigation @toggle-view="toggleView" class="navigation" :disabled="processing" :is-centered="isCentered"/>

        <RouterView v-slot="{ Component }" >

          <component class="articulos" :is="Component" @updateProcessing="updateProcessing" />
          
        </RouterView>

        <Side v-if="isCentered" class="side" :disabled="processing" />

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

  /* LAYOUT */ display: grid; grid-template-columns: 5fr 3fr; flex: 1 1 auto;
  /* BOX    */ width: 100%; min-height: 0; gap: 1rem;

  &.centered { grid-template-columns: 2.5fr 3fr 2.5fr; }

}

.navigation { grid-column: 1; overflow-y: auto; min-height: 0; }
.articulos  { grid-column: 2; overflow-y: auto; min-height: 0; }
.side       { grid-column: 3; overflow-y: auto; min-height: 0; }

@media (max-width: 1080px) {

  .pagina     { height: auto;                                         }
  .layout     { grid-template-columns: 1fr; grid-auto-rows: auto 1fr; }
  .navigation { height: auto; grid-column: 1;                         }
  .content    { aspect-ratio: 3/5;                                    }
  
  .articulos, .side { grid-column: 1; }
  
}

</style>