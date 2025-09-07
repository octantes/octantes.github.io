<template>
  <div ref="containerRef" class="matrix-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const canvasRef = ref(null)
const containerRef = ref(null)

let animationId = null
let ctx = null
let width = 0
let height = 0
let dpr = 1

// layout en "celdas"
let fontSize = 16
let columns = 0
let rows = 0

// parámetros ajustables
let speed = 0.7          // velocidad de la cabeza
let trailLength = 60      // longitud de la estela
let resetChance = 0.02    // probabilidad de reinicio al pasar el fondo
let headBrightnessFactor = 1.0 // multiplicador para alpha de la cabeza

const chars = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%')

// estado por columna
let heads = []
let trails = []
let charBuffers = []

function pickChar() {
  return chars[Math.floor(Math.random() * chars.length)]
}

function initGrid() {
  columns = Math.max(1, Math.floor(width / fontSize))
  rows = Math.max(2, Math.floor(height / fontSize))
  // iniciar cada columna en posición aleatoria para simular drops inmediatos
  heads = Array.from({ length: columns }, () => Math.random() * rows * -1)
  trails = new Array(columns).fill(null).map(() => [])
  charBuffers = new Array(columns).fill(null).map(() => [])
}

function setCanvasSize() {
  if (!canvasRef.value || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  width = Math.max(1, Math.floor(rect.width))
  height = Math.max(1, Math.floor(rect.height))
  dpr = window.devicePixelRatio || 1
  canvasRef.value.width = Math.floor(width * dpr)
  canvasRef.value.height = Math.floor(height * dpr)
  canvasRef.value.style.width = width + 'px'
  canvasRef.value.style.height = height + 'px'
  ctx = canvasRef.value.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function updateSize() {
  setCanvasSize()
  fontSize = Math.max(12, Math.floor(width / 70))
  initGrid()
  if (ctx) {
    ctx.fillStyle = '#986C98'
    ctx.fillRect(0, 0, width, height)
  }
}

function drawFrame() {
  if (!ctx) return

  // fondo estático
  ctx.fillStyle = '#986C98'
  ctx.fillRect(0, 0, width, height)

  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.font = `${fontSize}px monospace`

  for (let i = 0; i < columns; i++) {
    heads[i] += speed

    const rowPos = Math.floor(heads[i])
    if (rowPos >= 0) {
      trails[i].unshift(rowPos)
      charBuffers[i].unshift(pickChar())
      if (trails[i].length > trailLength) {
        trails[i].pop()
        charBuffers[i].pop()
      }
    }

    for (let idx = 0; idx < trails[i].length; idx++) {
      const ty = trails[i][idx]
      if (ty == null || ty < 0) continue

      let alpha = 1 - idx / trailLength
      alpha = Math.pow(Math.max(0, alpha), 1.2)
      if (idx === 0) alpha = Math.min(1, alpha * headBrightnessFactor)

      ctx.fillStyle = `rgba(27,28,28,${alpha.toFixed(3)})`
      const ch = charBuffers[i][idx] || pickChar()
      ctx.fillText(ch, i * fontSize, ty * fontSize)
    }

    if (heads[i] > rows + trailLength && Math.random() < resetChance) {
      heads[i] = -Math.random() * rows
      trails[i] = []
      charBuffers[i] = []
    }
  }

  animationId = requestAnimationFrame(drawFrame)
}

onMounted(async () => {
  await nextTick()
  updateSize()
  window.addEventListener('resize', updateSize)
  animationId = requestAnimationFrame(drawFrame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', updateSize)
})
</script>

<style>
.matrix-container {
  width: 100%;
  height: 100%;
  background-color: #986C98;
  overflow: hidden;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
