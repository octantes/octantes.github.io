<script setup> 
import { ref, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '../04/store.js'
import Shader from '../03/shader.vue'
import Portada from './portada.vue'
import A2 from '../02/A2.vue'
import S6 from '../02/S6.vue'
import S7 from '../02/S7.vue'
import N9 from '../02/N9.vue'

// import vuecomps if needed for notes

const store = useStore()
const components = { dev: A2, note: S6, design: S7, music: N9 } // add vuecomps if needed

const currentComponent = computed(() => {
  
  if (currentPost.value) {
    
    const customVuecomp = currentPost.value.vuecomp
    if (customVuecomp && components[customVuecomp]) { return components[customVuecomp] }
    const typeComp = components[currentPost.value.type]
    if (typeComp) { return typeComp}

  }

  return components.note

})

const route = useRoute()
const shaderRef = ref(null)
const noteContent = ref('')
const currentPost = ref(null)

let noteLoaded = false
let firstLoad = true
let lastSlug = null

async function loadNote(slug) { 

  if (!slug) { noteContent.value = ''; currentPost.value = null; return }
  const index = await store.loadNotesIndex()
  currentPost.value = index.find(p => p.slug === slug) || { type: 'note', slug }

  try {

    const fetchPath = currentPost.value.url || `/posts/${currentPost.value.type || 'note'}/${slug}/`
    const res = await fetch(fetchPath)
    const html = await res.text()
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    noteContent.value = html
    if (currentPost.value.title && currentPost.value.title !== document.title) document.title = currentPost.value.title
    await nextTick()
    const contentElement = document.querySelector('.content')

    if (contentElement) {
      
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
    
  } catch (e) { noteContent.value = `<p>error cargando la nota</p>`; console.error(`error fetching slug "${slug}":`, e) }

}

watch( 
  
  () => route.params.slug,
  
  async slug => {
    
    if (store.processing) return
    store.setProcessing(true)
    document.body.style.cursor = 'wait'
    await nextTick()
    await store.loadNotesIndex()

    const postElement = document.querySelector('.post')
    
    switch (true) {
      
      // first load without note, INTRO only on first page load
      case !slug && firstLoad:
        noteLoaded = false
        firstLoad = false
        lastSlug = null
        await shaderRef.value?.runQueue('intro')
        break
      
      // first note load, OUTRO only on first note load
      case slug && !noteLoaded && !firstLoad:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        await loadNote(slug)
        if (postElement) { postElement.scrollTop = 0 }
        await shaderRef.value?.runQueue('outro')
        break
      
      // first load from url, DIRECT when loading from url
      case slug && !noteLoaded && firstLoad:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        await shaderRef.value?.runQueue('static')
        await loadNote(slug)
        if (postElement) { postElement.scrollTop = 0 }
        await new Promise(resolve => setTimeout(resolve, 500))
        await shaderRef.value?.runQueue('direct')
        break
      
      // loaded note change, TRANSITION when switching note
      case slug && noteLoaded && lastSlug !== slug:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        await shaderRef.value?.runQueue('transition-intro')
        await loadNote(slug)
        if (postElement) { postElement.scrollTop = 0 }
        await shaderRef.value?.runQueue('transition-outro')
        break
      
      }

      document.body.style.cursor = ''
      store.setProcessing(false)
            
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
          
          <component :is="currentComponent" :html="noteContent" />
          
        </div>
        
      </div>
      
    </div>

  </div>

</template>

<style scoped> 

@media (max-width: 1080px) { .post::-webkit-scrollbar-thumb { background-color: var(--cristal) !important; } }

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

</style>