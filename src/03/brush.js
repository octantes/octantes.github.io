import { ref, onMounted, onBeforeUnmount } from 'vue'

// BOIL

const frame  = ref(0)
let   users  = 0
let   ticker = 0

export function useBoil() {
  onMounted(() => { if (!users++ && !STILL) ticker = setInterval(() => { frame.value = (frame.value + 1) % BRUSH.frames }, 1000 / BRUSH.fps) })
  onBeforeUnmount(() => { if (!--users) clearInterval(ticker) })
  return frame
}

// BRUSH

export const STILL  = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
export const MOTION = { length: 1300, overlap: .05, slowest: .5, alone: { out: [0, 1], in: [0, 1] }, turn: { out: [0, .45], in: [.35, 1] } }
export const REEL   = { frames: 16, fps: 6 }
export const PASTE  = { delay: 200, length: 1000, peel: 550, fps: 12, backing: '#C9CBCF', shade: .22, drop: [10, 12], margin: 30 }
export const BRUSH  = { width: 18, thin: 6, taper: 30, swell: 0.14, grain: 0.05, boil: .5, frames: 3, fps: 5 }

function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }

function noise(seed, t) {
  const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f)
  return (hash(seed * 31.7 + i) * (1 - u) + hash(seed * 31.7 + i + 1) * u) * 2 - 1
}

export function seedOf(text) { return [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7) }

function lengths(points) {
  const out = [0]
  for (let i = 1; i < points.length; i++) out.push(out[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]))
  return out
}

function smooth(points, closed, rounds = 2) {
  let pts = points
  for (let r = 0; r < rounds; r++) {
    const next = closed ? [] : [pts[0]]
    const pairs = closed ? pts.length : pts.length - 1
    for (let i = 0; i < pairs; i++) {
      const [a, b] = [pts[i], pts[(i + 1) % pts.length]]
      next.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75])
    }
    if (!closed) next.push(pts.at(-1))
    pts = next
  }
  return closed ? [...pts, pts[0]] : pts
}

function along(points, run, d) {
  let i = 1
  while (i < run.length - 1 && run[i] < d) i++
  const t = (d - run[i - 1]) / (run[i] - run[i - 1] || 1)
  return [points[i - 1][0] + (points[i][0] - points[i - 1][0]) * t, points[i - 1][1] + (points[i][1] - points[i - 1][1]) * t]
}

function resample(points, step) {
  const run = lengths(points)
  return Array.from({ length: Math.floor(run.at(-1) / step) + 1 }, (_, k) => along(points, run, k * step))
}

function wave(seed, d, scale, total, closed) {
  return closed ? noise(seed, d / scale) * (1 - d / total) + noise(seed, (d - total) / scale) * d / total : noise(seed, d / scale)
}

function boil(points, seed, amount, closed) {
  const run = lengths(points), total = run.at(-1)
  return points.map(([x, y], i) => [x + wave(seed, run[i], 90, total, closed) * amount, y + wave(seed + 17, run[i], 90, total, closed) * amount])
}

const fixed = n => Math.round(n * 10) / 10

export function trace(stroke, box, seed, variant, closed = false, step = 8) {
  const [x, y, w, h] = box
  const placed = smooth(stroke.map(([u, v]) => [x + u * w, y + v * h]), closed)
  const line = resample(boil(placed, seed * 3 + variant, BRUSH.boil, closed), step)
  if (!closed) return line
  const gap = Math.hypot(line.at(-1)[0] - line[0][0], line.at(-1)[1] - line[0][1])
  return [...(gap < step / 2 ? line.slice(0, -1) : line), line[0]]
}

export function ribbon(points, seed, width = BRUSH.width, tapered = true) {
  const run = lengths(points), total = run.at(-1), last = points.length - 1
  const ring = Math.hypot(points[0][0] - points[last][0], points[0][1] - points[last][1]) < 1
  const left = [], right = []
  points.forEach(([x, y], i) => {
    const [a, b] = ring ? [points[i ? i - 1 : last - 1], points[i === last ? 1 : i + 1]] : [points[Math.max(0, i - 1)], points[Math.min(last, i + 1)]]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const [nx, ny] = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len]
    const taper = tapered ? Math.min(1, run[i] / BRUSH.taper, (total - run[i]) / BRUSH.taper) : 1
    const half = width / 2 * (0.35 + 0.65 * taper) * (1 + BRUSH.swell * wave(seed, run[i], 160, total, ring) + BRUSH.grain * wave(seed + 5, run[i], 9, total, ring))
    left.push([x + nx * half, y + ny * half]); right.push([x - nx * half, y - ny * half])
  })
  return 'M' + [...left, ...right.reverse()].map(p => p.map(fixed).join(' ')).join('L') + 'Z'
}

export function span(points) { return lengths(points).at(-1) }

export function cut(points, from, to) {
  const run = lengths(points), [a, b] = [from * run.at(-1), to * run.at(-1)]
  return [along(points, run, a), ...points.filter((_, i) => run[i] > a && run[i] < b), along(points, run, b)]
}

export function shape(points) { return 'M' + points.map(p => p.map(fixed).join(' ')).join('L') + 'Z' }

export function sketchBox(w, h, seed, hidden = {}) {
  const jitter = (k, size) => noise(seed + k, k * .7) * 4 / size
  const side = (from, to, n, k) => Array.from({ length: n }, (_, i) => [from[0] + (to[0] - from[0]) * i / n + jitter(k + i, w), from[1] + (to[1] - from[1]) * i / n + jitter(k + i + 50, h)])
  const per = size => Math.max(2, Math.round(size / 90))
  const sides = [side([0, 0], [1, 0], per(w), 1), side([1, 0], [1, 1], per(h), 20), side([1, 1], [0, 1], per(w), 40), side([0, 1], [0, 0], per(h), 60)]
  const loop = sides.flat()
  const shown = [!hidden.top, !hidden.right, !hidden.bottom, !hidden.left]
  if (shown.every(Boolean)) return { outline: loop, ink: [[...loop, loop[0], [loop[1][0] * .5 + loop[0][0] * .5, loop[1][1] * .5 + loop[0][1] * .5]]] }
  const first = shown.findIndex((on, k) => on && !shown[(k + 3) % 4])
  const ink = []
  for (let k = 0, run = null; k < 4; k++) {
    const at = (first + k) % 4
    if (shown[at]) { run = run ?? []; run.push(...sides[at]) }
    if (run && (!shown[(at + 1) % 4] || k === 3)) { run.push(sides[(at + 1) % 4][0]); ink.push(run); run = null }
  }
  return { outline: loop, ink }
}

// CAMO

function lattice(x, y, seed) { return hash(x * 157.31 + y * 311.7 + seed * 71.3) }

function field(x, y, seed) {
  const [i, j] = [Math.floor(x), Math.floor(y)], [u, v] = [x - i, y - j].map(f => f * f * (3 - 2 * f))
  const at = (a, b) => lattice(i + a, j + b, seed)
  return (at(0, 0) * (1 - u) + at(1, 0) * u) * (1 - v) + (at(0, 1) * (1 - u) + at(1, 1) * u) * v
}

function contours(grid, [gx, gy], place) {
  const inside = (i, j) => grid[j][i] > 0
  const key = (kind, i, j) => `${kind}${i},${j}`
  const spot = new Map(), links = new Map()
  const cross = (kind, i, j) => {
    const id = key(kind, i, j)
    if (!spot.has(id)) {
      const [a, b] = kind === 'h' ? [grid[j][i], grid[j][i + 1]] : [grid[j][i], grid[j + 1][i]], t = a / (a - b)
      spot.set(id, place(kind === 'h' ? i + t : i, kind === 'h' ? j : j + t))
    }
    return id
  }
  const link = (a, b) => { for (const [x, y] of [[a, b], [b, a]]) links.set(x, [...(links.get(x) ?? []), y]) }
  for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) {
    const corners = [inside(i, j), inside(i + 1, j), inside(i + 1, j + 1), inside(i, j + 1)]
    const sides = [['h', i, j], ['v', i + 1, j], ['h', i, j + 1], ['v', i, j]]
    const cut = sides.filter((_, k) => corners[k] !== corners[(k + 1) % 4]).map(side => cross(...side))
    if (cut.length === 2) link(...cut)
    if (cut.length === 4) {
      const middle = (grid[j][i] + grid[j][i + 1] + grid[j + 1][i + 1] + grid[j + 1][i]) / 4 > 0
      const edges = sides.map(side => cross(...side))
      corners.forEach((c, k) => { if (c !== middle) link(edges[(k + 3) % 4], edges[k]) })
    }
  }
  const loops = [], seen = new Set()
  for (const start of links.keys()) {
    if (seen.has(start)) continue
    const loop = []
    let [at, from] = [start, null]
    while (at && !seen.has(at)) { seen.add(at); loop.push(spot.get(at)); const next = links.get(at).find(n => n !== from && !seen.has(n)); [from, at] = [at, next] }
    if (loop.length > 14) loops.push(loop)
  }
  return loops
}

const reels = new Map()

export function camo({ seed, scale, drift, levels, grid: [gx, gy], aspect, pad }) {
  const name = JSON.stringify(arguments[0])
  if (reels.has(name)) return reels.get(name)
  const place = (i, j) => [-pad + i / gx * (1 + 2 * pad), -pad + j / gy * (1 + 2 * pad)]
  const edge  = (i, j) => i === 0 || j === 0 || i === gx || j === gy
  const made  = new Map()
  const at = f => {
    if (made.has(f)) return made.get(f)
    const t = f / REEL.frames * 2 * Math.PI, [c, s] = [Math.cos(t) * drift, Math.sin(t) * drift]
    const value  = (u, v) => { const [x, y] = [u * aspect * scale, v * scale]; return .6 * field(x + c, y + s, seed) + .32 * field(x * 1.9 - s + 7.3, y * 1.9 + c + 3.1, seed + 1) + .08 * field(x * 9, y * 9, seed + 2) }
    const values = Array.from({ length: gy + 1 }, (_, j) => Array.from({ length: gx + 1 }, (_, i) => value(...place(i, j))))
    const band   = side => values.map((row, j) => row.map((v, i) => edge(i, j) ? -1 : side(v)))
    const frame  = { low: contours(band(v => levels[0] - v), [gx, gy], place), high: contours(band(v => v - levels[1]), [gx, gy], place) }
    made.set(f, frame)
    return frame
  }
  const reel = { low: f => at(f).low, high: f => at(f).high }
  reels.set(name, reel)
  return reel
}
