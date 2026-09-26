<script setup>

import { computed } from 'vue'
import { useStore } from '../04/store.js'

const props = defineProps({ item: Object, at: { type: Array, default: null } })

const store = useStore()

const place = computed(() => props.at && {
  left: `${props.at[0]}px`, top: `${props.at[1]}px`,
  '--dx': props.at[0] > innerWidth - 320 ? 'calc(-100% - 1rem)' : '1rem',
  '--dy': props.at[1] > innerHeight - 160 ? 'calc(-100% - 1rem)' : '1rem',
})

</script>

<template>

  <div class="hint" :class="{ docked: !at }" :style="place" :aria-hidden="at ? 'true' : null">
    <span class="label">{{ item.label[store.lang] }}</span>
    <span class="text">{{ item.description[store.lang] }}</span>
    <div class="bar"><div class="track">{{ store.barContent }}</div></div>
  </div>

</template>

<style scoped>

.hint {

  /* LAYOUT */ position: fixed; z-index: 3; pointer-events: none; display: flex; flex-direction: column; gap: .3rem; transform: translate(var(--dx), var(--dy));
  /* BOX    */ width: 18rem; padding: .6rem .8rem;
  /* FILL   */ background: var(--carbon-a95); color: var(--humo);
  /* BORDER */ border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-mono); font-size: .9rem;

  &.docked { position: static; transform: none; width: auto; padding: .6rem 0 0; margin-top: .5rem; background: none; border-top: var(--small-outline) var(--humo-a15); border-radius: 0; }

}

.label { color: var(--lirio); font-weight: 700; }
.text  { font-size: .85rem; line-height: 1.4; }
.bar   { overflow: hidden; white-space: nowrap; color: var(--lirio); font-size: .8rem; line-height: 1.5; }
.track { display: inline-block; animation: scroll-progress 4s linear infinite; }

</style>
