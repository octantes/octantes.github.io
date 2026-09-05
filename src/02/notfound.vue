<script setup>

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../04/store.js'

const props = defineProps({ code: { type: [Number, String], default: 404 } })

const router = useRouter()
const store  = useStore()

const GLYPHS = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
}

function bitmap(code) {
  return String(code).split('')
    .map(d => GLYPHS[d])
    .filter(Boolean)
    .map(rows => rows.flatMap(r => r.split('').map(c => c === '1')))
}

function scatter(words) {
  const step = 360 / words.length
  return words.map((text, i) => {
    const angle = (step * i + Math.random() * step) * Math.PI / 180
    const reach = 0.30 + Math.random() * 0.16
    return {
      text,
      style: {
        left:      `${50 + Math.cos(angle) * reach * 100}%`,
        top:       `${50 + Math.sin(angle) * reach * 78}%`,
        transform: `translate(-50%, -50%) rotate(${(Math.random() * 16 - 8).toFixed(1)}deg)`,
        fontSize:  `${(0.9 + Math.random() * 0.9).toFixed(2)}rem`,
        opacity:   (0.35 + Math.random() * 0.45).toFixed(2),
      },
    }
  })
}

const art   = bitmap(props.code)
const copy  = store.t.notFound
const words = ref(scatter((copy.byCode[String(props.code)] || copy.byCode.default).split(' ')))

</script>

<template>

  <div class="errorstate">

    <span v-for="(w, i) in words" :key="i" class="thrown" :style="w.style" aria-hidden="true">{{ w.text }}</span>

    <div class="errorcard" role="alert">

      <div class="errorart" aria-hidden="true">
        <div v-for="(digit, d) in art" :key="d" class="digit">
          <i v-for="(on, c) in digit" :key="c" :class="{ on }" />
        </div>
      </div>
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
  /* FILL   */ background-color: var(--carbon-a60); backdrop-filter: blur(2px);
  /* BORDER */ border: var(--small-outline) var(--lirio-a40); border-radius: var(--radius-ss);
  /* FILL   */ box-shadow: 0 0 3.2rem -0.4rem var(--lirio-a21), 0 0 1rem -0.45rem var(--lirio-a15);

}

.errorart { display: flex; gap: 0.5rem; }

.digit {

  /* LAYOUT */ display: grid; grid-template-columns: repeat(5, var(--px)); grid-auto-rows: var(--px);
  /* SIZE   */ --px: 0.42rem;

  & i        { background-color: transparent; }
  & i.on     { background-color: var(--lirio); }

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
