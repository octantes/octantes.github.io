<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({ disabled: Boolean, isCentered: Boolean })
const router = useRouter()
const notes = ref([])
const base = import.meta.env.BASE_URL.replace(/\/$/, '')
const activeFilter = ref('full')
const tabs = ['full', 'posts', 'design', 'dev', 'music']
const sortKey = ref('isoDate')
const sortOrder = ref('desc')

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

function navFilter(direction) {
  if (props.disabled) return
  const currentIndex = tabs.indexOf(activeFilter.value)
  const newIndex = (currentIndex + direction + tabs.length) % tabs.length
  activeFilter.value = tabs[newIndex]
}

function navSort(key) {
  if (props.disabled) return
  if (sortKey.value === key) { sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc' } 
  else { sortKey.value = key; sortOrder.value = 'asc' }
}

const noteSortFilter = computed(() => {

  const filterType = activeFilter.value === 'posts' ? 'note' : activeFilter.value
  const filtered = activeFilter.value === 'full' ? notes.value : notes.value.filter(note => note.type === filterType)

  return [...filtered].sort((a, b) => {
    let valA, valB

    switch (sortKey.value) {

      case 'title':
        valA = a.title.toLowerCase()
        valB = b.title.toLowerCase()
        break

      case 'tags':
        valA = a.tags[0]?.toLowerCase() || ''
        valB = b.tags[0]?.toLowerCase() || ''
        break
        
      default:
        valA = new Date(a.isoDate)
        valB = new Date(b.isoDate)
        break

    }

    let comparison = 0
    if (valA > valB) comparison = 1
    else if (valA < valB) comparison = -1
    return sortOrder.value === 'asc' ? comparison : -comparison

  })
})

function openNote(type, slug) { if (!props.disabled) router.push({ path: `/${type}/${slug}` }) }

</script>

<template>

  <div class="navigation">

    <div class="tabs">

      <button @click="navFilter(-1)" :disabled="props.disabled"> < </button>

      <div class="tabs-overflow">
        <button v-for="tab in tabs" :key="tab" @click="activeFilter = tab" :class="{ active: activeFilter === tab }" :disabled="props.disabled" > {{ tab }} </button>
      </div>

      <button @click="navFilter(+1)" :disabled="props.disabled"> > </button>

    </div>

    <div class="table-wrapper">

      <table>

        <thead>
          <tr>
            <th @click="navSort('isoDate')" :class="{ active: sortKey === 'isoDate' }" :data-order="sortOrder">fecha</th>
            <th @click="navSort('title')" :class="{ active: sortKey === 'title' }" :data-order="sortOrder">título</th>
            <th @click="navSort('tags')" :class="{ active: sortKey === 'tags' }" :data-order="sortOrder">tags</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="note in noteSortFilter" :key="note.slug" @click="openNote(note.type, note.slug)" :class="{ disabled: props.disabled }" >
            <td>{{ note.date }}</td>
            <td>{{ note.title }}</td>
            <td>{{ note.tags.join(' - ') }}</td>
          </tr>
        </tbody>

      </table>

    </div>

    <div v-if="!isCentered" class="contenido-extra">
      <p>lo que tenga este if desaparece si cambiamos layout</p>
    </div>

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
  border-radius: 5px;
  gap: 1rem;
}

.tabs { display: flex; width: 100%; gap: 1rem; align-items: center; }
.tabs-overflow { display: flex; gap: 1rem; flex-grow: 1; min-width: 0; overflow: hidden; }
.tabs-overflow button { flex-grow: 1; flex-basis: 0; text-align: center; transition: background-color 0.2s ease; }
.tabs-overflow button:hover { box-shadow: inset 0 0 0 1px #AAABAC25; border-radius: 5px; }
.tabs button { background-color: transparent; padding: 0.5rem 1rem; border: none; color: #AAABAC; cursor: pointer; border-radius: 5px; }
.tabs button:hover { background-color: #2B2C2C; color: #D8DADE; }
.tabs button.active { background-color: #8AB6BB25; color: #D8DADE; box-shadow: inset 0 0 0 1px #AAABAC25; border-radius: 5px; }
.tabs button:disabled { cursor: not-allowed; opacity: 0.25; }

table { width: 100%; border-collapse: separate; border-spacing: 0; }

thead tr { display: flex; box-shadow: inset 0 0 0 1px #AAABAC25; border-radius: 5px; }
th, td { padding: 0.5rem; text-align: left; user-select: none; }

th { color:#AAABAC; font-weight: normal; flex: 1; display: flex; justify-content: center; align-items: center; cursor: pointer; position: relative; transition: background-color 0.25s ease; }
th:hover { background-color: #2C2C2C; }
th.active { color:#D8DADE; background-color: #986C9825; }

tbody tr { cursor: pointer; }
tbody tr:hover { background-color: #2B2C2C; }
tbody tr:hover { background-color: #2B2C2C; }
tbody tr.disabled { cursor: not-allowed; opacity: 0.6; }
tbody tr.disabled:hover { background-color: transparent; }

th.active::after { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); }
th.active[data-order="asc"]::after { content: '↑'; }
th.active[data-order="desc"]::after { content: '↓'; }

</style>