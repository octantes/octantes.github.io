<script setup> 
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'
import About from '../02/about.vue'
import Subscribe from '../02/subscribe.vue'
import Shader from '../03/shader.vue'
import NotFound from '../02/notfound.vue'
import { throughTheVeil } from '../03/veil.js'
import Typewriter from '../03/typewriter.vue'

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

const shaderRef   = ref(null)                                                                                                         // shader variable for animations
const containerRef= ref(null)                                                                                                         // ref for the portal box, where pointer effects listen
const postRef     = ref(null)                                                                                                         // ref for post scroll container
const contentRef  = ref(null)                                                                                                         // ref for content element
const noteContent = ref('')                                                                                                           // basic note html for insert
const notFound    = ref(0)                                                                                                            // status code to show instead of a note, 0 for none

const fullBleed = ref(false)

let noteLoaded = false                                                                                                                // note loaded bool flag for shader
let firstLoad  = true                                                                                                                 // first load bool flag for shader
let lastSlug   = null                                                                                                                 // previous slug flag for shader

const computedComp = computed(() => {                                                                                                 // compute vuecomp if it exists 

  if (computedFullscreen.value) { return compMap[computedFullscreen.value] || null }
  if (computedNoteComp.value) { return compMap[computedNoteComp.value] || null }
  return null

})

async function forceShaderResize() {                                                                                                  // forces shader resize 

  await nextTick()
  window.dispatchEvent(new Event('resize'))
  await new Promise(resolve => requestAnimationFrame(resolve))

}

async function revealError() {
  if (isMobile.value || !shaderRef.value) return
  await shaderRef.value.runQueue('outro')
  await shaderRef.value.runQueue('hidden')
}

function resetScroll() {
  document.querySelector('.layout')?.scrollTo?.({ top: 0, behavior: 'auto' })
  if (postRef.value) postRef.value.scrollTop = 0
  const col = document.querySelector('.articulos')
  if (col) col.scrollTop = 0
}

const VERSO_MAX = 21.6                                                                                                                // 1.35rem, the ceiling the wide layout already uses
const FIT_STEPS = 7                                                                                                                   // halvings, so the result lands within ~0.1px

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

  if (document.fonts?.ready) await document.fonts.ready                                                                               // metrics change when the webfont lands

  for (const t of targets) {

    const blocks = textBlocks(t.el)

    if (!blocks.length) continue

    const base = parseFloat(getComputedStyle(t.el).fontSize) || 16
    if (breaks(t.el, blocks, t.row)) continue                                                                                         // already breaking at the column's size, nothing to win

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

async function handleLoadNote(slug) {                                                                                                 // custom html load behavior

  const { html, error } = await fetchPost(slug, route.params.type)

  /* Two failures, told apart: a note that is not there, and a note we could not
     reach. The first is the reader's mistake and says so; the second is ours. */

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

  await nextTick(); await fitCentred()                                                                                                        // the breakpoint is what decides whether a note is fitted

  if (!shaderRef.value || !shaderRef.value.runQueue) return
  if (newVal) {
    shaderRef.value.runQueue('hidden')
  } else {
    if (route.params.slug) { shaderRef.value.runQueue('hidden') }
    else { shaderRef.value.runQueue('static') }
  }

})

watch(computedFullscreen, async () => { await forceShaderResize() })                                                                  // watches for shader resize 

const forcedError = Number(new URLSearchParams(window.location.search).get('error')) || 0

watch(() => route.params.filterType, ft => {
  if (ft === undefined) { if (!route.params.slug) notFound.value = forcedError; return }
  notFound.value = forcedError || (store.tabs.some(tab => tab.value === ft) ? 0 : 404)
}, { immediate: true })

watch(                                                                                                                                // trigger notes and animations 
  
  () => route.params.slug,
  
  async slug => {
    
    if (store.processing) return
    setProcessing(true)

    try {

    await nextTick()
    
    if (!slug && !store.notesLoaded) { await loadNotesIndex() }

    switch (true) {

      // back to home with note loaded, TRANSITION on note unload
      case !slug && noteLoaded:

        noteLoaded = false
        lastSlug = null
        notFound.value = 0
        if (!isMobile.value) await shaderRef.value?.runQueue('transition-intro')
        setCurrentPost(null)
        noteContent.value = ''
        resetSEOTags()
        break
      
      // an unknown filter is an error, not an empty gallery: no intro, the field
      // steps aside and the error state takes the column
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
        if (!isMobile.value) await shaderRef.value?.runQueue('intro')
        break
      
      // first note load, OUTRO only on first note load
      case slug && !noteLoaded && !firstLoad:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        if (isMobile.value) { await throughTheVeil(() => handleLoadNote(slug), 'intro', 'outro'); break }
        await handleLoadNote(slug)
        await shaderRef.value?.runQueue('outro')
        await shaderRef.value?.runQueue('hidden')
        break

      // a note that turned out not to exist still needs the field to move
      case slug && notFound.value:
        break
      
      // first load from url, DIRECT when loading from url
      case slug && !noteLoaded && firstLoad:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        if (isMobile.value) { await throughTheVeil(() => handleLoadNote(slug), 'static', 'direct', 500); break }
        await shaderRef.value?.runQueue('static')
        await handleLoadNote(slug)
        await new Promise(resolve => setTimeout(resolve, 500))
        await shaderRef.value?.runQueue('direct')
        break
      
      // loaded note change, TRANSITION when switching note
      case slug && noteLoaded && lastSlug !== slug:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        if (isMobile.value) { await throughTheVeil(() => handleLoadNote(slug), 'transition-intro', 'transition-outro'); break }
        await shaderRef.value?.runQueue('transition-intro')
        await handleLoadNote(slug)
        await shaderRef.value?.runQueue('transition-outro')
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

  <div v-if="!isMobile || currentPost" class="notedisplay" :class="{ 'no-aperture': fullBleed }">
    
    <div class="container" ref="containerRef" :class="{ 'fs-container': computedFullscreen }">

      <Shader class="shader" ref="shaderRef"/>
      <Typewriter :shader="shaderRef" :container="containerRef" :enabled="!currentPost && !computedFullscreen" />

      <button v-if="computedFullscreen" class="fs-close" @click="store.navHome(router)" :title="store.t.portfolio.closeFullscreen" :aria-label="store.t.portfolio.closeFullscreenAria">X</button>

      <div class="post" ref="postRef" :class="{ 'fs-mode': computedFullscreen, 'is-error': notFound }">

        <div class="content" ref="contentRef" :class="{ 'fs-content': computedFullscreen }">

          <component :is="computedComp" v-if="computedComp" :metadata="currentPost" />                <!-- for vuecomp/fullscreen  -->
          <NotFound v-else-if="notFound" :code="notFound" :key="route.fullPath" />                    <!-- for anything missing    -->
          <div v-else :class="computedNoteClass" v-html="noteContent" />   <!-- for html posts          -->

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

  /* LAYOUT */ position: relative;

}

/* Paint rather than mask: a mask here would make the canvas translucent, and
   the state machine depends on the field being solid while a note swaps in. */

.container::after {

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

.notedisplay.no-aperture .container::after { opacity: 0; }

.notedisplay.no-aperture .post {
  -webkit-mask-size: 100% calc(100% + 4rem); mask-size: 100% calc(100% + 4rem);
  -webkit-mask-position: 0 -2rem;            mask-position: 0 -2rem;
}

.container.fs-container::after { display: none; }

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

.shader {

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

  /* the column stops being a viewport here and joins the document scroll, so
     the aperture would clip the page rather than frame it */
  .post { -webkit-mask-image: none; mask-image: none; }

  .container::after { display: none; }

  .post::-webkit-scrollbar-thumb { background-color: var(--cristal) !important; }

  @supports not selector(::-webkit-scrollbar) { .post { scrollbar-width: none; scrollbar-color: var(--cristal) transparent; } }
  
}

@media (max-width: 500px) { .post hr { margin: 0; } }

</style>