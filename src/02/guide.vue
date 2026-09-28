<script setup>

import { useStore } from '../04/store.js'

defineProps({ wall: Object, depth: Object, hot: String, place: String })

const emit  = defineEmits(['hover', 'pick', 'turn', 'back', 'aim'])
const store = useStore()

</script>

<template>

  <nav class="guide" :aria-label="store.t.havitat.items">

    <header v-if="depth" class="head bare">
      <button class="turn" @click="emit('back')" :title="store.t.havitat.back" :aria-label="store.t.havitat.back">‹</button>
      <span class="name">{{ depth.label[store.lang] }}</span>
      <span class="place">{{ wall[store.lang] }}</span>
    </header>

    <header v-else class="head">
      <button class="turn" @pointerenter="emit('aim', -1)" @pointerleave="emit('aim', null)" @focus="emit('aim', -1)" @blur="emit('aim', null)" @click="emit('turn', -1)" :title="store.t.havitat.prev" :aria-label="store.t.havitat.prev">‹</button>
      <span class="name">{{ wall[store.lang] }}</span>
      <span class="place">{{ place }}</span>
      <button class="turn" @pointerenter="emit('aim', 1)" @pointerleave="emit('aim', null)" @focus="emit('aim', 1)" @blur="emit('aim', null)" @click="emit('turn', 1)" :title="store.t.havitat.next" :aria-label="store.t.havitat.next">›</button>
    </header>

    <ul v-if="!depth" class="items">
      <li v-for="item in wall.items.filter(i => !i.decor)" :key="item.id">
        <button class="entry" :class="{ hot: hot === item.id }" @pointerenter="emit('hover', item.id, $event)" @pointerleave="emit('hover', null, $event)" @focus="emit('hover', item.id)" @blur="emit('hover', null)" @click="emit('pick', item, $event)">{{ item.label[store.lang] }}</button>
      </li>
    </ul>

    <slot />

  </nav>

</template>

<style scoped>

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

</style>
