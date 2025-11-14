import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('store', () => {

  const processing   = ref(false)                                                                                                     // disabled component state
  const isCentered   = ref(false)                                                                                                     // triple layout (centered note)
  const searchQuery  = ref('')                                                                                                        // searchbox current search
  const activeFilter = ref('full')                                                                                                    // active tab filter

  const notesIndex   = ref([])                                                                                                        // note index array
  const notesLoaded  = ref(false)                                                                                                     // loaded index flag

  // acciones

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

  const loadLatestPost = computed(() => {

    if (notesIndex.value.length === 0) return { title: 'cargando...', url: '' }
    const latest = notesIndex.value[0]
    const cleanUrl = latest.url.replace(/^\/posts/, '') 

    return { title: latest.title, url: cleanUrl }

  })

  function toggleView()       { isCentered.value = !isCentered.value }
  function setProcessing(val) { processing.value = val }
  function setSearchQuery(query)   { searchQuery.value = query }
  function setActiveFilter(filter) { activeFilter.value = filter }

  return {

    /* STATES     */ processing, setProcessing,
    /* LAYOUT     */ isCentered, toggleView,
    /* NAVIGATION */ searchQuery, activeFilter, setSearchQuery, setActiveFilter,
    /* DATA       */ notesIndex, notesLoaded, loadNotesIndex, loadLatestPost

  }

})