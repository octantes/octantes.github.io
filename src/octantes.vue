<script setup>
import { ref } from 'vue'
import Navigation from './01/navigation.vue'
import Status from './01/status.vue'
import Side from './01/side.vue'

const processing = ref(false)
const isCentered = ref(false)

function updateProcessing(val) { processing.value = val }
function toggleView() { isCentered.value = !isCentered.value }

</script>

<template>

  <div class="pagina">

    <div class="layout" :class="{ centered: isCentered }" >

        <Navigation class="navigation" :disabled="processing" :is-centered="isCentered"/>

        <RouterView v-slot="{ Component }" >

          <component class="articulos" :is="Component" @updateProcessing="updateProcessing" />
          
        </RouterView>

        <Side v-if="isCentered" class="side" :disabled="processing" />

    </div>

    <div class="footer">

        <Status @toggle-view="toggleView" />
        
    </div>

  </div>

</template>

<style>

@media (max-width: 1080px) {

  .pagina { height: auto; }
  .layout { grid-template-columns: 1fr; grid-auto-rows: auto 1fr; }
  .navigation { height: auto; }
  .content { aspect-ratio: 3/5;}
  
}

.navigation { grid-column: 1; }
.articulos { grid-column: 2; }
.side { grid-column: 3; }

.layout {
  display: grid;
  grid-template-columns: 5fr 3fr;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 1rem;
}

.layout.centered { grid-template-columns: 2.5fr 3fr 2.5fr; }

.pagina {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 1rem;
  gap: 1rem;
}

.articulos {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
  grid-column: 2;
}

</style>