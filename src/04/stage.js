import { shallowRef } from 'vue'
import { throughTheVeil } from '../03/veil.js'

export const stage = shallowRef(null)

export function launch(game, ground) { return throughTheVeil(() => { stage.value = { game, ground } }) }

export function leave() { return throughTheVeil(() => { stage.value = null }) }