<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import Shader from '../recursos/shader.vue'

const route = useRoute()
const shaderRef = ref(null)
const noteContent = ref('')
let noteLoaded = false
let firstLoad = true
let lastSlug = null

const postsIndex = ref([])
const currentPost = ref(null)

const components = {
  note: Note,
  design: Design,
  music: Music,
  dev: Dev
}

const currentComponent = computed (() =>
  currentPost.value?.type ? components[currentPost.value.type] : components.note
)

async function fetchIndex() {
  try {
    const res = await fetch('/index.json')
    postsIndex.value = await res.json()
  } catch {}
}

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
  if (!slug) { noteContent.value = ''; currentPost.value = null; return }
  currentPost.value = postsIndex.value.find(p => p.slug === slug) || { type: 'note' }
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
  document.title = doc.querySelector('title')?.textContent || '' // title
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') // canonical
  let canonicalEl = document.querySelector('link[rel="canonical"]')

  if (!canonicalEl) {
    canonicalEl = document.createElement('link')
    canonicalEl.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalEl)
  }

  canonicalEl.setAttribute('href', canonical || window.location.href)

  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') // description
  let descEl = document.querySelector('meta[name="description"]')

  if (!descEl) {
    descEl = document.createElement('meta')
    descEl.setAttribute('name', 'description')
    document.head.appendChild(descEl)
  }

  descEl.setAttribute('content', description || '')
  const ogProps = ['og:type','og:title','og:description','og:url','og:image'] // open graph

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

  const twitterProps = ['twitter:card','twitter:title','twitter:description','twitter:image','twitter:creator'] // twitter

  twitterProps.forEach(name => {

    const value = doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content')
    let el = document.querySelector(`meta[name="${name}"]`)

    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('name', name)
      document.head.appendChild(el)
    }

    el.setAttribute('content', value || '')

  })

  const ldScript = doc.querySelector('script[type="application/ld+json"]') // json-ld
  let existingLd = document.querySelector('script[type="application/ld+json"]')

  if (!existingLd) {
    existingLd = document.createElement('script')
    existingLd.type = 'application/ld+json'
    document.head.appendChild(existingLd)
  }

  existingLd.textContent = ldScript?.textContent || ''

}

watch(
  () => route.params.slug,
  async slug => {

    await nextTick()
    if (!postsIndex.value.length) await fetchIndex()
  
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
    <component :is="currentComponent" :html="noteContent" />
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