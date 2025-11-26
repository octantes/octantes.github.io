<script setup> 
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const router          = useRouter()                                                                                                   // handles note open route
const route           = useRoute()                                                                                                    // sets the current url route
const store           = useStore()                                                                                                    // initializes global store

const { noteSortFilter, processing } = storeToRefs(store) 

function noteOpen(type, slug) { if (!processing.value) router.push({ path: `/${type}/${slug}` }) }

</script>

<template> 
    
  <div class="gallery">
    
    <div v-for="note in noteSortFilter" :key="note.slug" class="notecard" @click="noteOpen(note.type, note.slug)" :class="{ disabled: processing, active: route.params.slug === note.slug }" >
    
      <div class="card-cover">

        <img v-if="note.portada" :src="note.portada" loading="lazy" alt="cover" />
        <div v-else class="card-placeholder">/</div>
        
      </div>

      <div class="card-info">

        <span class="date">{{ note.date }}</span>
        <h3 class="title">{{ note.title }}</h3>
        
        <div class="tags">
          <span v-for="tag in note.tags.slice(0,3)" :key="tag" class="tag">{{ tag }}</span>
        </div>

      </div>

    </div>

  </div>

</template>

<style scoped> 

.gallery { 

  /* LAYOUT */ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  /* BOX    */ width: 100%; padding-bottom: 2rem; padding-top: .5rem; gap: 1rem;  

}

.notecard {

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ display: flex; flex-direction: column; overflow: hidden;
  /* BOX    */ height: 100%;
  /* FILL   */ background-color: var(--carbon25);
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-ss);
  /* MOTION */ transition: all var(--animate-fast);

  &:hover {

    transform: translateY(-2px);
    border-color: var(--lirio);

    & .title { color: var(--cristal); }
    & img { filter: grayscale(0); transform: scale(1.05); }

  }

  &.active {

    border-color: var(--lirio);

    & .title { color: var(--cristal); }
    & img { filter: grayscale(0); transform: scale(1.05); }

  } 

  &.disabled { opacity: var(--alpha-disabled); cursor: not-allowed; }

}

.card-cover {
  
  /* BOX    */ width: 100%; aspect-ratio: 16/9; overflow: hidden;
  /* FILL   */ background-color: var(--carbon); 
  /* BORDER */ border-bottom: var(--small-outline) var(--humo10);
  
  & img {

    width: 100%; height: 100%; object-fit: cover;
    filter: grayscale(1); transition: all var(--animate-mid);

  }

}

.card-placeholder {

  /* LAYOUT */ display: flex; align-items: center; justify-content: center;
  /* BOX    */ width: 100%; height: 100%;
  /* FILL   */ color: var(--humo25);
  /* FONT   */ font-size: 2rem;

}

.card-info {

  /* LAYOUT */ display: flex; flex-direction: column;  flex-grow: 1;
  /* BOX    */ padding: 0.8rem; gap: 0.5rem;

}

.date { font-size: 0.7rem; font-family: var(--font-mono); color: var(--humo50); }

.title {

  /* LAYOUT */ display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-clamp: 2; overflow: hidden;
  /* FONT   */ font-size: 0.9rem; margin: 0; font-weight: normal; color: var(--humo); line-height: 1.3;
  /* MOTION */ transition: color var(--animate-fast);

}

.tags { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: auto; }

.tag { 

  /* BOX    */ padding: 0.1rem 0.3rem; border-radius: 2px;
  /* FILL   */ background-color: var(--humo10); color: var(--lirio);
  /* FONT   */ font-size: 0.6rem;

}

@media (max-width: 1080px) { .gallery { max-height: 25rem; } }

</style>