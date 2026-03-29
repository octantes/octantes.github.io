<script setup> 
import { ref } from 'vue'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const store               = useStore()                                                                                                // initializes global store
const { computedPortada: data } = storeToRefs(store)                                                                                  // note data for text content
const expanded            = ref(false)                                                                                                // description deploy state
const emit                = defineEmits(['update:expanded'])                                                                          // emit expanded state to parent

function openAuthor(author) { window.open(author.link, '_blank', 'noopener,noreferrer'); }                                            // open author link
function toggle() { expanded.value = !expanded.value; emit('update:expanded', expanded.value) }                                      // toggle and notify parent

</script>

<template> 

  <div class="card" :class="{ expanded }">

    <div class="bar">

      <div class="title">{{ data.title }}</div>

      <div class="bar-right">

        <div v-for="author in data.authors.filter(a => a.full)" :key="author.handle"
          class="profile" @click="openAuthor(author)"
          @keydown.enter.prevent="openAuthor(author)" @keydown.space.prevent="openAuthor(author)"
          :title="'ver perfil de ' + author.handle" role="button" :tabindex="expanded ? -1 : 0"
          :aria-hidden="expanded ? 'true' : undefined"
          :aria-label="'ver el perfil de autor @' + author.handle + ' en una pestaña nueva'">
          <img class="userpic bar-pic" :src="author.img" :alt="'foto de perfil de @' + author.handle" />
          <span>@{{ author.handle }}<span v-if="author.date"> - {{ author.date }}</span></span>
        </div>

      </div>

      <button class="toggle" @click="toggle"
        :title="expanded ? 'cerrar descripción' : 'ver descripción'"
        :aria-label="expanded ? 'cerrar descripción' : 'ver descripción'">{{ expanded ? '↑' : '↓' }}</button>

    </div>

    <div v-if="expanded" class="info">

      <div class="description">{{ data.description }}</div>

      <hr />

      <div class="authors">
        <div v-for="author in data.authors" :key="author.handle"
          class="profile" :class="{ 'profile-full': author.full }"
          @click="openAuthor(author)"
          @keydown.enter.prevent="openAuthor(author)" @keydown.space.prevent="openAuthor(author)"
          :title="'ver perfil de ' + author.handle" role="button" tabindex="0"
          :aria-label="'ver el perfil de autor @' + author.handle + ' en una pestaña nueva'">
          <img class="userpic" :src="author.img" :alt="'foto de perfil de @' + author.handle" />
          <span>@{{ author.handle }}<span v-if="author.date"> - {{ author.date }}</span></span>
        </div>
      </div>

    </div>

  </div>

</template>

<style scoped> 

.card {

  /* LAYOUT */ display: flex; flex-direction: column;
  /* BOX    */ width: 100%;
  /* FILL   */ background: linear-gradient(125deg, var(--cristal) 0%, var(--lirio) 100%);
  /* BORDER */ border-radius: var(--radius-ss) var(--radius-ss) 0 0;
  /* MOTION */ transition: all var(--animate-fast);

  &:not(.expanded):hover { filter: brightness(95%); }
  &.expanded { margin-bottom: 1rem; border-radius: var(--radius-ss); }

}

.bar {

  /* LAYOUT */ display: flex; align-items: center; flex-shrink: 0;
  /* BOX    */ width: 100%; gap: 1rem; padding: 1rem 1.5rem;
  /* FONT   */ font-size: 0.9rem;

}

.title {

  /* BOX    */ max-width: 50%; min-width: 0;
  /* FONT   */ font-family: var(--font-mono); font-size: 1.2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

}

.expanded .title { max-width: none; flex: 1; }

.expanded .bar-right .profile { visibility: hidden; pointer-events: none; transition: none; }

.bar-right {

  /* LAYOUT */ display: flex; align-items: center; margin-left: auto;
  /* BOX    */ gap: 1rem;

}

.info {

  /* LAYOUT */ display: flex; flex-direction: column; justify-content: center;
  /* FONT   */ font-family: var(--font-mono);
  /* BOX    */ width: 100%; padding: 0 1.5rem 1.5rem; gap: 1rem;
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { transform: var(--scale-min); }

  & hr { border: none; border-top: var(--small-outline) var(--carbon); margin: 0; }

}

.description {

  /* FONT   */ font-style: italic; line-height: 1.25rem; font-size: 1rem;

}

.authors {

  /* LAYOUT */ display: flex; flex-direction: row; gap: 1rem;
  /* BOX    */ flex-wrap: wrap;
  /* FONT   */ font-size: 1rem;

}

.profile {

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: inline-flex; flex-direction: row; align-items: center;
  /* BORDER */ border-radius: 9999px;
  /* BOX    */ padding: .5rem 1rem .5rem .6rem; gap: .65rem;
  /* FILL   */ background-color: var(--carbon25);
  /* FONT   */ font-family: var(--font-mono); font-size: 1rem; font-weight: normal;
  /* MOTION */ transition: all var(--animate-fast);

  &:hover  { cursor: pointer; background-color: var(--carbon50); }
  &:active { transform: var(--scale-min); }

}

.profile-full {

  /* LAYOUT */ flex-grow: 1; justify-content: flex-start;

}

.userpic {

  /* LAYOUT */ border-radius: 50%;
  /* BOX    */ width: 25px; height: 25px;

}

.bar-pic { width: 16px; height: 16px; }

.toggle {

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ display: flex; align-items: center; justify-content: center;
  /* BOX    */ padding: 0; align-self: stretch; aspect-ratio: 1; overflow: hidden; flex: none;
  /* FILL   */ background-color: var(--carbon25); color: var(--carbon80);
  /* BORDER */ border: none; border-radius: 9999px;
  /* FONT   */ font-family: var(--font-main); font-weight: normal;
  /* MOTION */ transition: all var(--animate-faster);

  &:hover  { background-color: var(--carbon50); color: var(--carbon); }
  &:active { transform: var(--scale-min); }

}

@media (max-width: 432px) { .description { display: none; } }

</style>