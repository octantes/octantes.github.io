<script setup> 
import { useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const router = useRouter()
const store = useStore()

const { processing, searchQuery, activeFilter } = storeToRefs(store)
const { changeFilter, emptyFilter, tabs, navHome, setActiveFilter } = store

</script>

<template> 

  <div class="filters"> 

    <button class="logo-btn" @click="navHome(router)" :disabled="processing" title="volver al inicio">OCTANTES</button>

    <input class="searchbox" type="text" v-model="searchQuery" placeholder="buscar..." :disabled="processing" title="buscar en la tabla de notas" aria-label="caja de búsqueda para notas"/>

    <button @click="changeFilter(router, -1)" :disabled="processing" title="ver el filtro anterior" aria-label="navegar al filtro de contenido anterior"> < </button>

    <div class="tabs"> 

      <template v-for="tab in tabs" :key="tab.value">
        <button v-if="emptyFilter(tab.value)" @click="setActiveFilter(router, tab.value)" :class="{ active: activeFilter === tab.value }"
          :disabled="processing" :title="'filtrar por ' + tab.label" :aria-label="'filtrar contenidos por ' + tab.label"> {{ tab.label }}
        </button>
      </template>
      
    </div>

    <button @click="changeFilter(router, +1)" :disabled="processing" title="ver el filtro siguiente" aria-label="navegar al filtro de contenido siguiente"> > </button>

  </div>

</template>

<style scoped> 

.filters { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  /* BOX    */ width: 100%; gap: 1rem; padding: 1rem;
  /* FILL   */ background: linear-gradient(125deg, var(--lirio) 0%, var(--cristal) 100%);  

  & button {

    /* CURSOR */ cursor: pointer;
    /* BOX    */ padding: 0.5rem 1rem;
    /* FILL   */ background-color: transparent; color: var(--carbon80);
    /* BORDER */ border: none; border-radius: var(--radius-ss);
    /* FONT   */ font-family: var(--font-main);
    /* MOTION */ transition: all var(--animate-fast);
    
    &:hover { /* FILL */ background-color: var(--carbon15); color: var(--carbon); }
    &:disabled { /* FILL */ cursor: not-allowed; opacity: var(--alpha-disabled); }
    &.active { /* FILL */ background-color: var(--carbon25); color: var(--carbon); /* BORDER */ box-shadow: var(--shadow-border) var(--carbon25); }
    
  }

}

.logo-btn { 

  /* FONT   */ font-family: var(--font-grotesk) !important; font-weight: bold; 
  /* BORDER */ box-shadow: var(--shadow-border) var(--carbon25); 

}

.searchbox { 

  /* CURSOR */ cursor: text;
  /* LAYOUT */ text-align: center;
  /* BOX    */ width: 75%; padding: 0.5rem 1rem;
  /* FILL   */ background-color: transparent; color: var(--carbon);
  /* BORDER */ border: none; border-radius: var(--radius-ss); box-shadow: var(--shadow-border) var(--carbon15);
  /* FONT   */ font-family: var(--font-main); font-style: italic;
  /* MOTION */ transition: all var(--animate-fast);

  &::placeholder { color: var(--carbon50); }

  &:focus { /* FILL */ background-color: var(--carbon10); color: var(--carbon); /* BORDER */ outline: none; box-shadow: var(--shadow-border) var(--carbon50); }

}

.tabs { 

  /* LAYOUT */ display: flex; flex-shrink: 0;
  /* BOX    */ gap: 1rem; overflow: hidden;

}

@media (max-width: 580px) {

  .tabs button        { display: none; }
  .tabs button.active { display: flex; }

}

</style>