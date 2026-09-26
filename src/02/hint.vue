<script setup>

import { useStore } from '../04/store.js'

defineProps({ item: Object, at: Array })

const store = useStore()

</script>

<template>

  <div class="hint" :style="{ left: `${at[0]}px`, top: `${at[1]}px` }" aria-hidden="true">{{ item.label[store.lang] }}</div>

</template>

<style scoped>

.hint {

  /* LAYOUT */ position: fixed; z-index: 3; pointer-events: none; transform: translate(1rem, 1rem);
  /* BOX    */ padding: .35rem .6rem;
  /* FILL   */ background: var(--carbon-a60); color: var(--lirio);
  /* BORDER */ border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-mono); font-size: .9rem; white-space: nowrap;

}

</style>
