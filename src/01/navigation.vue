<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const emit = defineEmits(['toggle-view'])                                                                                             // emit centered view toggle
const props = defineProps({ disabled: Boolean, isCentered: Boolean })                                                                 // layout states
const router = useRouter()                                                                                                            // handles note open
const route = useRoute()                                                                                                              // current url
const notes = ref([])                                                                                                                 // full note array
const base = import.meta.env.BASE_URL.replace(/\/$/, '')                                                                              // url base
const activeFilter = ref('full')                                                                                                      // active category
const sortKey = ref('isoDate')                                                                                                        // current order col
const sortOrder = ref('desc')                                                                                                         // current sort order
const itemsPerPage = 8                                                                                                                // number of notes
const currentPage = ref(1)                                                                                                            // current page
const currentTagline = ref('')
const searchQuery = ref('')

const totalPages = computed(() => { return Math.ceil(noteSortFilter.value.length / itemsPerPage) })                                   // returns pages in filters

const taglines = [ 'tejiendo hechizos', 'abriendo ventanas a universos alternativos' ]                                                // random taglines

const tabs = [                                                                                                                        // names for filters 
  { label: 'completo', value: 'full' },
  { label: 'textos', value: 'posts' },
  { label: 'diseño', value: 'design' },
  { label: 'desarrollo', value: 'dev' },
  { label: 'música', value: 'music' }
]

const paginatedNotes = computed(() => {                                                                                               // returns current page notes 
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return noteSortFilter.value.slice(start, end)
})

const noteSortFilter = computed(() => {                                                                                               // applies filters and order to list 

  const filterType = activeFilter.value === 'posts' ? 'note' : activeFilter.value
  let filtered = activeFilter.value === 'full' ? notes.value : notes.value.filter(note => note.type === filterType)
  const query = searchQuery.value.toLowerCase().trim()

  if (query) {
    filtered = filtered.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.description.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query)) ||
      note.date.includes(query)
    )
  }

  return [...filtered].sort((a, b) => {
    let valA, valB

    switch (sortKey.value) {

      case 'title':
        valA = a.title.toLowerCase()
        valB = b.title.toLowerCase()
        break

      case 'tags':
        valA = a.tags[0]?.toLowerCase() || ''
        valB = b.tags[0]?.toLowerCase() || ''
        break
        
      default:
        valA = new Date(a.isoDate)
        valB = new Date(b.isoDate)
        break

    }

    let comparison = 0
    if (valA > valB) comparison = 1
    else if (valA < valB) comparison = -1
    return sortOrder.value === 'asc' ? comparison : -comparison

  })
})

function toggleLayout() { emit('toggle-view'); }
function prevPage() { if (currentPage.value > 1 && !props.disabled) { currentPage.value-- } }                                         // changes to previous page
function nextPage() { if (currentPage.value < totalPages.value && !props.disabled) { currentPage.value++ } }                          // changes to next page
function openNote(type, slug) { if (!props.disabled) router.push({ path: `/${type}/${slug}` }) }                                      // opens note in content

function navFilter(direction) {                                                                                                       // changes filter manually 
  if (props.disabled) return
  const currentIndex = tabs.findIndex(tab => tab.value === activeFilter.value)
  const newIndex = (currentIndex + direction + tabs.length) % tabs.length
  activeFilter.value = tabs[newIndex].value
}

function navSort(key) {                                                                                                               // changes sorting column 
  if (props.disabled) return
  if (sortKey.value === key) { sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc' } 
  else { sortKey.value = key; sortOrder.value = 'asc' }
}

onMounted(async () => {                                                                                                               // searches notes on mount 

  const randomIndex = Math.floor(Math.random() * taglines.length)
  currentTagline.value = taglines[randomIndex]

  try {

    const response = await fetch(`${base}/index.json`)
    if (!response.ok) throw new Error(`http error ${response.status}`)
    notes.value = await response.json()

  } catch (e) { console.error('error cargando índice de notas:', e); notes.value = [] }

})

watch([activeFilter, sortKey, sortOrder, searchQuery], () => { currentPage.value = 1 })                                               // resets pagination

</script>

<template>
  
  <div class="navigation">

    <div class="banner" :class="{'bcentered': isCentered}">

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

      <button @click="navFilter(-1)" :disabled="props.disabled"> < </button>

      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.value" @click="activeFilter = tab.value" :class="{ active: activeFilter === tab.value }" :disabled="props.disabled" > {{ tab.label }} </button>
      </div>

      <button @click="navFilter(+1)" :disabled="props.disabled"> > </button>

    </div>

    <div class="tablediv">

      <table>

        <colgroup>
          <col class="col-fecha">
          <col class="col-titulo">
          <col class="col-tags">
        </colgroup>

        <thead>
          <tr>
            <th @click="navSort('isoDate')" :class="{ active: sortKey === 'isoDate' }" :data-order="sortOrder">fecha</th>
            <th @click="navSort('title')" :class="{ active: sortKey === 'title' }" :data-order="sortOrder">título</th>
            <th @click="navSort('tags')" :class="{ active: sortKey === 'tags' }" :data-order="sortOrder">tags</th>
          </tr>
        </thead>

        <tbody>

          <tr v-for="note in paginatedNotes" 
              :key="note.slug" 
              @click="openNote(note.type, note.slug)" 
              :class="{ active: route.params.slug === note.slug, disabled: props.disabled }" >
            <td>{{ note.date }}</td>
            <td>{{ note.title }}</td>
            <td>{{ note.tags.join(', ') }}</td>
          </tr>

          <tr v-if="noteSortFilter.length === 0 && searchQuery" class="no-results">
            <td colspan="3">no hay notas que coincidan con "{{ searchQuery }}"</td>
          </tr>

          <tr v-for="i in (itemsPerPage - (noteSortFilter.length > 0 ? paginatedNotes.length : (searchQuery ? 1 : 0)))" 
              :key="`placeholder-${i}`" class="bodyfill">
            <td colspan="3">&nbsp;</td>
          </tr>
          
        </tbody>

        <tfoot>
          <tr>
            <td :colspan="3">

              <div class="pagecontrols">
                <button class="navbutton" @click="prevPage" :disabled="currentPage === 1 || props.disabled"> < </button>
                <span>{{ currentPage }} / {{ totalPages || 1 }}</span>
                <button class="navbutton" @click="nextPage" :disabled="currentPage >= totalPages || props.disabled"> > </button>
              </div>

            </td>
          </tr>
        </tfoot>
        
      </table>

    </div>
    
    <div class="layoutcontrol">
      <input class="searchbox" type="text" v-model="searchQuery" placeholder="buscar..." :disabled="props.disabled" />
      <!--<button @click="toggleLayout">centrar</button>-->
    </div>

    <span class="tagline" v-if="currentTagline">{{ currentTagline }}</span>

  </div>

</template>

<style>

@media (max-width: 1080px) { .layoutcontrol button { display: none; }  }
@media (max-width: 580px) { .tabs button { display: none; } .tabs button.active { display: flex; } }

.navigation {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #1B1C1C;
  color: #D8DADE;
  padding: 3rem 2rem 2rem 2rem;
  border: 1px solid #AAABAC10;
  border-radius: 5px;
  gap: 1rem;
}

.banner { display: flex; flex-direction: column; font-size: .8vw; width: 100%; overflow: hidden; align-items: center; user-select: none; }
.banner pre { 
  background: linear-gradient(125deg, #8AB6BB, #986C98); 
  margin: 0;
  overflow: visible; 
  font-family: monospace; 
  color: #986C98; 
  -webkit-background-clip: text; 
  -webkit-text-fill-color: transparent; 
  background-clip: text;
  flex-shrink: 0;
}

.banner.bcentered { font-size: .5vw; }

.tagline {
  background: linear-gradient(125deg, #8AB6BB, #986C98);
  font-size: clamp(16px, .9vw, 24px);
  background-clip: text;
  font-style: italic;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-top: auto;
}

.layoutcontrol { width: 100%; padding-left: 4rem; padding-right: 4rem;}
.layoutcontrol button { 
    background-color: #1B1C1C;
    padding: 0.5rem 1rem;
    border: none;
    box-shadow: inset 0 0 0 1px #AAABAC25;
    color: #AAABAC;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.25s ease;
}

.layoutcontrol button:hover { background-color: #AAABAC25; color: #D8DADE; }
.layoutcontrol button:active { background-color: #AAABAC25; color: #D8DADE; box-shadow: inset 0 0 0 1px #AAABAC25; border-radius: 5px; }
.layoutcontrol button:disabled { cursor: not-allowed; opacity: 0.25; }

.searchbox { 
    background-color: transparent;
    padding: 0.5rem 1rem;
    width: 100%;
    border: none;
    box-shadow: inset 0 0 0 1px #AAABAC10;
    color: #AAABAC;
    font-style: italic;
    cursor: text;
    border-radius: 5px;
    text-align: center;
    transition: background-color 0.25s ease, box-shadow 0.25s ease;
}

.searchbox:focus { background-color: #986C9825; color: #D8DADE; box-shadow: inset 0 0 0 1px #AAABAC25; outline: none; }

.no-results td { text-align: center; color: #AAABAC; font-style: italic; opacity: 0.5; }

.filters                 { display: flex; align-items: center; gap: 1rem; width: 100%; user-select: none; justify-content: center; margin-top: .5rem;                                                           }
.filters button          { background-color: transparent; color: #AAABAC; padding: 0.5rem 1rem; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.25s ease; }
.filters button:hover    { background-color: #AAABAC25; color: #D8DADE;                                                                                                                   }
.filters button.active   { background-color: #8AB6BB25; color: #D8DADE; box-shadow: inset 0 0 0 1px #AAABAC25;                                                                          }
.filters button:disabled { opacity: 0.25; cursor: not-allowed;                                                                                                                                }
.tabs                    { display: flex; gap: 1rem; overflow: hidden; }

.col-fecha       { width: 20%; }
.col-titulo      { width: 50%; }
.col-tags        { width: 30%; }

.tablediv                           { padding-left: 4rem; padding-right: 4rem;                                                                            }
table                               { width: 100%; border-collapse: separate; border-spacing: 0 0.5rem; user-select: none; table-layout: fixed;           }
thead tr                            { box-shadow: inset 0 0 0 1px #AAABAC25; border-radius: 5px;                                                        }
th, td                              { padding: 0.5rem 1rem; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;             }
th                                  { color:#AAABAC; font-weight: normal; cursor: pointer; position: relative; transition: background-color 0.25s ease; }
th:hover                            { background-color: #AAABAC25; color: #D8DADE;                                                                    }
th.active                           { background-color: #986C9825; color:#D8DADE; border-left: 5px;                                                   }
th:first-child                      { border-top-left-radius: 5px; border-bottom-left-radius: 5px;                                                        }
th:last-child                       { border-top-right-radius: 5px; border-bottom-right-radius: 5px;                                                      }
th.active::after                    { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);                                             }
th.active[data-order="asc"]::after  { content: '↑'; }
th.active[data-order="desc"]::after { content: '↓'; }
tbody tr                            { cursor: pointer;                    }
tbody tr:hover                      { color: #986C9899;                 }
tbody tr.active                     { color: #8AB6BB;                   }
tbody tr.disabled                   { opacity: 0.25; cursor: not-allowed; }
.bodyfill                           { pointer-events: none; opacity: 0;   }
tfoot td                            { padding-top: 1rem; padding-bottom: 0; width: 100%; text-align: center; }

.pagecontrols      { display: flex; justify-content: center; align-items: center; gap: 1rem; user-select: none; }
.pagecontrols span { color: #AAABAC; }

.navbutton { 
  font-size: 1.5rem;
  padding: 0rem .5rem;
  background-color: transparent;
  color: #986C98;
  border: none;
  box-shadow: inset 0 0 0 1px #986C9825;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.25s ease;
}

.navbutton:hover { background-color: #AAABAC25; color: #986C98; box-shadow: inset 0 0 0 1px #986C9825; }
.navbutton:disabled { opacity: 0.25; cursor: not-allowed; }

</style>