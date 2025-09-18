<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import Shader from '../recursos/shader.vue'

const route = useRoute()
const shaderRef = ref(null)
const noteContent = ref('')
let noteLoaded = false
let firstLoad = true
let lastSlug = null

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
    const html = await res.text()
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    noteContent.value = html
    updateHead(html)
  } catch (e) {
    noteContent.value = `<p>error cargando la nota</p>`
    console.error(`error fetching slug "${slug}":`, e)
  }
}

function updateHead(html) {

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  document.title = doc.querySelector('title')?.textContent || ''
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href')
  let canonicalEl = document.querySelector('link[rel="canonical"]')

  if (!canonicalEl) {
    canonicalEl = document.createElement('link')
    canonicalEl.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalEl)
  }

  canonicalEl.setAttribute('href', canonical || window.location.href)

  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')
  let descEl = document.querySelector('meta[name="description"]')

  if (!descEl) {
    descEl = document.createElement('meta')
    descEl.setAttribute('name', 'description')
    document.head.appendChild(descEl)
  }

  descEl.setAttribute('content', description || '')

  const ogProps = ['og:title', 'og:description', 'og:image']
  ogProps.forEach(prop => {
    const value = doc.querySelector(`meta[property="${prop}"]`)?.getAttribute('content')
    let el = document.querySelector(`meta[property="${prop}"]`)

    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', prop)
      document.head.appendChild(el)
    }

    el.setAttribute('content', value || '')

  })

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
        lastSlug = null
        break

      // first note load
      case slug && !noteLoaded && !firstLoad:
        runShader('outro')
        await loadNote(slug)
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        break

      // first load from url
      case slug && !noteLoaded && firstLoad:
        runShader('direct')
        await loadNote(slug)
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        break
      
      // loaded note change
      case slug && noteLoaded && lastSlug !== slug:
        runShader('transition')
        setTimeout(async () => { await loadNote(slug) }, 1300)
        noteLoaded = true
        firstLoad = false
        lastSlug = slug
        break

    }

  }, { immediate: true }

)
</script>

<template>
  <div class="post">
    <Shader class ="shader" ref="shaderRef"/>
    <div class="content">
      <div class="text" v-if="noteContent" v-html="noteContent"></div>
    </div>
  </div>
</template>

<style>

.post {
  position: relative;
  height: 100%;
  width: 100%;
  background-color: #1B1C1C;
  border: 1px solid #AAABAC;
  overflow-x: hidden;
}

.shader {
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
  padding: 0rem 1rem;
}

.text {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
  color: #AAABAC;
  font-size: 1rem;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: break-word;
  padding: 1rem;
}

.text img {
  display: block;
  max-width: 100%;
  height: auto;
}

</style>