<script setup>

import { useStore } from '../04/store.js'

defineProps({ label: String })

const emit  = defineEmits(['close'])
const store = useStore()

</script>

<template>

  <div class="top-actions">
    <button class="close-btn" @click="emit('close')" :title="label" :aria-label="label">✘</button>
    <button class="close-btn lang-btn" @click="store.toggleLang" :title="store.t.portada.langTitle" :aria-label="store.t.portada.langTitle">{{ store.lang.toUpperCase() }}</button>
  </div>

</template>

<style scoped>

.top-actions {

  /* LAYOUT */ position: absolute; top: 1.5rem; right: 2rem; z-index: 50; display: flex; flex-direction: column; align-items: center;
  /* BOX    */ gap: 0.75rem;

}

.close-btn { 

  /* CURSOR */ cursor: pointer; user-select: none;
  /* LAYOUT */ position: relative;
  /* FILL   */ background: transparent; color: var(--humo-a60);
  /* BORDER */ border: none; box-shadow: none;
  /* FONT   */ font-family: var(--font-mono); font-size: 1.5rem; line-height: 1;
  /* FX     */ mix-blend-mode: difference;
  /* MOTION */ transition: color var(--animate-fast);

  &:hover { color: var(--lirio); }

}

.lang-btn { font-size: 1rem; font-weight: bold; }

</style>
