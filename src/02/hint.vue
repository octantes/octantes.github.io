<script setup>

import { computed } from 'vue'
import { useStore } from '../04/store.js'
import { HINT } from '../04/hint.js'

const props = defineProps({ item: Object, tip: { type: Object, default: null }, named: { type: Boolean, default: true } })

const store = useStore()

const place = computed(() => props.tip && { left: `${props.tip.at[0]}px`, top: `${props.tip.at[1]}px`, width: `${HINT.w}px`, '--ah': `${HINT.arrow}px` })

</script>

<template>

  <div class="hint" :class="[tip ? tip.place : 'docked', { plain: !named }]" :style="place" :aria-hidden="tip ? 'true' : null">
    <span v-if="named" class="label">{{ item.label[store.lang] }}</span>
    <span class="text">{{ item.description[store.lang] }}</span>
    <div class="bar"><div class="track">{{ store.barContent }}</div></div>
  </div>

</template>

<style scoped>

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
