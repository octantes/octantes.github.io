const PACE = { card: [3000, 6000], settle: [6000, 14000], gap: [1500, 5000], hover: [3000, 7000], inside: [8000, 16000], leave: [4000, 9000], after: [8000, 15000] }
const TICK = 200

const between  = ([lo, hi]) => lo + Math.random() * (hi - lo)
const shuffled = list => list.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v)
const anyOf    = list => list[Math.floor(Math.random() * list.length)]

export function direct(roomOf, enters = item => !!item.depth?.layout) {

  const visited = new Set()
  let next = performance.now() + between(PACE.card), wall = null, pending = [], explored = false

  const wait = range => { next = performance.now() + between(range) }
  const poke = () => { next = Math.max(next, performance.now() + between(PACE.after)) }

  function step() {
    const room = roomOf()
    if (!room || performance.now() < next) return
    const now = room.state()
    if (now.busy) return
    if (now.waiting) { room.enter(); return }
    if (now.wall !== wall) { wall = now.wall; visited.add(wall); pending = shuffled(now.items.map(item => item.id)); explored = false; wait(PACE.settle); return }
    if (now.depth) { room.back(); wait(PACE.gap); return }
    if (now.hovered) {
      const item = now.items.find(i => i.id === now.hovered)
      room.hover(null)
      if (item && enters(item)) { room.open(item); wait(PACE.inside) } else wait(PACE.gap)
      return
    }
    if (pending.length) { room.hover(pending.shift()); wait(PACE.hover); return }
    if (!explored) { explored = true; wait(PACE.leave); return }
    if (now.walls.every(id => visited.has(id))) { visited.clear(); visited.add(wall) }
    room.visit(anyOf(now.walls.filter(id => !visited.has(id))))
  }

  const timer = setInterval(step, TICK)
  window.addEventListener('pointerdown', poke)
  window.addEventListener('keydown', poke)

  return () => {
    clearInterval(timer)
    window.removeEventListener('pointerdown', poke)
    window.removeEventListener('keydown', poke)
  }

}