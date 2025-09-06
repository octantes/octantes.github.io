<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Shader from '../recursos/shader.vue'

const noteContent = ref('')
const route = useRoute()

async function loadNote(slug) {
  if (!slug) return
  try {
    const url = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/posts/${slug}/`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    noteContent.value = await res.text()
  } catch (e) {
    noteContent.value = `<p>Error cargando la nota</p>`
    console.error(`Error fetching slug "${slug}":`, e)
  }
}

// cargar nota al cambiar la ruta
watch(
  () => route.params.slug,
  (slug) => {
    loadNote(slug)
  },
  { immediate: true }
)
</script>

<template>
  <div class="post">
    <Shader v-if="!noteContent" />
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