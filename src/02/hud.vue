<script setup>

import { computed } from 'vue'
import { useStore } from '../04/store.js'
import { ROOM_TEXT } from '../04/havitat-setup.js'

const props = defineProps({ wall: Object, depth: Object, hot: String, place: String, docked: Object, pointed: Object })

const emit  = defineEmits(['hover', 'pick', 'turn', 'back', 'aim'])
const store = useStore()
const text  = computed(() => ROOM_TEXT[store.lang])

// HINTS

const HINT = { w: 288, h: 110, gap: 12, arrow: 14 }

function placeHint(frame, [left, top, w, h]) {

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
  return (wide ? fits.beside : fits.around) ? first() : second()

}

const tip = computed(() => props.pointed && placeHint(props.pointed.frame, props.pointed.box))

const hints = computed(() => [
  props.docked && { key: 'docked', item: props.docked, place: 'docked', named: !props.depth },
  tip.value && { key: 'tip', item: props.pointed.item, place: tip.value.place, named: true, floating: true, style: { left: `${tip.value.at[0]}px`, top: `${tip.value.at[1]}px`, width: `${HINT.w}px`, '--ah': `${HINT.arrow}px` } },
].filter(Boolean))

</script>

<template>

  <nav class="guide" :inert="store.processing" :aria-label="text.items">

    <header v-if="depth" class="head bare">
      <button class="turn" @click="emit('back')" :title="text.back" :aria-label="text.back">‹</button>
      <span class="name">{{ depth.label[store.lang] }}</span>
      <span class="place">{{ wall[store.lang] }}</span>
    </header>

    <header v-else class="head">
      <button class="turn" @pointerenter="emit('aim', -1)" @pointerleave="emit('aim', null)" @focus="emit('aim', -1)" @blur="emit('aim', null)" @click="emit('turn', -1)" :title="text.prev" :aria-label="text.prev">‹</button>
      <span class="name">{{ wall[store.lang] }}</span>
      <span class="place">{{ place }}</span>
      <button class="turn" @pointerenter="emit('aim', 1)" @pointerleave="emit('aim', null)" @focus="emit('aim', 1)" @blur="emit('aim', null)" @click="emit('turn', 1)" :title="text.next" :aria-label="text.next">›</button>
    </header>

    <ul v-if="!depth" class="items">
      <li v-for="item in wall.items.filter(i => !i.decor)" :key="item.id">
        <button class="entry" :class="{ hot: hot === item.id }" @pointerenter="emit('hover', item.id, $event)" @pointerleave="emit('hover', null, $event)" @focus="emit('hover', item.id)" @blur="emit('hover', null)" @click="emit('pick', item, $event)">{{ item.label[store.lang] }}</button>
      </li>
    </ul>

    <div v-for="hint in hints" :key="hint.key" class="hint" :class="[hint.place, { plain: !hint.named }]" :style="hint.style" :aria-hidden="hint.floating ? 'true' : null">
      <span v-if="hint.named" class="label">{{ hint.item.label[store.lang] }}</span>
      <span class="text">{{ hint.item.description[store.lang] }}</span>
      <div class="bar"><div class="track">{{ store.barContent }}</div></div>
    </div>

  </nav>

</template>

<style scoped>

/* GUIDE */

.guide {

  /* LAYOUT */ position: absolute; left: 2rem; bottom: 2rem; z-index: 2;
  /* BOX    */ width: 16rem; padding: .75rem 1rem;
  /* FILL   */ background: var(--carbon-a95); color: var(--humo);
  /* BORDER */ border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-mono); font-size: .9rem;

}

.head   { display: flex; align-items: center; gap: .5rem; padding-bottom: .5rem; margin-bottom: .5rem; border-bottom: var(--small-outline) var(--humo-a15); }
.name   { flex: 1; color: var(--lirio); font-weight: 700; }
.place  { color: var(--humo-a60); }
.bare   { border-bottom: none; margin-bottom: 0; }

.turn   { background: none; border: none; padding: 0 .25rem; color: var(--cristal); font: inherit; font-size: 1.1rem; line-height: 1; cursor: pointer; }
.turn:hover { color: var(--lirio); }

.items  { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .15rem; }

.entry  { background: none; border: none; padding: .1rem 0; color: var(--humo); font: inherit; text-align: left; cursor: pointer; }
.entry::before { content: '>'; margin-right: .5rem; color: var(--cristal); }
.entry.hot { color: var(--lirio); }

@media (--mobile) {

  .guide { top: 1rem; left: 1rem; right: 1rem; bottom: auto; width: auto; }
  .items { display: grid; grid-template-columns: 1fr 1fr; column-gap: 1rem; }

}

/* HINTS */

.hint {

  /* LAYOUT */ position: fixed; z-index: 3; pointer-events: none; display: flex; flex-direction: column; gap: .3rem;
               --aw: 24px; --inset: 14px; --reach: calc(var(--inset) + var(--aw) / 2);
  /* BOX    */ padding: .6rem .8rem;
  /* FILL   */ background: var(--carbon); color: var(--humo);
  /* BORDER */ border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-mono); font-size: .9rem;

  &::before { content: ''; position: absolute; background: var(--carbon); }

  &[class*='top-']::before, &[class*='bottom-']::before { width: var(--aw); height: calc(var(--ah) + 1px); }
  &[class*='left-']::before, &[class*='right-']::before { width: calc(var(--ah) + 1px); height: var(--aw); }

  &[class*='top-']::before    { top: calc(-1 * var(--ah));    clip-path: polygon(50% 0, 100% 100%, 0 100%); }
  &[class*='bottom-']::before { bottom: calc(-1 * var(--ah)); clip-path: polygon(0 0, 100% 0, 50% 100%); }
  &[class*='left-']::before   { left: calc(-1 * var(--ah));   clip-path: polygon(0 50%, 100% 0, 100% 100%); }
  &[class*='right-']::before  { right: calc(-1 * var(--ah));  clip-path: polygon(0 0, 100% 50%, 0 100%); }

  &.top-start, &.bottom-start { &::before { left: var(--inset); } }
  &.top-end, &.bottom-end     { &::before { right: var(--inset); } }
  &.left-start, &.right-start { &::before { top: var(--inset); } }
  &.left-end, &.right-end     { &::before { bottom: var(--inset); } }

  &.top-start    { transform: translate(calc(-1 * var(--reach)), var(--ah)); }
  &.top-end      { transform: translate(calc(-100% + var(--reach)), var(--ah)); }
  &.bottom-start { transform: translate(calc(-1 * var(--reach)), calc(-100% - var(--ah))); }
  &.bottom-end   { transform: translate(calc(-100% + var(--reach)), calc(-100% - var(--ah))); }
  &.left-start   { transform: translate(var(--ah), calc(-1 * var(--reach))); }
  &.left-end     { transform: translate(var(--ah), calc(-100% + var(--reach))); }
  &.right-start  { transform: translate(calc(-100% - var(--ah)), calc(-1 * var(--reach))); }
  &.right-end    { transform: translate(calc(-100% - var(--ah)), calc(-100% + var(--reach))); }

  &.docked { position: static; width: auto; padding: .6rem 0 0; margin-top: .5rem; background: none; border-top: var(--small-outline) var(--humo-a15); border-radius: 0; &::before { display: none; } }

  &.plain  { border-top: none; padding-top: 0; }

}

.label { color: var(--lirio); font-weight: 700; }
.text  { font-size: .85rem; line-height: 1.4; }
.bar   { overflow: hidden; white-space: nowrap; color: var(--lirio); font-size: .8rem; line-height: 1.5; }
.track { display: inline-block; animation: scroll-progress 4s linear infinite; }

</style>
