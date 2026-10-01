const STEP  = 6
const SKIP  = 'defs, clipPath, mask, symbol, pattern, marker'
const DRAWN = 'path, line, polyline, polygon, rect, circle, ellipse'

export function readDrawing(source) {

  const root = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement
  const [x0, y0, w, h] = (root.getAttribute('viewBox') ?? `0 0 ${parseFloat(root.getAttribute('width'))} ${parseFloat(root.getAttribute('height'))}`).split(/[\s,]+/).map(Number)
  const host = document.createElement('div')
  const svg  = document.importNode(root, true)

  host.style.cssText = 'position: absolute; left: -99999px; top: 0; visibility: hidden; pointer-events: none'
  Object.entries({ viewBox: `${x0} ${y0} ${w} ${h}`, width: w, height: h }).forEach(([k, v]) => svg.setAttribute(k, v))
  host.append(svg)
  document.body.append(host)

  const board = svg.getScreenCTM().inverse()
  try { return { size: [w, h], ...marksOf(svg, w, h, el => new DOMMatrix([1, 0, 0, 1, -x0, -y0]).multiply(board).multiply(el.getScreenCTM())) } } finally { host.remove() }

}

function marksOf(svg, w, h, matrixOf) {

  const marks = []
  let ground = null

  for (const el of svg.querySelectorAll(`${DRAWN}, text, image, use`)) {
    if (el.closest(SKIP) || !el.getClientRects().length) continue
    const layer = layerOf(el), order = marks.length
    const m = matrixOf(el)
    if (el.matches('text')) { marks.push({ kind: 'text', order, layer, ...textOf(el, m) }); continue }
    if (el.matches('image, use')) {
      const image = el.matches('use') ? svg.querySelector(hrefOf(el)) : el
      if (image?.matches('image')) marks.push({ kind: 'image', order, layer, href: hrefOf(image), box: boxOf(el, m) })
      continue
    }
    const style = getComputedStyle(el), fill = paintOf(style.fill, style.fillOpacity), stroke = paintOf(style.stroke, style.strokeOpacity)
    if (!ground && fill && !stroke && covers(boxOf(el, m), w, h)) { ground = fill; continue }
    const runs = runsOf(el, m)
    if (fill) marks.push({ kind: 'fill', order, layer, color: fill, runs: runs.filter(run => run.length > 2) })
    if (stroke) marks.push({ kind: 'stroke', order: marks.length, layer, color: stroke, width: parseFloat(style.strokeWidth) * scaleOf(m), runs })
  }

  return { ground, marks }

}

function runsOf(el, m) {

  const length = el.getTotalLength(), steps = Math.max(2, Math.ceil(length / STEP * scaleOf(m)))
  const runs = [[]]
  for (let i = 0; i <= steps; i++) {
    const p = new DOMPoint(...pointAt(el, i / steps * length)).matrixTransform(m), last = runs.at(-1).at(-1)
    if (last && Math.hypot(p.x - last[0], p.y - last[1]) > STEP * 3) runs.push([])
    runs.at(-1).push([p.x, p.y])
  }
  return runs.filter(run => run.length > 1)

}

function pointAt(el, at) { const p = el.getPointAtLength(at); return [p.x, p.y] }

function textOf(el, m) {

  const style = getComputedStyle(el)
  const rows = new Map()
  let y = el.getAttribute('y')
  for (const node of el.childNodes) {
    y = node.nodeType === 1 ? node.getAttribute('y') ?? y : y
    rows.set(y, `${rows.get(y) ?? ''}${node.textContent}`)
  }
  return {
    box: boxOf(el, m), lines: [...rows.values()].map(line => line.replace(/\s+/g, ' ').trim()).filter(Boolean),
    size: parseFloat(style.fontSize) * scaleOf(m), color: paintOf(style.fill, style.fillOpacity), weight: style.fontWeight, family: style.fontFamily, anchor: style.textAnchor,
  }

}

function boxOf(el, m) {

  const b = el.getBBox()
  const corners = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(m))
  const [xs, ys] = [corners.map(p => p.x), corners.map(p => p.y)]
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]

}

function layerOf(el) {

  for (let at = el.parentElement; at && at.localName !== 'svg'; at = at.parentElement) {
    const name = at.getAttribute('serif:id') ?? at.getAttribute('id')
    if (name) return name
  }
  return null

}

function hrefOf(el) { return el.getAttribute('href') ?? el.getAttribute('xlink:href') }

function paintOf(paint, opacity) { return paint && paint !== 'none' && parseFloat(opacity) > 0 ? hexOf(paint) : null }

function hexOf(paint) { const rgb = paint.match(/[\d.]+/g); return paint.startsWith('rgb') ? '#' + rgb.slice(0, 3).map(c => Math.round(c).toString(16).padStart(2, '0')).join('').toUpperCase() : paint }

function scaleOf(m) { return Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) }

function covers([x, y, w, h], width, height) { return x <= 1 && y <= 1 && x + w >= width - 1 && y + h >= height - 1 }
