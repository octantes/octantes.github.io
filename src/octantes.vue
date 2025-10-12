<script setup>
import { ref } from 'vue'
import Navigation from './01/navigation.vue'
import Footer from './01/footer.vue'

const processing = ref(false)
function updateProcessing(val) { processing.value = val }

</script>

<template>

  <div class="pagina">

    <div class="layout">

        <Navigation class="navigation" :disabled="processing" />

        <RouterView v-slot="{ Component }" >

          <component class="articulos" :is="Component" @updateProcessing="updateProcessing" />
          
        </RouterView>

    </div>

    <div class="footer">

        <Footer/>
        
    </div>

  </div>

</template>

<style>

.layout {
  display: grid;
  grid-template-columns: 5fr 3fr;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 0;
  gap: 1rem;
}

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
}

@media (max-width: 1080px) {

  .pagina { height: auto; }
  .layout { grid-template-columns: 1fr; grid-auto-rows: auto 1fr; }
  .navigation { height: auto; }
  .content { aspect-ratio: 3/5;}
  
}

</style>