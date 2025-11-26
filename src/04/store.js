import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStore = defineStore('store', () => {

  // CONTENT                                                                                                                          // LOAD DATA

  const notesIndex                 = ref([])                                                                                          // note index array
  const currentPost                = ref(null)                                                                                        // current loaded post ref
  const notesLoaded                = ref(false)                                                                                       // note loaded boolean ref
  const base                       = import.meta.env.BASE_URL.replace(/\/$/, '')                                                      // base url from index html
  const classMap                   = { desarrollo: 'S6', textos: 'S6', diseño: 'S7', musica: 'S6', juegos: 'S6'}                      // note type custom class map

  const authorsMap = {                                                                                                                // author profile pic and link 

    swim:     { img: '/assets/swim.webp', link: 'https://youtu.be/dQw4w9WgXcQ?si=bz_5AJZx0wCKCccI' },
    kaste:    { img: '/assets/kaste.webp', link: 'https://x.com/octantes' },
    octantes: { img: '/assets/kaste.webp', link: 'https://x.com/octantes' },

  }

  // STATES                                                                                                                           // CHANGE STATES

  const isCentered                 = ref(false)                                                                                       // triple layout (centered content)
  const processing                 = ref(false)                                                                                       // disabled component state
  const showPopup                  = ref(true)                                                                                        // enable popup in navigation
  const navMode                    = ref('table')                                                                                     // navigation view style

  // STATUS                                                                                                                           // BOTTOM BAR

  const btcPrice    = ref('---')                                                                                                      // btc price fetch result
  const currentTime = ref('--:--')                                                                                                    // current time fetch result
  const barContent  = ref('/ '.repeat(300))                                                                                           // progress bar animation content

  let timeInterval  = null                                                                                                            // time update interval
  let btcInterval   = null                                                                                                            // btc update interval

  // NAVIGATION                                                                                                                       // NOTE TABLE

  const tabs                       = [                                                                                                // names for filters 

    { label: 'completo',   value: 'full'       },
    { label: 'diseño',     value: 'diseño'     },
    { label: 'desarrollo', value: 'desarrollo' },
    { label: 'música',     value: 'musica'     },
    { label: 'textos',     value: 'textos'     },
    { label: 'juegos',     value: 'juegos'     },

  ]

  const defaultItemsPerPage        = 8                                                                                                // default number of notes per page
  const centeredItemsPerPage       = 10                                                                                               // number of notes per page when centered
  const itemsPerPage               = computed(() => isCentered.value ? centeredItemsPerPage : defaultItemsPerPage)                    // dynamic number of notes per page
  const totalPages                 = computed(() => { return Math.ceil(noteSortFilter.value.length / itemsPerPage.value) })           // returns total page number
  const activeFilter               = ref('full')                                                                                      // active tab filter name
  const sortKey                    = ref('isoDate')                                                                                   // current sort column
  const sortOrder                  = ref('desc')                                                                                      // current sort order
  const searchQuery                = ref('')                                                                                          // searchbox current search
  const currentPage                = ref(1)                                                                                           // current page number

  // ASCII PRE

    const error404 =

`
<div class="figlet">
  <pre>
██╗  ██╗ ██████╗ ██╗  ██╗
██║  ██║██╔═████╗██║  ██║
███████║██║██╔██║███████║
╚════██║████╔╝██║╚════██║
     ██║╚██████╔╝     ██║
     ╚═╝ ╚═════╝      ╚═╝
  </pre>
</div>
`

  // FUNCTIONS                                                                                                                        // FUNCTION
  
  function setCentered()                { isCentered.value = !isCentered.value }                                                      // toggle centered state
  function setProcessing(val)           { processing.value = val; document.body.style.cursor = val ? 'wait' : '' }                    // apply disabled component state
  function togglePopup()                { showPopup.value = !showPopup.value }                                                        // toggle popup for notifications
  function setSearchQuery(query)        { searchQuery.value = query; currentPage.value = 1 }                                          // apply note search query to table
  function setCurrentPost(metadataSlug) { currentPost.value = metadataSlug }                                                          // apply current post from slug

  function prevPage()                   { if (currentPage.value > 1 && !processing.value) { currentPage.value-- } }                   // reduce current table page
  function nextPage()                   { if (currentPage.value < totalPages.value && !processing.value) { currentPage.value++ } }    // advance current table page
  
  async function fetchPost(slug) {                                                                                                    // fetch post html 

    if (!slug) { setCurrentPost(null); return { html: '', error: null } }
    if (!notesLoaded.value) { await loadNotesIndex() }

    const metadataSlug = notesIndex.value.find(p => p.slug === slug)
    setCurrentPost(metadataSlug || { type: 'textos', slug })
    const post = currentPost.value

    try {

      const fetchPath = post.url || `${base.value}/posts/${post.type || 'textos'}/${slug}/`
      const res = await fetch(fetchPath)
      const html = await res.text()

      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      if (currentPost.value.title && currentPost.value.title !== document.title) { document.title = currentPost.value.title }

      return { html, error: null }

    } catch (e) { console.error(`error fetching slug "${slug}":`, e); return { html: error404, error: e } }
    
  }

  async function loadNotesIndex() {                                                                                                   // fetch full note index 

    if (notesLoaded.value) return notesIndex.value

    try {

      const response = await fetch('/index.json')
      if (!response.ok) throw new Error('no se encontró el index.json')
      notesIndex.value = await response.json()
      notesLoaded.value = true

    } catch (e) { console.error('error cargando índice de notas:', e); notesIndex.value = [] }

    return notesIndex.value

  }

  async function fetchBTC() {                                                                                                         // fetch and update btc price 

    try {

      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      if (!response.ok) throw new Error('la respuesta de la api falló')
      const data = await response.json()
      const price = data.bitcoin.usd
      const formattedPrice = Math.floor((price / 1000) * 10) / 10
      btcPrice.value = `${formattedPrice}K`

    } catch (e) { console.error('error buscando el precio de btc:', e); btcPrice.value = 'error' }

  }

  function fetchTime() {                                                                                                              // fetch and update current time  

    const now = new Date()

    currentTime.value = now.toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    })

  }

  function startStatusUpdates() {                                                                                                     // start bar data updates 

    fetchBTC()  ; btcInterval  = setInterval(fetchBTC,  60000)
    fetchTime() ; timeInterval = setInterval(fetchTime, 15000)
    
  }

  function stopStatusUpdates() {                                                                                                      // stop bar data updates 

    clearInterval(timeInterval)
    clearInterval(btcInterval)

  }

  function navHome(routerInstance) {                                                                                                  // navigates to root and reloads 

    if (processing.value) return
    routerInstance.push({ path: '/' })
    activeFilter.value = 'full'
    if (window.innerWidth > 1080) { isCentered.value = false }
    currentPage.value = 1

  }

  function navSort(key) {                                                                                                             // change sort order 

    if (processing.value) return
    if (sortKey.value === key) { sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc' } 
    else { sortKey.value = key; sortOrder.value = 'asc' }

  }

  function toggleNavMode() {                                                                                                          // toggle navigation view mode
  
    if (processing.value) return
    navMode.value = navMode.value === 'table' ? 'gallery' : 'table'

  }

  function setActiveFilter(routerInstance, filter) {                                                                                  // apply current table filter 

    activeFilter.value = filter
    currentPage.value = 1

    if (filter !== 'full' && !isCentered.value) { isCentered.value = true }

    if (routerInstance && !currentPost.value) {

      const isNote = routerInstance.currentRoute.value.params.slug
      if (isNote) return

      let path = (filter === 'full') ? `/` : `/${filter}`
      if (routerInstance.currentRoute.value.path !== path) { routerInstance.push({ path: path }) }

    }

  }

  function changeFilter(routerInstance, direction) {                                                                                  // advance or reduce filters 

    if (processing.value) return
    
    const currentTabValue = activeFilter.value
    const currentTabIndex = tabs.findIndex(tab => tab.value === currentTabValue)
    const numTabs = tabs.length

    for (let i = 1; i <= numTabs; i++) {

      let nextIndex = (currentTabIndex + direction * i % numTabs + numTabs) % numTabs
      const nextTabValue = tabs[nextIndex].value

      if (emptyFilter(nextTabValue)) { setActiveFilter(routerInstance, nextTabValue); return }

    }

  }

  function emptyFilter(type) {                                                                                                        // check if the filter is empty 

    if (type === 'full') return true
    const actualType = type
    
    return notesIndex.value.some(note => note.type === actualType)

  }

  const computedNoteComp  = computed(() => {                                                                                          // compute vuecomp if it exists 

    if (currentPost.value) {
      const customVuecomp = currentPost.value.vuecomp
      if (customVuecomp) { return customVuecomp } 
    }

    return null

  })

  const computedFullscreen = computed(() => {                                                                                         // return fullscreen component if exists 
    
    if (currentPost.value && currentPost.value.fullscreen) { return currentPost.value.fullscreen } return null

  })

  const computedNoteClass = computed(() => {                                                                                          // compute class for html post 

    if (currentPost.value) {
      const typeKey = currentPost.value.type
      return classMap[typeKey] || 'S6' 
    }

    return 'S6' 

  })

  const computedPortada   = computed(() => {                                                                                          // compute data for portada 

    const metadata = currentPost.value || {}
    let rawHandle = metadata.handle || 'kaste'
    const handles = Array.isArray(rawHandle) ? rawHandle : [rawHandle]
    
    const postAuthors = handles.map(h => { 

      const handleName = String(h).replace(/^@/, '')
      const authorInfo = authorsMap[handleName] || authorsMap['kaste']
      
      return {

        handle: handleName,
        img: authorInfo.img,
        link: authorInfo.link,
        full: h === handles[0], 
        date: h === handles[0] ? metadata.date || '2026' : null,

      }

    })

    return { 

      title: metadata.title || 'bienvenido a octantes.net!',
      description: metadata.description || 'toca una nota de la tabla para cargarla y empezar a leer, o tambien podes filtrar segun el tipo de post que queres encontrar en la pagina',
      authors: postAuthors,
      portada: metadata.portada || '',

    }
    
  })

  const loadLatestPost    = computed(() => {                                                                                          // compute latest post 

    if (notesIndex.value.length === 0) return { title: 'cargando...', url: '' }
    const latest = notesIndex.value[0]
    const cleanUrl = latest.url.replace(/^\/posts/, '') 

    return { title: latest.title, url: cleanUrl }

  })

  const noteSortFilter    = computed(() => {                                                                                          // compute table filter 

    if (!notesIndex.value || notesIndex.value.length === 0) { return [] }
    const filterType = activeFilter.value
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

  const paginatedNotes    = computed(() => {                                                                                          // compute table pages 

    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value

    return noteSortFilter.value.slice(start, end)

  })

  return { 

    /* NOTES VAR */ notesIndex, currentPost, notesLoaded, base,
    /* NOTES FUN */ fetchPost, loadNotesIndex, setCurrentPost,
    /* NOTES COM */ computedNoteComp, computedFullscreen, computedNoteClass, computedPortada, loadLatestPost,
    /* STATS VAR */ btcPrice, currentTime, barContent,
    /* STATS FUN */ startStatusUpdates, stopStatusUpdates,
    /* VIEWS VAR */ isCentered, processing, showPopup, navMode,
    /* VIEWS FUN */ setCentered, setProcessing, togglePopup, toggleNavMode,
    /* NAVIG VAR */ itemsPerPage, totalPages, activeFilter, sortKey, sortOrder, searchQuery, currentPage, tabs,
    /* NAVIG FUN */ prevPage, nextPage, setActiveFilter, setSearchQuery, navHome, navSort, changeFilter, emptyFilter,
    /* NAVIG COM */ noteSortFilter, paginatedNotes,

  }

})