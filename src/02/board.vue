<script setup>

import { computed } from 'vue'
import { useStore } from '../04/store.js'
import { BOARD, ROOM_TEXT } from '../04/rooms.js'

const props = defineProps({ layout: Object, scale: Number, tab: Number, page: Number })

const emit  = defineEmits(['tab', 'page'])
const store = useStore()
const shown = computed(() => BOARD.tabs[props.tab])
const leaf  = computed(() => shown.value.pages[props.page])
const text  = computed(() => ROOM_TEXT[store.lang])

function place([x, y, w, h]) { return { left: `${x * props.scale}px`, top: `${y * props.scale}px`, width: `${w * props.scale}px`, height: `${h * props.scale}px` } }

</script>

<template>

  <div class="board" :style="{ '--u': `${scale}px` }">

    <div role="tablist" :aria-label="text.tabs">
      <button v-for="(t, i) in BOARD.tabs" :key="t.id" class="tab" :class="{ active: i === tab }" :style="place(layout.slots.tabs[i])"
              role="tab" :aria-selected="i === tab" :title="t.label[store.lang]" @click="emit('tab', i)">
        <span v-if="i === tab">{{ t.label[store.lang] }}</span>
      </button>
    </div>

    <div class="text" role="tabpanel" :style="place(layout.slots.text)">
      <strong>{{ leaf.title[store.lang] }}</strong>
      <p>{{ leaf.text[store.lang] }}</p>
    </div>

    <button v-for="(p, i) in shown.pages" :key="i" class="page" :style="place(layout.slots.pages[i])"
            :aria-current="i === page ? 'page' : null" :aria-label="`${text.page} ${i + 1}`" @click="emit('page', i)" />

  </div>

</template>

<style scoped>

.board {

  /* LAYOUT */ position: absolute; inset: 0; z-index: 1; pointer-events: none;
  /* FONT   */ font-family: var(--font-mono); color: var(--carbon);
  /* MOTION */ animation: board-in var(--animate-fast) ease-out;

}

.tab, .page, .text { position: absolute; }

.tab, .page {

  /* CURSOR */ cursor: pointer; pointer-events: auto;
  /* LAYOUT */ display: flex; align-items: center; justify-content: center;
  /* BOX    */ padding: 0;
  /* FILL   */ background: none; color: inherit;
  /* BORDER */ border: none;
  /* FONT   */ font-family: var(--font-mono); font-size: calc(var(--u) * 40); font-weight: 700;

  &:focus { box-shadow: none; outline: none; }

}

.tab.active { cursor: default; }

.text {

  /* LAYOUT */ display: flex; flex-direction: column; gap: calc(var(--u) * 16); overflow: hidden;
  /* FONT   */ font-size: calc(var(--u) * 34); line-height: 1.35;

  & strong { font-family: var(--font-mono); font-weight: 700; color: var(--carbon); }
  & p      { margin: 0; color: var(--carbon-a60); }

}

@keyframes board-in { from { opacity: 0; } }

</style>
