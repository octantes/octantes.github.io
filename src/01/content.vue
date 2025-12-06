<script setup> 
import { ref, watch, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'
import Subscribe from '../02/subscribe.vue'
import Shader from '../03/shader.vue'

const compMap = { }                                                                                                                   // add vuecomps/fullcomps and import if needed

const router          = useRouter()                                                                                                   // handles note open route
const route           = useRoute()                                                                                                    // sets the current url route
const store           = useStore()                                                                                                    // initializes global store

const { currentPost, computedNoteComp, computedNoteClass, computedFullscreen } = storeToRefs(store)                                   // imports refs from main store
const { loadNotesIndex, setCurrentPost, setProcessing, fetchPost } = store                                                            // imports variables from main store

const shaderRef   = ref(null)                                                                                                         // shader variable for animations
const noteContent = ref('')                                                                                                           // basic note html for insert

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

async function handleLoadNote(slug) {                                                                                                 // custom html load behavior 
  
  const postElement = document.querySelector('.post')
  const { html, error } = await fetchPost(slug)

  noteContent.value = html
  if (postElement) { postElement.scrollTop = 0 }
  await nextTick()

  const contentElement = document.querySelector('.content')

  if (contentElement && !error) { 
    
    const mediaLoadPromises = []
    const mediaElements = contentElement.querySelectorAll('img, video, iframe')
    
    mediaElements.forEach(el => {
      
      if ((el.tagName === 'IMG' && !el.complete) || (el.tagName === 'VIDEO' && el.readyState < 3) || (el.tagName === 'IFRAME')) {
          
        mediaLoadPromises.push(new Promise(resolve => {
          
          if (el.tagName === 'IMG' || el.tagName === 'IFRAME') {
            el.addEventListener('load', resolve, { once: true })
            el.addEventListener('error', resolve, { once: true })
            if (el.complete || el.readyState === 'complete') { resolve() }
          }
          
          else if (el.tagName === 'VIDEO') {
            el.addEventListener('loadedmetadata', resolve, { once: true })
            el.addEventListener('error', resolve, { once: true })
            if (el.readyState >= 3) { resolve() }
          }
          
        }))
        
      }
    })
    
    await Promise.race([ Promise.all(mediaLoadPromises), new Promise(resolve => setTimeout(resolve, 3000)) ])
    if (!computedFullscreen.value && window.innerWidth <= 1080) { const scrollEl = document.querySelector('.scroll-into')
    if (scrollEl) { scrollEl.scrollIntoView({ behavior: 'smooth', block: 'start' }) } }
    
  }

}

watch(computedFullscreen, async () => { await forceShaderResize() })                                                                  // watches for shader resize 

watch(                                                                                                                                // trigger notes and animations 
  
  () => route.params.slug,
  
  async slug => {
    
    if (store.processing) return
    setProcessing(true)

    if (slug && route.params.type) {                                                                                                  // trigger side from note type
        store.activeFilter = route.params.type
        store.isCentered = true
    }

    await nextTick()
    
    if (!slug && !store.notesLoaded.value) { await loadNotesIndex() }

    switch (true) {

      // back to home with note loaded, TRANSITION on note unload
      case !slug && noteLoaded:

        noteLoaded = false
        lastSlug = null
        await shaderRef.value?.runQueue('transition-intro')
        setCurrentPost(null)
        noteContent.value = ''
        break
      
      // first load without note, INTRO only on first page load
      case !slug && firstLoad:
        noteLoaded = false
        firstLoad = false
        lastSlug = null
        setCurrentPost(null)
        noteContent.value = ''
        await shaderRef.value?.runQueue('intro')
        break
      
      // first note load, OUTRO only on first note load
      case slug && !noteLoaded && !firstLoad:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        await handleLoadNote(slug)
        await shaderRef.value?.runQueue('outro')
        break
      
      // first load from url, DIRECT when loading from url
      case slug && !noteLoaded && firstLoad:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
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
        await shaderRef.value?.runQueue('transition-intro')
        await handleLoadNote(slug)
        await shaderRef.value?.runQueue('transition-outro')
        break
      
    }

    setProcessing(false)
            
  }, { immediate: true }

)

</script>

<template> 

  <div class="notedisplay">
    
    <div class="container scroll-into" >

      <Shader class="shader" ref="shaderRef"/>

      <button v-if="computedFullscreen" class="fs-close" @click="store.navHome(router)" title="salir de la vista en pantalla completa" aria-label="cerrar el contenido en pantalla completa">X</button>

      <div class="post" :class="{ 'fs-mode': computedFullscreen }">

        <div class="content" :class="{ 'fs-content': computedFullscreen }">

          <component :is="computedComp" v-if="computedComp" :metadata="currentPost" />     <!-- for vuecomp/fullscreen  -->
          <div v-else :class="computedNoteClass" v-html="noteContent" />                   <!-- for html posts          -->

          <div v-if="currentPost && !computedNoteComp && !computedFullscreen"> <br><hr><br> </div>

          <Subscribe v-if="currentPost && !computedNoteComp && !computedFullscreen" />     <!-- subscribe to newsletter -->
          
        </div>
        
      </div>
      
    </div>

  </div>

</template>

<style scoped> 

.notedisplay { display: flex; flex-direction: column; height: 100%; gap: 1rem; }

.container { position: relative; }

.post { 

  /* LAYOUT */ position: relative;
  /* BOX    */ height: 100%; width: 100%; overflow-x: hidden; overflow-y: auto;
  /* FILL   */ background-color: var(--carbon);
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-ss);

  &::after {
    
    /* LAYOUT */ position: sticky; display: block; bottom: 0;
    /* BOX    */ height: 3rem; margin-top: -1rem;
    /* FONT   */ content: '';
    
  }

  &.fs-mode { background: none; overflow: hidden; &::after { display: none } }


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
  /* FILL   */ background-color: var(--niebla50); color: var(--carbon);
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { cursor: pointer; background-color: var(--niebla99); }

}

.sidebutton {

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: inline-flex; flex-direction: row; align-items: center; justify-content: center;
  /* BORDER */ border: none; border-radius: 9999px;
  /* BOX    */ padding: .5rem 1.5rem .5rem 1.5rem;
  /* FILL   */ background-color: var(--carbon25);
  /* MOTION */ transition: all var(--animate-fast);

  &:hover  { cursor: pointer; background-color: var(--carbon50); }
  &:active { transform: var(--scale-min); }
  
}

.content { 

  /* LAYOUT */ position: relative; top: 0; left: 0;
  /* BOX    */ width: 100%;

  &.fs-content { height: 100%; }

}

@media (max-width: 1080px) { 

  .post::-webkit-scrollbar-thumb { background-color: var(--cristal) !important; }

  @supports not selector(::-webkit-scrollbar) { .post { scrollbar-width: thin; scrollbar-color: var(--cristal) transparent; } }
  
}

</style>