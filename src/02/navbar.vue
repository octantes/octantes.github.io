<script setup> 
import { useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const router = useRouter()
const store = useStore()

const { processing, searchQuery, activeFilter, tabs } = storeToRefs(store)
const { changeFilter, hasNotes, navHome, setActiveFilter } = store

</script>

<template> 

  <div class="filters"> 

    <button class="logo-xx" @click="navHome(router)" :disabled="processing" :title="store.t.nav.home">OCTANTES</button>

    <input class="searchbox" type="text" v-model="searchQuery" :placeholder="store.t.nav.search" :disabled="processing" :title="store.t.nav.search" :aria-label="store.t.nav.search"/>

    <button @click="changeFilter(router, -1)" :disabled="processing" :title="store.t.nav.prev" :aria-label="store.t.nav.prev"> < </button>

    <div class="tabs"> 

      <template v-for="tab in tabs" :key="tab.value">
        <button v-if="activeFilter === tab.value && hasNotes(tab.value)" @click="setActiveFilter(router, 'full')"
          :class="{ active: activeFilter === tab.value }" :disabled="processing" :title="'filtrar por ' + tab.label" :aria-label="'filtrar contenidos por ' + tab.label"> {{ tab.label }}
        </button>
      </template>
      
    </div>

    <button @click="changeFilter(router, +1)" :disabled="processing" :title="store.t.nav.next" :aria-label="store.t.nav.next"> > </button>

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
    /* MOTION */ transition: all var(--animate-faster);
    &:active   { transform: var(--scale-min); }
    &:hover    { background-color: var(--carbon15); color: var(--carbon); }
    &:disabled { cursor: not-allowed; opacity: var(--alpha-disabled);     }

    &.active   { background-color: var(--carbon25); color: var(--carbon); box-shadow: var(--shadow-border) var(--carbon10); }
    
  }

}

.searchbox {

  /* CURSOR */ cursor: text;
  /* LAYOUT */ text-align: center;
  /* BOX */ width: 75%; padding: 0.5rem 1rem;
  /* FILL */ background-color: var(--carbon05); color: var(--carbon);
  /* BORDER */ border: none; border-radius: var(--radius-ss); box-shadow: var(--shadow-border) var(--carbon25);
  /* FONT */ font-family: var(--font-main); font-style: italic;
  /* MOTION */ transition: all var(--animate-fast);

  &::placeholder { color: var(--carbon99); }
  &:focus { color: var(--carbon); outline: none; box-shadow: var(--shadow-border) var(--carbon50); background-color: var(--carbon15); }

}

.tabs { 

  /* LAYOUT */ display: flex; flex-shrink: 0;
  /* BOX    */ gap: 1rem; overflow: hidden;

  & button.active { display: flex; width: 8rem; justify-content: center; }

}

.logo-xx { font-weight: bold; font-family: var(--font-grotesk) !important; }  

</style>