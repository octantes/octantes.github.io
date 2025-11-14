<script setup> 
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const taglines = [ 'tejiendo hechizos', 'abriendo ventanas a universos alternativos' ]                                                // random taglines
const tabs     = [                                                                                                                    // names for filters 

  { label: 'completo',   value: 'full'   },
  { label: 'diseño',     value: 'design' },
  { label: 'desarrollo', value: 'dev'    },
  { label: 'música',     value: 'music'  },
  // { label: 'textos',     value: 'posts'  },
  // { label: 'juegos',     value: 'game'   },

]

const router                     = useRouter()                                                                                        // handles note open route
const route                      = useRoute()                                                                                         // sets the current url route
const store                      = useStore()                                                                                         // initializes global store
const currentTagline             = ref('')                                                                                            // current tagline phrase

const { isCentered, processing, searchQuery, activeFilter, notesIndex, sortKey, sortOrder, currentPage, totalPages, paginatedNotes, noteSortFilter } = storeToRefs(store)

function noteOpen(type, slug) { if (!processing.value) router.push({ path: `/${type}/${slug}` }) }
function noteSearch(tag)      { if (!processing.value) { store.setSearchQuery(tag) } }

function navHome() {                                                                                                                  // navigates to root and reloads 

  if (processing.value) return
  if (route.params.slug) { router.push({ path: '/' })
  setTimeout(() => { window.location.reload() }, 0) }
  else { router.push({ path: '/' }) }

}

function navFilter(direction) {                                                                                                       // changes filter manually 

  if (processing.value) return
  const currentIndex = tabs.findIndex(tab => tab.value === activeFilter.value)
  const newIndex = (currentIndex + direction + tabs.length) % tabs.length
  store.setActiveFilter(tabs[newIndex].value)

}

function navSort(key) { store.navSort(key) }                                                                                          // changes sorting column 

onMounted(async () => {                                                                                                               // searches notes on mount 

  const randomIndex = Math.floor(Math.random() * taglines.length)
  currentTagline.value = taglines[randomIndex]
  await store.loadNotesIndex()

})

</script>

<template> 
  
  <div class="navigation">

    <div class="banner clickable" :class="{'bcentered': isCentered}" @click="navHome">

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

      <button @click="store.prevPage" :disabled="processing"> < </button>
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.value" @click="store.setActiveFilter(tab.value)" :class="{ active: activeFilter === tab.value }" :disabled="processing" > {{ tab.label }} </button>
      </div>
      <button @click="store.nextPage" :disabled="processing"> > </button>

    </div>

    <div class="tablediv">

      <table :class="{ 'two-columns': isCentered }">

        <colgroup>
          <col class="col-fecha" v-if="!isCentered">
          <col class="col-titulo">
          <col class="col-tags">
        </colgroup>

        <thead>
          <tr>
            <th @click="navSort('isoDate')" :class="{ active: sortKey === 'isoDate' }" :data-order="sortOrder" v-if="!isCentered">fecha</th>
            <th @click="navSort('title')" :class="{ active: sortKey === 'title' }" :data-order="sortOrder">título</th>
            <th @click="navSort('tags')" :class="{ active: sortKey === 'tags' }" :data-order="sortOrder">tags</th>
          </tr>
        </thead>

        <tbody>

          <tr v-for="note in paginatedNotes" :key="note.slug" @click="noteOpen(note.type, note.slug)" :class="{ active: route.params.slug === note.slug, disabled: processing }" >
            <td v-if="!isCentered">{{ note.date }}</td>
            <td>{{ note.title }}</td>
            <td class="tagcol">
              <template v-if="!isCentered">
                <button v-for="tag in note.tags" :key="tag" class="tagfilter" @click.stop="noteSearch(tag)" :disabled="processing"> {{ tag }} </button>
              </template>
              <template v-else>
                <button v-if="note.tags.length > 0" class="tagfilter" @click.stop="noteSearch(note.tags[0])" :disabled="processing"> {{ note.tags[0] }} </button>
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

    </div>
    
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

.layoutcontrol { 

  /* LAYOUT */ flex-shrink: 0;
  /* BOX    */ width: 100%; padding-left: 4rem; padding-right: 4rem;
  
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

@media (max-width: 1600px) { 

  .tablediv { padding-left: 2rem; padding-right: 2rem;}

  table .col-fecha  { width: 20%; }
  table .col-titulo { width: 50%; }
  table .col-tags   { width: 30%; }

}

@media (max-width: 1400px) { 

  .tablediv { padding-left: 0rem; padding-right: 0rem;}

  table .col-fecha  { width: 20%; }
  table .col-titulo { width: 50%; }
  table .col-tags   { width: 30%; }

}

@media (max-width: 1080px) { 

  .tablediv { padding-left: 2rem; padding-right: 2rem;}

  table .col-fecha  { width: 20%; }
  table .col-titulo { width: 50%; }
  table .col-tags   { width: 30%; }

}

@media (max-width: 800px) { 

  .tablediv { padding-left: 0rem; padding-right: 0rem;}

  table .col-fecha  { width: 20%; }
  table .col-titulo { width: 40%; }
  table .col-tags   { width: 30%; }

}

@media (max-width: 580px) {

  .tablediv { padding-left: 0rem; padding-right: 0rem;}

  table .col-fecha  { width: 02%; }
  table .col-titulo { width: 68%; }
  table .col-tags   { width: 30%; }

  .tabs button        { display: none; }
  .tabs button.active { display: flex; }

}

</style>