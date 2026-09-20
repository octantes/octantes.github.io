<script setup> 
import { useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import Mark from './mark.vue'
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
        <button v-if="activeFilter === tab.value && hasNotes(tab.value)" @click="router.push('/about/' + tab.value)"
          :data-type="tab.value" :class="{ active: activeFilter === tab.value }" :disabled="processing" :title="store.t.nav.filterBy + tab.label" :aria-label="store.t.nav.filterByContent + tab.label"><span class="tab-label">{{ tab.label }}</span><span class="tab-divider" aria-hidden="true">|</span><Mark class="tab-mark" :type="tab.value" />
        </button>
      </template>
      
    </div>

    <button @click="changeFilter(router, +1)" :disabled="processing" :title="store.t.nav.next" :aria-label="store.t.nav.next"> > </button>

  </div>

</template>

<style scoped> 

.filters { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; position: relative; z-index: 2;
  /* BOX    */ width: 100%; gap: 1rem; padding: 1rem; 
  /* FILL   */ background: linear-gradient(125deg, var(--lirio) 0%, var(--cristal) 100%);  

  & button {

    /* CURSOR */ cursor: pointer;
    /* BOX    */ padding: 0.5rem 1rem;
    /* FILL   */ background-color: transparent; color: var(--carbon-a50);
    /* BORDER */ border: none; border-radius: var(--radius-ss);
    /* FONT   */ font-family: var(--font-main);
    /* MOTION */ transition: all var(--animate-faster);
    &:active   { transform: var(--scale-min); }
    &:hover    { background-color: var(--carbon-a08); color: var(--carbon); }
    &:disabled { cursor: not-allowed; opacity: var(--alpha-disabled);     }

    &.active   { background-color: var(--carbon-a15); color: var(--carbon); box-shadow: var(--shadow-border) var(--carbon-a06); }
    
  }

}

.searchbox {

  /* CURSOR */ cursor: text;
  /* LAYOUT */ text-align: center; flex: 1 1 auto; min-width: 0;
  /* BOX */ padding: 0.5rem 1rem;
  /* FILL */ background-color: var(--carbon-a02); color: var(--carbon);
  /* BORDER */ border: none; border-radius: var(--radius-ss); box-shadow: var(--shadow-border) var(--carbon-a15);
  /* FONT */ font-family: var(--font-main); font-style: italic;
  /* MOTION */ transition: all var(--animate-fast);

  &::placeholder { color: var(--carbon-a60); }
  &:focus { color: var(--carbon); outline: none; box-shadow: var(--shadow-border) var(--carbon-a31); background-color: var(--carbon-a08); }

}

.tabs { 

  /* LAYOUT */ display: flex; flex-shrink: 0;
  /* BOX    */ gap: 1rem; overflow: hidden;

  & button.active { min-width: 4rem; max-width: 8rem; flex: 0 1 auto; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

}

.tabs button.active { display: inline-flex; align-items: center; gap: .45rem; }
.tab-label   { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tab-divider { color: var(--carbon-a31); font-weight: normal; }
.tab-mark    { width: .9em; height: .9em; }

.logo-xx { font-weight: bold; font-family: var(--font-grotesk) !important; text-align: center; }  

@media (max-width: 500px) {
  .filters { gap: .75rem; }
  .filters > button:not(.logo-xx) { padding: .5rem .6rem; }
  .searchbox { min-width: 3rem; }
  .tabs button.active { max-width: none; min-width: 0; overflow: visible; text-overflow: clip; display: flex; align-items: center; justify-content: center; padding: .5rem; width: 2.5rem; gap: 0; }
  .tabs button.active .tab-label, .tabs button.active .tab-divider { display: none; }
  .tabs button.active .tab-mark { width: 1rem; height: 1rem; transform: none; }
  .logo-xx { font-size: 0; padding: .5rem; width: 2rem; display: flex; align-items: center; justify-content: center; }
  .logo-xx::before { content: '⌂'; font-size: 1rem; font-weight: bold; line-height: 1; }
}

</style>