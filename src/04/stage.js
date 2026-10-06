import { shallowRef } from 'vue'
import { throughTheVeil, veilOn } from '../03/veil.js'
import router from './router.js'

export const stage   = shallowRef(null)
export const reading = shallowRef(false)

export function launch(game, ground) { return throughTheVeil(() => { stage.value = { game, ground } }) }
export function visit(path)          { return throughTheVeil(() => router.push(path)) }
export function leave()              { return throughTheVeil(() => { stage.value = null }) }
export function read(on)             { if (veilOn.value || reading.value === on) return; return throughTheVeil(() => { reading.value = on }) }
export function back()               { return throughTheVeil(() => window.history.state?.back ? previous() : router.push('/')) }

function previous() { return new Promise(done => { const off = router.afterEach(() => { off(); done() }); router.back() }) }