<script setup> 

import { computed } from 'vue'

const props = defineProps({ text: { type: String, default: '' } })                                                                    // the note's own title

/* the size has to know the length, or a long title runs off the column: the
   count of characters and of the longest word are handed to css, which sizes
   from them. no measuring, no canvas - the cap still comes from the column */

/* a title like "dinamik - studio dev" is a name and a gloss; the display takes
   the name. split on a spaced dash only, so hyphenated words survive */

const shown = computed(() => props.text.split(' - ')[0].trim() || props.text)

const chars = computed(() => Math.max(shown.value.length, 1))
const word  = computed(() => Math.max(...shown.value.split(/\s+/).map(w => w.length), 1))

</script>

<template> 

  <h2 class="notetitle" v-if="text" :style="{ '--chars': chars, '--word': word }"><span class="ink">{{ shown }}</span></h2>

</template>

<style scoped> 

/* No canvas: the display face carries it. The letters are set tight and
   stretched on the vertical, and the size follows the column through cqw -
   .post is the query container - so a phone and a wide desktop get the same
   proportions without measuring anything. */

.notetitle {

  /* LAYOUT */ display: block; width: 100%; text-align: center;
  /* BOX    */ margin: 0; padding-block: var(--space-xxl) var(--space-ll); padding-inline: var(--space-xxl);
  /* FONT   */ font-family: var(--font-display); font-weight: 400;
               font-size: clamp(1.4rem, min(10cqw, calc(118cqw / var(--word, 8)), calc(355cqw / var(--chars, 16))), 5rem);
               line-height: 1.04;
               letter-spacing: -0.055em; text-transform: uppercase;
               overflow-wrap: break-word;

}

/* a phone column is under half the width, so the same cqw sizing lands at under
   half the size. the cap goes up and the side air comes in, which keeps the
   title close to the proportions it has on the wide layout */

@media (max-width: 1080px) {

  .notetitle {
    /* BOX  */ padding-block: var(--space-xl) var(--space-mm); padding-inline: var(--space-ll);
    /* FONT */ font-size: clamp(1.6rem, min(19cqw, calc(122cqw / var(--word, 8)), calc(420cqw / var(--chars, 16))), 5rem);
  }

}

.ink {

  /* LAYOUT */ display: inline-block; max-width: 100%; overflow-wrap: anywhere;
  /* SHAPE  */ transform: scaleY(1.5); transform-origin: center;
  /* BOX    */ margin-block: 0.24em;                                                                                                  /* a transform reserves no room, so it is reserved here */
  /* FILL   */ background: linear-gradient(100deg, var(--cristal) 0%, var(--lirio) 100%);
               -webkit-background-clip: text; background-clip: text;
               -webkit-text-fill-color: transparent; color: transparent;

}

</style>
