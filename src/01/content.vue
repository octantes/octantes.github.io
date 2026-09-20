<script setup> 
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'
import About from '../02/about.vue'
import Subscribe from '../02/subscribe.vue'
import Portal from '../03/portal.vue'
import Notification from '../02/notification.vue'
import { throughTheVeil } from '../03/veil.js'
import Typewriter from '../03/typewriter.vue'
import NoteTitle from '../03/title.vue'

const compMap = { }                                                                                                                   // add vuecomps/fullcomps and import if needed

const router          = useRouter()                                                                                                   // handles note open route
const route           = useRoute()                                                                                                    // sets the current url route
const store           = useStore()                                                                                                    // initializes global store
const isMobile        = ref(false)                                                                                                    // mobile state

let resizeTimer = null                                                                                                                // save resize timer

function checkViewport() { isMobile.value = window.innerWidth <= 1080 }                                                               // detect mobile

function onResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { checkViewport(); fitCentred() }, 150) }                                       // use resize timer

const { currentPost, computedNoteComp, computedNoteClass, computedFullscreen } = storeToRefs(store)                                   // imports refs from main store
const { loadNotesIndex, setCurrentPost, setProcessing, fetchPost, resetSEOTags } = store                                          // imports variables from main store

const portalRef   = ref(null)                                                                                                         // shader variable for animations
const containerRef= ref(null)
const postRef     = ref(null)                                                                                                         // ref for post scroll container
const contentRef  = ref(null)                                                                                                         // ref for content element
const noteContent = ref('')                                                                                                           // basic note html for insert
const notFound    = ref(0)

const fullBleed = ref(false)

/* the about opens in the note column and behaves as a note: the state machine
   keys off openKey, so it gets the same field moves, the same direct-from-url
   beat and the same transitions between it and any note */

const aboutMode = computed(() => route.path.startsWith('/about/') ? route.params.section : null)
const noteTitle = computed(() => {                                                                                                    // the title as shown, language aware
  const p = currentPost.value
  if (!p) return ''
  return (store.lang === 'en' && p.bilingual && p.titleEn) ? p.titleEn : (p.title || '')
})

const openKey   = computed(() => route.params.slug || (aboutMode.value ? 'about:' + aboutMode.value : undefined))

let noteLoaded = false                                                                                                                // note loaded bool flag for shader
let firstLoad  = true                                                                                                                 // first load bool flag for shader
let lastSlug   = null                                                                                                                 // previous slug flag for shader

const computedComp = computed(() => {                                                                                                 // compute vuecomp if it exists 

  if (computedFullscreen.value) { return compMap[computedFullscreen.value] || null }
  if (computedNoteComp.value) { return compMap[computedNoteComp.value] || null }
  return null

})

async function forcePortalResize() {                                                                                                  // forces shader resize 

  await nextTick()
  window.dispatchEvent(new Event('resize'))
  await new Promise(resolve => requestAnimationFrame(resolve))

}

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

async function openInColumn(key) {                                                                                                    // a note, or the about for a section

  if (String(key).startsWith('about:')) {
    const section = String(key).slice(6)
    notFound.value = store.tabs.some(tab => tab.value === section) ? 0 : 404                                                          // a section that is not one is a 404, as a bad slug is
    noteContent.value = ''
    setCurrentPost(null)
    resetSEOTags()
    await nextTick()
    resetScroll()
    return
  }

  return handleLoadNote(key)

}

async function handleLoadNote(slug) {                                                                                                 // custom html load behavior

  const { html, error } = await fetchPost(slug, route.params.type)

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

watch(computedFullscreen, async () => { await forcePortalResize() })                                                                  // watches for shader resize 

const forcedError = Number(new URLSearchParams(window.location.search).get('error')) || 0

watch(() => route.params.filterType, ft => {
  if (ft === undefined) { if (!route.params.slug) notFound.value = forcedError; return }
  notFound.value = forcedError || (store.tabs.some(tab => tab.value === ft) ? 0 : 404)
}, { immediate: true })

watch(                                                                                                                                // trigger notes and animations 
  
  openKey,
  
  async slug => {
    
    if (store.processing) return
    setProcessing(true)

    if (route.params.type !== 'diseño') fullBleed.value = false

    try {

    await nextTick()
    
    if (!slug && !store.notesLoaded) { await loadNotesIndex() }

    switch (true) {

      // back to home with note loaded, TRANSITION on note unload
      case !slug && noteLoaded:

        noteLoaded = false
        lastSlug = null
        notFound.value = 0
        if (isMobile.value) {                                                                                                         // the field sweeps in, the home page arrives behind it, the field sweeps out
          await throughTheVeil(() => { setCurrentPost(null); noteContent.value = ''; resetSEOTags() }, 'transition-intro', 'transition-outro')
          break
        }
        await portalRef.value?.runQueue('transition-intro')
        setCurrentPost(null)
        noteContent.value = ''
        resetSEOTags()
        break
      
      case !slug && notFound.value:
        noteLoaded = false
        lastSlug = null
        setCurrentPost(null)
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
        noteContent.value = ''
        resetSEOTags()
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

  <div v-if="!isMobile || currentPost || notFound || aboutMode" class="notedisplay" :class="{ 'no-aperture': fullBleed }">
    
    <div class="container" ref="containerRef" :class="{ 'fs-container': computedFullscreen }">

      <Portal class="portal" ref="portalRef"/>
      <Typewriter :portal="portalRef" :container="containerRef" :enabled="!currentPost && !aboutMode && !computedFullscreen" />

      <button v-if="computedFullscreen" class="fs-close" @click="store.navHome(router)" :title="store.t.portfolio.closeFullscreen" :aria-label="store.t.portfolio.closeFullscreenAria">X</button>

      <div class="post" ref="postRef" :class="{ 'fs-mode': computedFullscreen, 'is-error': notFound }">

        <div class="content" ref="contentRef" :class="{ 'fs-content': computedFullscreen }">

          <component :is="computedComp" v-if="computedComp" :metadata="currentPost" />                <!-- for vuecomp/fullscreen  -->
          <Notification v-else-if="notFound" :code="notFound" :key="route.fullPath" />
          <About v-else-if="aboutMode && !notFound" :section="aboutMode" :key="route.fullPath" />                                       <!-- the section's about     -->
          <template v-else>
            <NoteTitle v-if="currentPost && currentPost.type !== 'diseño'" :text="noteTitle" />      <!-- design notes open straight into the work -->
            <div :class="computedNoteClass" v-html="noteContent" />                                   <!-- for html posts          -->
          </template>

          <template v-if="currentPost && !notFound && !computedNoteComp && !computedFullscreen">
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

.notedisplay { display: flex; flex-direction: column; height: 100%; gap: 1rem; }

.container {

  /* LAYOUT */ position: relative; overflow: hidden;
  /* BOX    */ width: 100%; height: 100%;

}

.notedisplay > .container::after {

  /* CURSOR */ pointer-events: none;
  /* LAYOUT */ content: ''; position: absolute; inset: 0; z-index: 11;
  /* STATE  */ opacity: 1;
  /* FILL   */
  background:
    radial-gradient(ellipse 50% 70% at 50% 30%, transparent 100%, var(--carbon-a31) 127%, var(--carbon-a56) 152%),
    linear-gradient(to right, var(--carbon) 0, var(--carbon-a56) 1.2rem, var(--carbon-a31) 3rem, var(--carbon-a15) 5rem, transparent 8rem),
    linear-gradient(to left,  var(--carbon) 0, var(--carbon-a56) 1.2rem, var(--carbon-a31) 3rem, var(--carbon-a15) 5rem, transparent 8rem),
    linear-gradient(to top,   var(--carbon) 0, var(--carbon-a56) 1.2rem, var(--carbon-a31) 3rem, var(--carbon-a15) 5rem, transparent 8rem);
  /* MOTION */ transition: opacity var(--animate-fast);

}

.notedisplay.no-aperture > .container::after { opacity: 0; }

.notedisplay.no-aperture .post {
  -webkit-mask-size: 100% calc(100% + 4rem); mask-size: 100% calc(100% + 4rem);
  -webkit-mask-position: 0 -2rem;            mask-position: 0 -2rem;
}

.notedisplay > .container.fs-container::after { display: none; }

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
  &.fs-mode { background: none; overflow: hidden; -webkit-mask-image: none; mask-image: none; &::after { display: none } }

}

.portal {

  /* CURSOR */ pointer-events: none;
  /* LAYOUT */ position: absolute; top: 0; left: 0;
  /* BOX    */ width: 100%; height: 100%; z-index: 10;

}

.fs-close {
  
  /* CURSOR */ user-select: none;
  /* LAYOUT */ position: absolute; top: 1rem; right: 2rem; z-index: 20;
  /* BORDER */ border: none; border-radius: 9999px;
  /* BOX    */ padding: .8rem 1rem .8rem 1rem;
  /* FILL   */ background-color: var(--niebla-a31); color: var(--carbon);
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { cursor: pointer; background-color: var(--niebla-a60); }

}

.content { 

  /* LAYOUT */ position: relative; top: 0; left: 0;
  /* BOX    */ width: 100%;

  &.fs-content { height: 100%; }

}

@media (max-width: 1080px) { 

  .notedisplay { height: auto; min-height: auto; }

  .post { -webkit-mask-image: none; mask-image: none; }

  .notedisplay > .container::after { display: none; }

  .post::-webkit-scrollbar-thumb { background-color: var(--cristal) !important; }

  @supports not selector(::-webkit-scrollbar) { .post { scrollbar-width: none; scrollbar-color: var(--cristal) transparent; } }
  
}

@media (max-width: 500px) { .post hr { margin: 0; } }

</style>