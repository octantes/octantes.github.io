<script setup> 
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const router          = useRouter()                                                                                                   // handles note open route
const route           = useRoute()                                                                                                    // sets the current url route
const store           = useStore()                                                                                                    // initializes global store

const { isCentered, processing, searchQuery, sortKey, sortOrder, currentPage, totalPages, paginatedNotes, noteSortFilter, itemsPerPage } = storeToRefs(store)

function noteOpen(type, slug) { if (!processing.value) router.push({ path: `/${type}/${slug}` }) }

</script>

<template> 

  <table :class="{ 'two-columns': isCentered }">

    <colgroup>
      <col class="col-fecha" v-if="!isCentered">
      <col class="col-titulo">
      <col class="col-tags">
    </colgroup>

    <thead>
      <tr>
        <th @click="store.navSort('isoDate')" :class="{ active: sortKey === 'isoDate' }" :data-order="sortOrder" v-if="!isCentered">fecha</th>
        <th @click="store.navSort('title')" :class="{ active: sortKey === 'title' }" :data-order="sortOrder">título</th>
        <th @click="store.navSort('tags')" :class="{ active: sortKey === 'tags' }" :data-order="sortOrder">tags</th>
      </tr>
    </thead>

    <tbody>

      <tr v-for="note in paginatedNotes" :key="note.slug" @click="noteOpen(note.type, note.slug)" :class="{ active: route.params.slug === note.slug, disabled: processing }" >

        <td v-if="!isCentered">{{ note.date }}</td>
        <td>{{ note.title }}</td>

        <td class="tagcol">

          <template v-if="!isCentered">
            <button v-for="tag in note.tags" :key="tag" class="tagfilter" @click.stop="store.setSearchQuery(tag)" :disabled="processing"> {{ tag }} </button>
          </template>

          <template v-else>
            <button v-if="note.tags.length > 0" class="tagfilter" @click.stop="store.setSearchQuery(note.tags[0])" :disabled="processing"> {{ note.tags[0] }} </button>
          </template>

        </td>

      </tr>

      <tr v-if="noteSortFilter.length === 0 && searchQuery" class="no-results">
        <td :colspan="isCentered ? 2 : 3">no hay notas que coincidan con "{{ searchQuery }}"</td>
      </tr>

      <tr v-for="i in (noteSortFilter.length > 0 ? itemsPerPage - paginatedNotes.length : 0)" :key="`placeholder-${i}`" class="bodyfill">
        <td :colspan="isCentered ? 2 : 3">&nbsp;</td>
      </tr>
      
    </tbody>

    <tfoot>

      <tr>
        <td :colspan="isCentered ? 2 : 3">

          <div class="pagecontrols">
            <button class="navbutton" @click="store.prevPage" :disabled="currentPage === 1 || processing"> < </button>
            <span>{{ currentPage }} / {{ totalPages || 1 }}</span>
            <button class="navbutton" @click="store.nextPage" :disabled="currentPage >= totalPages || processing"> > </button>
          </div>

        </td>
      </tr>

    </tfoot>
    
  </table>

  <div class="layoutcontrol">
    <input class="searchbox" type="text" v-model="searchQuery" placeholder="buscar..." :disabled="processing" />
  </div>

</template>

<style> 

table { 

  /* LAYOUT */ flex-shrink: 0;
  /* TABLE  */ table-layout: fixed;
  /* BOX    */ width: 100%;
  /* BORDER */ border-collapse: separate; border-spacing: 0 0.5rem;

  & .col-fecha  { width: 20%; }
  & .col-titulo { width: 60%; }
  & .col-tags   { width: 20%; }

  &.two-columns { & .col-titulo { width: 70%; } & .col-tags { width: 30%; } }

  & thead tr { 

    /* BORDER */ box-shadow: var(--shadow-border) var(--humo25); border-radius: var(--radius-xs);

  }

  & th, td { 

    /* LAYOUT */ text-align: left;
    /* BOX    */ padding: 0.5rem 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;

  }

  & th { 

    /* CURSOR */ cursor: pointer;
    /* LAYOUT */ position: relative;
    /* FILL   */ color: var(--humo);
    /* FONT   */ font-weight: normal;
    /* MOTION */ transition: all var(--animate-fast);

    &:hover         { background-color: var(--humo25); color: var(--niebla); }
    &.active        { background-color: var(--lirio25); color: var(--niebla); }
    &:first-child   { border-top-left-radius: var(--radius-xs); border-bottom-left-radius: var(--radius-xs); }
    &:last-child    { border-top-right-radius: var(--radius-xs); border-bottom-right-radius: var(--radius-xs); }

    &.active::after { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); }
    &.active[data-order="asc"]::after  { content: '↑'; }
    &.active[data-order="desc"]::after { content: '↓'; }

    &.active[data-order="asc"]  { background: linear-gradient(0deg, var(--cristal25) 0%, var(--lirio35) 100%); }
    &.active[data-order="desc"] { background: linear-gradient(180deg, var(--cristal25) 0%, var(--lirio35) 100%); }
  
  }

  & tbody tr { 

    /* CURSOR */ cursor: pointer;

    &:hover    { color: var(--lirio99); }
    &.active   { color: var(--cristal); }
    &.disabled { cursor: not-allowed; opacity: var(--alpha-disabled); }

    & td:nth-child(3) { cursor: default; }

  }

  & tfoot td { 

    /* LAYOUT */ text-align: center;
    /* BOX    */ width: 100%; padding-top: 1rem; padding-bottom: 0;

  }

}

.tagcol { 

  /* LAYOUT */ display: flex; 
  /* CURSOR */ cursor: default;
  /* FONT   */ white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  /* BOX    */ gap: 0.5rem;
  
}

.tagfilter { 

  /* CURSOR */ cursor: pointer;
  /* BOX    */ padding: 0; margin: 0;
  /* FILL   */ color: var(--lirio); background: none;
  /* BORDER */ border: none;
  /* FONT   */ white-space: nowrap;
  /* MOTION */ transition: all var(--animate-fast);

  &:hover    { color: var(--cristal); text-decoration: underline; }
  &:disabled { cursor: not-allowed; opacity: var(--alpha-half); text-decoration: none; }

}

.no-results td { 

  /* LAYOUT */ text-align: center;
  /* FILL   */ opacity: var(--alpha-half); color: var(--humo);
  /* FONT   */ font-style: italic;

}

.bodyfill { 

  /* CURSOR */ pointer-events: none;
  /* FILL   */ opacity: var(--alpha-invisible);
  
}

.pagecontrols {

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: flex; justify-content: center; align-items: center; flex-shrink: 0;
  /* BOX    */ gap: 1rem;

  & span { color: var(--humo); }

}

.navbutton { 

  /* CURSOR */ cursor: pointer;
  /* BOX    */ padding: 0rem .5rem;
  /* FILL   */ background-color: transparent; color: var(--lirio);
  /* BORDER */ border: none; border-radius: var(--radius-xs); box-shadow: var(--shadow-border) var(--lirio25);
  /* FONT   */ font-size: 1.5rem;
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { background-color: var(--humo25); }

  &:disabled { 
    
    /* CURSOR */ cursor: not-allowed;
    /* FILL   */ opacity: var(--alpha-disabled);
  
  }

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

@media (max-width: 1600px) { 

  table .col-fecha  { width: 20%; }
  table .col-titulo { width: 50%; }
  table .col-tags   { width: 30%; }

}

@media (max-width: 1400px) { 

  table .col-fecha  { width: 20%; }
  table .col-titulo { width: 50%; }
  table .col-tags   { width: 30%; }

}

@media (max-width: 1080px) { 

  table .col-fecha  { width: 20%; }
  table .col-titulo { width: 50%; }
  table .col-tags   { width: 30%; }

}

@media (max-width: 800px) { 

  table .col-fecha  { width: 20%; }
  table .col-titulo { width: 40%; }
  table .col-tags   { width: 30%; }

}

@media (max-width: 580px) {

  table .col-fecha  { width: 02%; }
  table .col-titulo { width: 68%; }
  table .col-tags   { width: 30%; }

}

</style>