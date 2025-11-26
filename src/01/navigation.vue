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

    <div class="toggleview" @click="toggleNavMode">
      <span>{{ navMode === 'table' ? '>' : '<' }}</span>
    </div>

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
      </div>

      <Popup v-if="store.showPopup" />

    </div>

  </div>

</template>

<style scoped> 

.navigation { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: flex; flex-direction: column; align-items: center; position: relative;
  /* BOX    */ padding: 2.25rem 2rem 1.5rem 2rem; gap: .8rem;
  /* FILL   */ background-color: var(--carbon); color: var(--niebla);
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-xs);
  /* FONT   */ font-family: var(--font-main); font-size: 0.9rem;

}

.toggleview {

  /* LAYOUT */ position: absolute; right: 0; top: 0; bottom: 0;
  /* BOX    */ width: 1.5rem; z-index: 10;
  /* FILL   */ background-color: var(--carbon25);
  /* BORDER */ border-left: var(--small-outline) var(--humo10);
  /* CURSOR */ cursor: pointer;
  /* FLEX   */ display: flex; align-items: center; justify-content: center;
  /* MOTION */ transition: background-color var(--animate-fast);

  &:hover { background-color: var(--carbon50); color: var(--lirio); }

}

.nav-content {

  /* LAYOUT */ display: flex; flex-direction: column; align-items: center;
  /* BOX */ width: 100%; height: 100%;
  /* PADDING */ padding: 2.25rem 3.5rem 1.5rem 2rem; gap: .8rem;
  overflow-y: auto;

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
  /* BOX    */ width: 100%; margin-top: .5rem; gap: 1rem;

  & button {

    /* CURSOR */ cursor: pointer;
    /* BOX    */ padding: 0.5rem 1rem;
    /* FILL   */ background-color: transparent; color: var(--humo);
    /* BORDER */ border: none; border-radius: var(--radius-xs);
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

  /* LAYOUT */ flex-shrink: 0;
  /* BOX    */ width: 100%; padding-left: 4rem; padding-right: 4rem;
  
}

.layoutcontrol { 

  /* LAYOUT */ flex-shrink: 0;
  /* BOX    */ width: 100%; padding-left: 4rem; padding-right: 4rem;
  
}

.searchbox { 

  /* CURSOR */ cursor: text;
  /* LAYOUT */ text-align: center;
  /* BOX    */ width: 100%; padding: 0.5rem 1rem;
  /* FILL   */ background-color: transparent; color: var(--humo);
  /* BORDER */ border: none; border-radius: var(--radius-xs); box-shadow: var(--shadow-border) var(--humo10);
  /* FONT   */ font-family: var(--font-main); font-style: italic;
  /* MOTION */ transition: all var(--animate-fast);

  &:focus { background-color: var(--lirio25); color: var(--niebla); outline: none; box-shadow: var(--shadow-border) var(--humo25); }

}


@media (max-width: 1600px) { .nav-views { padding-left: 2rem; padding-right: 2rem;} }
@media (max-width: 1400px) { .nav-views { padding-left: 0rem; padding-right: 0rem;} }
@media (max-width: 1080px) { .nav-views { padding-left: 2rem; padding-right: 2rem;} .bcentered { font-size: .8vw; } }
@media (max-width: 800px)  { .nav-views { padding-left: 0rem; padding-right: 0rem;} .bcentered { font-size: .8vw; } }

@media (max-width: 580px) {

  .nav-views { padding-left: 0rem; padding-right: 0rem;}
  .bcentered { font-size: .8vw; }

  .tabs button        { display: none; }
  .tabs button.active { display: flex; }

}

</style>