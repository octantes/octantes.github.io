import { shallowRef } from 'vue'
import { throughTheVeil, veilOn } from '../03/veil.js'
import router from './router.js'

export const stage   = shallowRef(null)
export const reading = shallowRef(false)

let wanted  = false
let turning = false

export function launch(game, ground) { return throughTheVeil(() => { stage.value = { game, ground } }) }
export function visit(path)          { return throughTheVeil(() => router.push(path)) }
export function leave()              { return throughTheVeil(() => { stage.value = null }) }
export function back()               { return throughTheVeil(() => window.history.state?.back ? previous() : router.push('/')) }

export function read(on) {
  const route = router.currentRoute.value
  if (veilOn.value || 'fullscreen' in route.query === on) return
  const query = { ...route.query, fullscreen: null }
  if (on) return router.push({ path: route.path, query, hash: route.hash })
  delete query.fullscreen
  const plain = router.resolve({ path: route.path, query, hash: route.hash }).fullPath
  return window.history.state?.back === plain ? previous() : router.replace(plain)
}

export async function follow(on, instant) {
  wanted = on
  if (turning) return
  if (instant) { reading.value = on; return }
  turning = true
  try { while (reading.value !== wanted) { const next = wanted; await throughTheVeil(() => { reading.value = next }) } }
  finally { turning = false }
}

function previous() { return new Promise(done => { const off = router.afterEach(() => { off(); done() }); router.back() }) }
