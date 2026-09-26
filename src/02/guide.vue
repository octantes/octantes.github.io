<script setup>

import { useStore } from '../04/store.js'

defineProps({ wall: Object, hot: String, place: String })

const emit  = defineEmits(['hover', 'pick', 'turn'])
const store = useStore()

</script>

<template>

  <nav class="guide" :aria-label="store.t.havitat.items">

    <header class="head">
      <button class="turn" @click="emit('turn', -1)" :title="store.t.havitat.prev" :aria-label="store.t.havitat.prev">‹</button>
      <span class="name">{{ wall[store.lang] }}</span>
      <span class="place">{{ place }}</span>
      <button class="turn" @click="emit('turn', 1)" :title="store.t.havitat.next" :aria-label="store.t.havitat.next">›</button>
    </header>

    <ul class="items">
      <li v-for="item in wall.items" :key="item.id">
        <button class="entry" :class="{ hot: hot === item.id }" @pointerenter="emit('hover', item.id)" @pointerleave="emit('hover', null)" @focus="emit('hover', item.id)" @blur="emit('hover', null)" @click="emit('pick', item, $event)">{{ item.label[store.lang] }}</button>
      </li>
    </ul>

  </nav>

</template>

<style scoped>

.guide {

  /* LAYOUT */ position: absolute; left: 1rem; bottom: 1rem; z-index: 2;
  /* BOX    */ width: 16rem; padding: .75rem 1rem;
  /* FILL   */ background: var(--carbon-a60); color: var(--humo);
  /* BORDER */ border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-mono); font-size: .9rem;

}

.head   { display: flex; align-items: center; gap: .5rem; padding-bottom: .5rem; margin-bottom: .5rem; border-bottom: var(--small-outline) var(--humo-a15); }
.name   { flex: 1; color: var(--lirio); font-weight: 700; }
.place  { color: var(--humo-a60); }

.turn   { background: none; border: none; padding: 0 .25rem; color: var(--cristal); font: inherit; font-size: 1.1rem; line-height: 1; cursor: pointer; }
.turn:hover { color: var(--lirio); }

.items  { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .15rem; }

.entry  { background: none; border: none; padding: .1rem 0; color: var(--humo); font: inherit; text-align: left; cursor: pointer; }
.entry::before { content: '>'; margin-right: .5rem; color: var(--cristal); }
.entry.hot { color: var(--lirio); }

@media (--mobile) {

  .guide { top: 1rem; right: 1rem; bottom: auto; width: auto; }
  .items { display: grid; grid-template-columns: 1fr 1fr; column-gap: 1rem; }

}

</style>
