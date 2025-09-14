<script setup>

import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const charRangeStart = 33                             // unicode char start
const charRangeEnd = 126                              // unicode char end
const charRangeMax = charRangeEnd - charRangeStart    // max possible chars

let _readyResolve = null
const _ready = new Promise(r => { _readyResolve = r })

const canvasRef = ref(null)         // dom << canvas >> ref
const containerRef = ref(null)      // container div ref

let circleCells = new Set()         // guarda indices dentro del circulo
let circleFrontier = new Set()      // guarda indices del limite del circulo

let ctx = null                      // canvas 2D context
let width = 0                       // canvas px height
let height = 0                      // canvas px width
let fontSize = 16                   // font px size
let dpr = 1                         // device px ratio
let cols = 0                        // char grid columns
let rows = 0                        // char grid rows

let speed = 0.7                     // rain fall speed
let trailLength = 40                // rain trail char length
let resetChance = 0.02              // column reset chance

let heads = []                      // first rain char position
let charBuffers = []                // rain column chars positions
let portalCodes = null              // portal cell char codes

let noiseMap = null                 // static noise array for animations
let baseMask = null                 // active/inactive animation cell mask
let tmpMask = null                  // dilation temporal buffer mask

let animationId = null              // next requested frame id
let revealFrame = 0                 // frame counter for intro
let mode = 'hidden'                       // current mode store string
let outroFrame = 0                  // outro max frame counter
let outroRadius = 0                 // current outro animation radius
let outroCenter = { x: 0, y: 0 }    // outro animation center position
let transFrame = 0                  // swipe animation line counter
let transPhase = 0                  // swipe animation direction

const revealMaxFrames = 160         // intro total frames counter
const borderColor = '#AAABAC'       // active border zone color
const maxDilateSteps = 32           // outro animation max frames

// HELPERS

function clamp(v, a = 0, b = 1) {         // constrain value 

  return Math.min(b, Math.max(a, v))

}

function pickChar() {                     // return character 

  return String.fromCharCode(charRangeStart + Math.floor(Math.random() * charRangeMax))

}

function trailAlpha(alpha) {              // returns trail color 

  alpha = Math.pow(Math.max(0, alpha), 1.2)

  return `rgba(126,189,196,${alpha.toFixed(3)})`

}

function isFrontier(maskArr, x, y) {      // detects border of zone 

  const i = y * cols + x

  // true if cell is active and one neighbor is not active
  if (!maskArr[i]) return false
  if (x > 0 && !maskArr[i - 1]) return true
  if (x < cols - 1 && !maskArr[i + 1]) return true
  if (y > 0 && !maskArr[i - cols]) return true
  if (y < rows - 1 && !maskArr[i + cols]) return true

  return false

}

// CONTEXT

function setSize() {                      // prepare context 

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

function updateSize() {                   // update context 

  setSize()

  fontSize = Math.max(12, Math.floor(width / 70)) * 0.75

  setGrid()

}

function setGrid() {                      // create grid + animate rain 

  // set size
  cols = Math.max(1, Math.ceil(width / fontSize))
  rows = Math.max(2, Math.ceil(height / fontSize))

  // set rain
  heads = new Array(cols)
  charBuffers = new Array(cols)
  for (let c = 0; c < cols; c++) {
    heads[c] = Math.random() * rows * -1
    charBuffers[c] = new Array(rows).fill(null)
  }

  // set arrays
  portalCodes = new Uint16Array(cols * rows)
  noiseMap = new Float32Array(cols * rows)
  baseMask = new Uint8Array(cols * rows)
  tmpMask = new Uint8Array(cols * rows)

  baseMask.fill(0)
  tmpMask.fill(0)

  if (_readyResolve) { _readyResolve(); _readyResolve = null }

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

}

// ANIMATIONS

function updatePortal(tick) {             // next portal frame 

  // set variables
  const cx = cols / 2
  const cy = rows / 2
  const t = 100 + tick * 0.001
  let idx = 0
  
  // create animation
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++, idx++) {
      const v = (Math.cos((x - cx) / 8) + Math.sin((y - cy) / 8) + t) * 16
      const mod = ((Math.floor(v) % charRangeMax) + charRangeMax) % charRangeMax
      portalCodes[idx] = charRangeStart + mod
    }
  }

}

function updateRain() {                   // next rain frame 

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

function updateCircle() {                 // next circle frame 

  outroRadius += 1
  circleCells.clear()
  circleFrontier.clear()  

  // calcular circulo
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

  // calcular fronteras
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

  for (let i = 0; i < rows*cols; i++) baseMask[i] = circleCells.has(i) ? 0 : 1
  
}

function updateGerm(total) {              // next germ frame 

  const ratio = clamp(revealFrame / revealMaxFrames, 0, 1)
  for (let i = 0; i < total; i++) baseMask[i] = noiseMap[i] < ratio ? 1 : 0

}

function updateGermInv(total) {           // next germ frame inverted 

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
          if ((x > 0 && baseMask[i - 1] === 0) ||
              (x < cols - 1 && baseMask[i + 1] === 0) ||
              (y > 0 && baseMask[i - cols] === 0) ||
              (y < rows - 1 && baseMask[i + cols] === 0)) {
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

function updateSwipe() {                  // next swipe frame 
  
  const line = Math.floor(transFrame)
  tmpMask.fill(0)

  const t = performance.now() * 0.01
  const verticalShift = Math.floor(t)

  if (transPhase === 0) {

    for (let y = 0; y < rows; y++) {

      const n = noiseMap[((y + verticalShift) % rows) * cols]
      const noiseOffset = Math.floor(Math.sin(t + n * 5) + 1)
      const xLimit = Math.min(line + noiseOffset, cols - 1)

      for (let x = 0; x <= xLimit; x++) tmpMask[y * cols + x] = 1

    }
  } else if (transPhase === 1) {

    for (let y = 0; y < rows; y++) {

      const n = noiseMap[((y + verticalShift) % rows) * cols]
      const noiseOffset = Math.floor(Math.sin(t + n * 5) + 1)
      const xStart = Math.max(line - noiseOffset, 0)
       
      for (let x = xStart; x < cols; x++) tmpMask[y * cols + x] = 1

    }
  }

  transFrame += 1.0;

  if (transFrame >= cols) {

    if (transPhase === 0) {

      transPhase = 1;
      transFrame = 0;
      baseMask.set(tmpMask);

    } else if (transPhase === 1) {

      baseMask.fill(0);
      tmpMask.fill(0);
      transFrame = cols;
      transPhase = 1;

    }

  }
  
}

function expandMask(src, dst, steps) {    // next mask frame 

  dst.set(src)

  // for each step, activate neighbors
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

  // returns expanded mask
  return (steps % 2 === 0) ? dst : src

}

// MAIN

function updateMasks(total) {                                   // handle mask mode 

    switch (mode) {

    case 'intro': { updateGerm(total); break }
    case 'static': { tmpMask.set(baseMask); break }
    case 'outro': { updateCircle(); break }
    case 'direct': { updateGermInv(total); break }
    case 'transition': { updateSwipe(); break }
    case 'hidden': { tmpMask.fill(0); break }
  
  }

}

function cellRender(x, y, headPos, colBuf, resultMask) {        // render cells 
  
  const idx = y * cols + x
  const portalCode = portalCodes[idx]
  const portalCh = String.fromCharCode(portalCode)
  const matrixCh = colBuf[y]
  const revealed = !!resultMask[idx]
  const frontier = isFrontier(resultMask, x, y)

  let drawCh = portalCh
  let color = `rgba(152,108,152,1)` // default portal shader

  switch (mode) {

    case 'intro': { 

      if (!revealed) color = '#1b1c1c'
      if (frontier) color = borderColor

      if (matrixCh && revealed) {

        const dist = headPos - y
        if (dist >= 0 && dist <= trailLength) color = trailAlpha(1 - dist / trailLength)
      
      }

      break

    }

    case 'static': { 

      const dist = headPos - y

      if (matrixCh && dist >= 0 && dist <= trailLength) {

        color = trailAlpha(1 - dist / trailLength)
        drawCh = matrixCh

      }

      break

    }

    case 'outro': { 

      const dist = headPos - y
      const inTrail = matrixCh && dist >= 0 && dist <= trailLength

      if (inTrail) {

        color = trailAlpha(1 - dist / trailLength)
        drawCh = matrixCh

      }

      if (circleCells.has(idx) && !circleFrontier.has(idx)) {

        drawCh = null

      } else if (circleFrontier.has(idx)) {

        color = borderColor

      }

      break

    }

    case 'direct': { 

      if (!revealed) {

        drawCh = null
        color = borderColor && isFrontier(resultMask, x, y) ? borderColor : '#1b1c1c'

      } else {

        drawCh = matrixCh || portalCh
        const dist = headPos - y

        if (matrixCh && dist >= 0 && dist <= trailLength) color = trailAlpha(1 - dist / trailLength)
        
      }
      
      break
      
    }

    case 'transition': { 
      
      if (!revealed) {
        
        if (frontier) { drawCh = portalCh; color = borderColor } else { drawCh = null }
        
      } else {
        
        drawCh = portalCh
        
        if (frontier) color = borderColor
        
        if (matrixCh) {
          
          const dist = headPos - y
          
          if (dist >= 0 && dist <= trailLength) {
            
            color = trailAlpha(1 - dist / trailLength)
            drawCh = matrixCh
            
          }
          
        }
        
      }
      
      break
      
    }
    
    case 'hidden': { drawCh = null; break }
    
    default: { if (frontier) color = borderColor; break }
    
  }

  return { drawCh, color }

}

function drawFrame(ts) {                                        // draws shader 

  if (!ctx) return
  const total = rows * cols

  ctx.font = `${fontSize}px 'Gohu Mono', monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  ctx.clearRect(0, 0, width, height)

  updatePortal(ts)
  updateRain()
  updateMasks(total)

  // outro circle
  const steps = Math.min(maxDilateSteps, Math.floor((mode === 'intro' ? clamp(revealFrame/revealMaxFrames,0,1) : 1)*maxDilateSteps))
  const resultMask = mode === 'direct' ? baseMask : mode === 'transition' ? tmpMask : expandMask(baseMask, tmpMask, steps)

  // cell draw loop
  for (let x = 0; x < cols; x++) {

    const headPos = Math.floor(heads[x])
    const colBuf = charBuffers[x]

    for (let y = 0; y < rows; y++) {

      const { drawCh, color } = cellRender(x, y, headPos, colBuf, resultMask)
      if (drawCh !== null) ctx.fillStyle = color, ctx.fillText(drawCh, x * fontSize, y * fontSize)

    }

  }

  // frame counters
  if (mode==='intro' && revealFrame < revealMaxFrames) revealFrame++
  else if (mode === 'outro' && outroRadius < Math.hypot(cols,rows)) outroFrame++
  else if (mode === 'direct' && revealFrame < revealMaxFrames) revealFrame++

  // request next frame
  animationId = requestAnimationFrame(drawFrame)

}

function runIntro() { mode = 'intro'; revealFrame = 0; }                                                                // DONE
function runStatic() { mode = 'static'; for(let i=0;i<rows*cols;i++) baseMask[i] = 1; }                                 // DONE
function runOutro() { mode = 'outro'; outroRadius = 0; outroCenter = { x: 0, y: rows } }                                // DONE
function runDirect() { mode = 'direct'; revealFrame = 0; for (let i = 0; i < rows * cols; i++) baseMask[i] = 1 }        // DONE
function runTransition() { mode = 'transition'; baseMask.fill(0); tmpMask.fill(0) }                                     // DONE
function runHidden() { mode = 'hidden'; }                                                                               // DONE

defineExpose({ runIntro, runStatic, runOutro, runTransition, runDirect, runHidden, waitReady: () => _ready })

onMounted ( async () => {

  updateSize()
  runIntro()
  window.addEventListener('resize', updateSize)
  animationId = requestAnimationFrame(drawFrame)

})

onBeforeUnmount ( () => {

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

@import url('https://font.gohu.org/css2?family=Gohu+Mono&display=swap');

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