<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const GRAIN_TARGET = 55

const canvasRef    = ref(null)                                          // dom << canvas >> ref
const containerRef = ref(null)                                          // container div ref
const COLOR_BACKGR = '#1B1C1C'                                          // solid background color
const COLOR_BORDER = '#AAABAC'                                          // solid frontier color
const COLOR_PORTAL = '#986C98'                                          // solid portal color
const COLOR_RAIN   = '#8AB6BB'                                          // solid rain color
const charRangeStart    = 33                                            // unicode starting character
const charRangeCount    = 126 - charRangeStart + 1                      // max possible characters
const germFramesMax     = 160                                           // intro total frames counter
const outroFramesMax    = 32                                            // outro animation max frames
const directFramesExtra = 42                                            // direct animation extra frames

let lastTime   = 0                                                      // last frame time for delta
let charIndex  = 0                                                      // character buffer index
let charTable  = null                                                   // precomputed unicode char values
let charBuffer = []                                                     // buffer for precomputed char values
let mode = 'hidden'                                                     // current animation mode
let animationID = null                                                  // next requested frame id
let taskPromise = null                                                  // promise handling for drawloop
let taskResolve = null                                                  // resolve handling for drawloop
let context = null                                                      // canvas 2D context init
let fontSize = 16                                                       // font base pixel size
let height = 0                                                          // canvas px height
let width = 0                                                           // canvas px width
let dpr = 1                                                             // device px ratio
let cols = 0                                                            // char grid columns
let rows = 0                                                            // char grid rows
let maxCols = 40                                                        // max char grid columns
let maxRows = 60                                                        // max char grid rows

let portalTime   = 0                                                    // portal delta speed calculation
let portalCodes  = null                                                 // portal cell int char codes
let portalChars  = null                                                 // portal characters
let portalSine   = null                                                 // portal trigo cache sine
let portalCosine = null                                                 // portal trigo cache cosine
let rainHeads    = []                                                   // first rain char position
let rainBuffer   = []                                                   // rain column chars positions
let rainColumn   = null                                                 // full rain column position array
let rainColors   = null                                                 // alpha color cache
let rainChance   = 0.005                                                // column reset chance
let rainLength   = 25                                                   // rain trail char length
let rainSpeed    = 0.7                                                  // rain trail fall speed

let germFrame     = 0                                                   // frame counter for intro & direct
let swipeFrame    = 0                                                   // swipe animation line counter
let swipePhase    = 0                                                   // swipe animation direction
let swipeSine     = null                                                // swipe trigo cache sine
let swipeCosine   = null                                                // swipe trigo cache cosine
let outroRadius   = 0                                                   // current outro animation radius
let outroCenter   = { x: 0, y: 0 }                                      // outro animation center position
let outroAuto     = false                                               // swipe outro autotrigger
let outroCells    = null                                                // guarda indices dentro del circulo
let outroFrontier = null                                                // guarda indices del limite del circulo

let logicMask  = null                                                   // binary active cell mask
let visualMask = null                                                   // buffer mask for basemask
let expandA    = null                                                   // dilation buffer for expandMask
let expandB    = null                                                   // dilation buffer for expandMask
let indexToX   = null                                                   // maps linear index to x coord
let indexToY   = null                                                   // maps linear index to y coord
let textGroups        = null                                            // map for text drawing
let isTransparentPath = []                                              // reusable buffer for transparent cells

let noiseMap        = null                                              // static noise map for distortion
let neighborsMap    = null                                              // stores each cell neighbors
let frontierMap     = null                                              // mask for cells in borders
let frontierCurrent = null                                              // buffer for last frontier indexes
let frontierNext    = null                                              // buffer for next frontier indexes

// MAIN RENDER

function cellRender(x, y, headPos, colBuf, resultMask) {                // cell style definitions by mode 

  const idx = y * cols + x
  const portalCh = portalChars[idx]
  const matrixCh = colBuf[y]
  const revealed = !!resultMask[idx]
  const frontier = !!frontierMap[idx]
  const dist = headPos - y

  let drawCh = portalCh
  let color = COLOR_PORTAL
  let isTransparent = false

  const isRain = (dist >= 0 && dist <= rainLength)
  const isRainHead = !!matrixCh

  switch (mode) {

    case 'intro': {
      if (frontier) color = COLOR_BORDER
      if (!revealed) { drawCh = null; isTransparent = true }
      if (isRain && revealed) { color = rainColors[dist]; if (isRainHead) drawCh = matrixCh }
      break
    }

    case 'static': {
      if (isRain) { color = rainColors[dist]; if (isRainHead) drawCh = matrixCh }
      else { drawCh = portalCh; color = COLOR_PORTAL }
      break
    }

    case 'outro': {
      const isInsideCircle = outroCells[idx] && !outroFrontier[idx]
      isTransparent = isInsideCircle
      if (isInsideCircle) { drawCh = null } else if (outroFrontier[idx]) { color = COLOR_BORDER; drawCh = portalCh }
      if (isRain && !isInsideCircle) { color = rainColors[dist]; if (isRainHead) drawCh = matrixCh }
      break
    }

    case 'direct': {
      if (frontier) { drawCh = portalCh; color = COLOR_BORDER }
      else if (!revealed) { drawCh = null; isTransparent = true }
      else { drawCh = portalCh; color = COLOR_PORTAL }
      if (isRain && (revealed || frontier)) { color = rainColors[dist]; if (isRainHead) drawCh = matrixCh }
      break
    }

    case 'transition': {
      if (!revealed) { if (frontier) { drawCh = portalCh; color = COLOR_BORDER } else { drawCh = null; isTransparent = true } }
      else { drawCh = portalCh; if (frontier) color = COLOR_BORDER }
      if (isRain && revealed) { color = rainColors[dist]; if (isRainHead) drawCh = matrixCh }
      break
    }

    default: {
      if (frontier) color = COLOR_BORDER;
      if (isRain) { color = rainColors[dist]; if (isRainHead) drawCh = matrixCh }
      break
    }

  }
  
  return [drawCh, color, isTransparent]

}

function drawFrame(deltaTime) {                                         // draw shader 

  if (!context) return

  if (mode === 'hidden') {
    context.clearRect(0, 0, width, height)
    if (taskPromise) { const r = taskResolve; taskPromise = null; taskResolve = null; if (r) r() }
    return
  }

  const total = rows * cols
  const frameFactor = (deltaTime / 16.666)

  animatePortal(frameFactor)
  animateRain(frameFactor)

  switch (mode) {

    case 'intro':       { animateGerm(total); break }
    case 'static':      { break }
    case 'outro':       { animateCircle(frameFactor); break }
    case 'direct':      { animateGermInv(total); break }
    case 'transition':  { animateSwipe(frameFactor); break }

  }

  if (mode === 'hidden') {
    context.clearRect(0, 0, width, height)
    if (taskPromise) { const r = taskResolve; taskPromise = null; taskResolve = null; if (r) r() }
    return
  }

  const steps = Math.min(outroFramesMax, Math.floor((mode === 'intro' ? clampValue(germFrame / germFramesMax, 0, 1) : 1) * outroFramesMax))
  let resultMask = (mode === 'direct' || mode === 'static' || mode === 'outro') ? logicMask : (mode === 'transition') ? visualMask : expandMask(logicMask, steps)
  if (mode !== 'outro') computeFrontier(resultMask)
  
  if (!textGroups) textGroups = new Map()
  for (const arr of textGroups.values()) arr.length = 0

  context.clearRect(0, 0, width, height)
  context.fillStyle = COLOR_BACKGR
  context.fillRect(0, 0, width, height)

  context.globalCompositeOperation = 'destination-out'
  context.fillStyle = '#000'
  context.beginPath()
  
  isTransparentPath.length = 0

  for (let y = 0; y < rows; y++) {

    const py = y * fontSize

    for (let x = 0; x < cols; x++) {

      const headPos = rainColumn[x]
      const colBuf = rainBuffer[x]
      const [drawCh, color, isTransparent] = cellRender(x, y, headPos, colBuf, resultMask)
      
      if (isTransparent) { isTransparentPath.push(x, py) }

      if (drawCh != null) {
        let group = textGroups.get(color)
        if (!group) { group = []; textGroups.set(color, group) }
        group.push(drawCh, x, py)
      }

    }
  }
  
  for (let i = 0; i < isTransparentPath.length; i += 2) { context.rect(isTransparentPath[i] * fontSize, isTransparentPath[i + 1], fontSize + 1, fontSize + 1) }
  context.fill()

  context.globalCompositeOperation = 'source-over'

  for (const [color, chars] of textGroups) {
    if (!chars.length) continue
    context.fillStyle = color
    for (let i = 0; i < chars.length; i += 3) { context.fillText(chars[i], chars[i + 1] * fontSize, chars[i + 2]) }
  }
  
  const frameAdvancement = 1 * frameFactor

  switch (mode) {

    case 'intro':         germFrame += frameAdvancement; if (germFrame >= germFramesMax) { germFrame = germFramesMax; mode = 'static' } break
    case 'direct':        germFrame += frameAdvancement; const directLimit = germFramesMax + directFramesExtra; if (germFrame >= directLimit) { germFrame = directLimit; mode = 'hidden' } break

    default: break

  }

  if (taskPromise) {
    try {
      if (mode === 'hidden' || mode === 'static' || (typeof taskPromise.finish === 'function' && taskPromise.finish())) {
        const r = taskResolve
        taskPromise = null
        taskResolve = null
        if (r) r()
      }
    } catch (err) { taskPromise = null; taskResolve = null }
  }

}

// INIT

function initMasks() {                                                  // initialize all arrays 

  const total = cols * rows

  if (!noiseMap         || noiseMap.length          !== total) noiseMap          = new Float32Array(total)
  if (!frontierCurrent  || frontierCurrent.length   !== total) frontierCurrent   = new Uint32Array(total)
  if (!frontierNext     || frontierNext.length      !== total) frontierNext      = new Uint32Array(total)
  if (!indexToX         || indexToX.length          !== total) indexToX          = new Int16Array(total)
  if (!indexToY         || indexToY.length          !== total) indexToY          = new Int16Array(total)
  if (!portalCodes      || portalCodes.length       !== total) portalCodes       = new Int16Array(total)
  if (!logicMask        || logicMask.length         !== total) logicMask         = new Uint8Array(total)
  if (!visualMask       || visualMask.length        !== total) visualMask        = new Uint8Array(total)
  if (!expandA          || expandA.length           !== total) expandA           = new Uint8Array(total)
  if (!expandB          || expandB.length           !== total) expandB           = new Uint8Array(total)
  if (!outroCells       || outroCells.length        !== total) outroCells        = new Uint8Array(total)
  if (!outroFrontier    || outroFrontier.length     !== total) outroFrontier     = new Uint8Array(total)
  if (!frontierMap      || frontierMap.length       !== total) frontierMap       = new Uint8Array(total)
  if (!portalChars      || portalChars.length       !== total) portalChars       = new Array(total)
  if (!neighborsMap     || neighborsMap.length      !== total) neighborsMap      = new Array(total)
  if (!rainColumn       || rainColumn.length        !== cols)  rainColumn        = new Int16Array(cols)
  if (!portalCosine     || portalCosine.length      !== cols)  portalCosine      = new Float32Array(cols)
  if (!portalSine       || portalSine.length        !== rows)  portalSine        = new Float32Array(rows)
  if (!swipeSine        || swipeSine.length         !== rows)  swipeSine         = new Float32Array(rows)
  if (!swipeCosine      || swipeCosine.length       !== rows)  swipeCosine       = new Float32Array(rows)

}

function resetMasks() {                                                 // reset only state masks 

  const total = cols * rows

  if (!logicMask      || logicMask.length      !== total) logicMask      = new Uint8Array(total)
  if (!visualMask     || visualMask.length     !== total) visualMask     = new Uint8Array(total)
  if (!outroCells     || outroCells.length     !== total) outroCells     = new Uint8Array(total)
  if (!outroFrontier  || outroFrontier.length  !== total) outroFrontier  = new Uint8Array(total)
  if (!frontierMap    || frontierMap.length    !== total) frontierMap    = new Uint8Array(total)
  if (!portalChars    || portalChars.length    !== total) portalChars    = new Array(total)

}

function initContext() {                                                // prepare context 

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
  context = canvasRef.value.getContext('2d')
  context.setTransform(dpr, 0, 0, dpr, 0, 0)

}

function resetContext() {                                               // update context 

  initContext()

  let calcSize = Math.floor(width / GRAIN_TARGET)
  fontSize = Math.max(10, Math.min(calcSize, 24))

  initGrid()

}

function initGrid() {                                                   // create grid + animate rain 

  // set size
  cols = Math.ceil(width / fontSize)
  rows = Math.ceil(height / fontSize)

  maxCols = cols
  maxRows = rows

  context.font = `${fontSize}px monospace`
  context.textBaseline = 'top'
  context.textAlign = 'left'

  // set final sizes
  const total = cols * rows

  initMasks()

  const cx = cols / 2
  const cy = rows / 2
  
  const t0 = 100
  
  // portal trig animation
  for (let y = 0, i = 0; y < rows; y++) { for (let x = 0; x < cols; x++, i++) { indexToX[i] = x; indexToY[i] = y } }
  for (let x = 0; x < cols; x++) portalCosine[x] = Math.cos((x - cx) / 8 + t0 * 0.001)
  for (let y = 0; y < rows; y++) portalSine[y] = Math.sin((y - cy) / 8 + t0 * 0.001)

  // set rain
  rainHeads = new Array(cols)
  rainBuffer = new Array(cols)
  for (let c = 0; c < cols; c++) {
    rainHeads[c] = -Math.random() * rows * 10
    rainBuffer[c] = new Array(rows).fill(null)
  }

  // precompute all chars
  if (!charTable) {
    charTable = new Array(charRangeCount)
    for (let i = 0; i < charRangeCount; i++) {
      charTable[i] = String.fromCharCode(charRangeStart + i)
    }
  }

  buildChars()
  
  // build swipe waves
  for (let y = 0; y < rows; y++) {
    swipeSine[y] = Math.sin(y * 0.25)
    swipeCosine[y] = Math.cos(y * 0.25)
  }
  
  // buildneighbors
  neighborsMap = new Array(total).fill(null)
  for (let idx = 0; idx < total; idx++) {
    const x = indexToX[idx]
    const y = indexToY[idx]
    const neighbors = []
    if (x > 0) neighbors.push(idx - 1)
    if (x < cols - 1) neighbors.push(idx + 1)
    if (y > 0) neighbors.push(idx - cols)
    if (y < rows - 1) neighbors.push(idx + cols)
    neighborsMap[idx] = neighbors
  }

  // set alpha cache
  rainColors = new Array(rainLength + 1)
  for (let i = 0; i <= rainLength; i++) {
    const alpha = 1 - i / Math.max(1, rainLength)
    const a = Math.pow(Math.max(0, alpha), 1.2)
    rainColors[i] = `rgba(126,189,196,${a.toFixed(3)})`
  }

  // set noisemap
  for (let y = 0; y < rows; y++) {
    const ny = y / Math.max(1, rows)
    for (let x = 0; x < cols; x++) {
      const nx = x / Math.max(1, cols)
      const noise = Math.sin(nx * 12 + ny * 12) + Math.cos(nx * 7 - ny * 9)
      const n = clampValue(noise * 0.5 + 0.5, 0, 1)
      noiseMap[y * cols + x] = n
    }
  }

}

// HELPERS

function clampValue(value, min = 0, max = 1) {                          // constrain value between max and min 
  
  return Math.min(max, Math.max(min, value))

}

function secureCopy(destination, source) {                              // prevent overwrite on UINT8 array copy 

  if (!source) return null
  if (!destination || destination.length !== source.length) {
    destination = new Uint8Array(source.length)
  }
  
  destination.set(source)
  return destination

}

// BUILDERS

function computeFrontier(mask) {                                        // frontier from cells touching inactive 

  if (!mask) { frontierMap && frontierMap.fill(0); return }
  frontierMap.fill(0)
  
  for (let y = 0; y < rows; y++) {
    const yOff = y * cols
    for (let x = 0; x < cols; x++) {
      const i = yOff + x
      if (!mask[i]) continue
      if (x > 0        && !mask[i - 1])    { frontierMap[i] = 1; continue }
      if (y > 0        && !mask[i - cols]) { frontierMap[i] = 1; continue }
      if (x < cols - 1 && !mask[i + 1])    { frontierMap[i] = 1; continue }
      if (y < rows - 1 && !mask[i + cols]) { frontierMap[i] = 1; continue }
    }
  }

}

function buildChars() {                                                 // init char buffer 

  charBuffer = new Array(charRangeCount)

  for (let i = 0; i < charRangeCount; i++) {
    charBuffer[i] = charTable[i]
  }

  charIndex = 0
  
}

// ANIMATIONS

function animatePortal(frameFactor) {                                          // render next portal frame

  const portalAdvance = 0.0125 * frameFactor
  portalTime += portalAdvance

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      const v = portalCosine[x] + portalSine[y] + portalTime
      const rawCode = v * 16 | 0
      portalCodes[idx] = ((rawCode % charRangeCount) + charRangeCount) % charRangeCount
      portalChars[idx] = charTable[portalCodes[idx]]
    }
  }

}

function animateRain(frameFactor) {                                     // render next rain frame 

  let localCharIndex = charIndex
  const charCount = charRangeCount
  const fallSpeed = rainSpeed * frameFactor

  for (let c = 0; c < cols; c++) {
    const rowPos = Math.floor(rainHeads[c] + fallSpeed)
    rainHeads[c] += fallSpeed
    rainColumn[c] = Math.floor(rainHeads[c])
    if (rowPos >= 0 && rowPos < rows) { rainBuffer[c][rowPos] = charBuffer[localCharIndex]; localCharIndex = (localCharIndex + 1) % charCount }
    if (rainHeads[c] > rows + rainLength && Math.random() < rainChance) { rainHeads[c] = -Math.random() * rows }
  }

  charIndex = localCharIndex

}

function animateCircle(frameFactor) {                                   // render next circle frame

  const maxRadius = Math.hypot(cols, rows) + 10
  if (outroRadius >= maxRadius) return
  outroRadius += 1 * frameFactor

  const rCurr = outroRadius
  const cX = outroCenter.x
  const cY = outroCenter.y

  outroCells.fill(0); 

  for (let y = 0; y < rows; y++) {

    const yOff = y * cols
    const dY = y - cY
    const dY2 = dY * dY

    for (let x = 0; x < cols; x++) {

      const idx = yOff + x
      const dX = x - cX
      const dist2 = dX * dX + dY2
      const n = noiseMap[idx] * 5
      const radiusNoise2 = (rCurr + n) * (rCurr + n)

      if (dist2 <= radiusNoise2) outroCells[idx] = 1

    }

  }

  for (let i = 0; i < rows * cols; i++) outroFrontier[i] = 0

  for (let y = 0; y < rows; y++) {

    const yOff = y * cols

    for (let x = 0; x < cols; x++) {

      const idx = yOff + x
      
      if (!outroCells[idx]) continue
      if (

        (x > 0 && !outroCells[idx - 1]) || (x < cols - 1 && !outroCells[idx + 1]) || 
        (y > 0 && !outroCells[idx - cols]) || (y < rows - 1 && !outroCells[idx + cols]) 

      ) outroFrontier[idx] = 1

    }
  }

  for (let i = 0; i < rows * cols; i++) logicMask[i] = outroCells[i] ? 0 : 1

}

function animateGerm(total) {                                           // render next germ frame 

  const oldRatio = animateGerm.lastRatio || 0
  const newRatio = clampValue(germFrame / germFramesMax, 0, 1)

  for (let i = 0; i < total; i++) { const n = noiseMap[i]; if (n >= oldRatio && n < newRatio) logicMask[i] = 1 }
  animateGerm.lastRatio = newRatio

}

function animateGermInv(total) {                                        // render next inverted germ frame 
  
  const ratio = clampValue(germFrame / germFramesMax, 0, 1)
  
  for (let i = 0; i < total; i++) { if (logicMask[i] === 1 && noiseMap[i] < ratio) logicMask[i] = 0 }

  if (ratio >= 1) {

    if (!animateGermInv.frontierQueue) { animateGermInv.frontierQueue = []; animateGermInv.frontierSet = new Set() }
    const q = animateGermInv.frontierQueue
    const qSet = animateGermInv.frontierSet

    for (let y = 0; y < rows; y++) {
      const yOff = y * cols
      for (let x = 0; x < cols; x++) {
        const i = yOff + x
        if (logicMask[i] !== 1) continue
        if (
          (x > 0        && logicMask[i - 1]    === 0) ||
          (x < cols - 1 && logicMask[i + 1]    === 0) ||
          (y > 0        && logicMask[i - cols] === 0) ||
          (y < rows - 1 && logicMask[i + cols] === 0)
        ) { if (!qSet.has(i)) { qSet.add(i); q.push(i) } }
      }
    }

    if (q.length > 0) {
      const perFrame = Math.max(1, Math.floor(total / germFramesMax))
      let count = 0
      for (let k = 0; k < q.length && count < perFrame; k++) {
        const idx = q[k]
        if (logicMask[idx] === 1) { logicMask[idx] = 0; count++ }
      }
      const newQ = q.filter(i => logicMask[i] === 1)
      animateGermInv.frontierQueue = newQ
      animateGermInv.frontierSet = new Set(newQ)
    }
  }
}

function animateSwipe(frameFactor) {                                    // render next swipe frame 

  const line = Math.floor(swipeFrame)
  visualMask.fill(0)

  if (swipePhase === 0) {
    for (let y = 0; y < rows; y++) {
      const wave = swipeSine[y]
      const noiseOffset = Math.floor(wave * 2)
      const xLimit = Math.min(line + noiseOffset, cols - 1)
      for (let x = 0; x <= xLimit; x++) visualMask[y * cols + x] = 1
    }
  } else if (swipePhase === 1) {
    for (let y = 0; y < rows; y++) {
      const wave = swipeCosine[y]
      const noiseOffset = Math.floor(wave * 2)
      const xStart = Math.max(line - noiseOffset, 0)
      for (let x = xStart; x < cols; x++) visualMask[y * cols + x] = 1
    }
  }

  swipeFrame += 2.0 * frameFactor

  if (swipeFrame >= cols) {

    if (swipePhase === 0) {

      logicMask.set(visualMask)
      if (outroAuto) { swipePhase = 1; swipeFrame = 0 } else { mode = 'static' }

    } else if (swipePhase === 1) {

      logicMask.fill(0)
      visualMask.fill(0)
      swipeFrame = cols
      swipePhase = 1
      mode = 'hidden'

    }

  }

}

function expandMask(source, steps) {                                    // render next mask frame with buffer 

  const total = cols * rows
  let a = expandA, b = expandB
  a.set(source)
  
  let frontier = frontierCurrent
  let nextFrontier = frontierNext
  let frontierLen = 0
  let nextLen = 0

  for (let i = 0; i < total; i++) { if (a[i]) frontier[frontierLen++] = i }

  for (let s = 0; s < steps; s++) {

    b.set(a)
    nextLen = 0

    for (let f = 0; f < frontierLen; f++) {
      const idx = frontier[f]
      const neighbors = neighborsMap[idx]
      for (let n of neighbors) { if (!b[n]) { b[n] = 1; nextFrontier[nextLen++] = n } }
    }

    if (nextLen === 0) break

    [frontier, nextFrontier] = [nextFrontier, frontier]
    frontierLen = nextLen
    const tmp = a
    a = b
    b = tmp

  }

  expandA.set(a);
  return expandA;
}

// TASKS

const TASKS = {                                                         // run and check 

  intro:    { impl: runIntro,  finish: checkIntro   },
  static:   { impl: runStatic, finish: checkStatic  },
  outro:    { impl: runOutro,  finish: checkOutro   },
  direct:   { impl: runDirect, finish: checkDirect  },
  hidden:   { impl: runHidden, finish: checkHidden  },

  'transition-full':  { impl: runTransitionFull,  finish: checkTransitionFull  },
  'transition-intro': { impl: runTransitionIntro, finish: checkTransitionIntro },
  'transition-outro': { impl: runTransitionOutro, finish: checkTransitionOutro },

}

function startLoop() { if (animationID !== null) return; lastTime = 0; animationID = requestAnimationFrame(mainLoop) }

function runQueue(name) {                                               // run queue
  const task = TASKS[name]
  if (!task) return Promise.reject(new Error(`Unknown shader task "${name}"`))
  if (taskResolve) { const r = taskResolve; taskPromise = null; taskResolve = null; r() }
  return new Promise((resolve, reject) => {
    try { task.impl() } catch (err) { return reject(err) }
    taskPromise = task
    taskResolve = resolve
    startLoop()
  })
}

function runIntro()             { mode = 'intro'; germFrame = 0; }
function runOutro()             { mode = 'outro'; outroRadius = 0; outroCenter = { x: 0, y: rows } }
function runDirect()            { mode = 'direct'; germFrame = 0; resetMasks(); for (let i = 0; i < rows * cols; i++) logicMask[i] = 1; secureCopy(visualMask, logicMask) }
function runTransitionFull()    { mode = 'transition'; resetMasks(); logicMask.fill(0); visualMask.fill(0); swipeFrame = 0; swipePhase = 0; outroAuto = true }
function runTransitionIntro()   { mode = 'transition'; resetMasks(); logicMask.fill(0); visualMask.fill(0); swipeFrame = 0; swipePhase = 0; outroAuto = false }
function runTransitionOutro()   { mode = 'transition'; resetMasks(); secureCopy(visualMask, logicMask); swipeFrame = 0; swipePhase = 1; outroAuto = false }
function runStatic()            { mode = 'static'; resetMasks(); for (let i = 0; i < rows * cols; i++) logicMask[i] = 1; secureCopy(visualMask, logicMask) }
function runHidden()            { mode = 'hidden' }

function checkIntro()           { return mode === 'intro' && germFrame >= germFramesMax * 0.65 }
function checkOutro()           { return mode === 'outro' && outroRadius >= Math.hypot(cols, rows) }
function checkDirect()          { return mode === 'direct' && germFrame >= germFramesMax + directFramesExtra }
function checkTransitionIntro() { return mode === 'static' }
function checkTransitionOutro() { return mode === 'hidden' }
function checkTransitionFull()  { return mode === 'hidden' || mode === 'static' }
function checkStatic()          { return true }
function checkHidden()          { return true }

function mainLoop(ts) { if (lastTime === 0) lastTime = ts; const deltaTime = ts - lastTime; lastTime = ts; const prevMode = mode; drawFrame(deltaTime); if (mode !== 'hidden') { animationID = requestAnimationFrame(mainLoop) } else if (prevMode !== 'hidden') { animationID = requestAnimationFrame(mainLoop) } else { animationID = null } }

defineExpose({ runQueue })
onMounted(() => { requestAnimationFrame(() => { resetContext(); window.addEventListener('resize', resetContext) }) })

onBeforeUnmount(() => { 

  cancelAnimationFrame(animationID)
  window.removeEventListener('resize', resetContext)
  if (animateGerm.lastRatio !== undefined) animateGerm.lastRatio = 0
  if (animateGermInv.frontierQueue !== undefined) animateGermInv.frontierQueue = null
  if (animateGermInv.frontierSet !== undefined) animateGermInv.frontierSet = null

})

</script>

<template> <div ref="containerRef" class="container"> <canvas ref="canvasRef"> </canvas> </div> </template>
<style> .container { overflow: hidden; width: 100%; height: 100%; } canvas { display: block; width: 100%; height: 100%; } </style>