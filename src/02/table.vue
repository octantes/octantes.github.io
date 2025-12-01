<script setup> 
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const router          = useRouter()                                                                                                   // handles note open route
const route           = useRoute()                                                                                                    // sets the current url route
const store           = useStore()                                                                                                    // initializes global store

const { isCentered, processing, searchQuery, sortKey, sortOrder, noteSortFilter } = storeToRefs(store)                                // imports refs from main store

function noteOpen(type, slug) { if (!processing.value) router.push({ path: `/${type}/${slug}` }) }                                    // trigger note open

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

      <tr v-for="note in noteSortFilter" :key="note.slug" @click="noteOpen(note.type, note.slug)" :class="{ active: route.params.slug === note.slug, disabled: processing }" >

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

    </tbody>
    
  </table>

</template>

<style scoped> 

table { 

  /* LAYOUT */ flex-shrink: 0;
  /* TABLE  */ table-layout: fixed;
  /* BOX    */ width: 100%;
  /* BORDER */ border-collapse: separate; border-spacing: 0 0.5rem;

  & .col-fecha  { width: 20%; }
  & .col-titulo { width: 60%; }
  & .col-tags   { width: 20%; }

  &.two-columns { & .col-titulo { width: 70%; } & .col-tags { width: 30%; } }

  & thead { background-color: var(--carbon); }

  & thead tr { 

    /* BORDER */ box-shadow: var(--shadow-border) var(--humo25); border-radius: var(--radius-ss);

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
    &:first-child   { border-top-left-radius: var(--radius-ss); border-bottom-left-radius: var(--radius-ss); }
    &:last-child    { border-top-right-radius: var(--radius-ss); border-bottom-right-radius: var(--radius-ss); }

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

</style>