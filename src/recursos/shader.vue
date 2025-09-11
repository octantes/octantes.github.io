<template>
  <div ref="containerRef" class="portal-matrix-container">
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

let fontSize = 16
let cols = 0
let rows = 0

const charRangeStart = 33
const charRangeEnd = 126
const charRangeMax = charRangeEnd - charRangeStart

let speed = 0.7
let trailLength = 40
let resetChance = 0.02

let heads = []
let charBuffers = []
let portalCodes = null

let noiseMap = null
let baseMask = null
let mask = null
let tmpMask = null

let revealFrame = 0
const revealMaxFrames = 160
const borderColor = '#aaabac'
const maxDilateSteps = 32

let mode = 'intro'
let outroFrame = 0
const outroMaxFrames = 160

let outroMode = null
let outroRadius = 0
let outroCenter = { x: 0, y: 0 }

function clamp(v, a = 0, b = 1) { return Math.min(b, Math.max(a, v)) }
function pickChar() {
  return String.fromCharCode(charRangeStart + Math.floor(Math.random() * charRangeMax))
}

function setCanvasSize() {
  if (!canvasRef.value || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  width = Math.floor(rect.width)
  height = Math.floor(rect.height)
  dpr = window.devicePixelRatio || 1
  canvasRef.value.width = Math.floor(width * dpr)
  canvasRef.value.height = Math.floor(height * dpr)
  canvasRef.value.style.width = width + 'px'
  canvasRef.value.style.height = height + 'px'
  ctx = canvasRef.value.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function initGrid() {
  cols = Math.max(1, Math.ceil(width / fontSize))
  rows = Math.max(2, Math.ceil(height / fontSize))

  heads = new Array(cols)
  charBuffers = new Array(cols)
  for (let c = 0; c < cols; c++) {
    heads[c] = Math.random() * rows * -1
    charBuffers[c] = new Array(rows).fill(null)
  }

  portalCodes = new Uint16Array(cols * rows)
  noiseMap = new Float32Array(cols * rows)
  baseMask = new Uint8Array(cols * rows)
  mask = new Uint8Array(cols * rows)
  tmpMask = new Uint8Array(cols * rows)

  for (let y = 0; y < rows; y++) {
    const ny = y / Math.max(1, rows)
    for (let x = 0; x < cols; x++) {
      const nx = x / Math.max(1, cols)
      const noise = Math.sin(nx * 12 + ny * 12) + Math.cos(nx * 7 - ny * 9)
      const n = clamp(noise * 0.5 + 0.5, 0, 1)
      noiseMap[y * cols + x] = n
    }
  }
}

function updateSize() {
  setCanvasSize()
  fontSize = Math.max(12, Math.floor(width / 70)) * 0.75
  initGrid()
}

function updatePortalGrid(tick) {
  const cx = cols / 2
  const cy = rows / 2
  const t = 100 + tick * 0.001
  let idx = 0
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++, idx++) {
      const v = (Math.cos((x - cx) / 8) + Math.sin((y - cy) / 8) + t) * 16
      const mod = ((Math.floor(v) % charRangeMax) + charRangeMax) % charRangeMax
      portalCodes[idx] = charRangeStart + mod
    }
  }
}

function getTrailColor(alpha) {
  alpha = Math.pow(Math.max(0, alpha), 1.2)
  return `rgba(126,189,196,${alpha.toFixed(3)})`
}

function dilateMaskInplace(src, dst, steps) {
  dst.set(src)
  for (let s = 0; s < steps; s++) {
    const srcBuf = (s % 2 === 0) ? dst : src
    const dstBuf = (s % 2 === 0) ? src : dst
    dstBuf.fill(0)
    for (let y = 0; y < rows; y++) {
      const yOff = y * cols
      for (let x = 0; x < cols; x++) {
        const i = yOff + x
        if (srcBuf[i]) {
          dstBuf[i] = 1
          if (x > 0) dstBuf[i - 1] = 1
          if (x < cols - 1) dstBuf[i + 1] = 1
          if (y > 0) dstBuf[i - cols] = 1
          if (y < rows - 1) dstBuf[i + cols] = 1
          if (x === 0 && y === 0) dstBuf[i] = 1
        }
      }
    }
  }
  return (steps % 2 === 0) ? dst : src
}

function isFrontier(maskArr, x, y) {
  const i = y * cols + x
  if (!maskArr[i]) return false
  if (x > 0 && !maskArr[i - 1]) return true
  if (x < cols - 1 && !maskArr[i + 1]) return true
  if (y > 0 && !maskArr[i - cols]) return true
  if (y < rows - 1 && !maskArr[i + cols]) return true
  return false
}

function drawFrame(ts) {
  if (!ctx) return
  // ctx.fillStyle = '#1b1c1c'
  // ctx.fillRect(0, 0, width, height)
  
  ctx.clearRect(0, 0, width, height)

  updatePortalGrid(ts)

  for (let c = 0; c < cols; c++) {
    const rowPos = Math.floor(heads[c] + speed)
    heads[c] += speed
    if (rowPos >= 0 && rowPos < rows) charBuffers[c][rowPos] = pickChar()
    if (heads[c] > rows + trailLength && Math.random() < resetChance) {
      heads[c] = -Math.random() * rows
      charBuffers[c].fill(null)
    }
  }

  ctx.font = `${fontSize}px 'Gohu Mono', monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  const total = rows * cols
  let circleCells = new Set()
  let circleFrontier = new Set()

  if (mode === 'intro') {
    const ratio = clamp(revealFrame / revealMaxFrames, 0, 1)
    for (let i = 0; i < total; i++) baseMask[i] = noiseMap[i] < ratio ? 1 : 0
  } else if (mode === 'outro' && outroMode === 'radial') {
    outroRadius += 1

    // calcular circleCells **una vez por frame** con noise
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dx = x - outroCenter.x
        const dy = y - outroCenter.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        const n = noiseMap[y*cols + x] * 5
        const idx = y*cols + x
        if (dist + n <= outroRadius) circleCells.add(idx)
      }
    }

    // calcular circleFrontier solo en los bordes de circleCells
    circleFrontier.clear()
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x
        if (!circleCells.has(idx)) continue
        if (
          (x > 0 && !circleCells.has(idx-1)) ||
          (x < cols-1 && !circleCells.has(idx+1)) ||
          (y > 0 && !circleCells.has(idx-cols)) ||
          (y < rows-1 && !circleCells.has(idx+cols))
        ) circleFrontier.add(idx)
      }
    }

    for (let i = 0; i < total; i++) baseMask[i] = circleCells.has(i) ? 0 : 1
  }

  const steps = Math.min(maxDilateSteps, Math.floor((mode === 'intro' ? clamp(revealFrame/revealMaxFrames,0,1) : 1)*maxDilateSteps))
  const resultMask = dilateMaskInplace(baseMask, tmpMask, steps)

  for (let x = 0; x < cols; x++) {
    const headPos = Math.floor(heads[x])
    const colBuf = charBuffers[x]
    for (let y = 0; y < rows; y++) {
      const idx = y * cols + x
      const portalCode = portalCodes[idx]
      const portalCh = String.fromCharCode(portalCode)
      const matrixCh = colBuf[y]
      const revealed = !!resultMask[idx]
      const frontier = isFrontier(resultMask, x, y)

      let drawCh = portalCh
      let color = `rgba(152,108,152,1)` // default portal shader

      if (mode === 'intro') {
        if (!revealed) color = '#1b1c1c' // fondo negro
        if (frontier) color = borderColor // borde blanco sobre fondo negro
        if (matrixCh && revealed) {
          const dist = headPos - y
          if (dist >=0 && dist <= trailLength) color = getTrailColor(1 - dist/trailLength)
        }
        } else if (mode === 'outro' && outroMode === 'radial') {
          const dist = headPos - y
          const inTrail = matrixCh && dist >=0 && dist <= trailLength

          // la lluvia se genera normalmente
          if (inTrail) {
            color = getTrailColor(1 - dist/trailLength)
            drawCh = matrixCh
          }

          // luego sobreescribimos si estamos dentro del círculo outro
          if (circleCells.has(idx) && !circleFrontier.has(idx)) {
            // drawCh = ' '
            // color = '#1b1c1c'
            continue
          } else if (circleFrontier.has(idx)) {
            color = borderColor
          }
        } else if (frontier) {
          color = borderColor
        }


      ctx.fillStyle = color
      ctx.fillText(drawCh, x*fontSize, y*fontSize)
    }
  }

  if (mode==='intro' && revealFrame<revealMaxFrames) revealFrame++
  else if (mode==='outro' && outroMode==='radial' && outroRadius<Math.hypot(cols,rows)) outroFrame++

  animationId = requestAnimationFrame(drawFrame)
}


function startOutro() {
  mode = 'outro'
  outroMode = 'radial'
  outroRadius = 0
  outroCenter = { x: 0, y: rows } // esquina inferior izquierda
}

defineExpose({ startOutro })

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
@import url('https://font.gohu.org/css2?family=Gohu+Mono&display=swap');

.portal-matrix-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>