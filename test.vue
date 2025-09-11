<script>
function drawFrame(ts) {
  if (!ctx) return
  ctx.fillStyle = '#1b1c1c'
  ctx.fillRect(0, 0, width, height)

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
  const circleCells = new Set()
  const circleFrontier = new Set()

  if (mode === 'intro') {
    const ratio = clamp(revealFrame / revealMaxFrames, 0, 1)
    for (let i = 0; i < total; i++) baseMask[i] = noiseMap[i] < ratio ? 1 : 0
  } else if (mode === 'outro' && outroMode === 'radial') {
    outroRadius += 1
    // calcular círculo smooth
    for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
      const fx = outroCenter.x + Math.cos(angle) * outroRadius
      const fy = outroCenter.y + Math.sin(angle) * outroRadius
      const cx = Math.round(fx)
      const cy = Math.round(fy)
      if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
        const idx = cy * cols + cx
        circleFrontier.add(idx)
      }
    }

    // generar interior del círculo: todo negro
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dx = x - outroCenter.x
        const dy = y - outroCenter.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= outroRadius) circleCells.add(y * cols + x)
      }
    }

    // actualizar baseMask para outro
    for (let i = 0; i < total; i++) baseMask[i] = circleCells.has(i) ? 0 : 1
  }

  const steps = Math.min(maxDilateSteps, Math.floor((mode === 'intro' ? clamp(revealFrame / revealMaxFrames,0,1) : 1) * maxDilateSteps))
  const resultMask = dilateMaskInplace(baseMask, tmpMask, steps)

  if (mode === 'intro' && revealFrame >= revealMaxFrames) {
    for (let i = 0; i < total; i++) {
      if (baseMask[i] && Math.random() < 0.05) baseMask[i] = 0
    }
  }

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
      let color = `rgba(152,108,152,1)`

      if (mode === 'outro' && outroMode === 'radial') {
        if (circleCells.has(idx) && !circleFrontier.has(idx)) {
          // interior del círculo: negro
          drawCh = ' '
          color = '#1b1c1c'
        } else if (circleFrontier.has(idx)) {
          // borde del círculo: color borde
          drawCh = portalCh
          color = borderColor
        }
      } else if (frontier) {
        drawCh = portalCh
        color = borderColor
      } else if (revealed) {
        if (matrixCh) {
          const dist = headPos - y
          let alpha = 0
          if (dist >= 0 && dist <= trailLength) alpha = 1 - dist / trailLength
          if (alpha > 0) {
            drawCh = matrixCh
            color = getTrailColor(alpha)
          } else {
            drawCh = portalCh
            color = `rgba(152,108,152,1)`
          }
        } else {
          drawCh = portalCh
          color = `rgba(152,108,152,1)`
        }
      }

      ctx.fillStyle = color
      ctx.fillText(drawCh, x * fontSize, y * fontSize)
    }
  }

  if (mode === 'intro' && revealFrame < revealMaxFrames) revealFrame++
  else if (mode === 'outro' && outroMode === 'radial' && outroRadius < Math.hypot(cols, rows)) outroFrame++

  animationId = requestAnimationFrame(drawFrame)
}

<script>
    