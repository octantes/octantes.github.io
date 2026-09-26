<script setup>

import { computed } from 'vue'
import { useStore } from '../04/store.js'

const props = defineProps({ item: Object, tip: { type: Object, default: null } })

const store = useStore()

const place = computed(() => props.tip && { left: `${props.tip.at[0]}px`, top: `${props.tip.at[1]}px` })

</script>

<template>

  <div class="hint" :class="tip ? tip.corner : 'docked'" :style="place" :aria-hidden="tip ? 'true' : null">
    <span class="label">{{ item.label[store.lang] }}</span>
    <span class="text">{{ item.description[store.lang] }}</span>
    <div class="bar"><div class="track">{{ store.barContent }}</div></div>
  </div>

</template>

<style scoped>

.hint {

  /* LAYOUT */ position: fixed; z-index: 3; pointer-events: none; display: flex; flex-direction: column; gap: .3rem; --gap: 10px;
  /* BOX    */ width: 18rem; padding: .6rem .8rem;
  /* FILL   */ background: var(--carbon-a95); color: var(--humo);
  /* BORDER */ border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-mono); font-size: .9rem;

  &::before { content: ''; position: absolute; width: var(--gap); height: var(--gap); background: var(--carbon-a95); clip-path: polygon(0 0, 100% 45%, 45% 100%); }

  &.tl { transform: translate(var(--gap), var(--gap));                                 &::before { left: calc(-1 * var(--gap)); top: calc(-1 * var(--gap)); } }
  &.tr { transform: translate(calc(-100% - var(--gap)), var(--gap));                   &::before { right: calc(-1 * var(--gap)); top: calc(-1 * var(--gap)); transform: scaleX(-1); } }
  &.bl { transform: translate(var(--gap), calc(-100% - var(--gap)));                   &::before { left: calc(-1 * var(--gap)); bottom: calc(-1 * var(--gap)); transform: scaleY(-1); } }
  &.br { transform: translate(calc(-100% - var(--gap)), calc(-100% - var(--gap)));     &::before { right: calc(-1 * var(--gap)); bottom: calc(-1 * var(--gap)); transform: scale(-1); } }

  &.docked { position: static; width: auto; padding: .6rem 0 0; margin-top: .5rem; background: none; border-top: var(--small-outline) var(--humo-a15); border-radius: 0; &::before { display: none; } }

}

.label { color: var(--lirio); font-weight: 700; }
.text  { font-size: .85rem; line-height: 1.4; }
.bar   { overflow: hidden; white-space: nowrap; color: var(--lirio); font-size: .8rem; line-height: 1.5; }
.track { display: inline-block; animation: scroll-progress 4s linear infinite; }

</style>
