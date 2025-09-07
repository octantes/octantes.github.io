<script setup>
import { ref, onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import ShaderMatrix from '../recursos/shaderMatrix.vue'
import ShaderPortal from '../recursos/shaderPortal.vue'

const route = useRoute()
const noteContent = ref('')
const loading = ref(true)
const base = import.meta.env.BASE_URL.replace(/\/$/, '')

async function loadNote(slug) {
  loading.value = true
  try {
    const res = await fetch((`${base}/posts/${slug}/`))
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    noteContent.value = await res.text()
  } catch (e) {
    noteContent.value = `<p>error cargando la nota</p>`
    console.error(`error fetching slug "${slug}":`, e)
  }
}

// cargar nota al cambiar la ruta
onMounted(() => loadNote(route.params.slug))
onBeforeRouteUpdate((to) => loadNote(to.params.slug))
</script>

<template>
  <div class="post">
    <ShaderMatrix v-if="loading" />
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