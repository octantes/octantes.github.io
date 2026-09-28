import { ref, onMounted, onBeforeUnmount } from 'vue'
import { BRUSH, STILL } from './brush.js'

const frame = ref(0)

let users  = 0
let ticker = 0

export function useBoil() {

  onMounted(() => { if (!users++ && !STILL) ticker = setInterval(() => { frame.value = (frame.value + 1) % BRUSH.frames }, 1000 / BRUSH.fps) })
  onBeforeUnmount(() => { if (!--users) clearInterval(ticker) })
  return frame

}
