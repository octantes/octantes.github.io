<script setup>

import { ref, onMounted } from 'vue'
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

const REPEATS  = 6                                                              // times each word is thrown
const TRIES    = 500                                                            // placements attempted per word, per size
const SHRINKS  = 3                                                              // times a word will try again smaller before it is dropped
const GAP      = 3                                                              // px of air required between two words

function measurer(el) {
  const font = getComputedStyle(el).fontFamily
  const c = document.createElement('canvas').getContext('2d')
  return (text, px) => { c.font = `${px}px ${font}`; return c.measureText(text).width }
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function scatter(words, el, stage, card) {

  const W = stage.width, H = stage.height
  const px = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const width = measurer(el)

  const thrown = []
  for (let r = 0; r < REPEATS; r++) for (const w of words) thrown.push(w)

  // size first, then place biggest first - they are the ones with nowhere else to go
  const sized = thrown.map(text => {
    const roll = Math.random()
    const tier = roll < 0.12 ? 2 : roll < 0.52 ? 1 : 0
    const rem  = tier === 2 ? 7.5 + Math.random() * 3.5
               : tier === 1 ? 3.6 + Math.random() * 2.6
               :              1.7 + Math.random() * 1.0
    const alpha = tier === 2 ? 0.045 + Math.random() * 0.035
                : tier === 1 ? 0.10  + Math.random() * 0.09
                :              0.24  + Math.random() * 0.26
    return { text, tier, rem, alpha, angle: Math.random() * 18 - 9 }
  }).sort((a, b) => b.rem - a.rem)

  const taken = [card]
  const out = []

  for (const item of sized) {

    let placed = false

    for (let shrink = 0; shrink <= SHRINKS && !placed; shrink++) {

      const rem  = item.rem * Math.pow(0.72, shrink)
      const size = rem * px
      const w0 = width(item.text, size), h0 = size * 1.15
      const rad = Math.abs(item.angle) * Math.PI / 180
      const w = w0 * Math.cos(rad) + h0 * Math.sin(rad) + GAP
      const h = w0 * Math.sin(rad) + h0 * Math.cos(rad) + GAP

      for (let n = 0; n < TRIES; n++) {

        const angle = Math.random() * Math.PI * 2
        const reach = item.tier === 2 ? 0.42 + Math.random() * 0.42
                    : item.tier === 1 ? 0.34 + Math.random() * 0.48
                    :                   0.28 + Math.random() * 0.56

        const cx = W / 2 + Math.cos(angle) * reach * W / 2
        const cy = H / 2 + Math.sin(angle) * reach * H / 2
        const box = { x: cx - w / 2, y: cy - h / 2, w, h }

        if (taken.some(t => overlaps(box, t))) continue

        taken.push(box)
        out.push({
          text: item.text,
          style: {
            left:      `${(cx / W) * 100}%`,
            top:       `${(cy / H) * 100}%`,
            transform: `translate(-50%, -50%) rotate(${item.angle.toFixed(1)}deg)`,
            fontSize:  `${rem.toFixed(2)}rem`,
            opacity:   item.alpha.toFixed(2),
          },
        })
        placed = true
        break

      }
    }
  }

  return out

}

const art   = figlet(props.code)
const copy  = store.t.notFound
const stage = ref(null)
const card  = ref(null)
const words = ref([])

onMounted(() => {
  const s = stage.value?.getBoundingClientRect()
  const c = card.value?.getBoundingClientRect()
  if (!s || !c) return
  words.value = scatter(
    (copy.byCode[String(props.code)] || copy.byCode.default).split(' '),
    stage.value,
    { width: s.width, height: s.height },
    { x: c.x - s.x - 24, y: c.y - s.y - 24, w: c.width + 48, h: c.height + 48 },
  )
})

</script>

<template>

  <div class="errorstate" ref="stage">

    <span v-for="(w, i) in words" :key="i" class="thrown" :style="w.style" aria-hidden="true">{{ w.text }}</span>

    <div class="errorcard" role="alert" ref="card">

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
