<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const charRangeStart = 33
const charRangeEnd = 126
const charRangeMax = charRangeEnd - charRangeStart

const canvasRef = ref(null)
const containerRef = ref(null)

let circleCells = new Set()
let circleFrontier = new Set()

let ctx = null
let width = 0
let height = 0
let fontSize = 16
let dpr = 1
let cols = 0
let rows = 0

let speed = 0.7
let trailLength = 40
let resetChance = 0.02

let heads = []
let charBuffers = []
let portalCodes = null

let noiseMap = null
let baseMask = null
let tmpMask = null
let expandA = null
let expandB = null

let animationId = null
let revealFrame = 0
let mode = 'intro'
let outroFrame = 0
let outroRadius = 0
let outroCenter = { x: 0, y: 0 }
let transFrame = 0
let transPhase = 0
let autoOutro = false

const revealMaxFrames = 160
const borderColor = '#AAABAC'
const maxDilateSteps = 32

// ---- HELPERS ----

function clamp(v, a = 0, b = 1) {
  return Math.min(b, Math.max(a, v))
}

function pickChar() {
  return String.fromCharCode(charRangeStart + Math.floor(Math.random() * charRangeMax))
}

function trailAlpha(alpha) {
  alpha = Math.pow(Math.max(0, alpha), 1.2)
  return `rgba(126,189,196,${alpha.toFixed(3)})`
}

function isFrontier(maskArr, x, y) {
  const i = y * cols + x
  if (!maskArr || !maskArr.length) return false
  if (!maskArr[i]) return false
  if (x > 0 && !maskArr[i - 1]) return true
  if (x < cols - 1 && !maskArr[i + 1]) return true
  if (y > 0 && !maskArr[i - cols]) return true
  if (y < rows - 1 && !maskArr[i + cols]) return true
  return false
}

// Copy helper: returns a destination buffer with src copied into it.
// If dst is null or wrong size, a new Uint8Array is created and returned.
function ensureAndCopy(dst, src) {
  if (!src) return null
  if (!dst || dst.length !== src.length) {
    dst = new Uint8Array(src.length)
  }
  dst.set(src)
  return dst
}

// Ensure expand buffers have size for current grid
function ensureExpandBuffers() {
  const total = cols * rows
  if (!expandA || expandA.length !== total) {
    expandA = new Uint8Array(total)
    expandB = new Uint8Array(total)
  }
}

// Ensure masks are allocated and sized consistently
function ensureMasks() {
  const total = cols * rows
  if (!baseMask || baseMask.length !== total) baseMask = new Uint8Array(total)
  if (!tmpMask || tmpMask.length !== total) tmpMask = new Uint8Array(total)
  ensureExpandBuffers()
}

// ---- CONTEXT / GRID ----

function setSize() {
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

function updateSize() {
  setSize()
  fontSize = Math.floor(Math.max(12, Math.floor(width / 70)) * 0.75)
  setGrid()
}

function setGrid() {
  cols = Math.max(1, Math.ceil(width / fontSize))
  rows = Math.max(2, Math.ceil(height / fontSize))

  // rain
  heads = new Array(cols)
  charBuffers = new Array(cols)
  for (let c = 0; c < cols; c++) {
    heads[c] = Math.random() * rows * -1
    charBuffers[c] = new Array(rows).fill(null)
  }

  // masks and buffers
  portalCodes = new Uint16Array(cols * rows)
  noiseMap = new Float32Array(cols * rows)
  baseMask = new Uint8Array(cols * rows)
  tmpMask = new Uint8Array(cols * rows)

  // initialize noise map
  for (let y = 0; y < rows; y++) {
    const ny = y / Math.max(1, rows)
    for (let x = 0; x < cols; x++) {
      const nx = x / Math.max(1, cols)
      const noise = Math.sin(nx * 12 + ny * 12) + Math.cos(nx * 7 - ny * 9)
      const n = clamp(noise * 0.5 + 0.5, 0, 1)
      noiseMap[y * cols + x] = n
    }
  }

  // ensure expansion buffers aligned
  ensureExpandBuffers()
}

// ---- ANIMATIONS ----

function updatePortal(tick) {
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

function updateRain() {
  for (let c = 0; c < cols; c++) {
    const rowPos = Math.floor(heads[c] + speed)
    heads[c] += speed
    if (rowPos >= 0 && rowPos < rows) charBuffers[c][rowPos] = pickChar()
    if (heads[c] > rows + trailLength && Math.random() < resetChance) {
      heads[c] = -Math.random() * rows
      charBuffers[c].fill(null)
    }
  }
}

function updateCircle() {
  outroRadius += 1
  circleCells.clear()
  circleFrontier.clear()

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = x - outroCenter.x
      const dy = y - outroCenter.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const n = noiseMap[y * cols + x] * 5
      const idx = y * cols + x
      if (dist + n <= outroRadius) circleCells.add(idx)
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      if (!circleCells.has(idx)) continue
      if (
        (x > 0 && !circleCells.has(idx - 1)) ||
        (x < cols - 1 && !circleCells.has(idx + 1)) ||
        (y > 0 && !circleCells.has(idx - cols)) ||
        (y < rows - 1 && !circleCells.has(idx + cols))
      )
        circleFrontier.add(idx)
    }
  }

  for (let i = 0; i < rows * cols; i++) baseMask[i] = circleCells.has(i) ? 0 : 1
}

function updateGerm(total) {
  const ratio = clamp(revealFrame / revealMaxFrames, 0, 1)
  for (let i = 0; i < total; i++) baseMask[i] = noiseMap[i] < ratio ? 1 : 0
}

function updateGermInv(total) {
  const ratio = clamp(revealFrame / revealMaxFrames, 0, 1)
  for (let i = 0; i < total; i++) {
    if (baseMask[i] === 0 || noiseMap[i] < ratio) baseMask[i] = 0
    else baseMask[i] = 1
  }

  if (ratio >= 1) {
    const frontier = []
    for (let y = 0; y < rows; y++) {
      const yOff = y * cols
      for (let x = 0; x < cols; x++) {
        const i = yOff + x
        if (baseMask[i] === 1) {
          if ((x > 0 && baseMask[i - 1] === 0) || (x < cols - 1 && baseMask[i + 1] === 0) || (y > 0 && baseMask[i - cols] === 0) || (y < rows - 1 && baseMask[i + cols] === 0)) {
            frontier.push(i)
          }
        }
      }
    }

    if (frontier.length > 0) {
      const perFrame = Math.max(1, Math.floor(total / revealMaxFrames))
      const newMask = baseMask.slice()

      if (frontier.length <= perFrame) {
        for (let k = 0; k < frontier.length; k++) newMask[frontier[k]] = 0
      } else {
        const step = Math.ceil(frontier.length / perFrame)
        let count = 0
        for (let k = 0; k < frontier.length && count < perFrame; k += step) {
          newMask[frontier[k]] = 0
          count++
        }
        if (count < perFrame) {
          for (let k = 0; k < frontier.length && count < perFrame; k++) {
            const idx = frontier[k]
            if (newMask[idx] !== 0) {
              newMask[idx] = 0
              count++
            }
          }
        }
      }

      baseMask.set(newMask)
    }
  }
}

function updateSwipe() {
  // ensure masks are present and sized correctly
  ensureMasks()

  const line = Math.floor(transFrame)
  tmpMask.fill(0)

  const t = performance.now() * 0.001
  const scroll = t * 20

  if (transPhase === 0) {
    for (let y = 0; y < rows; y++) {
      const idx = (y * cols + Math.floor(scroll)) % (rows * cols)
      const frac = scroll % 1

      const n0 = noiseMap[idx]
      const n1 = noiseMap[(idx + 1) % (rows * cols)]
      const n = n0 * (1 - frac) + n1 * frac

      const wave = Math.sin(y * 0.25 + t * 2 + n * 2)
      const noiseOffset = Math.floor(n * 4 + wave * 2)

      const xLimit = Math.min(line + noiseOffset, cols - 1)
      for (let x = 0; x <= xLimit; x++) tmpMask[y * cols + x] = 1
    }
  } else if (transPhase === 1) {
    for (let y = 0; y < rows; y++) {
      const idx = (y * cols + Math.floor(scroll)) % (rows * cols)
      const frac = scroll % 1
      const n0 = noiseMap[idx]
      const n1 = noiseMap[(idx + 1) % (rows * cols)]
      const n = n0 * (1 - frac) + n1 * frac

      const wave = Math.cos(y * 0.25 - t * 2 + n * 2)
      const noiseOffset = Math.floor(n * 4 + wave * 2)

      const xStart = Math.max(line - noiseOffset, 0)
      for (let x = xStart; x < cols; x++) tmpMask[y * cols + x] = 1
    }
  }

  transFrame += 1.0

  if (transFrame >= cols) {
    if (transPhase === 0) {
      // copy tmpMask -> baseMask, but ensure sizes match (defensive)
      baseMask = ensureAndCopy(baseMask, tmpMask)

      if (autoOutro) {
        transPhase = 1
        transFrame = 0
      } else {
        mode = 'static'
      }
    } else if (transPhase === 1) {
      baseMask.fill(0)
      tmpMask.fill(0)
      transFrame = cols
      transPhase = 1
      mode = 'hidden'
    }
  }
}

// expandMask returns a stable buffer containing expanded mask without mutating src
function expandMask(src, steps) {
  ensureExpandBuffers()
  const total = cols * rows
  if (steps <= 0) {
    expandA.set(src)
    return expandA
  }

  let a = expandA
  let b = expandB
  a.set(src)

  for (let s = 0; s < steps; s++) {
    b.fill(0)
    for (let y = 0; y < rows; y++) {
      const yOff = y * cols
      for (let x = 0; x < cols; x++) {
        const i = yOff + x
        if (a[i]) {
          b[i] = 1
          if (x > 0) b[i - 1] = 1
          if (x < cols - 1) b[i + 1] = 1
          if (y > 0) b[i - cols] = 1
          if (y < rows - 1) b[i + cols] = 1
        }
      }
    }
    const tmp = a
    a = b
    b = tmp
  }

  if (a !== expandA) expandA.set(a), a = expandA
  return a
}

// ---- MASKS / RENDER ----

function updateMasks(total) {
  // ensure masks sized before using them
  ensureMasks()

  switch (mode) {
    case 'intro': {
      updateGerm(total)
      break
    }
    case 'static': {
      // copy baseMask into tmpMask safely
      tmpMask = ensureAndCopy(tmpMask, baseMask)
      break
    }
    case 'outro': {
      updateCircle()
      break
    }
    case 'direct': {
      updateGermInv(total)
      break
    }
    case 'transition': {
      updateSwipe()
      break
    }
    case 'hidden': {
      tmpMask.fill(0)
      break
    }
  }
}

function cellRender(x, y, headPos, colBuf, resultMask) {
  const idx = y * cols + x
  const portalCode = portalCodes[idx]
  const portalCh = String.fromCharCode(portalCode)
  const matrixCh = colBuf[y]
  const revealed = !!resultMask[idx]
  const frontier = isFrontier(resultMask, x, y)

  let drawCh = portalCh
  let color = `rgba(152,108,152,1)`
  let needsBg = false

  switch (mode) {
    case 'intro': {
      if (!revealed) color = '#1B1C1C'
      if (frontier) color = borderColor
      if (matrixCh && revealed) {
        const dist = headPos - y
        if (dist >= 0 && dist <= trailLength) {
          color = trailAlpha(1 - dist / trailLength)
          needsBg = true
        }
      }
      break
    }
    case 'static': {
      if (matrixCh) {
        const dist = headPos - y
        if (dist >= 0 && dist <= trailLength) {
          color = trailAlpha(1 - dist / trailLength)
          drawCh = matrixCh
          needsBg = true
        }
        break
      }
      break
    }
    case 'outro': {
      const dist = headPos - y
      if (matrixCh && dist >= 0 && dist <= trailLength) {
        color = trailAlpha(1 - dist / trailLength)
        drawCh = matrixCh
        needsBg = true
      }
      if (circleCells.has(idx) && !circleFrontier.has(idx)) drawCh = null
      else if (circleFrontier.has(idx)) color = borderColor
      break
    }
    case 'direct': {
      if (!revealed) {
        drawCh = null
        color = borderColor && isFrontier(resultMask, x, y) ? borderColor : '#1B1C1C'
      } else {
        drawCh = matrixCh || portalCh
        const dist = headPos - y
        if (matrixCh && dist >= 0 && dist <= trailLength) {
          color = trailAlpha(1 - dist / trailLength)
          needsBg = true
        }
      }
      break
    }
    case 'transition': {
      if (!revealed) {
        if (frontier) {
          drawCh = portalCh
          color = borderColor
          needsBg = true
        } else {
          drawCh = null
        }
      } else {
        drawCh = portalCh
        if (frontier) color = borderColor
        if (matrixCh) {
          const dist = headPos - y
          if (dist >= 0 && dist <= trailLength) {
            color = trailAlpha(1 - dist / trailLength)
            drawCh = matrixCh
            needsBg = true
          }
        }
      }
      break
    }
    case 'hidden': {
      drawCh = null
      break
    }
    default: {
      if (frontier) color = borderColor
      break
    }
  }

  return { drawCh, color, needsBg, frontier }
}

function drawFrame(ts) {
  if (!ctx) return
  const total = rows * cols

  ctx.font = `${fontSize}px monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  ctx.clearRect(0, 0, width, height)

  updatePortal(ts)
  updateRain()
  updateMasks(total)

  const steps = Math.min(
    maxDilateSteps,
    Math.floor((mode === 'intro' ? clamp(revealFrame / revealMaxFrames, 0, 1) : 1) * maxDilateSteps)
  )

  let resultMask
  if (mode === 'direct' || mode === 'static') {
    resultMask = baseMask
  } else if (mode === 'transition') {
    resultMask = tmpMask
  } else {
    resultMask = expandMask(baseMask, steps)
  }

  for (let x = 0; x < cols; x++) {
    const headPos = Math.floor(heads[x])
    const colBuf = charBuffers[x]

    for (let y = 0; y < rows; y++) {
      const idx = y * cols + x
      const { drawCh, color, frontier } = cellRender(x, y, headPos, colBuf, resultMask)

      if (drawCh === null) continue

      const px = Math.floor(x * fontSize)
      const py = Math.floor(y * fontSize)

      const matrixCh = colBuf[y]
      const dist = headPos - y
      const isRain = !!(matrixCh && dist >= 0 && dist <= trailLength)
      const portalCh = String.fromCharCode(portalCodes[idx])
      const isPortal = drawCh === portalCh
      const isFrontier = !!frontier
      const revealed = !!resultMask[idx]

      if (mode === 'outro' || mode === 'transition') {
        if (isRain || isPortal || isFrontier) {
          ctx.fillStyle = '#1b1c1c'
          ctx.fillRect(px, py, fontSize, fontSize)
        }
      } else if (mode === 'intro') {
        if (revealed) {
          ctx.fillStyle = '#1b1c1c'
          ctx.fillRect(px, py, fontSize, fontSize)
        }
      } else {
        ctx.fillStyle = '#1b1c1c'
        ctx.fillRect(px, py, fontSize, fontSize)
      }

      ctx.fillStyle = color
      ctx.fillText(drawCh, px, py)
    }
  }

  if (mode === 'intro' && revealFrame < revealMaxFrames) revealFrame++
  else if (mode === 'outro' && outroRadius < Math.hypot(cols, rows)) outroFrame++
  else if (mode === 'direct' && revealFrame < revealMaxFrames) revealFrame++

  animationId = requestAnimationFrame(drawFrame)
}

// ---- TASKS / CONTROL ----

function runIntro() {
  mode = 'intro'
  revealFrame = 0
}
function runStatic() {
  mode = 'static'
  ensureMasks()
  for (let i = 0; i < rows * cols; i++) baseMask[i] = 1
  tmpMask = ensureAndCopy(tmpMask, baseMask)
}
function runOutro() {
  mode = 'outro'
  outroRadius = 0
  outroCenter = { x: 0, y: rows }
}
function runDirect() {
  mode = 'direct'
  revealFrame = 0
  ensureMasks()
  for (let i = 0; i < rows * cols; i++) baseMask[i] = 1
  tmpMask = ensureAndCopy(tmpMask, baseMask)
}
function runTransitionFull() {
  mode = 'transition'
  ensureMasks()
  baseMask.fill(0)
  tmpMask.fill(0)
  transFrame = 0
  transPhase = 0
  autoOutro = true
}
function runTransitionIntro() {
  mode = 'transition'
  ensureMasks()
  baseMask.fill(0)
  tmpMask.fill(0)
  transFrame = 0
  transPhase = 0
  autoOutro = false
}
function runTransitionOutro() {
  // start transition outro using current baseMask as starting tmpMask
  mode = 'transition'
  ensureMasks()
  tmpMask = ensureAndCopy(tmpMask, baseMask)
  transFrame = 0
  transPhase = 1
  autoOutro = false
}
function runHidden() {
  mode = 'hidden'
}

function checkIntro() {
  return mode === 'intro' && revealFrame >= revealMaxFrames
}
function checkStatic() {
  return true
}
function checkOutro() {
  return mode === 'outro' && outroRadius >= Math.hypot(cols, rows)
}
function checkDirect() {
  return mode === 'direct' && revealFrame >= revealMaxFrames
}
function checkTransitionIntro() {
  return mode === 'static' || (mode === 'transition' && transPhase === 1 && transFrame >= cols)
}
function checkTransitionOutro() {
  return mode === 'hidden' || (mode === 'transition' && transPhase === 1 && transFrame >= cols)
}
function checkTransitionFull() {
  return mode === 'hidden' || mode === 'static'
}
function checkHidden() {
  return true
}

const TASKS = {
  intro: { impl: runIntro, finish: checkIntro },
  static: { impl: runStatic, finish: checkStatic },
  outro: { impl: runOutro, finish: checkOutro },
  direct: { impl: runDirect, finish: checkDirect },
  'transition-full': { impl: runTransitionFull, finish: checkTransitionFull },
  'transition-intro': { impl: runTransitionIntro, finish: checkTransitionIntro },
  'transition-outro': { impl: runTransitionOutro, finish: checkTransitionOutro },
  hidden: { impl: runHidden, finish: checkHidden },
}

function runQueue(name) {
  const task = TASKS[name]
  if (!task) return Promise.reject(new Error(`Unknown shader task "${name}"`))
  return new Promise((resolve, reject) => {
    try {
      task.impl()
    } catch (err) {
      reject(err)
      return
    }
    let rafId = null
    const check = () => {
      try {
        if (typeof task.finish === 'function' && task.finish()) {
          if (rafId != null) cancelAnimationFrame(rafId)
          resolve()
          return
        }
      } catch (err) {
        if (rafId != null) cancelAnimationFrame(rafId)
        reject(err)
        return
      }
      rafId = requestAnimationFrame(check)
    }
    rafId = requestAnimationFrame(check)
  })
}

defineExpose({ runQueue, runIntro, runStatic, runOutro, runTransitionIntro, runTransitionOutro, runDirect, runHidden })

// ---- LIFECYCLE ----

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
  // ensure masks and buffers before first frame
  ensureMasks()
  animationId = requestAnimationFrame(drawFrame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', updateSize)
})
</script>

<template>
  <div ref="containerRef" class="container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style>
.container {
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