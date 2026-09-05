import { ref } from 'vue'

export const ENABLED = true

export const veilOn = ref(false)

let canvas = null

export function registerVeil(instance) { canvas = instance || null }

export async function throughTheVeil(work, enter = 'intro', exit = 'outro', hold = 0) {

  if (!ENABLED) { await work(); return }

  veilOn.value = true
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))  // mounted, and sized

  await canvas?.runQueue(enter)
  await work()
  if (hold) await new Promise(r => setTimeout(r, hold))
  await canvas?.runQueue(exit)
  await canvas?.runQueue('hidden')

  veilOn.value = false

}
