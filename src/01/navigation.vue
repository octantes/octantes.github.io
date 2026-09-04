<script setup> 
import { onMounted, watch } from 'vue'
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

  if (initialFilter !== store.activeFilter) { store.setActiveFilter(router, initialFilter) }

})

watch(() => route.params.filterType, (newFilterType) => {                                                                             // syncs filter on back/forward nav

  if (newFilterType !== undefined && newFilterType !== store.activeFilter) { store.setActiveFilter(router, newFilterType) }

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

  /* The gallery is a room, not a panel. It used to paint its own carbon ground,
     which is identical to the page's — invisible on its own, but it blocked the
     portal's light the moment there was any, and the column read as a dead
     rectangle in a lit page. Transparent here; the cards keep their own tint and
     now sit *in* the light rather than in front of it. */

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: flex; flex-direction: column; align-items: center; position: relative;
  /* BOX    */ padding: 0rem; gap: .8rem; min-height: 300px;
  /* FILL   */ background-color: transparent; color: var(--niebla);
  /* BORDER */ border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-main); font-size: 0.9rem;

}

.nav-content {

  /* LAYOUT */ display: flex; flex-direction: column; align-items: center; overflow: hidden;
  /* BOX    */ width: 100%; height: 100%;

}

.nav-views { 

  /* LAYOUT */ display: flex; flex-direction: column; flex-grow: 1; overflow-y: auto;
  /* BOX    */ width: 100%; min-height: 0; padding-top: 2rem;
  /* SCROLL */ scrollbar-width: none; -ms-overflow-style: none;
  /* BORDER */ border: var(--small-outline) var(--humo-a06); border-top: none;
  
  &::-webkit-scrollbar { display: none; }
  
}

@media (max-width: 1080px) { .navigation { min-height: 40rem; overflow: hidden; } }

</style>