<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Shader from '../recursos/shader.vue'

const route = useRoute()
const noteContent = ref('')
const loading = ref(false)
const shaderRef = ref(null)

async function loadNote(slug) {
  if (!slug) {
    noteContent.value = ''
    loading.value = true
    return
  }
  shaderRef.value?.startOutro()
  loading.value = true
  try {
    const res = await fetch(`/posts/${slug}/`)
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    noteContent.value = await res.text()
  } catch (e) {
    noteContent.value = `<p>error cargando la nota</p>`
    console.error(`error fetching slug "${slug}":`, e)
  } finally {
    loading.value = false
  }
}

// observar cambios de ruta y ejecutar al inicializar
watch(() => route.params.slug, slug => loadNote(slug), { immediate: true })
</script>

<template>
  <div class="post">
    <Shader class="shader" ref="shaderRef"/>
    <div class="text" v-html="noteContent"></div>
  </div>
</template>

<style>
.shader {
  z-index: 10;
}
.post {
  background-color: #1b1c1c;
  border: 1px solid #AAABAC;
  width: 100%;
}
.text {
  color: #1B1C1C;
  padding: 1rem;
}
</style>