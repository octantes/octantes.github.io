<script setup>

import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import Drawing from '../03/drawing.vue'

const route  = useRoute()
const router = useRouter()
const store  = useStore()

store.land(route)

const entries = ref([])
const active  = ref(null)
const scroller = ref(null)

let spy = null

function go(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  router.replace({ hash: `#${id}` })
}

onMounted(async () => {
  entries.value = await (await fetch('/vitacora.json')).json()
  active.value  = entries.value[0]?.id ?? null
  await nextTick()
  spy = new IntersectionObserver(seen => { for (const entry of seen) if (entry.isIntersecting) active.value = entry.target.id }, { root: scroller.value, rootMargin: '-45% 0px -45% 0px' })
  for (const el of scroller.value.querySelectorAll('.entry')) spy.observe(el)
  if (route.hash) document.getElementById(decodeURIComponent(route.hash.slice(1)))?.scrollIntoView({ block: 'start' })
})

onBeforeUnmount(() => spy?.disconnect())

</script>

<template>

  <div class="frame page">

    <div class="log">

      <nav class="dates" :aria-label="'vitacora'">
        <button v-for="e in entries" :key="e.id" class="date" :class="{ active: active === e.id }" @click="go(e.id)">
          <span class="day">{{ e.date }}</span>
          <span class="name">{{ e.title }}</span>
        </button>
      </nav>

      <main class="board" ref="scroller">
        <article v-for="e in entries" :id="e.id" :key="e.id" class="entry">
          <header class="head"><time :datetime="e.date">{{ e.date }}</time><h2>{{ e.title }}</h2></header>
          <Drawing v-if="e.kind === 'svg'" :src="e.src" />
          <div v-else class="prose" v-html="e.html" />
        </article>
      </main>

    </div>

  </div>

</template>

<style scoped>

.log    { display: grid; grid-template-columns: 16rem 1fr; gap: 1rem; flex: 1 1 auto; min-height: 0; }

.dates {

  /* LAYOUT */ display: flex; flex-direction: column; gap: .15rem; overflow-y: auto; align-self: start; max-height: 100%;
  /* BOX    */ padding: .75rem 1rem;
  /* FILL   */ background: var(--carbon-a95); color: var(--humo);
  /* BORDER */ border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-mono); font-size: .9rem;

}

.date {

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ display: flex; flex-direction: column; align-items: flex-start;
  /* BOX    */ padding: .25rem 0;
  /* FILL   */ background: none; color: var(--humo);
  /* BORDER */ border: none;
  /* FONT   */ font: inherit; text-align: left;

  &:hover, &.active { color: var(--lirio); }
  &:focus { box-shadow: none; outline: none; }
  &:focus-visible { color: var(--lirio); }

}

.day    { color: var(--humo-a60); font-size: .8rem; }
.name   { font-weight: 700; }

.board  { overflow-y: auto; min-height: 0; display: flex; flex-direction: column; gap: 4rem; padding-bottom: 50vh; scroll-behavior: smooth; }

.entry  { display: flex; flex-direction: column; gap: 1rem; scroll-margin-top: 1rem; }

.head   { display: flex; align-items: baseline; gap: 1rem; font-family: var(--font-mono); color: var(--humo); }
.head time { color: var(--humo-a60); font-size: .85rem; }
.head h2   { margin: 0; font-size: 1.1rem; color: var(--lirio); }

.prose  { max-width: 42rem; font-family: var(--font-mono); color: var(--humo); line-height: 1.6; }

@media (--mobile) {

  .log   { grid-template-columns: 1fr; }
  .dates { flex-direction: row; overflow-x: auto; }

}

</style>
