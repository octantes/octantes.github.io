<script setup>

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import { pageOf, pathOf } from '../04/pages.js'
import { WALLS, LANDING_WALL, LINE, layoutWall } from '../04/walls.js'
import Guide from '../02/guide.vue'
import Hint from '../02/hint.vue'
import Sketch from '../03/sketch.vue'

const HINT = { w: 288, h: 110, gap: 12, arrow: 14 }

const route  = useRoute()
const router = useRouter()
const store  = useStore()

store.land(route)

const index = computed(() => WALLS.findIndex(w => w.id === (pageOf(route).id ?? LANDING_WALL)))
const wall  = computed(() => WALLS[index.value])

const room   = ref(null)
const bounds = ref([1712, 866])
const layout = computed(() => layoutWall(wall.value, ...bounds.value))

const hovered = ref(null)
const armed   = ref(null)
const hot     = computed(() => hovered.value ?? armed.value)
const docked  = computed(() => layout.value.items.find(i => i.id === armed.value))

const tip = computed(() => {

  const item = layout.value.items.find(i => i.id === hovered.value)
  if (!item || item.id === armed.value || !room.value) return null

  const frame = room.value.getBoundingClientRect(), scale = bounds.value[0] / layout.value.size[0]
  const [x, y, w, h] = [item.box[0] - LINE / 2, item.box[1] - LINE / 2, item.box[2] + LINE, item.box[3] + LINE].map(v => v * scale)
  const [left, top] = [frame.left + x, frame.top + y]
  const west  = left + w / 2 < frame.left + frame.width / 2
  const north = top + h / 2 < frame.top + frame.height / 2
  const space = { left: left - frame.left, right: frame.right - left - w, above: top - frame.top, below: frame.bottom - top - h }

  const beside = () => space.right > space.left
    ? { at: [left + w + HINT.gap, top + h / 2], place: `left-${north ? 'start' : 'end'}` }
    : { at: [left - HINT.gap, top + h / 2], place: `right-${north ? 'start' : 'end'}` }
  const around = () => space.below > space.above
    ? { at: [left + w / 2, top + h + HINT.gap], place: `top-${west ? 'start' : 'end'}` }
    : { at: [left + w / 2, top - HINT.gap], place: `bottom-${west ? 'start' : 'end'}` }

  const reach = HINT.gap + HINT.arrow
  const fits  = { beside: Math.max(space.left, space.right) > HINT.w + reach, around: Math.max(space.above, space.below) > HINT.h + reach }
  const wide  = frame.width > frame.height
  const [first, second] = wide ? [beside, around] : [around, beside]
  return { item, ...((wide ? fits.beside : fits.around) ? first() : second()) }

})

watch(() => wall.value.id, () => { hovered.value = armed.value = null })

let sizes = null

function turn(step) { router.push(pathOf({ kind: 'wall', id: WALLS[(index.value + step + WALLS.length) % WALLS.length].id }, store.lang)) }

function pick(item, e) {
  if (e.pointerType === 'touch' && armed.value !== item.id) { armed.value = item.id; return }
  if (e.pointerType === 'touch') hovered.value = null
  armed.value = null
  if (item.to) router.push(item.to)
}

function hover(id, e) { if (e?.pointerType !== 'touch') hovered.value = id }

function onKey(e) { if (e.key === 'ArrowLeft') turn(-1); if (e.key === 'ArrowRight') turn(1) }

onMounted(() => {
  sizes = new ResizeObserver(([entry]) => { bounds.value = [entry.contentRect.width, entry.contentRect.height] })
  sizes.observe(room.value)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => { sizes?.disconnect(); window.removeEventListener('keydown', onKey) })

</script>

<template>

  <div class="frame page">

    <div class="room" ref="room" role="main">

      <Sketch :wall="wall" :layout="layout" :hot="hot" @hover="hover" @pick="pick" @clear="armed = null" />

      <Guide :wall="wall" :hot="hot" :place="`${index + 1}/${WALLS.length}`" @hover="hover" @pick="pick" @turn="turn">
        <Hint v-if="docked" :item="docked" />
      </Guide>

      <Hint v-if="tip" :item="tip.item" :tip="tip" />

    </div>

  </div>

</template>

<style scoped>

.room {

  /* LAYOUT */ position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden;
  /* BORDER */ border: var(--small-outline) var(--carbon-a15); border-radius: var(--radius-ss);

}

</style>
