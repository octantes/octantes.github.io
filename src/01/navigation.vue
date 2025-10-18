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

function setSearchQuery(tag) { if (!props.disabled) { searchQuery.value = tag } }

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
            <td class="tagcol">
              <button v-for="tag in note.tags" :key="tag" class="tagfilter" @click.stop="setSearchQuery(tag)" :disabled="props.disabled"> {{ tag }} </button>
            </td>
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