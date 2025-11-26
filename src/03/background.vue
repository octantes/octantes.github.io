<script setup> 
import { ref, onMounted, onUnmounted } from 'vue'

const cells = ref([])
const cols = ref(0)
const rows = ref(0)
const size = 192

function calculateGrid() {
  
  const w = window.innerWidth
  const h = window.innerHeight
  
  cols.value = Math.ceil(w / size)
  rows.value = Math.ceil(h / size)
  
  const total = cols.value * rows.value
  const newCells = []

  for (let i = 0; i < total; i++) {
    
    const x = i % cols.value
    const y = Math.floor(i / cols.value)
    const isDark = (x + y) % 2 === 0
    
    newCells.push({ id: i, isDark })
    
  }

  cells.value = newCells

}

onMounted(() => { calculateGrid(); window.addEventListener('resize', calculateGrid) })
onUnmounted(() => { window.removeEventListener('resize', calculateGrid) })

</script>

<template> 
  
  <div class="background" :style="{ '--cols': cols }">
    
    <div v-for="cell in cells" :key="cell.id" class="cell" :class="{ 'dark': cell.isDark }">
      <span class="cross">X</span>
    </div>

  </div>

</template>

<style scoped> 

.background {
  
  /* LAYOUT */ position: absolute;
  /* BOX    */ top: 0; left: 0; width: 100%; height: 100%;
  /* GRID   */ display: grid; grid-template-columns: repeat(var(--cols), 1fr);
  /* LAYER  */ z-index: 0;
  /* FILL   */ background-color: var(--carbon);

}

.cell {
  
  /* LAYOUT */ display: flex; align-items: center; justify-content: center;
  /* BOX    */ width: 100%; height: 100%;
  /* FILL   */ background-color: var(--humo);
  /* MOTION */ transition: background-color 0.2s ease;

  &.dark { background-color: var(--carbon); & .cross { color: var(--humo); } }

  &:hover .cross { opacity: 1; transform: scale(1); }

}

.cross {
  
  /* FONT   */ font-family: var(--font-mono); font-size: 4rem; font-weight: bold;
  /* FILL   */ color: var(--carbon); opacity: 0;
  /* MOTION */ transition: all 0.15s ease; transform: scale(0.5);
  /* CURSOR */ cursor: default; user-select: none;

}

</style>