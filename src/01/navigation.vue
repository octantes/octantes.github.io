<script setup> 
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'
import Gallery from '../02/gallery.vue'
import Popup from '../02/popup.vue'

const router          = useRouter()                                                                                                   // handles note open route
const route           = useRoute()                                                                                                    // sets the current url route
const store           = useStore()                                                                                                    // initializes global store

const { isCentered, processing, searchQuery, activeFilter } = storeToRefs(store)                                                      // imports refs from main store
const { changeFilter, emptyFilter, tabs } = store                                                                                     // destructure store refs

function isNeighbor(tabValue) {                                                                                                       // check compact tab neighbors 

  const visibleTabs = tabs.filter(t => emptyFilter(t.value))
  const currentIndex = visibleTabs.findIndex(t => t.value === activeFilter.value)
  const tabIndex = visibleTabs.findIndex(t => t.value === tabValue)

  if (currentIndex === -1 || tabIndex === -1) return false

  const prevIndex = currentIndex - 1
  const nextIndex = currentIndex + 1

  return tabIndex === prevIndex || tabIndex === nextIndex

}

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

      <!-- <div class="filters" > <HeaderBar>-->

      <div class="filters"> 

        <input class="searchbox" type="text" v-model="searchQuery" placeholder="buscar..." :disabled="processing" title="buscar en la tabla de notas" aria-label="caja de búsqueda para notas"/>

        <button @click="changeFilter(router, -1)" :disabled="processing" title="ver el filtro anterior" aria-label="navegar al filtro de contenido anterior"> < </button>

        <div class="tabs" :class="{ 'compact': isCentered }">
          <template v-for="tab in tabs" :key="tab.value">
            <button v-if="emptyFilter(tab.value)" @click="store.setActiveFilter(router, tab.value)" :class="{ active: activeFilter === tab.value, neighbor: isNeighbor(tab.value) }"
              :disabled="processing" :title="'filtrar por ' + tab.label" :aria-label="'filtrar contenidos por ' + tab.label"> {{ tab.label }}
            </button>
          </template>
        </div>

        <button @click="changeFilter(router, +1)" :disabled="processing" title="ver el filtro siguiente" aria-label="navegar al filtro de contenido siguiente"> > </button>

      </div>

      <div class="nav-views"> <Gallery /> </div>
      
      <Popup v-if="store.showPopup" />

    </div>

  </div>

</template>

<style scoped> 

.navigation { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: flex; flex-direction: column; align-items: center; position: relative;
  /* BOX    */ padding: 0rem; gap: .8rem;
  /* FILL   */ background-color: var(--carbon); color: var(--niebla);
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-main); font-size: 0.9rem;

}

.nav-content {

  /* LAYOUT */ display: flex; flex-direction: column; align-items: center; overflow: hidden;
  /* BOX    */ width: 100%; height: 100%;
  /* PAD    */ padding: 2rem 2rem 2rem 2rem; gap: 2rem;

}

.filters { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  /* BOX    */ width: 100%; gap: 1rem;

  & button {

    /* CURSOR */ cursor: pointer;
    /* BOX    */ padding: 0.5rem 1rem;
    /* FILL   */ background-color: transparent; color: var(--humo);
    /* BORDER */ border: none; border-radius: var(--radius-ss);
    /* FONT   */ font-family: var(--font-main);
    /* MOTION */ transition: all var(--animate-fast);
    
    &:hover { background-color: var(--humo25); color: var(--niebla); }
    &:disabled { cursor: not-allowed; opacity: var(--alpha-disabled); }
    &.active { background-color: var(--cristal25); color: var(--niebla); box-shadow: var(--shadow-border) var(--humo25); }
    
  }

}

.searchbox { 

  /* CURSOR */ cursor: text;
  /* LAYOUT */ text-align: center;
  /* BOX    */ width: 75%; padding: 0.5rem 1rem;
  /* FILL   */ background-color: transparent; color: var(--humo);
  /* BORDER */ border: none; border-radius: var(--radius-ss); box-shadow: var(--shadow-border) var(--humo10);
  /* FONT   */ font-family: var(--font-main); font-style: italic;
  /* MOTION */ transition: all var(--animate-fast);

  &:focus { background-color: var(--lirio15); color: var(--niebla); outline: none; box-shadow: var(--shadow-border) var(--humo25); }

}

.tabs { 

  /* LAYOUT */ display: flex; flex-shrink: 0;
  /* BOX    */ gap: 1rem; overflow: hidden;

}

.nav-views { 

  flex-grow: 1; min-height: 0; width: 100%;
  overflow-y: auto;
  display: flex; flex-direction: column;
  
  scrollbar-width: none; 
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
  
}

.tabs.compact button { display: none; min-width: 6rem; justify-content: center; }
.tabs.compact button.active, .tabs.compact button.neighbor  { display: flex; }

@media (max-width: 580px) {

  .tabs.compact button.neighbor { display: none; }
  .tabs button                  { display: none; }
  .tabs button.active           { display: flex; }

}

</style>