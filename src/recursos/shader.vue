// credits: https://speckyboy.com/css-javascript-ascii-artwork-snippets/

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const gridRef = ref(null)
const containerRef = ref(null)

let animationId
let cols = 0
let rows = 0
let fontSize = 8

const charRangeStart = 33
const charRangeEnd = 126
const charRangeMax = charRangeEnd - charRangeStart

function updateSize() {
  if (!containerRef.value) return
  const { clientWidth, clientHeight } = containerRef.value

  // ajustar fontSize dinámicamente según ancho
  fontSize = Math.max(4, Math.floor(clientWidth / 100))
  cols = Math.ceil(clientWidth / fontSize)
  // generar filas extra para cubrir posibles gaps y evitar cortes
  rows = Math.ceil(clientHeight / fontSize) + 2

  if (gridRef.value) {
    gridRef.value.style.fontSize = `${fontSize}px`
  }
}

function generateGrid(tick) {
  let content = ''
  const cx = Math.floor(cols / 2)
  const cy = Math.floor(rows / 2)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const t = 100 + tick * 0.001
      const v = (Math.cos((x - cx) / 8) + Math.sin((y - cy) / 8) + t) * 16
      const val = Math.floor(v) % charRangeMax
      content += String.fromCharCode(charRangeStart + val)
    }
    content += '\n'
  }
  return content
}

function animate(ts) {
  if (gridRef.value) {
    gridRef.value.textContent = generateGrid(ts)
  }
  animationId = requestAnimationFrame(animate)
}

onMounted(async () => {
  await nextTick() // espera que el DOM esté renderizado
  updateSize()
  window.addEventListener('resize', updateSize)
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', updateSize)
})
</script>

<template>
  <div ref="containerRef" class="grid-container">
    <pre ref="gridRef" class="grid"></pre>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.grid-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.grid {
  flex: 1;
  margin: 0;
  padding: 0;
  font-family: 'Press Start 2P', monospace;
  line-height: 1;
  color: #1b1c1c;
  white-space: pre;
  box-sizing: content-box;
  /* asegurar que el grid se dibuje desde Y=0 aunque sobrepase */
  min-height: 100%;
}
</style>