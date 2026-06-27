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
          :data-type="tab.value" :class="{ active: activeFilter === tab.value }" :disabled="processing" :title="store.t.nav.filterBy + tab.label" :aria-label="store.t.nav.filterByContent + tab.label"> {{ tab.label }}
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
  /* LAYOUT */ text-align: center; flex: 1 1 auto; min-width: 0;
  /* BOX */ padding: 0.5rem 1rem;
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

  & button.active { min-width: 4rem; max-width: 8rem; flex: 0 1 auto; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

}

.logo-xx { font-weight: bold; font-family: var(--font-grotesk) !important; text-align: center; }  

@media (max-width: 500px) {
  .filters { gap: .75rem; }
  .filters > button:not(.logo-xx) { padding: .5rem .6rem; }
  .searchbox { min-width: 3rem; }
  .tabs button.active { max-width: none; min-width: 0; overflow: visible; text-overflow: clip; font-size: 0; display: flex; align-items: center; justify-content: center; padding: .5rem; width: 2.5rem; }
  .tabs button.active::before { font-size: 1rem; line-height: 1; font-variant-emoji: text; }
  .tabs button.active[data-type="full"]::before       { content: '\221E'; }
  .tabs button.active[data-type="diseño"]::before      { content: '\22A1'; }
  .tabs button.active[data-type="desarrollo"]::before  { content: '\2699'; }
  .tabs button.active[data-type="musica"]::before      { content: '\266A'; }
  .tabs button.active[data-type="textos"]::before      { content: '\270E'; }
  .tabs button.active[data-type="juegos"]::before      { content: '\2660'; }
  .logo-xx { font-size: 0; padding: .5rem; width: 2rem; display: flex; align-items: center; justify-content: center; }
  .logo-xx::before { content: '⌂'; font-size: 1rem; font-weight: bold; line-height: 1; }
}

</style>