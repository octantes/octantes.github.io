<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import Shader from '../recursos/shader.vue'

const route = useRoute()
const shaderRef = ref(null)
const noteContent = ref('')
let noteLoaded = false
let firstLoad = true

function runShader(state) {
  switch (state) {
    case 'intro':         shaderRef.value?.runIntro();        break          // only on first page load
    case 'static':        shaderRef.value?.runStatic();       break          // when in between states
    case 'outro':         shaderRef.value?.runOutro();        break          // only on first note load
    case 'transition':    shaderRef.value?.runTransition();   break          // when switching note
    case 'direct':        shaderRef.value?.runDirect();       break          // when loading from url
    case 'hidden':        shaderRef.value?.runHidden();       break          // when note is loaded
  }
}

async function loadNote(slug) {
  if (!slug) { noteContent.value = ''; return }
  try {
    const res = await fetch(`/posts/${slug}/`)
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    noteContent.value = await res.text()
  } catch (e) {
    noteContent.value = `<p>error cargando la nota</p>`
    console.error(`error fetching slug "${slug}":`, e)
  }
}

watch(

  () => route.params.slug,  

  async slug => {

    await nextTick()

    switch (true) {

      // first load without note
      case !slug && firstLoad:

        runShader('intro')
        noteLoaded = false
        firstLoad = false

        break

      // first note load
      case slug && !noteLoaded && !firstLoad:

        runShader('outro')
        await loadNote(slug)
        noteLoaded = true
        firstLoad = false
        
        break

      // first load from url
      case slug && !noteLoaded && firstLoad:

        runShader('direct')
        await loadNote(slug)
        noteLoaded = true
        firstLoad = false
        
        break
      
      // loaded note change
      case slug && noteLoaded:

        runShader('transition')
        setTimeout(async () => { await loadNote(slug) }, 2000)
        noteLoaded = true
        firstLoad = false

        break

      default:

        noteLoaded = false

        break

    }

  }, { immediate: true }

)
</script>

<template>
  <div class="post">
    <Shader ref="shaderRef"/>
    <div class="text" v-if="noteContent" v-html="noteContent"></div>
  </div>
</template>

<style>
.post {
  background-color: #1B1C1C;
  border: 1px solid #AAABAC;
  width: 100%;
}
.text {
  color: #AAABAC;
  padding: 1rem;
}
</style>