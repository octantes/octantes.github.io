<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import Shader from '../03/shader.vue'
import Portada from '../03/portada.vue'
import A2 from '../02/A2.vue'
import S6 from '../02/S6.vue'
import S7 from '../02/S7.vue'
import N9 from '../02/N9.vue'

const emit = defineEmits(['updateProcessing'])
const processing = ref(false)

const components = { dev: A2, note: S6, design: S7, music: N9 }
const currentComponent = computed (() => currentPost.value?.type ? components[currentPost.value.type] : components.note )

const route = useRoute()
const shaderRef = ref(null)
const postsIndex = ref([])
const noteContent = ref('')
const currentPost = ref(null)

let noteLoaded = false
let firstLoad = true
let lastSlug = null

async function loadIndex() { try { const res = await fetch('/index.json'); postsIndex.value = await res.json() } catch { postsIndex.value = [] } }

async function loadNote(slug) { 

  if (!slug) { noteContent.value = ''; currentPost.value = null; return }

  currentPost.value = postsIndex.value.find(p => p.slug === slug) || { type: 'note', slug }

  try {

    const fetchPath = currentPost.value.url || `/posts/${currentPost.value.type || 'note'}/${slug}/`
    const res = await fetch(fetchPath)
    const html = await res.text()
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    noteContent.value = html
    if (currentPost.value.title && currentPost.value.title !== document.title) document.title = currentPost.value.title
    
    await nextTick()
    
    const contentEl = document.querySelector('.content')

    if (contentEl) {
      
      const mediaLoadPromises = []
      
      const mediaElements = contentEl.querySelectorAll('img, video, iframe')
      
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
      
    }
    
  } catch (e) { noteContent.value = `<p>error cargando la nota</p>`; console.error(`error fetching slug "${slug}":`, e) }

}

watch(
  
  () => route.params.slug,
  
  async slug => {
    
    if (processing.value) return
    processing.value = true; emit('updateProcessing', processing.value)
    document.body.style.cursor = 'wait'
    await nextTick()
    
    if (!postsIndex.value.length) await loadIndex()
    
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
        await shaderRef.value?.runQueue('outro')
        break
      
      // first load from url, DIRECT when loading from url
      case slug && !noteLoaded && firstLoad:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        await loadNote(slug)
        await shaderRef.value?.runQueue('direct')
        break
      
      // loaded note change, TRANSITION when switching note
      case slug && noteLoaded && lastSlug !== slug:
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        await shaderRef.value?.runQueue('transition-intro')
        await loadNote(slug)
        await shaderRef.value?.runQueue('transition-outro')
        break
      
      }

      document.body.style.cursor = ''
      processing.value = false; emit('updateProcessing', processing.value)
            
  }, { immediate: true }

)

</script>

<template>

  <div class="container">

    <Shader class ="shader" ref="shaderRef"/>
    
    <div class="post">
      
      <div class="content">
        
        <Portada v-if="currentPost && currentPost.type !== 'design'" :metadata="currentPost || {}" />
        <component :is="currentComponent" :html="noteContent" />
        
      </div>
      
    </div>
    
  </div>

</template>

<style>

@media (max-width: 1080px) { .post { height: auto; overflow-y: visible; } }

.container { position: relative; border-radius: 5px; }
.post::-webkit-scrollbar-thumb { background-color: #8AB6BB !important; }

.post {
  position: relative;
  height: 100%;
  width: 100%;
  background-color: #1B1C1C;
  border: 1px solid #AAABAC25;
  overflow-x: hidden;
}

.shader {
  pointer-events: none;
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  width: 100%;
  z-index: 10;
}

.content {
  position: relative;
  top: 0; left: 0;
  height: 100%;
  width: 100%;
}

.content::after {
  content: '';
  display: block;
  height: 3rem;
  margin-top: -1rem;
  background: linear-gradient(to bottom, #1B1C1C00 0%, #1B1C1CFF 100%);
  position: sticky;
  bottom: 0;
}

</style>