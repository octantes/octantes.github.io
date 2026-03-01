<script setup> 
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../04/store.js'
import Navbar from '../02/navbar.vue'
import Gallery from '../02/gallery.vue'
import Popup from '../02/popup.vue'

const router          = useRouter()                                                                                                   // handles note open route
const route           = useRoute()                                                                                                    // sets the current url route
const store           = useStore()                                                                                                    // initializes global store

onMounted(async () => {                                                                                                               // searches notes on mount 

  await store.loadNotesIndex()

  const urlFilter = route.params.filterType
  const initialFilter = urlFilter || 'full'
  
  if (initialFilter !== store.activeFilter.value) { store.setActiveFilter(router, initialFilter) }

})

</script>

<template> 
  
  <div class="navigation">

    <div class="nav-content">

      <Navbar/>
      
      <div class="nav-views"> <Gallery /> </div>
      
      <Popup v-if="store.showPopup" />

    </div>

  </div>

</template>

<style scoped> 

.navigation { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: flex; flex-direction: column; align-items: center; position: relative;
  /* BOX    */ padding: 0rem; gap: .8rem; min-height: 300px;
  /* FILL   */ background-color: var(--carbon); color: var(--niebla);
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-main); font-size: 0.9rem;

}

.nav-content {

  /* LAYOUT */ display: flex; flex-direction: column; align-items: center; overflow: hidden;
  /* BOX    */ width: 100%; height: 100%;
  /* PAD    */ padding: 2rem 4rem 2rem 4rem; gap: 2rem;

}

.nav-views { 

  flex-grow: 1; min-height: 0; width: 100%;
  overflow-y: auto;
  display: flex; flex-direction: column;
  
  scrollbar-width: none; 
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
  
}

@media (max-width: 580px) {

  .tabs button                  { display: none; }
  .tabs button.active           { display: flex; }

}

</style>