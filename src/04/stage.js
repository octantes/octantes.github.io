import { shallowRef } from 'vue'
import { throughTheVeil } from '../03/veil.js'
import router from './router.js'

export const stage   = shallowRef(null)
export const reading = shallowRef(false)

export function launch(game, ground) { return throughTheVeil(() => { stage.value = { game, ground } }) }
export function visit(path)          { return throughTheVeil(() => router.push(path)) }
export function leave()              { return throughTheVeil(() => { stage.value = null }) }
export function read(on)             { return throughTheVeil(() => { reading.value = on }) }