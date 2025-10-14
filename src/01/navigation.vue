<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({ disabled: Boolean, isCentered: Boolean })                                            // layout states
const router = useRouter()                                                                                       // handles note open
const route = useRoute()                                                                                         // current url
const notes = ref([])                                                                                            // full note array
const base = import.meta.env.BASE_URL.replace(/\/$/, '')                                                         // url base
const activeFilter = ref('full')                                                                                 // active category
const sortKey = ref('isoDate')                                                                                   // current order col
const sortOrder = ref('desc')                                                                                    // current sort order
const itemsPerPage = 8                                                                                           // number of notes
const currentPage = ref(1)                                                                                       // current page
const totalPages = computed(() => { return Math.ceil(noteSortFilter.value.length / itemsPerPage) })              // returns pages in filters

const tabs = [                                                                                                   // names for filters 
  { label: 'todo', value: 'full' },
  { label: 'notas', value: 'posts' },
  { label: 'diseño', value: 'design' },
  { label: 'código', value: 'dev' },
  { label: 'música', value: 'music' }
]

function prevPage() { if (currentPage.value > 1 && !props.disabled) { currentPage.value-- } }                    // changes to previous page
function nextPage() { if (currentPage.value < totalPages.value && !props.disabled) { currentPage.value++ } }     // changes to next page
function openNote(type, slug) { if (!props.disabled) router.push({ path: `/${type}/${slug}` }) }                 // opens note in content

const paginatedNotes = computed(() => {                                                                          // returns current page notes 
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return noteSortFilter.value.slice(start, end)
})

const noteSortFilter = computed(() => {                                                                          // applies filters and order to list 

  const filterType = activeFilter.value === 'posts' ? 'note' : activeFilter.value
  const filtered = activeFilter.value === 'full' ? notes.value : notes.value.filter(note => note.type === filterType)

  return [...filtered].sort((a, b) => {
    let valA, valB

    switch (sortKey.value) {

      case 'title':
        valA = a.title.toLowerCase()
        valB = b.title.toLowerCase()
        break

      case 'description':
        valA = a.description.toLowerCase()
        valB = b.description.toLowerCase()
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

function navFilter(direction) {                                                                                  // changes filter manually 
  if (props.disabled) return
  const currentIndex = tabs.findIndex(tab => tab.value === activeFilter.value)
  const newIndex = (currentIndex + direction + tabs.length) % tabs.length
  activeFilter.value = tabs[newIndex].value
}

function navSort(key) {                                                                                          // changes sorting column 
  if (props.disabled) return
  if (sortKey.value === key) { sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc' } 
  else { sortKey.value = key; sortOrder.value = 'asc' }
}

onMounted(async () => {                                                                                          // searches notes on mount 
  try {
    const response = await fetch(`${base}/index.json`)
    if (!response.ok) throw new Error(`http error ${response.status}`)
    notes.value = await response.json()
  } catch (e) {
    console.error('error cargando índice de notas:', e)
    notes.value = []
  }
})

watch([activeFilter, sortKey, sortOrder], () => { currentPage.value = 1 })                                       // resets pagination

</script>

<template>

  <div class="navigation">

    <div class="filters">

      <button @click="navFilter(-1)" :disabled="props.disabled"> < </button>

      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.value" @click="activeFilter = tab.value" :class="{ active: activeFilter === tab.value }" :disabled="props.disabled" > {{ tab.label }} </button>
      </div>

      <button @click="navFilter(+1)" :disabled="props.disabled"> > </button>

    </div>

    <div class="tablediv">

      <table>

        <thead>
          <tr>
            <th @click="navSort('isoDate')" :class="{ active: sortKey === 'isoDate' }" :data-order="sortOrder">fecha</th>
            <th @click="navSort('title')" :class="{ active: sortKey === 'title' }" :data-order="sortOrder">título</th>
            <th @click="navSort('description')" :class="{ active: sortKey === 'description' }" :data-order="sortOrder">descripción</th>
            <th @click="navSort('tags')" :class="{ active: sortKey === 'tags' }" :data-order="sortOrder">tags</th>
          </tr>
        </thead>

        <tbody>

          <tr v-for="note in paginatedNotes" :key="note.slug" @click="openNote(note.type, note.slug)" :class="{ active: route.params.slug === note.slug, disabled: props.disabled }" >
            <td>{{ note.date }}</td>
            <td>{{ note.title }}</td>
            <td>{{ note.description.split(',')[0] }}</td>
            <td>{{ note.tags.join(', ') }}</td>
          </tr>

          <tr v-if="paginatedNotes.length < itemsPerPage" v-for="i in (itemsPerPage - paginatedNotes.length)" :key="`placeholder-${i}`" class="bodyfill">
            <td colspan="4">&nbsp;</td>
          </tr>

        </tbody>

        <tfoot>
          <tr>
            <td :colspan="4">
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

    <div v-if="!isCentered" class="contenido-extra">
      <p>lo que tenga este if desaparece si cambiamos layout</p>
    </div>

  </div>

</template>

<style>

.navigation {
  display: flex;
  flex-direction: column;
  background-color: #1B1C1C;
  color: #D8DADE;
  padding: 2rem;
  border: 1px solid #AAABAC25;
  border-radius: 5px;
  gap: 1rem;
}

.filters                 { display: flex; align-items: center; gap: 1rem; width: 100%; user-select: none;                                                                                     }
.filters button          { background-color: transparent; color: #AAABAC; padding: 0.5rem 1rem; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.25s ease; }
.filters button:hover    { background-color: #AAABAC25; color: #D8DADE;                                                                                                                   }
.filters button.active   { background-color: #8AB6BB25; color: #D8DADE; box-shadow: inset 0 0 0 1px #AAABAC25;                                                                          }
.filters button:disabled { opacity: 0.25; cursor: not-allowed;                                                                                                                                }
.tabs                    { display: flex; gap: 1rem; overflow: hidden; flex-grow: 1; }
.tabs button             { flex-grow: 1;                                             }

table                               { width: 100%; border-collapse: separate; border-spacing: 0 0.5rem; user-select: none; table-layout: fixed; }
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
tfoot td                            { padding: 1rem; width: 100%; text-align: center; }

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