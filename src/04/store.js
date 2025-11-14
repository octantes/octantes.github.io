import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStore = defineStore('store', () => {

  // STATES

  const processing   = ref(false)                                                                                                     // disabled component state
  const isCentered   = ref(false)                                                                                                     // triple layout (centered note)
  const searchQuery  = ref('')                                                                                                        // searchbox current search
  const activeFilter = ref('full')                                                                                                    // active tab filter
  const notesIndex   = ref([])                                                                                                        // note index array
  const notesLoaded  = ref(false)                                                                                                     // loaded index flag

  // NAVIGATION

  const defaultItemsPerPage        = 8                                                                                                // default number of notes per page
  const centeredItemsPerPage       = 10                                                                                               // number of notes per page when centered
  const sortKey                    = ref('isoDate')                                                                                   // current sort column
  const sortOrder                  = ref('desc')                                                                                      // current sort order
  const currentPage                = ref(1)                                                                                           // current page number
  const itemsPerPage               = computed(() => isCentered.value ? centeredItemsPerPage : defaultItemsPerPage)                    // dynamic number of notes per page
  const totalPages                 = computed(() => { return Math.ceil(noteSortFilter.value.length / itemsPerPage.value) })           // returns total page number

  // acciones

  const noteSortFilter = computed(() => { 

    if (!notesIndex.value || notesIndex.value.length === 0) { return [] }

    const filterType = activeFilter.value === 'posts' ? 'note' : activeFilter.value
    let filtered = activeFilter.value === 'full' ? notesIndex.value : notesIndex.value.filter(note => note.type === filterType)
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
        case 'title': valA = a.title.toLowerCase()          ; valB = b.title.toLowerCase()          ; break
        case 'tags':  valA = a.tags[0]?.toLowerCase() || '' ; valB = b.tags[0]?.toLowerCase() || '' ; break
        default:      valA = new Date(a.isoDate)            ; valB = new Date(b.isoDate)            ; break
      }

      let comparison = 0
      if (valA > valB)      comparison =  1
      else if (valA < valB) comparison = -1

      return sortOrder.value === 'asc' ? comparison : -comparison

    })

  })

  async function loadNotesIndex() {

    if (notesLoaded.value) return notesIndex.value

    try {

      const response = await fetch('/index.json')
      if (!response.ok) throw new Error('no se encontró el index.json')
      notesIndex.value = await response.json()
      notesLoaded.value = true

    } catch (e) { console.error('error cargando índice de notas:', e); notesIndex.value = [] }

    return notesIndex.value

  }

  const paginatedNotes = computed(() => {                                                                                              
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return noteSortFilter.value.slice(start, end)
  })

  const loadLatestPost = computed(() => {

    if (notesIndex.value.length === 0) return { title: 'cargando...', url: '' }
    const latest = notesIndex.value[0]
    const cleanUrl = latest.url.replace(/^\/posts/, '') 

    return { title: latest.title, url: cleanUrl }

  })

  function toggleView()       { isCentered.value = !isCentered.value }
  function setProcessing(val) { processing.value = val }
  function setSearchQuery(query)   { searchQuery.value = query; currentPage.value = 1 }
  function setActiveFilter(filter) { activeFilter.value = filter }
  function prevPage()           { if (currentPage.value > 1 && !processing.value) { currentPage.value-- } }
  function nextPage()           { if (currentPage.value < totalPages.value && !processing.value) { currentPage.value++ } }
  
  function navSort(key) {
    if (processing.value) return
    if (sortKey.value === key) { 
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc' 
    } else { 
        sortKey.value = key
        sortOrder.value = 'asc' 
    }
    currentPage.value = 1 // resetear página al ordenar
  }

  watch(totalPages, (newTotalPages) => { if (currentPage.value > newTotalPages || newTotalPages === 0) { currentPage.value = 1 } })

  return {

    /* STATES     */ processing, setProcessing,
    /* LAYOUT     */ isCentered, toggleView,
    /* NAVIGATION */ searchQuery, activeFilter, setSearchQuery, setActiveFilter, sortKey, sortOrder, currentPage, totalPages, paginatedNotes, noteSortFilter, prevPage, nextPage, navSort,
    /* DATA       */ notesIndex, notesLoaded, loadNotesIndex, loadLatestPost

  }

})