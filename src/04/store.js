import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { SITE_URL, CONTACT_EMAIL } from '@/site-config.js'

export const useStore = defineStore('store', () => {

  const webURL = SITE_URL

  const tabs                       = computed(() => [                                                                                 // names for filters 

    { label: t.value.nav.tabs.full,       value: 'full'       },
    { label: t.value.nav.tabs.diseño,     value: 'diseño'     },
    { label: t.value.nav.tabs.desarrollo, value: 'desarrollo' },
    { label: t.value.nav.tabs.musica,     value: 'musica'     },
    { label: t.value.nav.tabs.textos,     value: 'textos'     },
    { label: t.value.nav.tabs.juegos,     value: 'juegos'     },

  ])

  const authorsMap = {                                                                                                                // author profile pic and link 

    swim:     { img: '/assets/swim.webp',  link: 'https://youtu.be/dQw4w9WgXcQ?si=bz_5AJZx0wCKCccI' },
    kaste:    { img: '/assets/kaste.webp', link: 'https://x.com/octantes' },
    octantes: { img: '/assets/kaste.webp', link: 'https://x.com/octantes' },

  }

  const statusMap  = {                                                                                                                // status emojis (messages in dict)

    frenzy:   { emoji: '❤️‍🔥' },
    dominion: { emoji: '🪡' },
    stuck:    { emoji: '🌀' },
    default:  { emoji: '🪡' },

  }

  const statusKey = ref('frenzy')                                                                                                      // current status key

  // LENGUAJE Y DICCIONARIO

  function detectLang() {
    var nav = (navigator.language || navigator.languages?.[0] || '').toLowerCase().split('-')[0]
    return nav === 'es' ? 'es' : 'en'
  }

  const lang = ref(localStorage.getItem('lang') || detectLang())

  function toggleLang() {
    lang.value = lang.value === 'es' ? 'en' : 'es'
    localStorage.setItem('lang', lang.value)
  }

  const dict = {
    es: {
      portada: {
        welcome: 'bienvenido a octantes!',
        desc: 'tocá un posteo de la tabla para cargarlo; también podés filtrar según el tipo de contenido que querés encontrar en la página',
        viewProfile: 'ver perfil de',
        openProfile: 'ver el perfil de autor @',
        closeDesc: 'cerrar descripción',
        openDesc: 'ver descripción',
        langTitle: 'cambiar a inglés',
        profilePicAlt: 'foto de perfil de @',
        openProfileNewTab: ' en una pesta\u00f1a nueva',
        closePopup: 'cerrar notificación',
        closePopupAria: 'cerrar la notificación popup',
        popupLink: 'ir al enlace',
        popupLinkAria: 'abrir enlace de la notificación',
        popupText: "p\u00e1sate a escuchar<br>mi \u00faltimo disco",
        sigilAlt: 'sigilo'
      },
      nav: { search: 'buscar...', home: 'volver al inicio', prev: 'ver el filtro anterior', next: 'ver el filtro siguiente', tabs: { full: 'completo', diseño: 'diseño', desarrollo: 'desarrollo', musica: 'música', textos: 'textos', juegos: 'juegos' }, siteTitle: 'octantes.ar - portal multimedia', filterBy: 'filtrar por ', filterByContent: 'filtrar contenidos por ' },
      status: { contact: 'contactame!', archive: 'ARCHIVO', archiveLink: '/archivo.html', openLatest: 'abrir la \u00faltima nota publicada', portfolioTitle: 'ver portfolio din\u00e1mico', portfolioLabel: 'portfolio', rssTitle: 'suscribirse al feed RSS', rssAria: 'suscribirse a las \u00faltimas publicaciones por feed RSS', rssLabel: 'RSS', btcLabel: 'BTC:', frenzy: 'in a frenzy!', dominion: 'dominando el mundo', stuck: 'stuck in a loop', default: 'dominando el mundo' },
      gallery: { loading: 'cargando...', empty: 'no hay notas que coincidan', open: 'abrir nota', noteCover: 'portada de la nota: ' },
      portfolio: {
        subtitle: 'Desarrollador Frontend & Diseñador',
        desc: 'desarrollando interfaces y experiencias digitales <br> con un enfoque en el diseño multimedia <br> y la simplicidad técnica',
        close: 'volver al inicio', select: 'seleccionar proyecto ', open: 'abrir nota de ', noDesc: 'sin descripción', closeFullscreen: 'salir de la vista en pantalla completa', closeFullscreenAria: 'cerrar el contenido en pantalla completa', githubProfile: 'Ver perfil de GitHub', openGithub: 'Abrir GitHub de octantes'
      },
      subscribe: {
        cta: 'querés enterarte cuando subo algo nuevo? sumate a la lista de mails!',
        placeholder: 'dejá tu mail acá...',
        done: 'ya estás en la lista, gracias por sumarte!',
        button: 'suscribirme',
        emailTitle: 'ingresar tu correo para suscribirte',
        emailAria: 'campo para ingresar correo electrónico',
        submitTitle: 'hacer click para suscribirte',
        submitAria: 'botón para enviar la suscripción',
        successMsg: 'mail registrado!',
        errorMsg: 'ese mail no es válido!',
        thanksMsg: 'gracias por sumarte!',
        adblockMsg: 'prevenido por adblocker'
      },
      about: {
        taglines: ['tejiendo hechizos', 'abriendo ventanas a universos alternativos', 'desplegando portales', 'investigando dualidades'],
        profilePic: 'foto de perfil',
        sections: {
          full: 'buenas! soy <i>kaste</i> y lo que estás viendo es mi base de operaciones     <br><br>armé <b>octantes</b> para centralizar toda mi producción fuera de las redes  <br>recuperando los fundamentos, sin algoritmos, reglas o intermediarios         <br>vas a encontrar proyectos de todo tipo, vos elegís lo que querés ver         <br>desde música, textos y diseño hasta videojuegos y software propio            <br><br>la página me permite adaptar el formato al contenido que voy creando         <br>y pensar mis proyectos se vuelve más fácil con outputs definidos             <br><br>usá las pestañas superiores de la tabla para filtrar por sección             <br>cuando un posteo te llame la atención, clickealo para cargarlo acá           <br>',
          diseño: 'estás viendo la sección de <i>diseño</i>, acá viven mis proyectos multimedia <br><br>disfruto mucho armar <b>identidades</b> y pensar assets que las acompañen    <br>algunos de estos trabajos son solo de práctica, excusas para aprender        <br>otros son encargos reales, puestos a prueba en distintos entornos            <br>mi foco es la multimedialidad, lograr una fusión interesante de medios       <br><br>vas a encontrar trabajos de branding, diseño web y piezas editoriales        <br>desde interfaces hasta logotipos, fanzines, stickers y otros objetos         <br><br>si te interesa algún proyecto, clickealo para ver el desglose completo       <br>vas a encontrar la galería, el proceso, las herramientas e influencias       <br>',
          desarrollo: 'estás viendo la sección de <i>desarrollo</i>, acá armo mis herramientas    <br><br>desde que aprendí a <b>programar</b>, se me abrieron muchas posibilidades  <br>ahora cuando no encuentro algo que necesito, puedo armarlo de cero         <br>también me permite implementar diseños propios en entornos reales          <br>esta sección muestra la parte que ya es pública de esos desarrollos        <br><br>vas a encontrar software, experimentos gráficos y otras utilidades         <br>desde herramientas de producción y productividad hasta shaders             <br><br>si te interesa algún proyecto, clickealo para ver el desglose completo     <br>vas a encontrar el repositorio, el proceso, las herramientas e imágenes    <br>',
          musica: 'estás viendo la sección de <i>música</i>, acá es donde tejo hechizos          <br><br>desde el primer tema que hice, <b>producir</b> se volvió una necesidad total  <br>cuando no entro seguido en ese estado de trance, pierdo la templanza          <br>armar canciones en el sentido tradicional no es mi principal interés          <br>me llama mucho más crear paisajes que transmitan una emoción                  <br><br>vas a ver álbumes, acompañados por experimentos audiovisuales                 <br>desde proyectos terminados hasta descartes y demos sin mezclar                <br><br>si te interesa escuchar algo, clickealo para ver el video en youtube          <br>también vas a encontrar el disco en spotify y otras plataformas               <br>',
          textos: 'estás viendo la sección de <i>textos</i>, acá desarrollo mis intereses        <br><br>para mí, <b>escribir</b> siempre fue la mejor forma de ordenar las ideas      <br>en ese proceso aparecen borradores que acá traduzco a artículos               <br>la idea es conectar los puntos entre distintos desarrollos de la página       <br>para aportar un marco teórico a la práctica y disparar nuevos procesos        <br><br>vas a encontrar bitácoras, reflexiones y análisis de cosas variadas           <br>escritas en formato de blog personal, sin demasiada formalidad                <br><br>si querés leer algunos de mis pensamientos, clickeá un posteo                 <br>a lo largo de distintas notas se van desarrollando las temáticas              <br>',
          juegos: 'estás viendo la sección de <i>videojuegos</i>, mi principal laboratorio       <br><br>diseñar <b>fichines</b> siempre ha sido mi endgame, el objetivo final         <br>participé en gamejams y armé prototipos para practicar un poco                <br>pero siempre quise desarrollar cosas jugables desde el navegador              <br>porque la web es de los pocos lugares donde aún hay límites técnicos          <br><br>vas a encontrar juegos centrados en lo mecánico y otros en lo narrativo       <br>lo que más me interesa es pensar el juego como sistema y ver qué sale         <br><br>si querés probar algún prototipo, simplemente cargalo desde la tabla          <br>la mayoría corren en el navegador y otros pueden ser descargables             <br>'
        },
        footers: {
          full: 'si querés saber más <i>sobre el proyecto</i> podes leer estos posteos',
          diseño: 'si querés saber más <i>sobre mis diseños</i> podes leer estos posteos',
          desarrollo: 'si querés saber más <i>sobre mi desarrollo</i> podes leer estos posteos',
          musica: 'si querés saber más <i>sobre mi música</i> podes leer estos posteos',
          textos: 'si querés saber más <i>sobre lo que escribo</i> podes leer estos posteos',
          juegos: 'si querés saber más <i>sobre los juegos</i> podes leer estos posteos'
        }
      }
    },
    en: {
      portada: {
        welcome: 'welcome to octantes!',
        desc: 'click a post on the table to load it; you can also filter by the type of content you want to find on the page',
        viewProfile: 'view profile of',
        openProfile: 'view author profile @',
        closeDesc: 'close description',
        openDesc: 'view description',
        langTitle: 'switch to spanish',
        profilePicAlt: 'profile pic of @',
        openProfileNewTab: ' in a new tab',
        closePopup: 'close notification',
        closePopupAria: 'close popup notification',
        popupLink: 'go to link',
        popupLinkAria: 'open notification link',
        popupText: "come listen to<br>my latest album",
        sigilAlt: 'sigil'
      },
      nav: { search: 'search...', home: 'back to home', prev: 'view previous filter', next: 'view next filter', tabs: { full: 'all', diseño: 'design', desarrollo: 'dev', musica: 'music', textos: 'writing', juegos: 'games' }, siteTitle: 'octantes.ar - multimedia portal', filterBy: 'filter by ', filterByContent: 'filter posts by ' },
      status: { contact: 'get in touch!', archive: 'ARCHIVE', archiveLink: '/archive.html', openLatest: 'open latest published note', portfolioTitle: 'view dynamic portfolio', portfolioLabel: 'portfolio', rssTitle: 'subscribe to RSS feed', rssAria: 'subscribe to latest posts via RSS feed', rssLabel: 'RSS', btcLabel: 'BTC:', frenzy: 'in a frenzy!', dominion: 'dominating the world', stuck: 'stuck in a loop', default: 'dominating the world' },
      gallery: { loading: 'loading...', empty: 'no matching notes', open: 'open note', noteCover: 'cover for note: ' },
      portfolio: {
        subtitle: 'Frontend Engineer & Designer',
        desc: 'developing interfaces and digital experiences <br> with a focus on multimedia design <br> and technical simplicity',
        close: 'back to home', select: 'select project ', open: 'open note for ', noDesc: 'no description', closeFullscreen: 'exit fullscreen view', closeFullscreenAria: 'close fullscreen content', githubProfile: 'View GitHub profile', openGithub: 'Open octantes GitHub'
      },
      subscribe: {
        cta: 'want to know when i upload something new? join the mailing list!',
        placeholder: 'leave your email here...',
        done: "you're already on the list, thanks for joining!",
        button: 'subscribe',
        emailTitle: 'enter your email to subscribe',
        emailAria: 'field to enter email address',
        submitTitle: 'click to subscribe',
        submitAria: 'button to send subscription',
        successMsg: 'email registered!',
        errorMsg: 'that email is not valid!',
        thanksMsg: 'thanks for joining!',
        adblockMsg: 'blocked by adblocker'
      },
      about: {
        taglines: ['weaving spells', 'opening windows to alternate universes', 'unfolding portals', 'investigating dualities'],
        profilePic: 'profile picture',
        sections: {
          full: 'hey! i\'m <i>kaste</i> and what you\'re seeing is my operations base     <br><br>i built <b>octantes</b> to centralize all my production outside social media  <br>getting back to fundamentals, no algorithms, rules or middlemen               <br>you\'ll find projects of all kinds, you choose what you want to see            <br>from music, writing and design to video games and custom software             <br><br>the page lets me adapt the format to whatever content i\'m creating            <br>and thinking about my projects gets easier with defined outputs               <br><br>use the top tabs of the table to filter by section                            <br>when a post catches your attention, click it to load it here                  <br>',
          diseño: 'you\'re viewing the <i>design</i> section, where my multimedia projects live <br><br>i really enjoy building <b>identities</b> and designing assets to go with them<br>some of these works are just practice, excuses to learn                       <br>others are real commissions, tested in different environments                 <br>my focus is multimediality, achieving an interesting fusion of media          <br><br>you\'ll find branding work, web design and editorial pieces                    <br>from interfaces to logos, fanzines, stickers and other objects                <br><br>if you\'re interested in a project, click it to see the full breakdown         <br>you\'ll find the gallery, the process, tools and influences                    <br>',
          desarrollo: 'you\'re viewing the <i>dev</i> section, where i build my tools              <br><br>ever since i learned to <b>code</b>, a lot of possibilities opened up       <br>now when i can\'t find something i need, i can build it from scratch         <br>it also lets me implement my own designs in real environments                <br>this section shows the part that\'s already public from those developments   <br><br>you\'ll find software, graphical experiments and other utilities             <br>from production and productivity tools to shaders                           <br><br>if you\'re interested in a project, click it to see the full breakdown       <br>you\'ll find the repo, the process, tools and images                         <br>',
          musica: 'you\'re viewing the <i>music</i> section, this is where i weave spells          <br><br>since the first track i made, <b>producing</b> became a total necessity        <br>when i don\'t enter that trance state often enough, i lose my composure         <br>making songs in the traditional sense isn\'t my main interest                    <br>i\'m much more drawn to creating soundscapes that convey an emotion              <br><br>you\'ll see albums, accompanied by audiovisual experiments                       <br>from finished projects to scraps and unmixed demos                             <br><br>if you want to listen to something, click it to see the video on youtube        <br>you\'ll also find the album on spotify and other platforms                       <br>',
          textos: 'you\'re viewing the <i>writing</i> section, where i develop my interests        <br><br>for me, <b>writing</b> has always been the best way to organize my thoughts    <br>in that process drafts appear that i translate into articles here               <br>the idea is to connect the dots between different developments on the page      <br>to provide a theoretical framework for the practice and spark new processes     <br><br>you\'ll find logs, reflections and analysis of various things                    <br>written in a personal blog format, without too much formality                   <br><br>if you want to read some of my thoughts, click on a post                        <br>across different notes the themes keep developing                               <br>',
          juegos: 'you\'re viewing the <i>games</i> section, my main laboratory                  <br><br>designing <b>games</b> has always been my endgame, the final goal            <br>i\'ve participated in game jams and built prototypes to practice a bit        <br>but i\'ve always wanted to develop playable things from the browser           <br>because the web is one of the few places where there are still technical limits<br><br>you\'ll find games focused on mechanics and others on narrative               <br>what interests me most is thinking about the game as a system and seeing what comes out<br><br>if you want to try a prototype, just load it from the table                  <br>most run in the browser and others can be downloaded                         <br>'
        },
        footers: {
          full: 'if you want to know more <i>about the project</i> you can read these posts',
          diseño: 'if you want to know more <i>about my designs</i> you can read these posts',
          desarrollo: 'if you want to know more <i>about my development</i> you can read these posts',
          musica: 'if you want to know more <i>about my music</i> you can read these posts',
          textos: 'if you want to know more <i>about what i write</i> you can read these posts',
          juegos: 'if you want to know more <i>about the games</i> you can read these posts'
        }
      }
    }
  }

  const t = computed(() => dict[lang.value])

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
  const classMap                   = { desarrollo: 'S6', textos: 'S6', diseño: 'S7', musica: 'S6', juegos: 'S6'}                      // note type custom class map
  const postHtmlCache              = ref({})


  // STATES                                                                                                                           // CHANGE STATES

  const processing                 = ref(false)                                                                                       // disabled component state
  const popLink                    = ref('https://www.youtube.com/watch?v=eOnO8ECvJl0')                                               // popup go link
  const showPopup                  = ref(localStorage.getItem('popup_seen') !== popLink.value)                                        // enable popup in navigation
  const popString                  = computed(() => t.value.portada.popupText)                                                      // popup text
  const mailtoDir                  = ref(CONTACT_EMAIL)                                                                               // contact direction
  const userStatus                 = computed(() => {                                                                                   // current user status (lang-aware)

    const key = statusKey.value
    const entry = statusMap[key] || statusMap.default
    return { emoji: entry.emoji, message: t.value.status[key] || t.value.status.default || entry.emoji }

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

  const activeFilter               = ref('full')                                                                                      // active tab filter name
  const sortKey                    = ref('isoDate')                                                                                   // current sort column
  const sortOrder                  = ref('desc')                                                                                      // current sort order
  const searchQuery                = ref('')                                                                                          // searchbox current search



  // FUNCTIONS ----------------------------------------------------------------------------------------------------------------------------------------------------------


  function setProcessing(val)           { processing.value = val; document.body.style.cursor = val ? 'wait' : '' }                    // apply disabled component state
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

  function navHome(routerInstance) {                                                                                                  // navigates to root and reloads  

    if (processing.value) return
    searchQuery.value = ''
    routerInstance.push({ path: '/' })
    activeFilter.value = 'full'
    document.title = t.value.nav.siteTitle

  }

  function navSort(key) {                                                                                                             // change sort order 

    if (processing.value) return
    if (sortKey.value === key) { sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc' } 
    else { sortKey.value = key; sortOrder.value = 'asc' }

  }

  function setActiveFilter(routerInstance, filter) {                                                                                  // set active note filter

    activeFilter.value = filter
    searchQuery.value  = ''

    if (routerInstance && !currentPost.value) {

      const currentRoute = routerInstance.currentRoute.value
      const isNote = currentRoute.params.slug
      const isPortfolio = currentRoute.path === '/portfolio'
      
      if (isNote || isPortfolio) return // block redirect

      let path = (filter === 'full') ? `/` : `/${filter}`
      if (currentRoute.path !== path) { routerInstance.push({ path: path }) }

    }

  }


  function changeFilter(routerInstance, direction) {                                                                                  // advance or reduce filters 

    if (processing.value) return
    
    const currentTabValue = activeFilter.value
    const currentTabIndex = tabs.value.findIndex(tab => tab.value === currentTabValue)
    const numTabs = tabs.value.length

    for (let i = 1; i <= numTabs; i++) {

      let nextIndex = ((currentTabIndex + direction * i) % numTabs + numTabs) % numTabs
      const nextTabValue = tabs.value[nextIndex].value

      if (hasNotes(nextTabValue)) { setActiveFilter(routerInstance, nextTabValue); return }

    }

  }

  function hasNotes(type) {                                                                                                        // check if filter has notes

    if (type === 'full') return true
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

  function setUserStatus(key) {                                                                                                       // set emoji and status phrase 

    statusKey.value = key

  }

  watch(lang, () => { if (subState.value === 'default') subMessage.value = t.value.subscribe.placeholder })                            // sync placeholder on lang switch

  
  // ASYNCS -------------------------------------------------------------------------------------------------------------------------------------------------------------


  async function fetchAndParse(slug, post, langCode) {

    const cacheKey = `${slug}-${langCode}`
    const cached = postHtmlCache.value[cacheKey]
    if (cached) return cached

    const fileName = langCode === 'en' ? 'ingles.html' : 'index.html'
    const fetchPath = `${base}/posts/${post.type || 'textos'}/${slug}/${fileName}`
    const res = await fetch(fetchPath)
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)

    const rawText = await res.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(rawText, 'text/html')
    const staticNav = doc.querySelector('.static-nav')
    if (staticNav) staticNav.remove()

    const html = doc.body.innerHTML
    postHtmlCache.value[cacheKey] = html
    return html

  }

  async function fetchPost(slug) {                                                                                                    // fetch post html 

    if (!slug) { setCurrentPost(null); return { html: '', error: null } }
    if (!notesLoaded.value) { await loadNotesIndex() }

    const metadataSlug = notesIndex.value.find(p => p.slug === slug)
    setCurrentPost(metadataSlug || { type: 'textos', slug })
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

      updateSEOTags(currentPost.value)
      document.title = currentPost.value.title || document.title

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

  function updateSEOTags(post) {

    if (!post) { resetSEOTags(); return }

    const isEn = lang.value === 'en'
    const title = (isEn && post.bilingual && post.titleEn) ? post.titleEn : post.title
    const description = (isEn && post.bilingual && post.descriptionEn) ? post.descriptionEn : post.description
    const slug = post.slug

    document.title = `${title} - octantes.ar`

    const descMeta = document.querySelector('meta[name="description"]')
    if (descMeta) descMeta.content = description

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.content = title

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.content = description

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.content = `${webURL}/${post.type}/${slug}/`

    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage && post.portada) ogImage.content = post.portada

    const twTitle = document.querySelector('meta[name="twitter:title"]')
    if (twTitle) twTitle.content = title

    const twDesc = document.querySelector('meta[name="twitter:description"]')
    if (twDesc) twDesc.content = description

    const twImage = document.querySelector('meta[name="twitter:image"]')
    if (twImage && post.portada) twImage.content = post.portada

    const twCreator = document.querySelector('meta[name="twitter:creator"]')
    if (twCreator) {
      const handle = Array.isArray(post.handle) ? post.handle[0] : (post.handle || 'kaste')
      twCreator.content = `@${handle.replace(/^@/, '')}`
    }

    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) canonical.href = `${webURL}/${post.type}/${slug}/`

    const ldScript = document.querySelector('script[type="application/ld+json"]')
    if (ldScript) {
      ldScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${webURL}/${post.type}/${slug}/` },
        "headline": title,
        "image": post.portada || `${webURL}/assets/portada.webp`,
        "author": { "@type": "Person", "name": (Array.isArray(post.handle) ? post.handle[0] : post.handle) || 'kaste' },
        "publisher": { "@type": "Organization", "name": "octantes.ar", "logo": { "@type": "ImageObject", "@id": `${webURL}/assets/logo.webp`, "url": `${webURL}/assets/logo.webp` } },
        "datePublished": post.isoDate,
        "dateModified": post.isoDate,
        "description": description,
        "keywords": (Array.isArray(post.tags) ? post.tags.join(', ') : '')
      })
    }

    const ogPublished = document.querySelector('meta[property="article:published_time"]')
    if (ogPublished) ogPublished.content = post.isoDate
    const ogModified = document.querySelector('meta[property="article:modified_time"]')
    if (ogModified) ogModified.content = post.isoDate

  }

  function resetSEOTags() {

    const isEn = lang.value === 'en'

    document.title = isEn ? 'octantes.ar - multimedia portal' : 'octantes.ar - portal multimedia'

    const descMeta = document.querySelector('meta[name="description"]')
    if (descMeta) descMeta.content = isEn ? 'weaving spells' : 'tejiendo hechizos'

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.content = 'octantes.ar'

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.content = isEn ? 'weaving spells' : 'tejiendo hechizos'

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.content = webURL + '/'

    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage) ogImage.content = webURL + '/assets/portada.webp'

    const twTitle = document.querySelector('meta[name="twitter:title"]')
    if (twTitle) twTitle.content = 'octantes.ar'

    const twDesc = document.querySelector('meta[name="twitter:description"]')
    if (twDesc) twDesc.content = isEn ? 'weaving spells' : 'tejiendo hechizos'

    const twImage = document.querySelector('meta[name="twitter:image"]')
    if (twImage) twImage.content = webURL + '/assets/portada.webp'

    const twCreator = document.querySelector('meta[name="twitter:creator"]')
    if (twCreator) twCreator.content = '@octantes'

    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) canonical.href = webURL + '/'

    const ogPublished = document.querySelector('meta[property="article:published_time"]')
    if (ogPublished) ogPublished.remove()
    const ogModified = document.querySelector('meta[property="article:modified_time"]')
    if (ogModified) ogModified.remove()

    const ldScript = document.querySelector('script[type="application/ld+json"]')
    if (ldScript) {
      ldScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "octantes.ar",
        "url": webURL + "/",
        "description": isEn ? 'weaving spells' : 'tejiendo hechizos',
        "author": { "@type": "Person", "name": "kaste" }
      })
    }

  }


  // COMPUTEDS ----------------------------------------------------------------------------------------------------------------------------------------------------------


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

      title: (lang.value === 'en' && metadata.bilingual && metadata.titleEn) ? metadata.titleEn : (metadata.title || t.value.portada.welcome),
      description: (lang.value === 'en' && metadata.bilingual && metadata.descriptionEn) ? metadata.descriptionEn : (metadata.description || t.value.portada.desc),
      authors: postAuthors,
      portada: metadata.portada || '',

    }
    
  })

  const loadLatestPost    = computed(() => {                                                                                          // compute latest post 

    if (notesIndex.value.length === 0) return { title: t.value.gallery.loading, url: '' }
    const latest = notesIndex.value[0]
    const cleanUrl = latest.url.replace(/^\/posts/, '') 

    return {
      title: (lang.value === 'en' && latest.bilingual && latest.titleEn) ? latest.titleEn : latest.title,
      url: cleanUrl
    }

  })

  const noteSortFilter    = computed(() => {                                                                                          // compute table filter 

    if (!notesIndex.value || notesIndex.value.length === 0) { return [] }
    const filterType = activeFilter.value
    let filtered = activeFilter.value === 'full' ? notesIndex.value : notesIndex.value.filter(note => note.type === filterType)

    filtered = filtered.map(note => ({                                                                                               // add lang-aware display fields
      ...note,
      displayTitle: (lang.value === 'en' && note.bilingual && note.titleEn) ? note.titleEn : note.title,
      displayDescription: (lang.value === 'en' && note.bilingual && note.descriptionEn) ? note.descriptionEn : note.description,
    }))

    const query = searchQuery.value.toLowerCase().trim()

    if (query) { 

      filtered = filtered.filter(note =>
        note.displayTitle.toLowerCase().includes(query) ||
        note.displayDescription.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query)) ||
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

    /* SITE VAR */ webURL,
    /* SITE CON */ SITE_URL,

    /* NOTES VAR */ notesIndex, currentPost, notesLoaded, base, subEmail, subHoney, subMessage, subState, subDone, statusMap, userStatus,
    /* NOTES FUN */ fetchPost, loadNotesIndex, setCurrentPost, resetSub, updateSub, emitSub, setUserStatus,
    /* NOTES COM */ computedNoteComp, computedFullscreen, computedNoteClass, computedPortada, loadLatestPost,
    /* STATS VAR */ btcPrice, currentTime, barContent,
    /* STATS FUN */ startStatusUpdates, stopStatusUpdates,
    /* VIEWS VAR */ processing, showPopup, popLink, popString, mailtoDir,
    /* VIEWS FUN */ setProcessing, togglePopup,
    /* NAVIG VAR */ activeFilter, sortKey, sortOrder, searchQuery, tabs,
    /* NAVIG FUN */ setActiveFilter, setSearchQuery, navHome, navSort, changeFilter, hasNotes,
    /* NAVIG COM */ noteSortFilter,
    /* LANG VAR  */ lang, t,
    /* LANG FUN  */ toggleLang,
    /* SEO  FUN  */ updateSEOTags, resetSEOTags,

  }

})