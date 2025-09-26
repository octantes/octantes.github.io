<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({ disabled: Boolean })
const router = useRouter()
const notes = ref([])
const base = import.meta.env.BASE_URL.replace(/\/$/, '')

onMounted(async () => {
  try {
    const response = await fetch(`${base}/index.json`)
    if (!response.ok) throw new Error(`http error ${response.status}`)
    notes.value = await response.json()
  } catch (e) {
    console.error('error cargando índice de notas:', e)
    notes.value = []
  }
})

function openNote(type, slug) { if (!props.disabled) router.push({ path: `/${type}/${slug}` }) }

</script>

<template>

  <div class="navigation">

    <h1>navegacion</h1>

    <table>

      <thead>
        <tr>
          <th>título</th>
          <th>fecha</th>
          <th>tags</th>
          <th>link</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="note in notes" :key="note.slug">
          <td>{{ note.title }}</td>
          <td>{{ note.date }}</td>
          <td>{{ note.tags.join(', ') }}</td>
          <td><button :disabled="props.disabled" @click="openNote(note.type, note.slug)">ver</button></td>
        </tr>
      </tbody>

    </table>
    
  </div>

</template>

<style>

.navigation {
  display: flex;
  flex-direction: column;
  background-color: #1B1C1C;
  color: #D8DADE;
  padding: 1rem;
  border: 1px solid #AAABAC25;
}

</style>