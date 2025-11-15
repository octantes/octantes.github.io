import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStore = defineStore('store', () => {

  // DATA                                                                                                                             // LOAD NOTES

  const notesIndex                 = ref([])                                                                                          // note index array
  const notesLoaded                = ref(false)                                                                                       // loaded index flag
  const currentPost                = ref(null)                                                                                        // current post ref
  const base                       = import.meta.env.BASE_URL.replace(/\/$/, '')                                                      // base url

  const classMap = { dev: 'S6', note: 'S6', design: 'S7', music: 'S6' }                                                               // note type custom class map

  // STATES                                                                                                                           // CHANGE STATES

  const processing                 = ref(false)                                                                                       // disabled component state
  const isCentered                 = ref(false)                                                                                       // triple layout (centered note)

  // NAVIGATION                                                                                                                       // TABLE

  const defaultItemsPerPage        = 8                                                                                                // default number of notes per page
  const centeredItemsPerPage       = 10                                                                                               // number of notes per page when centered
  const itemsPerPage               = computed(() => isCentered.value ? centeredItemsPerPage : defaultItemsPerPage)                    // dynamic number of notes per page
  const activeFilter               = ref('full')                                                                                      // active tab filter name
  const sortKey                    = ref('isoDate')                                                                                   // current sort column
  const sortOrder                  = ref('desc')                                                                                      // current sort order
  const searchQuery                = ref('')                                                                                          // searchbox current search
  const currentPage                = ref(1)                                                                                           // current page number
  const totalPages                 = computed(() => { return Math.ceil(noteSortFilter.value.length / itemsPerPage.value) })           // returns total page number

  // FUNCTIONS                                                                                                                        // FUNCTION

  function toggleView()            { isCentered.value = !isCentered.value }
  function setProcessing(val)      { processing.value = val; document.body.style.cursor = val ? 'wait' : '' }
  function setSearchQuery(query)   { searchQuery.value = query; currentPage.value = 1 }
  function setActiveFilter(filter) { activeFilter.value = filter; currentPage.value = 1 }
  function prevPage()              { if (currentPage.value > 1 && !processing.value) { currentPage.value-- } }
  function nextPage()              { if (currentPage.value < totalPages.value && !processing.value) { currentPage.value++ } }

  function setCurrentPost(postMetadata) { currentPost.value = postMetadata }

  async function fetchPost(slug) {

    if (!slug) { setCurrentPost(null); return { html: '', error: null } }
    if (!notesLoaded.value) { await loadNotesIndex() }

    const postMetadata = notesIndex.value.find(p => p.slug === slug)
    setCurrentPost(postMetadata || { type: 'note', slug })
    const post = currentPost.value

    try {

      const fetchPath = post.url || `${base.value}/posts/${post.type || 'note'}/${slug}/`
      const res = await fetch(fetchPath)
      const html = await res.text()

      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      if (currentPost.value.title && currentPost.value.title !== document.title) { document.title = currentPost.value.title }

      return { html, error: null }

    } catch (e) { console.error(`error fetching slug "${slug}":`, e); return { html: `<p>error cargando la nota</p>`, error: e } }
    
  }

  const computedNoteComp = computed(() => {                                                                                               // compute vuecomp if it exists 

    if (currentPost.value) {
      const customVuecomp = currentPost.value.vuecomp
      if (customVuecomp) { return customVuecomp } 
    }

    return null

  })

  const computedNoteClass = computed(() => {                                                                                              // compute class for html post 

    if (currentPost.value) {
      const typeKey = currentPost.value.type
      return classMap[typeKey] || 'S6' 
    }

    return 'S6' 

  })

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

  function navSort(key) {

    if (processing.value) return
    if (sortKey.value === key) { sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc' } 
    else { sortKey.value = key; sortOrder.value = 'asc' }
    currentPage.value = 1

  }

  return {

    /* STATES     */ processing, setProcessing,
    /* LAYOUT     */ isCentered, toggleView,
    /* NAVIGATION */ searchQuery, activeFilter, setSearchQuery, setActiveFilter, sortKey, sortOrder, currentPage, totalPages, paginatedNotes, noteSortFilter, prevPage, nextPage, navSort, itemsPerPage,
    /* DATA       */ fetchPost, notesIndex, notesLoaded, loadNotesIndex, loadLatestPost, currentPost, setCurrentPost, base, computedNoteComp, computedNoteClass

  }

})