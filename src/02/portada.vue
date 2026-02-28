<script setup> 
import { computed } from 'vue'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const store               = useStore()                                                                                                // initializes global store
const { computedPortada } = storeToRefs(store)                                                                                        // imports refs from main store
const data = computed(()  => computedPortada.value)                                                                                   // note data for text content

function openAuthor(author) { window.open(author.link, '_blank', 'noopener,noreferrer'); }                                            // open author link and track

</script>

<template> 

  <div class="card">

    <div class="text">

      <div class="info">
          
        <div class="title">{{ data.title }}</div>
        <div class="description">{{ data.description }}</div>

        <hr />

        <div class="authors"> 
          
          <div v-for="author in data.authors" :key="author.handle" class="profile" :class="{ 'profile-full': author.full }" @click="openAuthor(author)" :title="'ver perfil de ' + author.handle" role="button" :aria-label="'ver el perfil de autor @' + author.handle + ' en una pestaña nueva'">

            <img class="userpic" :src="author.img" :alt="'foto de perfil de @' + author.handle"/>
            <span>@{{ author.handle }}<span v-if="author.date"> - {{ author.date }}</span></span>

          </div>

        </div>

      </div>

    </div>

  </div>

</template>

<style scoped> 

.card { 

  /* LAYOUT */ display: flex; flex-direction: row; align-items: stretch;
  /* BOX    */ width: 100%;

}

.text { 

  /* BOX    */ width: 100%;
  /* FILL   */ background: linear-gradient(125deg, var(--cristal) 0%, var(--lirio) 100%);
  /* BORDER */ border-radius: var(--radius-ss);
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { filter: brightness(95%); }

}

.info { 

  /* LAYOUT */ display: flex; flex-direction: column; justify-content: center;
  /* FONT   */ font-family: var(--font-mono);
  /* BOX    */ width: 100%; height: 100%; padding: 1.5rem; gap: 1rem;
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { transform: var(--scale-min); }

  & hr { 

    /* BORDER */ border: none; border-top: var(--small-outline) var(--carbon);
    /* BOX    */ margin: 0;

  }

}

.title { font-size: 1vw; }

.description { 

  /* BOX    */ height: calc(1.25rem * 2);
  /* FONT   */ font-style: italic; overflow: hidden; line-height: 1.25rem; font-size: .9vw;

}

.authors {

  /* LAYOUT */ display: flex; flex-direction: row; gap: 1rem;
  /* BOX    */ flex-wrap: wrap;
  /* FONT   */ font-size: .85vw;

}

.profile { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: inline-flex; flex-direction: row; align-items: center;
  /* BORDER */ border-radius: 9999px;
  /* BOX    */ padding: .5rem 1rem .5rem .6rem; gap: .65rem;
  /* FILL   */ background-color: var(--carbon25);
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

</style>