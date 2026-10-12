import { shallowRef } from 'vue'
import { throughTheVeil, veilOn } from '../03/veil.js'
import { isFullscreen } from './map.js'
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
  if (veilOn.value || isFullscreen(route) === on) return
  const { path, query, hash } = route
  if (on) return router.push({ path, hash, query: { ...query, fullscreen: null } })
  const plain = router.resolve({ path, hash, query: { ...query, fullscreen: undefined } }).fullPath
  return window.history.state?.back === plain ? previous() : router.replace(plain)
}

export async function follow(on, instant) {
  wanted = on
  if (instant) reading.value = on
  if (turning || reading.value === on) return
  turning = true
  try { while (reading.value !== wanted) await throughTheVeil(() => { reading.value = wanted }) }
  finally { turning = false }
}

function previous() { return new Promise(done => { const off = router.afterEach(() => { off(); done() }); router.back() }) }