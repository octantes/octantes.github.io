<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import Shader from '../04/shader.vue'
import Portada from './portada.vue'
import A2 from '../02/A2.vue'
import S6 from '../02/S6.vue'
import S7 from '../02/S7.vue'
import N9 from '../02/N9.vue'

const components = { dev: A2, note: S6, design: S7, music: N9 }

const route = useRoute()
const shaderRef = ref(null)
const postsIndex = ref([])
const noteContent = ref('')
const currentPost = ref(null)

let noteLoaded = false
let firstLoad = true
let lastSlug = null

const currentComponent = computed (() =>
  currentPost.value?.type ? components[currentPost.value.type] : components.note
)

async function loadIndex() {
  try {
    const res = await fetch('/index.json')
    postsIndex.value = await res.json()
  } catch { postsIndex.value = [] }
}

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
  } catch (e) {
    noteContent.value = `<p>error cargando la nota</p>`
    console.error(`error fetching slug "${slug}":`, e)
  }
}

watch(

  () => route.params.slug,

  async slug => {

    await nextTick()

    if (!postsIndex.value.length) await loadIndex()
  
    switch (true) {

      // first load without note, INTRO only on first page load

      case !slug && firstLoad:
        
        noteLoaded = false
        firstLoad = false
        await shaderRef.value?.runIntro()
        lastSlug = null
        break

      // first note load, OUTRO only on first note load

      case slug && !noteLoaded && !firstLoad:

        noteLoaded = true
        firstLoad = false
        await shaderRef.value?.runOutro()
        await loadNote(slug)
        lastSlug = slug
        break

      // first load from url, DIRECT when loading from url

      case slug && !noteLoaded && firstLoad:

        noteLoaded = true
        firstLoad = false
        shaderRef.value?.runDirect()
        await loadNote(slug)
        lastSlug = slug
        break
      
      // loaded note change, TRANSITION when switching note

      case slug && noteLoaded && lastSlug !== slug:

        noteLoaded = true
        firstLoad = false
        await shaderRef.value?.runTransitionIntro()
        await loadNote(slug)
        await shaderRef.value?.runTransitionOutro()
        lastSlug = slug
        break

    }

  }, { immediate: true }

)

</script>

<template>

  <div class="container">

    <Shader class ="shader" ref="shaderRef"/>
    
    <div class="post">
      
      <div class="content">
        
        <Portada v-if="currentPost" :metadata="currentPost || {}" />
        <component :is="currentComponent" :html="noteContent" />
        
      </div>
      
    </div>
    
  </div>

</template>

<style>

.container { position: relative; }

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