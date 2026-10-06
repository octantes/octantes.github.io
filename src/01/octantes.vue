<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'
import Navigation from '../01/navigation.vue'
import Content from '../01/content.vue'
import Status from '../01/status.vue'
import Portada from '../02/portada.vue'
import Corner from '../02/corner.vue'
import { reading, read, stage } from '../04/stage.js'
import { MOBILE_MAX } from '../04/config.js'

const store = useStore()
const { currentPost } = storeToRefs(store)
const narrow = matchMedia(`(max-width: ${MOBILE_MAX}px)`)
const mobile = ref(narrow.matches)

function fit() { mobile.value = narrow.matches; if (mobile.value) reading.value = false }

function escape(e) { if (e.key === 'Escape' && reading.value && !stage.value) read(false) }

function sideScroll(e) {
  if (!reading.value || e.target.closest('.post') || !e.target.closest('.articulos')) return
  document.querySelector('.articulos .post')?.scrollBy(0, e.deltaY * (e.deltaMode ? 40 : 1))
}

watch(currentPost, post => { if (!post) reading.value = false })

onMounted(() => { window.addEventListener('keydown', escape); narrow.addEventListener('change', fit) })
onBeforeUnmount(() => { window.removeEventListener('keydown', escape); narrow.removeEventListener('change', fit); reading.value = false })

</script>

<template>

  <div class="layout page" :class="{ reading }" @wheel.passive="sideScroll">

    <div class="portal-glow" aria-hidden="true" />
    <Portada role="banner" class="portada" :class="{ 'mobile-gap': !currentPost }" :inert="store.processing" />
    <Navigation role="navigation" :aria-label="store.t.nav.search" class="navigation" :locked="store.processing" />

    <Content role="main" class="articulos" />

    <div v-if="reading && !mobile" class="reading-corner"><Corner :label="store.t.stage.unread" stacked @close="read(false)" /></div>

  </div>

  <div class="footer" role="contentinfo" :inert="store.processing">

      <Status />

  </div>

</template>

<style>

.layout {

  /* LAYOUT */ display: grid; grid-template-columns: 4fr 4fr; grid-template-rows: auto 1fr;
  /* BOX    */ padding: 1rem; column-gap: 1rem; row-gap: 0;
  /* FILL   */ --portal-glow: radial-gradient(ellipse 46% 44% at 50% 49%,
      color-mix(in srgb, var(--lirio) 13.0%, transparent) 0%,
      color-mix(in srgb, var(--lirio) 12.7%, transparent) 10%,
      color-mix(in srgb, var(--lirio) 12.0%, transparent) 20%,
      color-mix(in srgb, var(--lirio) 10.8%, transparent) 30%,
      color-mix(in srgb, var(--lirio) 9.2%, transparent) 40%,
      color-mix(in srgb, var(--lirio) 7.3%, transparent) 50%,
      color-mix(in srgb, var(--lirio) 5.3%, transparent) 60%,
      color-mix(in srgb, var(--lirio) 3.4%, transparent) 70%,
      color-mix(in srgb, var(--lirio) 1.7%, transparent) 80%,
      color-mix(in srgb, var(--lirio) 0.5%, transparent) 90%,
      transparent 100%);

}

.navigation { grid-column: 1; overflow-y: auto; min-height: 0; grid-row: 1 / span 2; position: relative; z-index: 1; }
.portada    { grid-column: 2; overflow-y: auto; min-height: 0; grid-row: 1; position: relative; z-index: 1; }
.articulos  { grid-column: 2; overflow-y: auto; min-height: 0; grid-row: 2; position: relative; z-index: 1; }

.layout > .articulos { background: var(--portal-glow) -1rem -2rem / calc(100% + 2rem) calc(100% + 4rem) no-repeat, var(--carbon); }

.portal-glow {

  /* LAYOUT */ grid-column: 2; grid-row: 2; z-index: 0; pointer-events: none;
  /* BOX    */ margin: -2rem -1rem;
  /* FILL   */ background: var(--portal-glow);

}

.layout.reading { @media (--desktop) {

  --wider: 6rem;

  & .portada, & .navigation { display: none; }
  & .articulos, & .portal-glow, & .reading-corner { grid-column: 1 / -1; grid-row: 1 / -1; justify-self: center; width: calc((100% - 1rem) / 2 + var(--wider) * 2); }
  & .articulos, & .reading-corner { margin-top: -1rem; }
  & .portal-glow { width: calc((100% - 1rem) / 2 + var(--wider) * 2 + 2rem); }
  & .articulos .post { width: calc(100% - var(--wider) * 2); margin-inline: auto; }
  & .reading-corner { position: relative; z-index: 2; pointer-events: none; & .top-actions { pointer-events: auto; top: 2.25rem; right: 3rem; } }

} }

.footer     { padding: 0rem 1rem 1rem 1rem; flex-shrink: 0; }

@media (--mobile) {

  .layout { display: flex; flex-direction: column; height: 100%; overflow-y: auto; row-gap: 0; }

  .navigation, .portada, .articulos  { overflow-y: visible; min-height: auto; height: auto; }

  .portal-glow { display: none; }
  .layout > .articulos { background: var(--carbon); }
  .portada { order: 1; } .portada.mobile-gap { margin-bottom: 1rem; border-radius: var(--radius-ss); } .articulos { order: 2; margin-bottom: 1rem; } .navigation { order: 3; }

  .footer  { padding: 0 1rem 1rem; }
  .content { height: auto; scrollbar-width: none; -ms-overflow-style: none; &::-webkit-scrollbar { display: none; } }

}

</style>