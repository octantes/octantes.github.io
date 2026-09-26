export const BRUSH = { width: 18, taper: 30, swell: 0.14, grain: 0.05, boil: 2.4, frames: 3, fps: 6 }

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

function smooth(points, rounds = 2) {
  let pts = points
  for (let r = 0; r < rounds; r++) {
    const next = [pts[0]]
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, b] = [pts[i], pts[i + 1]]
      next.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75])
    }
    next.push(pts[pts.length - 1])
    pts = next
  }
  return pts
}

function resample(points, step) {
  const run = lengths(points), total = run[run.length - 1], out = []
  for (let s = 0, i = 1; s <= total; s += step) {
    while (i < run.length - 1 && run[i] < s) i++
    const t = (s - run[i - 1]) / (run[i] - run[i - 1] || 1)
    out.push([points[i - 1][0] + (points[i][0] - points[i - 1][0]) * t, points[i - 1][1] + (points[i][1] - points[i - 1][1]) * t])
  }
  return out
}

function boil(points, seed, amount) {
  const run = lengths(points)
  return points.map(([x, y], i) => [x + noise(seed, run[i] / 90) * amount, y + noise(seed + 17, run[i] / 90) * amount])
}

const fixed = n => Math.round(n * 10) / 10

export function trace(stroke, box, seed, variant) {
  const [x, y, w, h] = box
  const placed = smooth(stroke.map(([u, v]) => [x + u * w, y + v * h]))
  return resample(boil(placed, seed * 3 + variant, BRUSH.boil), 8)
}

export function ribbon(points, seed, width = BRUSH.width) {
  const run = lengths(points), total = run[run.length - 1]
  const left = [], right = []
  points.forEach(([x, y], i) => {
    const [a, b] = [points[Math.max(0, i - 1)], points[Math.min(points.length - 1, i + 1)]]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const [nx, ny] = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len]
    const taper = Math.min(1, run[i] / BRUSH.taper, (total - run[i]) / BRUSH.taper)
    const half = width / 2 * (0.35 + 0.65 * taper) * (1 + BRUSH.swell * noise(seed, run[i] / 160) + BRUSH.grain * noise(seed + 5, run[i] / 9))
    left.push([x + nx * half, y + ny * half]); right.push([x - nx * half, y - ny * half])
  })
  return 'M' + [...left, ...right.reverse()].map(p => p.map(fixed).join(' ')).join('L') + 'Z'
}

export function shape(points) { return 'M' + points.map(p => p.map(fixed).join(' ')).join('L') + 'Z' }

export function sketchBox(w, h, seed) {
  const jitter = (k, size) => noise(seed + k, k * .7) * 4 / size
  const side = (from, to, n, k) => Array.from({ length: n }, (_, i) => [from[0] + (to[0] - from[0]) * i / n + jitter(k + i, w), from[1] + (to[1] - from[1]) * i / n + jitter(k + i + 50, h)])
  const per = size => Math.max(2, Math.round(size / 90))
  const loop = [...side([0, 0], [1, 0], per(w), 1), ...side([1, 0], [1, 1], per(h), 20), ...side([1, 1], [0, 1], per(w), 40), ...side([0, 1], [0, 0], per(h), 60)]
  return [...loop, loop[0], [loop[1][0] * .5 + loop[0][0] * .5, loop[1][1] * .5 + loop[0][1] * .5]]
}
