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
  let portalGrid = []

  // animación de revelado
  let revealFrame = 0
  const revealMaxFrames = 160 // más lento
  const borderColor = '#aaabac'

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
    heads = Array.from({ length: cols }, () => Math.random() * rows * -1)
    charBuffers = Array.from({ length: cols }, () => new Array(rows).fill(null))
    portalGrid = Array.from({ length: rows }, () => new Array(cols).fill(null))
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
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = (Math.cos((x - cx) / 8) + Math.sin((y - cy) / 8) + t) * 16
        portalGrid[y][x] = String.fromCharCode(charRangeStart + (Math.floor(v) % charRangeMax))
      }
    }
  }

  // efecto trail
  function getTrailColor(alpha) {
    alpha = Math.pow(Math.max(0, alpha), 1.2)
    return `rgba(126,189,196,${alpha.toFixed(3)})`
  }

  // función de celula pseudo-random para frontera orgánica
  function cellMask(x, y, revealRatio) {
    const nx = x / cols
    const ny = y / rows
    const noise = Math.sin(nx * 12 + ny * 12) + Math.cos(nx * 7 - ny * 9)
    return noise * 0.5 + 0.5 < revealRatio
  }

  function drawFrame(ts) {
    if (!ctx) return

    ctx.fillStyle = '#1b1c1c'
    ctx.fillRect(0, 0, width, height)

    updatePortalGrid(ts)

    ctx.font = `${fontSize}px 'Gohu Mono', monospace`
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'

    const revealRatio = revealFrame / revealMaxFrames

    for (let i = 0; i < cols; i++) {
      const rowPos = Math.floor(heads[i] + speed)
      heads[i] += speed
      if (rowPos >= 0 && rowPos < rows) charBuffers[i][rowPos] = pickChar()

      const colBuffer = charBuffers[i]
      for (let r = 0; r < rows; r++) {
        const drawCell = cellMask(i, r, revealRatio)
        let drawCh = ' '
        let color = '#1b1c1c'

        if (drawCell) {
          drawCh = portalGrid[r][i]
          color = '#986C98'

          const chMatrix = colBuffer[r]
          if (chMatrix) {
            const distFromHead = rowPos - r
            if (distFromHead >= 0 && distFromHead <= trailLength) {
              const alpha = 1 - distFromHead / trailLength
              drawCh = chMatrix
              color = getTrailColor(alpha)
            }
          }

          // borde en la frontera del reveal
          const neighborRatio = cellMask(i + 1, r, revealRatio) &&
                                cellMask(i - 1, r, revealRatio) &&
                                cellMask(i, r + 1, revealRatio) &&
                                cellMask(i, r - 1, revealRatio)
          if (!neighborRatio) color = borderColor
        }

        ctx.fillStyle = color
        ctx.fillText(drawCh, i * fontSize, r * fontSize)
      }

      if (heads[i] > rows + trailLength && Math.random() < resetChance) {
        heads[i] = -Math.random() * rows
        charBuffers[i].fill(null)
      }
    }

    if (revealFrame < revealMaxFrames) revealFrame++

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
  @import url('https://font.gohu.org/css2?family=Gohu+Mono&display=swap');

  .portal-matrix-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #1b1c1c;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  </style>
