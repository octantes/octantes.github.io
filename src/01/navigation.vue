<script setup> 
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'
import Table from '../02/table.vue'
import Gallery from '../02/gallery.vue'
import Popup from '../02/popup.vue'

const router          = useRouter()                                                                                                   // handles note open route
const route           = useRoute()                                                                                                    // sets the current url route
const store           = useStore()                                                                                                    // initializes global store

const { isCentered, processing, searchQuery, activeFilter, navMode } = storeToRefs(store)                                             // imports refs from main store
const { changeFilter, emptyFilter, tabs, toggleNavMode } = store                                                                      // destructure store refs

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

      <div class="banner" :class="{'bcentered': isCentered}" @click="store.navHome(router)">

<pre>
 ██████╗  ██████╗████████╗ █████╗ ███╗   ██╗████████╗███████╗███████╗
██╔═══██╗██╔════╝╚══██╔══╝██╔══██╗████╗  ██║╚══██╔══╝██╔════╝██╔════╝
██║   ██║██║        ██║   ███████║██╔██╗ ██║   ██║   █████╗  ███████╗
██║   ██║██║        ██║   ██╔══██║██║╚██╗██║   ██║   ██╔══╝  ╚════██║
╚██████╔╝╚██████╗   ██║   ██║  ██║██║ ╚████║   ██║   ███████╗███████║
 ╚═════╝  ╚═════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚══════╝
</pre>
        
      </div>

      <div class="filters"> 

        <button @click="changeFilter(router, -1)" :disabled="processing"> < </button>

        <div class="tabs">
          <template v-for="tab in tabs" :key="tab.value">
            <button v-if="emptyFilter(tab.value)" @click="store.setActiveFilter(router, tab.value)" :class="{ active: activeFilter === tab.value }" :disabled="processing" > {{ tab.label }} </button>
          </template>
        </div>

        <button @click="changeFilter(router, +1)" :disabled="processing"> > </button>

      </div>

      <div class="nav-views"> 

        <Table v-if="navMode === 'table'" />
        <Gallery v-else />

      </div>
      
      <div class="layoutcontrol"> 

        <input class="searchbox" type="text" v-model="searchQuery" placeholder="buscar..." :disabled="processing" />

        <span class="toggleview" @click="toggleNavMode">{{ navMode === 'table' ? 'galería' : 'tabla' }}</span>

      </div>

      <Popup v-if="store.showPopup" />

    </div>


  </div>

</template>

<style scoped> 

.navigation { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: flex; flex-direction: column; align-items: center; position: relative;
  /* BOX    */ padding: 2rem; padding-top: 1rem; gap: .8rem;
  /* FILL   */ background-color: var(--carbon); color: var(--niebla);
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-main); font-size: 0.9rem;

}

.nav-content {

  /* LAYOUT */ display: flex; flex-direction: column; align-items: center; overflow: hidden;
  /* BOX    */ width: 100%; height: 100%;
  /* PAD    */ padding: 2rem 2rem 2rem 2rem; gap: 2rem;

}

.banner { 

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
  /* BOX    */ width: 100%; overflow: hidden;
  /* FONT   */ font-size: .8vw;

  &.bcentered { font-size: .5vw; }

  & pre {
  
    /* LAYOUT */ flex-shrink: 0;
    /* BOX    */ margin-bottom: .25rem; margin-top: .8rem; overflow: visible;
    /* FILL   */ background: linear-gradient(125deg, var(--cristal), var(--lirio)); color: var(--lirio);
    /* FONT   */ font-family: monospace;
    /* WEBKIT */ -webkit-text-fill-color: transparent; -webkit-background-clip: text; background-clip: text;
  
  }

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

.layoutcontrol { 

  /* LAYOUT */ display: flex; flex-direction: row; gap: 1rem; flex-shrink: 0;
  /* BOX    */ width: 100%;
  
}

.searchbox { 

  /* CURSOR */ cursor: text;
  /* LAYOUT */ text-align: center;
  /* BOX    */ width: 75%; padding: 0.5rem 1rem;
  /* FILL   */ background-color: transparent; color: var(--humo);
  /* BORDER */ border: none; border-radius: var(--radius-ss); box-shadow: var(--shadow-border) var(--humo10);
  /* FONT   */ font-family: var(--font-main); font-style: italic;
  /* MOTION */ transition: all var(--animate-fast);

  &:focus { background-color: var(--lirio25); color: var(--niebla); outline: none; box-shadow: var(--shadow-border) var(--humo25); }

}

.toggleview {

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  /* BOX    */ width: 25%; padding: 0.5rem 5rem;
  /* FILL   */ background-color: transparent; color: var(--humo);
  /* BORDER */ border: none; border-radius: var(--radius-ss); box-shadow: var(--shadow-border) var(--humo10);
  /* FONT   */ font-family: var(--font-main); font-style: italic;
  /* MOTION */ transition: background-color var(--animate-fast);

  &:hover { background-color: var(--lirio15); }

}

@media (max-width: 1080px) { .bcentered { font-size: .8vw; } }
@media (max-width: 800px)  { .bcentered { font-size: .8vw; } }

@media (max-width: 580px) {

  .bcentered { font-size: .8vw; }

  .tabs button        { display: none; }
  .tabs button.active { display: flex; }

}

</style>