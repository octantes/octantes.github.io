<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const charRangeStart = 33                                               // unicode char start
const charRangeEnd = 126                                                // unicode char end
const charRangeMax = charRangeEnd - charRangeStart                      // max possible chars

const canvasRef = ref(null)                                             // dom << canvas >> ref
const containerRef = ref(null)                                          // container div ref
const revealMaxFrames = 160                                             // intro total frames counter
const borderColor = '#AAABAC'                                           // active border zone color
const maxDilateSteps = 32                                               // outro animation max frames
const extraFrames = 42                                                  // direct animation extra frames

let circleCells = new Set()                                             // guarda indices dentro del circulo
let circleFrontier = new Set()                                          // guarda indices del limite del circulo

let ctx = null                                                          // canvas 2D context
let height = 0                                                          // canvas px height
let width = 0                                                           // canvas px width
let fontSize = 16                                                       // font px size
let dpr = 1                                                             // device px ratio
let cols = 0                                                            // char grid columns
let rows = 0                                                            // char grid rows

let speed = 0.7                                                         // rain fall speed
let trailLength = 40                                                    // rain trail char length
let resetChance = 0.02                                                  // column reset chance
let heads = []                                                          // first rain char position
let charBuffers = []                                                    // rain column chars positions
let portalCodes = null                                                  // portal cell char codes
let animationId = null                                                  // next requested frame id
let revealFrame = 0                                                     // frame counter for intro
let mode = 'intro'                                                      // current mode store string
let outroFrame = 0                                                      // outro max frame counter
let outroRadius = 0                                                     // current outro animation radius
let outroCenter = { x: 0, y: 0 }                                        // outro animation center position
let transFrame = 0                                                      // swipe animation line counter
let transPhase = 0                                                      // swipe animation direction
let autoOutro = false                                                   // swipe outro autotrigger

let noiseMap = null                                                     // static noise array for animations
let baseMask = null                                                     // active/inactive animation cell mask
let tmpMask = null                                                      // dilation temporal buffer mask
let expandA = null                                                      // expand variable a
let expandB = null                                                      // expand variable b

// HELPERS

function clamp(v, a = 0, b = 1) {                                       // constrain value 
  return Math.min(b, Math.max(a, v))
}
function pickChar() {                                                   // return character 
  return String.fromCharCode(charRangeStart + Math.floor(Math.random() * charRangeMax))
}
function trailAlpha(alpha) {                                            // returns trail color 
  alpha = Math.pow(Math.max(0, alpha), 1.2)
  return `rgba(126,189,196,${alpha.toFixed(3)})`
}
function isFrontier(maskArr, x, y) {                                    // detects border of zone 
  const i = y * cols + x
  if (!maskArr || !maskArr.length) return false
  if (!maskArr[i]) return false
  if (x > 0 && !maskArr[i - 1]) return true
  if (x < cols - 1 && !maskArr[i + 1]) return true
  if (y > 0 && !maskArr[i - cols]) return true
  if (y < rows - 1 && !maskArr[i + cols]) return true
  return false
}
function secureCopy(dst, src) {                                         // prevent overwrite on src copy 
  if (!src) return null
  if (!dst || dst.length !== src.length) { dst = new Uint8Array(src.length) }
  dst.set(src)
  return dst
}
function secureExpand() {                                               // prevent overwrite on expand 
  const total = cols * rows
  if (!expandA || expandA.length !== total) {
    expandA = new Uint8Array(total)
    expandB = new Uint8Array(total)
  }
}
function secureMasks() {                                                // prevent mask overwrite 
  const total = cols * rows
  if (!baseMask || baseMask.length !== total) baseMask = new Uint8Array(total)
  if (!tmpMask || tmpMask.length !== total) tmpMask = new Uint8Array(total)
  secureExpand()
}

// CONTEXT

function setSize() {                                                    // prepare context 

  // container div size
  if (!canvasRef.value || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  width = Math.floor(rect.width)
  height = Math.floor(rect.height)

  // resolution by pixel density
  dpr = window.devicePixelRatio || 1
  canvasRef.value.width = Math.floor(width * dpr)
  canvasRef.value.height = Math.floor(height * dpr)
  canvasRef.value.style.width = width + 'px'
  canvasRef.value.style.height = height + 'px'

  // transform to normals
  ctx = canvasRef.value.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

}
function updateSize() {                                                 // update context 
  setSize()
  fontSize = Math.floor(Math.max(12, Math.floor(width / 70)) * 0.75)
  setGrid()
}
function setGrid() {                                                    // create grid + animate rain 

  // set size
  let tempCols = Math.ceil(width / fontSize)
  let tempRows = Math.ceil(height / fontSize)

  const maxCols = 80
  const maxRows = 100

  // dynamic font size for large screen
  if (tempCols > maxCols || tempRows > maxRows) {
    const scaleX = width / maxCols
    const scaleY = height / maxRows
    fontSize = Math.floor(Math.min(scaleX, scaleY))
    tempCols = Math.ceil(width / fontSize)
    tempRows = Math.ceil(height / fontSize)
  }

  // set final sizes
  cols = tempCols
  rows = tempRows

  // set rain
  heads = new Array(cols)
  charBuffers = new Array(cols)
  for (let c = 0; c < cols; c++) {
    heads[c] = Math.random() * rows * -1
    charBuffers[c] = new Array(rows).fill(null)
  }

  // set masks and buffers
  portalCodes = new Uint16Array(cols * rows)
  noiseMap = new Float32Array(cols * rows)
  baseMask = new Uint8Array(cols * rows)
  tmpMask = new Uint8Array(cols * rows)

  // set noisemap
  for (let y = 0; y < rows; y++) {
    const ny = y / Math.max(1, rows)
    for (let x = 0; x < cols; x++) {
      const nx = x / Math.max(1, cols)
      const noise = Math.sin(nx * 12 + ny * 12) + Math.cos(nx * 7 - ny * 9)
      const n = clamp(noise * 0.5 + 0.5, 0, 1)
      noiseMap[y * cols + x] = n
    }
  }

  // ensure aligned expansion
  secureExpand()

}

// ANIMATIONS

function updatePortal(tick) {                                           // render next portal frame 

  // set variables
  const cx = cols / 2
  const cy = rows / 2
  const t = 100 + tick * 0.001
  let idx = 0
  
  // animate
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++, idx++) {
      const v = (Math.cos((x - cx) / 8) + Math.sin((y - cy) / 8) + t) * 16
      const mod = ((Math.floor(v) % charRangeMax) + charRangeMax) % charRangeMax
      portalCodes[idx] = charRangeStart + mod
    }
  }

}
function updateRain() {                                                 // render next rain frame 
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
function updateCircle() {                                               // render next circle frame 

  outroRadius += 1
  circleCells.clear()
  circleFrontier.clear()

  // calcular circulo
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

  // calcular fronteras
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
function updateGerm(total) {                                            // render next germ frame 
  const ratio = clamp(revealFrame / revealMaxFrames, 0, 1)
  for (let i = 0; i < total; i++) baseMask[i] = noiseMap[i] < ratio ? 1 : 0
}
function updateGermInv(total) {                                         // render next inverted germ frame 

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
function updateSwipe() {                                                // render next swipe frame 

  secureMasks()

  const line = Math.floor(transFrame)
  tmpMask.fill(0)

  const t = transFrame * 0.05
  const scroll = transFrame * 0.5

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

      baseMask = secureCopy(baseMask, tmpMask)
      if (autoOutro) { transPhase = 1; transFrame = 0 } else { mode = 'static' }

    } else if (transPhase === 1) {

      baseMask.fill(0)
      tmpMask.fill(0)
      transFrame = cols
      transPhase = 1
      mode = 'hidden'

    }

  }

}
function expandMask(src, steps) {                                       // render next mask frame with buffer 

  secureExpand()
  const total = cols * rows

  if (steps <= 0) { expandA.set(src); return expandA }

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

// MAIN RENDER

function updateMasks(total) {                                           // handle mask mode 

  secureMasks()

  switch (mode) {
    case 'intro':       { updateGerm(total); break }
    case 'static':      { tmpMask = secureCopy(tmpMask, baseMask); break }
    case 'outro':       { updateCircle(); break }
    case 'direct':      { updateGermInv(total); break }
    case 'transition':  { updateSwipe(); break }
    case 'hidden':      { tmpMask.fill(0); break }
  }

}
function cellRender(x, y, headPos, colBuf, resultMask) {                // render mode cells 

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
function drawFrame(ts) {                                                // draw shader 

  if (!ctx) return
  if (mode === 'hidden') { if (animationId != null) cancelAnimationFrame(animationId); animationId = null; return }

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

  if (mode === 'direct' || mode === 'static') { resultMask = baseMask }
  else if (mode === 'transition') { resultMask = tmpMask }
  else { resultMask = expandMask(baseMask, steps) }

  // cell draw loop
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
          ctx.fillRect(px, py, fontSize + 1, fontSize + 1)
        }

      } else if (mode === 'intro') {

        if (revealed) {
          ctx.fillStyle = '#1b1c1c'
          ctx.fillRect(px, py, fontSize + 1, fontSize + 1)
        }

      } else {

        ctx.fillStyle = '#1b1c1c'
        ctx.fillRect(px, py, fontSize + 1, fontSize + 1)

      }

      ctx.fillStyle = color
      ctx.fillText(drawCh, px, py)

    }
  }

  if (mode === 'intro' && revealFrame < revealMaxFrames) revealFrame++
  else if (mode === 'outro') { if (outroRadius < Math.hypot(cols, rows)) outroFrame++; else mode = 'hidden' }
  else if (mode === 'direct') {
  if (revealFrame < revealMaxFrames + extraFrames) revealFrame++; else mode = 'hidden' }

  if (mode !== 'hidden') animationId = requestAnimationFrame(drawFrame)

}

// TASKS

const TASKS = {                                                         // run and check 

  intro:    { impl: runIntro, finish: checkIntro    },
  static:   { impl: runStatic, finish: checkStatic  },
  outro:    { impl: runOutro, finish: checkOutro    },
  direct:   { impl: runDirect, finish: checkDirect  },
  hidden:   { impl: runHidden, finish: checkHidden  },

  'transition-full': { impl: runTransitionFull, finish: checkTransitionFull },
  'transition-intro': { impl: runTransitionIntro, finish: checkTransitionIntro },
  'transition-outro': { impl: runTransitionOutro, finish: checkTransitionOutro },

}
function runQueue(name) {                                               // run queue 

  const task = TASKS[name]
  if (!task) return Promise.reject(new Error(`Unknown shader task "${name}"`))

  if (!animationId) animationId = requestAnimationFrame(drawFrame) // reiniciar raf

  return new Promise((resolve, reject) => {
    try { task.impl() } catch (err) { reject(err); return }
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

function runIntro()             { mode = 'intro'; revealFrame = 0 }
function runStatic()            { mode = 'static'; secureMasks(); for (let i = 0; i < rows * cols; i++) baseMask[i] = 1; tmpMask = secureCopy(tmpMask, baseMask) }
function runOutro()             { mode = 'outro'; outroRadius = 0; outroCenter = { x: 0, y: rows } }
function runDirect()            { mode = 'direct'; revealFrame = 0; secureMasks(); for (let i = 0; i < rows * cols; i++) baseMask[i] = 1; tmpMask = secureCopy(tmpMask, baseMask) }
function runTransitionFull()    { mode = 'transition'; secureMasks(); baseMask.fill(0); tmpMask.fill(0); transFrame = 0; transPhase = 0; autoOutro = true }
function runTransitionIntro()   { mode = 'transition'; secureMasks(); baseMask.fill(0); tmpMask.fill(0); transFrame = 0; transPhase = 0; autoOutro = false }
function runTransitionOutro()   { mode = 'transition'; secureMasks(); tmpMask = secureCopy(tmpMask, baseMask); transFrame = 0; transPhase = 1; autoOutro = false }
function runHidden()            { mode = 'hidden' }

function checkIntro()           { return mode === 'intro' && revealFrame >= revealMaxFrames * 0.65 }
function checkStatic()          { return true }
function checkOutro()           { return mode === 'outro' && outroRadius >= Math.hypot(cols, rows) }
function checkDirect()          { return mode === 'direct' && revealFrame >= revealMaxFrames + extraFrames }
function checkTransitionIntro() { return mode === 'static' || (mode === 'transition' && transPhase === 1 && transFrame >= cols) }
function checkTransitionOutro() { return mode === 'hidden' || (mode === 'transition' && transPhase === 1 && transFrame >= cols) }
function checkTransitionFull()  { return mode === 'hidden' || mode === 'static' }
function checkHidden()          { return true }

defineExpose({ 
  runQueue,
  runIntro,
  runStatic,
  runOutro,
  runTransitionIntro,
  runTransitionOutro,
  runDirect,
  runHidden,
})

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
  secureMasks()
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
.container { overflow: hidden; width: 100%; height: 100%; }
canvas { display: block; width: 100%; height: 100%; }
</style>