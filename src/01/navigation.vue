<script setup> 
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'
import Table from '../02/table.vue'

const router          = useRouter()                                                                                                   // handles note open route
const route           = useRoute()                                                                                                    // sets the current url route
const store           = useStore()                                                                                                    // initializes global store
const currentTagline  = ref('')                                                                                                       // current tagline phrase
const taglines        = [ 'tejiendo hechizos', 'abriendo ventanas a universos alternativos' ]                                         // random taglines

const { isCentered, processing, searchQuery, activeFilter } = storeToRefs(store)                                                      // imports refs from main store
const { changeFilter, emptyFilter, tabs } = store                                                                                     // destructure store refs

onMounted(async () => {                                                                                                               // searches notes on mount 

  const randomIndex = Math.floor(Math.random() * taglines.length)
  currentTagline.value = taglines[randomIndex]
  await store.loadNotesIndex()

})

</script>

<template> 
  
  <div class="navigation">

    <div class="banner clickable" :class="{'bcentered': isCentered}" @click="store.navHome(router, route.params.slug)">

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

      <button @click="changeFilter(-1)" :disabled="processing"> < </button>

      <div class="tabs">
        <template v-for="tab in tabs" :key="tab.value">
          <button v-if="emptyFilter(tab.value)" @click="store.setActiveFilter(tab.value)" :class="{ active: activeFilter === tab.value }" :disabled="processing" > {{ tab.label }} </button>
        </template>
      </div>

      <button @click="changeFilter(+1)" :disabled="processing"> > </button>

    </div>

    <div class="tablediv"> <Table /> </div>
    
    <div class="layoutcontrol">
      <input class="searchbox" type="text" v-model="searchQuery" placeholder="buscar..." :disabled="processing" />
    </div>

    <div class="bottom">
      <span class="tagline" v-if="currentTagline">{{ currentTagline }}</span>
    </div>

  </div>

</template>

<style scoped> 

.navigation { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: flex; flex-direction: column; align-items: center;
  /* BOX    */ padding: 2.25rem 2rem 1.5rem 2rem; gap: .8rem;
  /* FILL   */ background-color: var(--carbon); color: var(--niebla);
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-xs);
  /* FONT   */ font-family: var(--font-main); font-size: 0.9rem;

}

.banner { 

  /* LAYOUT */ display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
  /* BOX    */ width: 100%; overflow: hidden;
  /* FONT   */ font-size: .8vw;

  &.clickable { cursor: pointer; }

  & pre {
  
    /* LAYOUT */ flex-shrink: 0;
    /* BOX    */ margin-bottom: .25rem; margin-top: .8rem; overflow: visible;
    /* FILL   */ background: linear-gradient(125deg, var(--cristal), var(--lirio)); color: var(--lirio);
    /* FONT   */ font-family: monospace;
    /* WEBKIT */ -webkit-text-fill-color: transparent; -webkit-background-clip: text; background-clip: text;
  
  }

}

.bcentered { 
  
  /* FONT   */ font-size: .5vw;

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

.tablediv { 

  /* LAYOUT */ flex-shrink: 0;
  /* BOX    */ padding-left: 4rem; padding-right: 4rem;
  
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

.bottom { display:flex; height: 100%; align-items: center; justify-content: center; }

.tagline { 

  /* FILL   */ background: linear-gradient(125deg, var(--cristal), var(--lirio));
  /* FONT   */ font-size: clamp(16px, .9vw, 24px); font-style: italic;
  /* WEBKIT */ -webkit-text-fill-color: transparent; -webkit-background-clip: text; background-clip: text;

}

@media (max-width: 1600px) { .tablediv { padding-left: 2rem; padding-right: 2rem;} }
@media (max-width: 1400px) { .tablediv { padding-left: 0rem; padding-right: 0rem;} }
@media (max-width: 1080px) { .tablediv { padding-left: 2rem; padding-right: 2rem;} }
@media (max-width: 800px)  { .tablediv { padding-left: 0rem; padding-right: 0rem;} }

@media (max-width: 580px) {

  .tablediv { padding-left: 0rem; padding-right: 0rem;}

  .tabs button        { display: none; }
  .tabs button.active { display: flex; }

}

</style>