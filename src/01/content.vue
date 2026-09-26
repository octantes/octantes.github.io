<script setup> 
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'
import About from '../02/about.vue'
import Subscribe from '../02/subscribe.vue'
import Portal from '../03/portal.vue'
import Notification from '../02/notification.vue'
import { throughTheVeil, veilFromStart } from '../03/veil.js'
import Typewriter from '../03/typewriter.vue'
import NoteTitle from '../03/title.vue'
import { MOBILE_MAX } from '../04/site-config.js'

const compMap = { }                                                                                                                   // add vuecomps/fullcomps and import if needed

const route           = useRoute()                                                                                                    // sets the current url route
const store           = useStore()                                                                                                    // initializes global store
const isMobile        = ref(window.innerWidth <= MOBILE_MAX)                                                                          // mobile state

let resizeTimer = null                                                                                                                // save resize timer

function checkViewport() { isMobile.value = window.innerWidth <= MOBILE_MAX }                                                         // detect mobile

function onResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { checkViewport(); fitCentred() }, 150) }                                       // use resize timer

const { currentPost, computedNoteComp, computedNoteClass } = storeToRefs(store)                                   // imports refs from main store
const { loadNotesIndex, setCurrentPost, setProcessing, fetchPost } = store                                                        // imports variables from main store

const portalRef   = ref(null)                                                                                                         // shader variable for animations
const containerRef= ref(null)
const postRef     = ref(null)                                                                                                         // ref for post scroll container
const contentRef  = ref(null)                                                                                                         // ref for content element
const noteContent = ref('')                                                                                                           // basic note html for insert
const notFound    = ref(0)

const fullBleed = ref(false)

store.land(route)

const aboutMode = computed(() => store.aboutSection)
const noteTitle = computed(() => currentPost.value ? store.textOf(currentPost.value, 'title') || '' : '')

const aboutOpen = ref(null)

const openKey   = computed(() => route.params.slug || (aboutMode.value ? 'about:' + aboutMode.value : undefined))

if (isMobile.value && openKey.value) veilFromStart()

let noteLoaded = false                                                                                                                // note loaded bool flag for shader
let firstLoad  = true                                                                                                                 // first load bool flag for shader
let lastSlug   = null                                                                                                                 // previous slug flag for shader

const computedComp = computed(() => {                                                                                                 // compute vuecomp if it exists 

  if (computedNoteComp.value) { return compMap[computedNoteComp.value] || null }
  return null

})

async function revealError() {
  if (isMobile.value || !portalRef.value) return
  await portalRef.value.runQueue('outro')
  await portalRef.value.runQueue('hidden')
}

function resetScroll() {
  document.querySelector('.layout')?.scrollTo?.({ top: 0, behavior: 'auto' })
  if (postRef.value) postRef.value.scrollTop = 0
  const col = document.querySelector('.articulos')
  if (col) col.scrollTop = 0
}

const VERSO_MAX = 21.6
const FIT_STEPS = 7

const CENTRED = [
  { root: '.nota-verso', parts: [],                            row: false },
  { root: '.about',      parts: ['.tagline', '.user-status'],  row: true  },
  { root: '.subscribe',  parts: ['.cta', '.textbox', '.submit'], row: true },
]

function textBlocks(root) {
  return [...root.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, span, div')]
    .filter(el => el.textContent.trim()
              && !el.querySelector('img, video, iframe')
              && !el.closest('.nota-prosa')
              && getComputedStyle(el).display !== 'inline'
              && ![...el.children].some(c => getComputedStyle(c).display !== 'inline'))
}

function breaks(root, blocks, row) {
  if (row) {
    for (const el of [root, ...root.querySelectorAll('*')]) {
      if (el.scrollWidth > el.clientWidth + 1) return true
    }
  }
  for (const el of blocks) {
    const cs = getComputedStyle(el)
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2
    if (!lh) continue
    const hard = el.innerHTML.split(/<br\s*\/?>/i).length
    if (el.getBoundingClientRect().height > lh * (hard + 0.25)) return true
  }
  return false
}

function setSize(root, parts, px) {
  root.style.fontSize = px
  for (const sel of parts) for (const el of root.querySelectorAll(sel)) el.style.fontSize = px
}

async function fitCentred() {

  const host = contentRef.value
  if (!host) return

  const targets = CENTRED.map(t => ({ ...t, el: host.querySelector(t.root) })).filter(t => t.el)
  for (const t of targets) setSize(t.el, t.parts, '')

  if (!isMobile.value) return

  if (document.fonts?.ready) await document.fonts.ready

  for (const t of targets) {

    const blocks = textBlocks(t.el)

    if (!blocks.length) continue

    const base = parseFloat(getComputedStyle(t.el).fontSize) || 16
    if (breaks(t.el, blocks, t.row)) continue

    let lo = base, hi = VERSO_MAX
    if (hi <= lo) continue

    for (let i = 0; i < FIT_STEPS; i++) {
      const mid = (lo + hi) / 2
      setSize(t.el, t.parts, `${mid}px`)
      if (breaks(t.el, blocks, t.row)) hi = mid; else lo = mid
    }

    setSize(t.el, t.parts, `${lo * 0.98}px`)

  }

}

async function openInColumn(key) {

  if (String(key).startsWith('about:')) {
    const section = String(key).slice(6)
    aboutOpen.value = section
    notFound.value = store.tabs.some(tab => tab.value === section) ? 0 : 404
    noteContent.value = ''
    setCurrentPost(null)
    await nextTick()
    resetScroll()
    return
  }

  aboutOpen.value = null
  return handleLoadNote(key)

}

async function handleLoadNote(slug) {                                                                                                 // custom html load behavior

  const { html, error } = await fetchPost(slug, store.sectionOf(route.params.type) ?? route.params.type)

  notFound.value = !error ? 0 : /not a note page|HTTP error 404/.test(error.message || '') ? 404 : 500
  noteContent.value = error ? '' : html
  if (error) { setCurrentPost(null); return }
  await nextTick()

  const contentElement = contentRef.value

  if (contentElement && !error) { 
    
    const mediaLoadPromises = []
    const mediaElements = contentElement.querySelectorAll('img, video, iframe')
    
    mediaElements.forEach(el => {
      
      if ((el.tagName === 'IMG' && !el.complete && (el.loading !== 'lazy' || el.getBoundingClientRect().top < window.innerHeight)) || (el.tagName === 'VIDEO' && el.readyState < 3) || (el.tagName === 'IFRAME')) {
          
        mediaLoadPromises.push(new Promise(resolve => {
          
          if (el.tagName === 'IMG') {
            el.addEventListener('load', resolve, { once: true })
            el.addEventListener('error', resolve, { once: true })
            if (el.complete) { resolve() }
          } else if (el.tagName === 'IFRAME') {
            el.addEventListener('load', resolve, { once: true })
            el.addEventListener('error', resolve, { once: true })
            try { if (el.contentDocument?.readyState === 'complete') resolve() } catch { resolve() }
          }
          
          else if (el.tagName === 'VIDEO') {
            el.addEventListener('loadedmetadata', resolve, { once: true })
            el.addEventListener('error', resolve, { once: true })
            if (el.readyState >= 3) { resolve() }
          }
          
        }))
        
      }
    })
    
    await Promise.race([ Promise.all(mediaLoadPromises), new Promise(resolve => setTimeout(resolve, 1000)) ])

  }

  await nextTick()
  await fitCentred()
  resetScroll()

  setTimeout(fitCentred, 400)

}

watch(isMobile, async (newVal) => { 

  await nextTick(); await fitCentred()

  if (!portalRef.value || !portalRef.value.runQueue) return
  if (newVal) {
    portalRef.value.runQueue('hidden')
  } else {
    if (route.params.slug) { portalRef.value.runQueue('hidden') }
    else { portalRef.value.runQueue('static') }
  }

})

const forcedError = Number(new URLSearchParams(window.location.search).get('error')) || 0

watch(() => route.params.filterType, ft => {
  if (ft === undefined) { if (!route.params.slug) notFound.value = forcedError; return }
  notFound.value = forcedError || (store.sectionOf(ft) ? 0 : 404)
}, { immediate: true })

watch(                                                                                                                                // trigger notes and animations 
  
  openKey,
  
  async slug => {
    
    if (store.processing) return
    setProcessing(true)

    if (store.sectionOf(route.params.type) !== 'diseño') fullBleed.value = false

    try {

    await nextTick()
    
    if (!slug && !store.notesLoaded) { await loadNotesIndex() }

    switch (true) {

      // back to home with note loaded, TRANSITION on note unload
      case !slug && noteLoaded:

        noteLoaded = false
        lastSlug = null
        notFound.value = 0
        if (isMobile.value) {
          await throughTheVeil(() => { setCurrentPost(null); aboutOpen.value = null; noteContent.value = '' }, 'transition-intro', 'transition-outro')
          break
        }
        await portalRef.value?.runQueue('transition-intro')
        setCurrentPost(null)
        aboutOpen.value = null
        noteContent.value = ''
        break
      
      case !slug && notFound.value:
        noteLoaded = false
        lastSlug = null
        setCurrentPost(null)
        aboutOpen.value = null
        noteContent.value = ''
        if (!firstLoad) await revealError()
        firstLoad = false
        break

      // first load without note, INTRO only on first page load
      case !slug && firstLoad:
        noteLoaded = false
        firstLoad = false
        lastSlug = null
        setCurrentPost(null)
        aboutOpen.value = null
        noteContent.value = ''
        if (isMobile.value) { await throughTheVeil(() => {}, 'static', 'direct', 500); break }
        await portalRef.value?.runQueue('intro')
        break
      
      // first note load, OUTRO only on first note load
      case slug && !noteLoaded && !firstLoad:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        if (isMobile.value) { await throughTheVeil(() => openInColumn(slug), 'intro', 'outro'); break }
        await openInColumn(slug)
        await portalRef.value?.runQueue('outro')
        await portalRef.value?.runQueue('hidden')
        break

      case slug && notFound.value:
        break
      
      // first load from url, DIRECT when loading from url
      case slug && !noteLoaded && firstLoad:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        if (isMobile.value) { await throughTheVeil(() => openInColumn(slug), 'static', 'direct', 500); break }
        await portalRef.value?.runQueue('static')
        await openInColumn(slug)
        await new Promise(resolve => setTimeout(resolve, 500))
        await portalRef.value?.runQueue('direct')
        break
      
      // loaded note change, TRANSITION when switching note
      case slug && noteLoaded && lastSlug !== slug:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        if (isMobile.value) { await throughTheVeil(() => openInColumn(slug), 'transition-intro', 'transition-outro'); break }
        await portalRef.value?.runQueue('transition-intro')
        await openInColumn(slug)
        await portalRef.value?.runQueue('transition-outro')
        break
      
    }

    } finally {

      fullBleed.value = store.currentPost?.type === 'diseño'
      setProcessing(false)

    }

  }, { immediate: true }

)

watch(() => store.lang, async () => {
  if (store.currentPost && store.currentPost.bilingual && !store.processing) {
    await handleLoadNote(store.currentPost.slug)
    return
  }
  await nextTick()
  await fitCentred()
  setTimeout(fitCentred, 400)
})

onMounted(async () => {
  checkViewport()
  await nextTick(); await fitCentred()
  window.addEventListener('resize', onResize)
  if (notFound.value) { await nextTick(); await new Promise(r => requestAnimationFrame(r)); await revealError() }
})
onUnmounted(() => { window.removeEventListener('resize', onResize); clearTimeout(resizeTimer) })

</script>

<template> 

  <div v-if="!isMobile || openKey || currentPost || notFound" class="notedisplay" :class="{ 'no-aperture': fullBleed, pending: openKey && !noteContent && !aboutOpen && !notFound }">
    
    <div class="container" ref="containerRef">

      <Portal class="portal" ref="portalRef"/>
      <Typewriter :portal="portalRef" :container="containerRef" :enabled="!currentPost && !aboutMode" />

      <div class="post" ref="postRef" :class="{ 'is-error': notFound }">

        <div class="content" ref="contentRef">

          <component :is="computedComp" v-if="computedComp" :metadata="currentPost" />                <!-- for vuecomp            -->
          <Notification v-else-if="notFound" :code="notFound" :key="route.fullPath" />
          <About v-else-if="aboutOpen && !notFound" :section="aboutOpen" :key="route.fullPath" />
          <template v-else>
            <NoteTitle v-if="currentPost && currentPost.type !== 'diseño'" :text="noteTitle" />
            <div :class="computedNoteClass" v-html="noteContent" />                                   <!-- for html posts          -->
          </template>

          <template v-if="currentPost && noteContent && !notFound && !computedNoteComp">
            <br><hr><br>
            <Subscribe />
            <br><hr><br>
            <About />
          </template>

        </div>
        
      </div>
      
    </div>

  </div>

</template>

<style scoped> 

.notedisplay {

  /* LAYOUT */ display: flex; flex-direction: column; height: 100%; gap: 1rem;
  /* STATE  */ --vig: 1;
  /* MASK   */ --vig-band: rgba(0,0,0,calc(1 - var(--vig))) 0, rgba(0,0,0,calc(1 - var(--vig) * 0.5647)) 1.2rem, rgba(0,0,0,calc(1 - var(--vig) * 0.3137)) 3rem, rgba(0,0,0,calc(1 - var(--vig) * 0.1451)) 5rem, #000 8rem;
               --vig-mask: radial-gradient(ellipse 50% 70% at 50% 30%, #000 100%, rgba(0,0,0,calc(1 - var(--vig) * 0.3137)) 127%, rgba(0,0,0,calc(1 - var(--vig) * 0.5647)) 152%),
                           linear-gradient(to right, var(--vig-band)), linear-gradient(to left, var(--vig-band)), linear-gradient(to top, var(--vig-band));
               -webkit-mask-image: var(--vig-mask); mask-image: var(--vig-mask);
               -webkit-mask-composite: source-in; mask-composite: intersect;
  /* MOTION */ transition: --vig var(--animate-fast);

}

@property --vig { syntax: '<number>'; inherits: false; initial-value: 1; }

.notedisplay.no-aperture { --vig: 0; }


.container {

  /* LAYOUT */ position: relative; overflow: hidden;
  /* BOX    */ width: 100%; height: 100%;

}


.notedisplay.no-aperture .post {
  -webkit-mask-size: 100% calc(100% + 4rem); mask-size: 100% calc(100% + 4rem);
  -webkit-mask-position: 0 -2rem;            mask-position: 0 -2rem;
}


.post {

  /* LAYOUT */ position: relative;
  /* BOX    */ height: 100%; width: 100%; overflow-x: hidden; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none;
  /* FILL   */ background-color: transparent;

  /* MASK   */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, black 2rem, black calc(100% - 2rem), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, black 2rem, black calc(100% - 2rem), transparent 100%);
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;   mask-size: 100% 100%;
  -webkit-mask-position: 0 0;     mask-position: 0 0;
  /* MOTION */ transition: -webkit-mask-size var(--animate-fast), -webkit-mask-position var(--animate-fast),
                           mask-size var(--animate-fast), mask-position var(--animate-fast);

  container-type: inline-size;
  container-name: post-viewer;

&::-webkit-scrollbar { display: none; }

  &.is-error .content { height: 100%; }

}

.portal {

  /* CURSOR */ pointer-events: none;
  /* LAYOUT */ position: absolute; top: 0; left: 0;
  /* BOX    */ width: 100%; height: 100%; z-index: 10;

}

.content { 

  /* LAYOUT */ position: relative; top: 0; left: 0;
  /* BOX    */ width: 100%;

}

@media (--mobile) { 

  .notedisplay { height: auto; min-height: auto; }
  .notedisplay.pending { min-height: 100svh; }

  .post { -webkit-mask-image: none; mask-image: none; }

  .notedisplay { -webkit-mask-image: none; mask-image: none; }

  .post::-webkit-scrollbar-thumb { background-color: var(--cristal) !important; }

  @supports not selector(::-webkit-scrollbar) { .post { scrollbar-width: none; scrollbar-color: var(--cristal) transparent; } }
  
}

@media (max-width: 500px) { .post hr { margin: 0; } }

</style>