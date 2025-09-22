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
  } catch {}
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

    if (!postsIndex.value.length) await loadIndex()
  
    switch (true) {

      // first load without note, INTRO only on first page load

      case !slug && firstLoad:
        
        noteLoaded = false
        firstLoad = false
        shaderRef.value?.runIntro()
        lastSlug = null
        break

      // first note load, OUTRO only on first note load

      case slug && !noteLoaded && !firstLoad:

        noteLoaded = true
        firstLoad = false
        shaderRef.value?.runOutro()
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
        shaderRef.value?.runTransition()
        setTimeout(async () => { await loadNote(slug) }, 1300)
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

      <Portada v-if="noteLoaded" :metadata="currentPost || {}"  />
      <component :is="currentComponent" :html="noteContent" />

    </div>

  </div>

</template>

<style>

.post {
  position: relative;
  height: 100%;
  width: 100%;
  background-color: #1B1C1C;
  border: 1px solid #AAABAC25;
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