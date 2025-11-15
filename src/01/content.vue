<script setup> 
import { ref, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'
import Portada from '../02/portada.vue'
import Shader from '../03/shader.vue'

// import vuecomps if needed for notes
const compMap = { portada: Portada } // add vuecomps if needed
const classMap = { dev: 'S6', note: 'S6', design: 'S7', music: 'S6' }

const route = useRoute()
const store = useStore()
const { currentPost } = storeToRefs(store)
const { loadNotesIndex, setCurrentPost, setProcessing, fetchPost } = store
const shaderRef = ref(null)
const noteContent = ref('')

let noteLoaded = false
let firstLoad = true
let lastSlug = null

const computedComp = computed(() => {

    if (currentPost.value) {

        const customVuecomp = currentPost.value.vuecomp
        if (customVuecomp && compMap[customVuecomp]) { return compMap[customVuecomp] }

    }

    return null

})

const computedClass = computed(() => {

    if (currentPost.value) {
        
        const typeKey = currentPost.value.type
        return classMap[typeKey] || 'S6' 

    }

    return 'S6' 

})

async function handleLoadNote(slug) { 
  
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
    if (window.innerWidth <= 1080) { const scrollEl = document.querySelector('.scroll-into')
    if (scrollEl) { scrollEl.scrollIntoView({ behavior: 'smooth', block: 'start' }) } }
    
  }

}

watch( 
  
  () => route.params.slug,
  
  async slug => {
    
    if (store.processing) return
    setProcessing(true)
    document.body.style.cursor = 'wait'
    await nextTick()
    
    if (!slug && !store.notesLoaded.value) { await loadNotesIndex() }

    switch (true) {
      
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

      document.body.style.cursor = ''
      setProcessing(false)
            
  }, { immediate: true }

)

</script>

<template> 

  <div class="notedisplay">
  
    <Portada :metadata="currentPost || {}" class="scroll-into" />
    
    <div class="container">

      <Shader class ="shader" ref="shaderRef"/>

      <div class="post">

        <div class="content">

          <component :is="computedComp" v-if="computedComp" :metadata="currentPost" />
          
          <div v-else :class="computedClass" v-html="noteContent" />
          
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
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-xs);

  &::after {
    
    /* LAYOUT */ position: sticky; display: block; bottom: 0;
    /* BOX    */ height: 3rem; margin-top: -1rem;
    /* FONT   */ content: '';
    
  }

}

.shader { 
  
  /* CURSOR */ pointer-events: none;
  /* LAYOUT */ position: absolute; top: 0; left: 0;
  /* BOX    */ width: 100%; height: 100%; z-index: 10;
  
}

.content { 

  /* LAYOUT */ position: relative; top: 0; left: 0;
  /* BOX    */ width: 100%;

}

@media (max-width: 1080px) { .post::-webkit-scrollbar-thumb { background-color: var(--cristal) !important; } }

</style>