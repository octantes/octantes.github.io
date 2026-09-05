import { ref } from 'vue'

export const ENABLED = true

export const veilOn = ref(false)

let canvas = null

export function registerVeil(instance) { canvas = instance || null }

export async function throughTheVeil(work, enter = 'intro', exit = 'outro') {

  if (!ENABLED) { await work(); return }

  veilOn.value = true
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))  // mounted, and sized

  await canvas?.runQueue(enter)
  window.scrollTo({ top: 0, behavior: 'auto' })
  await work()
  await canvas?.runQueue(exit)
  await canvas?.runQueue('hidden')

  veilOn.value = false

}
