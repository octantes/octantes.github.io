import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { CONTACT_EMAIL, POPUP_LINK, SECTIONS, STATUS, STATUSES } from '@/04/site-config.js'
import { sectionOf, labelOf, pageOf, pathOf, headFor, applyHead } from '@/04/pages.js'
import { DICT } from '@/04/dict.js'
import router from '@/04/router.js'

export const useStore = defineStore('store', () => {

  const tabs                       = computed(() => SECTIONS.map(({ id }) => ({ label: labelOf(id, lang.value), value: id })))    // names for filters 

  const authorsMap = {                                                                                                                // author profile pic and link 

    swim:     { img: '/assets/swim.webp',  link: 'https://youtu.be/dQw4w9WgXcQ?si=bz_5AJZx0wCKCccI' },
    kaste:    { img: '/assets/kaste.webp', link: 'https://x.com/octantes' },
    octantes: { img: '/assets/kaste.webp', link: 'https://x.com/octantes' },

  }

  // LENGUAJE Y DICCIONARIO

  function detectLang() {
    var nav = (navigator.language || navigator.languages?.[0] || '').toLowerCase().split('-')[0]
    return nav === 'es' ? 'es' : 'en'
  }

  const lang = ref(localStorage.getItem('lang') || detectLang())
  document.documentElement.lang = lang.value

  function setLang(value) {
    lang.value = value
    localStorage.setItem('lang', value)
    document.documentElement.lang = value
  }

  function toggleLang() {
    setLang(lang.value === 'es' ? 'en' : 'es')
    const route = router.currentRoute.value
    router.replace({ path: pathOf(pageOf(route), lang.value), query: route.query, hash: route.hash })
  }

  router.afterEach(to => { const language = pageOf(to).lang; if (language && language !== lang.value) setLang(language) })

  const t = computed(() => DICT[lang.value])

  const error404   =                                                                                                                  // div for content miss 
`
<div class="figlet">
  <pre aria-hidden="true">
██╗  ██╗ ██████╗ ██╗  ██╗
██║  ██║██╔═████╗██║  ██║
███████║██║██╔██║███████║
╚════██║████╔╝██║╚════██║
     ██║╚██████╔╝     ██║
     ╚═╝ ╚═════╝      ╚═╝
  </pre>
</div>
`

  // CONTENT                                                                                                                          // LOAD DATA

  const notesIndex                 = ref([])                                                                                          // note index array
  const currentPost                = ref(null)                                                                                        // current loaded post ref
  const notesLoaded                = ref(false)                                                                                       // note loaded boolean ref
  let   notesLoadingPromise        = null                                                                                               // in-flight guard for loadNotesIndex
  const base                       = import.meta.env.BASE_URL.replace(/\/$/, '')                                                      // base url from index html
  const classMap                   = { desarrollo: 'nota nota-verso', textos: 'nota nota-verso', diseño: 'nota-medios', musica: 'nota nota-verso', juegos: 'nota nota-verso'}                      // note type custom class map
  const postHtmlCache              = ref({})

  // STATES                                                                                                                           // CHANGE STATES

  const processing                 = ref(false)                                                                                       // navigation lock state
  const popLink                    = ref(POPUP_LINK)                                                                                  // popup go link
  const showPopup                  = ref(localStorage.getItem('popup_seen') !== popLink.value)                                        // enable popup in navigation
  const popString                  = computed(() => t.value.portada.popupText)                                                      // popup text
  const mailtoDir                  = ref(CONTACT_EMAIL)                                                                               // contact direction
  const userStatus                 = computed(() => {                                                                                   // current user status (lang-aware)

    const entry = STATUSES[STATUS] || Object.values(STATUSES)[0]
    return { emoji: entry.emoji, message: entry[lang.value] || entry.es || entry.emoji }

  })

  // SUBS                                                                                                                             // SUBSCRIPTION HANDLING

  const subEmail                   = ref('')                                                                                          // email
  const subHoney                   = ref('')                                                                                          // bot honeypot
  const subMessage                 = ref(t.value.subscribe.placeholder)                                                                 // status message
  const subState                   = ref('default')                                                                                   // status states
  const subDone                    = ref((parseInt(localStorage.getItem('subscription_count') || '0', 10) || 0) > 0)                  // user already subscribed
  const emailRegex                 = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/                                             // email regex
  const subResetTime               = 3000                                                                                             // submit reset timer
  
  // STATUS                                                                                                                           // BOTTOM BAR

  let   timeInterval = null                                                                                                           // time update interval
  let   btcInterval  = null                                                                                                           // btc update interval
  const btcPrice     = ref(null)                                                                                                      // btc price fetch result
  const currentTime  = ref('--:--')                                                                                                   // current time fetch result
  const barContent   = ref('/ '.repeat(300))                                                                                          // progress bar animation content

  // NAVIGATION                                                                                                                       // NOTE TABLE

  const activeFilter               = ref('portal')                                                                                    // active tab filter name
  const sortKey                    = ref('isoDate')                                                                                   // current sort column
  const sortOrder                  = ref('desc')                                                                                      // current sort order
  const aboutSection               = ref(null)
  let landed                       = false
  const searchQuery                = ref('')                                                                                          // searchbox current search

  // FUNCTIONS ----------------------------------------------------------------------------------------------------------------------------------------------------------

  function setProcessing(val)           { processing.value = val; document.body.style.cursor = val ? 'wait' : '' }                    // lock or unlock navigation
  function togglePopup()                { showPopup.value = !showPopup.value; if (!showPopup.value) localStorage.setItem('popup_seen', popLink.value) } // toggle popup for notifications
  function setSearchQuery(query)        { searchQuery.value = query }                                          // apply note search query to table
  function setCurrentPost(metadataSlug) { currentPost.value = metadataSlug }                                                          // apply current post from slug

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

    clearInterval(btcInterval)  ; clearInterval(timeInterval)
    fetchBTC()  ; btcInterval  = setInterval(fetchBTC,  60000)
    fetchTime() ; timeInterval = setInterval(fetchTime, 15000)
    
  }

  function stopStatusUpdates() {                                                                                                      // stop bar data updates 

    clearInterval(timeInterval)
    clearInterval(btcInterval)

  }

  function navHome() {                                                                                                                // navigates to root and reloads  

    if (processing.value) return
    searchQuery.value = ''
    router.push({ path: '/' })
    activeFilter.value = 'portal'
    aboutSection.value = null

  }

  function setActiveFilter(filter) {                                                                                                  // set active note filter

    activeFilter.value = filter
    searchQuery.value  = ''

    if (!currentPost.value) {

      const currentRoute = router.currentRoute.value
      const isNote = currentRoute.params.slug
      
      if (isNote) return // block redirect

      let path = (filter === 'portal') ? `/` : pathOf({ kind: 'section', id: filter }, lang.value)
      if (currentRoute.path !== path) { router.push({ path: path }) }

    }

  }

  function aboutOf(route) { return pageOf(route).kind === 'about' ? 'portal' : null }

  function openAbout(section) {

    if (section === 'portal') router.push({ path: pathOf({ kind: 'about' }, lang.value) })
    else aboutSection.value = section

  }

  function land(route) {

    if (landed) return
    landed = true
    const page = pageOf(route)
    const note = page.kind === 'note' && document.getElementById('note')
    if (page.lang) setLang(page.lang)
    if (note) setCurrentPost(JSON.parse(note.textContent))
    aboutSection.value = aboutOf(route) || (page.kind === 'section' ? page.id : null)

  }

  watch(() => pathOf(pageOf(router.currentRoute.value), 'es'), () => { aboutSection.value = aboutOf(router.currentRoute.value) })

  function changeFilter(direction) {                                                                                                  // advance or reduce filters 

    const currentTabValue = activeFilter.value
    const currentTabIndex = tabs.value.findIndex(tab => tab.value === currentTabValue)
    const numTabs = tabs.value.length

    for (let i = 1; i <= numTabs; i++) {

      let nextIndex = ((currentTabIndex + direction * i) % numTabs + numTabs) % numTabs
      const nextTabValue = tabs.value[nextIndex].value

      if (hasNotes(nextTabValue)) { setActiveFilter(nextTabValue); return }

    }

  }

  function hasNotes(type) {                                                                                                        // check if filter has notes

    if (type === 'portal') return true
    return notesIndex.value.some(note => note.type === type)

  }

  function resetSub() {                                                                                                               // reset sub message and value 

    subMessage.value = t.value.subscribe.placeholder
    subState.value = 'default'

  }

  function updateSub(state, text, clearInput = false) {                                                                               // update sub message and value 

    subState.value   = state
    subMessage.value = text

    if (clearInput) subEmail.value = ''
    if (state !== 'default') { setTimeout(resetSub, subResetTime) }

  }

  function emitSub(e) {                                                                                                               // check and emit umami event 

    if (subState.value !== 'default') return
    
    const email = subEmail.value
    const submissionsKey = 'subscription_count'
    const currentCount   = parseInt(localStorage.getItem(submissionsKey) || '0', 10) || 0
    
    if (subHoney.value)                    { updateSub('success', t.value.subscribe.successMsg, true);  return }
    if (!email || !emailRegex.test(email)) { updateSub('error',   t.value.subscribe.errorMsg,   false); return }

    if (window.umami && typeof window.umami.track === 'function') {

        window.umami.track('suscripcion', { email: email })
        localStorage.setItem(submissionsKey, currentCount + 1)
        subDone.value = true

        updateSub('success', t.value.subscribe.thanksMsg, true)

    } else { updateSub('error', t.value.subscribe.adblockMsg, true) }
    
  }

  watch(lang, () => { if (subState.value === 'default') subMessage.value = t.value.subscribe.placeholder })                            // sync placeholder on lang switch

  // ASYNCS -------------------------------------------------------------------------------------------------------------------------------------------------------------

  async function fetchAndParse(slug, post, langCode) {

    const cacheKey = `${slug}-${langCode}`
    const cached = postHtmlCache.value[cacheKey]
    if (cached) return cached

    const notePath = pathOf({ kind: 'note', id: post.type || 'textos', slug }, langCode)
    const ownPage = decodeURIComponent(location.pathname) === notePath && document.querySelector('noscript.archive')

    let rawText = ownPage?.textContent
    if (!rawText) {
      const res = await fetch(`${base}${notePath}.html`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      rawText = await res.text()
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(rawText, 'text/html')

    const article = doc.querySelector('main.post-content')
    if (!article) throw new Error('not a note page')

    const html = article.outerHTML
    postHtmlCache.value[cacheKey] = html
    return html

  }

  async function fetchPost(slug, routeType) {                                                                                        // fetch post html 

    if (!slug) { setCurrentPost(null); return { html: '', error: null } }
    if (!notesLoaded.value) { await loadNotesIndex() }

    const metadataSlug = notesIndex.value.find(p => p.slug === slug)
    setCurrentPost(metadataSlug || { type: routeType || 'textos', slug })
    const post = currentPost.value

    const currentLang = (lang.value === 'en' && post.bilingual) ? 'en' : 'es'

    try {

      const html = await fetchAndParse(slug, post, currentLang)

      if (post.bilingual) {
        const otherLang = currentLang === 'en' ? 'es' : 'en'
        if (!postHtmlCache.value[`${slug}-${otherLang}`]) {
          fetchAndParse(slug, post, otherLang).catch(() => {})
        }
      }


      return { html, error: null }

    } catch (e) { console.error(`error fetching slug "${slug}":`, e); return { html: error404, error: e } }
    
  }

  async function loadNotesIndex() {                                                                                                   // fetch full note index

    if (notesLoaded.value) return notesIndex.value
    if (notesLoadingPromise) return notesLoadingPromise

    notesLoadingPromise = (async () => {
      try {

        const response = await fetch(`${base}/index.json`)
        if (!response.ok) throw new Error('index.json not found')
        notesIndex.value = await response.json()
        notesLoaded.value = true

      } catch (e) { console.error('error loading notes index:', e); notesIndex.value = []; notesLoaded.value = true }
      finally { notesLoadingPromise = null }

      return notesIndex.value
    })()

    return notesLoadingPromise

  }

  async function fetchBTC() {                                                                                                         // fetch and update btc price 

    try {

      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      if (!response.ok) throw new Error('API response failed')
      const data = await response.json()
      const price = data?.bitcoin?.usd
      if (typeof price !== 'number' || !isFinite(price)) { btcPrice.value = null; return }
      const formattedPrice = Math.round((price / 1000) * 10) / 10
      btcPrice.value = `${formattedPrice}K`

    } catch (e) { console.error('error fetching btc price:', e); btcPrice.value = null }

  }

  function syncHead() {

    const page = pageOf(router.currentRoute.value)
    const post = page.kind === 'note' ? notesIndex.value.find(p => p.slug === page.slug) : null
    if (page.kind !== 'note' || post) applyHead(headFor(page, lang.value, post))

  }

  watch([() => router.currentRoute.value.fullPath, lang, notesIndex], syncHead, { immediate: true })

  // COMPUTEDS ----------------------------------------------------------------------------------------------------------------------------------------------------------

  const computedNoteComp  = computed(() => {                                                                                          // compute vuecomp if it exists 

    if (currentPost.value) {
      const customVuecomp = currentPost.value.vuecomp
      if (customVuecomp) { return customVuecomp } 
    }

    return null

  })

  const computedNoteClass = computed(() => {                                                                                          // compute class for html post 

    if (currentPost.value) {
      const typeKey = currentPost.value.type
      return classMap[typeKey] || 'nota nota-verso' 
    }

    return 'nota nota-verso' 

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

      title: (lang.value === 'en' && metadata.bilingual && metadata.titleEn) ? metadata.titleEn : (metadata.title || t.value.portada.welcome),
      description: (lang.value === 'en' && metadata.bilingual && metadata.descriptionEn) ? metadata.descriptionEn : (metadata.description || t.value.portada.desc),
      authors: postAuthors,
      portada: metadata.portada || '',

    }
    
  })

  const loadLatestPost    = computed(() => {                                                                                          // compute latest post 

    if (notesIndex.value.length === 0) return { title: t.value.gallery.loading, url: '' }
    const latest = notesIndex.value[0]

    return {
      title: (lang.value === 'en' && latest.bilingual && latest.titleEn) ? latest.titleEn : latest.title,
      url: pathOf({ kind: 'note', id: latest.type, slug: latest.slug }, lang.value)
    }

  })

  const noteSortFilter    = computed(() => {                                                                                          // compute table filter 

    if (!notesIndex.value || notesIndex.value.length === 0) { return [] }
    const filterType = activeFilter.value
    let filtered = activeFilter.value === 'portal' ? notesIndex.value : notesIndex.value.filter(note => note.type === filterType)

    filtered = filtered.map(note => ({                                                                                               // add lang-aware display fields
      ...note,
      displayTitle: (lang.value === 'en' && note.bilingual && note.titleEn) ? note.titleEn : note.title,
      displayDescription: (lang.value === 'en' && note.bilingual && note.descriptionEn) ? note.descriptionEn : note.description,
    }))

    const fold  = text => (text || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    const query = fold(searchQuery.value).trim()

    if (query) { 

      filtered = filtered.filter(note =>
        fold(note.displayTitle).includes(query) ||
        fold(note.displayDescription).includes(query) ||
        note.tags?.some(tag => fold(tag).includes(query)) ||
        note.date.includes(query)
      )

    }

    return [...filtered].sort((a, b) => { 

      let valA, valB

      switch (sortKey.value) {

        case 'title': valA = a.displayTitle.toLowerCase()          ; valB = b.displayTitle.toLowerCase()          ; break
        case 'tags':  valA = a.tags?.[0]?.toLowerCase() || '' ; valB = b.tags?.[0]?.toLowerCase() || '' ; break
        default:      valA = new Date(a.isoDate)            ; valB = new Date(b.isoDate)            ; break

      }

      let comparison = 0
      if (valA > valB)      comparison =  1
      else if (valA < valB) comparison = -1

      return sortOrder.value === 'asc' ? comparison : -comparison

    })

  })

  // RETURN -------------------------------------------------------------------------------------------------------------------------------------------------------------

  return { 

    /* NOTES VAR */ notesIndex, currentPost, notesLoaded, base, subEmail, subHoney, subMessage, subState, subDone, userStatus,
    /* NOTES FUN */ fetchPost, loadNotesIndex, setCurrentPost, emitSub,
    /* NOTES COM */ computedNoteComp, computedNoteClass, computedPortada, loadLatestPost,
    /* STATS VAR */ btcPrice, currentTime, barContent,
    /* STATS FUN */ startStatusUpdates, stopStatusUpdates,
    /* VIEWS VAR */ processing, showPopup, popLink, popString, mailtoDir,
    /* VIEWS FUN */ setProcessing, togglePopup,
    /* NAVIG VAR */ activeFilter, aboutSection, searchQuery, tabs,
    /* NAVIG FUN */ setActiveFilter, setSearchQuery, navHome, changeFilter, hasNotes, openAbout, land, sectionOf, notePath: (type, slug) => pathOf({ kind: 'note', id: type, slug }, lang.value), labelOf: id => labelOf(id, lang.value),
    /* NAVIG COM */ noteSortFilter,
    /* LANG VAR  */ lang, t,
    /* LANG FUN  */ toggleLang,

  }

})