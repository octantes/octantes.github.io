<script setup>

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../04/store.js'

const props = defineProps({ code: { type: [Number, String], default: 404 } })

const router = useRouter()
const store  = useStore()

const GLYPHS = {
  '0': [' ██████╗ ', '██╔═████╗', '██║██╔██║', '████╔╝██║', '╚██████╔╝', ' ╚═════╝ '],
  '1': [' ██╗', '███║', '╚██║', ' ██║', ' ██║', ' ╚═╝'],
  '2': ['██████╗ ', '╚════██╗', ' █████╔╝', '██╔═══╝ ', '███████╗', '╚══════╝'],
  '3': ['██████╗ ', '╚════██╗', ' █████╔╝', ' ╚═══██╗', '██████╔╝', '╚═════╝ '],
  '4': ['██╗  ██╗', '██║  ██║', '███████║', '╚════██║', '     ██║', '     ╚═╝'],
  '5': ['███████╗', '██╔════╝', '███████╗', '╚════██║', '███████║', '╚══════╝'],
}

function figlet(code) {
  const digits = String(code).split('').map(d => GLYPHS[d]).filter(Boolean)
  if (!digits.length) return String(code)
  return [0, 1, 2, 3, 4, 5].map(r => digits.map(d => d[r]).join('')).join('\n')
}

const REPEATS = 4                                                               // times each word is thrown

function scatter(words) {

  const thrown = []
  for (let r = 0; r < REPEATS; r++) for (const w of words) thrown.push(w)
  for (let i = thrown.length - 1; i > 0; i--) {                                 // shuffle, so repeats never land in a ring
    const j = Math.floor(Math.random() * (i + 1))
    ;[thrown[i], thrown[j]] = [thrown[j], thrown[i]]
  }

  const step = 360 / thrown.length

  return thrown.map((text, i) => {

    const angle = (step * i + Math.random() * step) * Math.PI / 180
    const roll  = Math.random()
    const tier  = roll < 0.14 ? 2 : roll < 0.66 ? 1 : 0                         // giant, large, and merely big

    const reach = tier === 2 ? 0.36 + Math.random() * 0.34
                : tier === 1 ? 0.28 + Math.random() * 0.28
                :              0.18 + Math.random() * 0.24

    const size  = tier === 2 ? 7.5 + Math.random() * 3.5
                : tier === 1 ? 3.6 + Math.random() * 2.6
                :              1.7 + Math.random() * 1.0

    const alpha = tier === 2 ? 0.045 + Math.random() * 0.035
                : tier === 1 ? 0.10  + Math.random() * 0.09
                :              0.24  + Math.random() * 0.26

    return {
      text,
      style: {
        left:      `${50 + Math.cos(angle) * reach * 100}%`,
        top:       `${50 + Math.sin(angle) * reach * 82}%`,
        transform: `translate(-50%, -50%) rotate(${(Math.random() * 18 - 9).toFixed(1)}deg)`,
        fontSize:  `${size.toFixed(2)}rem`,
        opacity:   alpha.toFixed(2),
      },
    }
  })

}

const art   = figlet(props.code)
const copy  = store.t.notFound
const words = ref(scatter((copy.byCode[String(props.code)] || copy.byCode.default).split(' ')))

</script>

<template>

  <div class="errorstate">

    <span v-for="(w, i) in words" :key="i" class="thrown" :style="w.style" aria-hidden="true">{{ w.text }}</span>

    <div class="errorcard" role="alert">

      <pre class="errorart" aria-hidden="true">{{ art }}</pre>
      <p class="errorline">{{ copy.byCode[String(code)] || copy.byCode.default }}</p>
      <button class="errorback" @click="store.navHome(router)" :title="copy.back" :aria-label="copy.back">{{ copy.back }}</button>

    </div>

  </div>

</template>

<style scoped>

.errorstate {

  /* LAYOUT */ position: relative; display: flex; align-items: center; justify-content: center;
  /* BOX    */ width: 100%; min-height: 24rem; height: 100%; overflow: hidden;
  /* FONT   */ font-family: var(--font-mono);

}

/* The scattered words sit under the card and are deliberately quiet - they are
   texture, and the card is the thing to read. */

.thrown {

  /* CURSOR */ user-select: none; pointer-events: none;
  /* LAYOUT */ position: absolute; white-space: nowrap;
  /* FILL   */ color: var(--humo);

}

.errorcard {

  /* LAYOUT */ position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center;
  /* BOX    */ padding: var(--space-xl) var(--space-xxl); gap: var(--space-mm);
  /* FILL   */ background-color: var(--carbon);                                                                                     /* solid: a hero-sized word landing behind it should not read through */
  /* BORDER */ border: var(--small-outline) var(--lirio-a40); border-radius: var(--radius-ss);
  /* FILL   */ box-shadow: 0 0 3.2rem -0.4rem var(--lirio-a21), 0 0 1rem -0.45rem var(--lirio-a15);

}

.errorart {

  /* LAYOUT */ margin: 0;
  /* FILL   */ color: var(--lirio);
  /* FONT   */ font-family: monospace; font-size: 0.62rem; line-height: 1.1; white-space: pre;
  /* FONT   */ font-variant-ligatures: none; letter-spacing: 0;

}

.errorline { margin: 0; color: var(--humo); font-size: var(--text-mm); text-align: center; }

.errorback {

  /* CURSOR */ cursor: pointer;
  /* BOX    */ padding: 0.35rem 0.9rem;
  /* FILL   */ background-color: transparent; color: var(--cristal);
  /* BORDER */ border: var(--small-outline) var(--cristal-a60); border-radius: 9999px; corner-shape: superellipse(1.4);
  /* FONT   */ font-family: var(--font-mono); font-size: var(--text-ss);
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { color: var(--carbon); background-color: var(--cristal); border-color: var(--cristal);
            box-shadow: 0 0 1rem 0 var(--cristal-a31), 0 0 .35rem 0 var(--cristal-a15); }

}

@media (max-width: 1080px) { .errorstate { min-height: 18rem; } .thrown { font-size: 0.8rem !important; } }

</style>
