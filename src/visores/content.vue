<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ShaderMatrix from '../recursos/shaderMatrix.vue'
import ShaderPortal from '../recursos/shaderPortal.vue'

const route = useRoute()
const noteContent = ref('')
const loading = ref(false)

const shaders = [ShaderMatrix, ShaderPortal]
const chosenShader = ref(shaders[Math.floor(Math.random() * shaders.length)])

async function loadNote(slug) {
  if (!slug) {
    noteContent.value = ''
    loading.value = true
    return
  }
  loading.value = true
  chosenShader.value = shaders[Math.floor(Math.random() * shaders.length)]
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
    <component :is="chosenShader" v-if="loading" />
    <div v-else class="text" v-html="noteContent"></div>
  </div>
</template>

<style>
.post {
  background-color: #986C98;
  border: 1px solid #AAABAC;
  width: 100%;
}
.text {
  color: #1B1C1C;
  background-color: #986C98;
  padding: 1rem;
}
</style>