import { ref } from 'vue'

const ENABLED = true

export const veilOn = ref(false)
export const veilOpaque = ref(false)

let canvas = null

export function registerVeil(instance) { canvas = instance || null }

export function veilFromStart() { veilOn.value = true; veilOpaque.value = true }

let queue = Promise.resolve()

export function throughTheVeil(work, enter = 'intro', exit = 'outro', hold = 0) {
  const run = queue.then(() => pass(work, enter, exit, hold))
  queue = run.catch(() => {})
  return run
}

async function pass(work, enter, exit, hold) {

  if (!ENABLED) { await work(); return }

  veilOn.value = true
  veilOpaque.value = enter === 'static'
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

  await canvas?.runQueue(enter)
  await work()
  if (hold) await new Promise(r => setTimeout(r, hold))
  veilOpaque.value = false
  await canvas?.runQueue(exit)
  await canvas?.runQueue('hidden')

  veilOn.value = false

}