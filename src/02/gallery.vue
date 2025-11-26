<script setup>
import { useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const router = useRouter()
const store = useStore()
const { paginatedNotes, processing, currentPage, totalPages } = storeToRefs(store)

function noteOpen(type, slug) {
  if (!processing.value) router.push({ path: `/${type}/${slug}` })
}
</script>

<template>
  <div class="gallery-container">
    
    <div class="grid">
      <div 
        v-for="note in paginatedNotes" 
        :key="note.slug" 
        class="card" 
        @click="noteOpen(note.type, note.slug)"
        :class="{ disabled: processing }"
      >
        
        <div class="card-cover">
          <img v-if="note.portada" :src="note.portada" loading="lazy" />
          <div v-else class="placeholder-img">/</div>
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

    <div class="gallery-footer">
       <button class="navbutton" @click="store.prevPage" :disabled="currentPage === 1 || processing"> < </button>
       <span>{{ currentPage }} / {{ totalPages || 1 }}</span>
       <button class="navbutton" @click="store.nextPage" :disabled="currentPage >= totalPages || processing"> > </button>
    </div>

  </div>
</template>

<style scoped>
.gallery-container {
  /* LAYOUT */ display: flex; flex-direction: column;
  /* BOX    */ width: 100%; height: 100%; overflow-y: auto;
  /* SCROLL */ scrollbar-width: thin; scrollbar-color: var(--lirio) var(--carbon);
  padding-right: 0.5rem;
}

.grid {
  /* GRID   */ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  /* BOX    */ gap: 1rem; width: 100%; padding-bottom: 2rem;
}

.card {
  /* LAYOUT */ display: flex; flex-direction: column;
  /* BOX    */ background-color: var(--carbon25); border-radius: var(--radius-ss);
  /* BORDER */ border: var(--small-outline) var(--humo10);
  /* CURSOR */ cursor: pointer;
  /* MOTION */ transition: all var(--animate-fast);
  overflow: hidden; height: 100%;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--lirio);
    & .title { color: var(--cristal); }
    & img { filter: grayscale(0); transform: scale(1.05); }
  }

  &.disabled { opacity: var(--alpha-disabled); cursor: not-allowed; }
}

.card-cover {
  /* BOX    */ width: 100%; aspect-ratio: 16/9; overflow: hidden;
  /* FILL   */ background-color: var(--carbon); border-bottom: var(--small-outline) var(--humo10);
  
  & img {
    width: 100%; height: 100%; object-fit: cover;
    filter: grayscale(1); transition: all var(--animate-mid);
  }
}

.placeholder-img {
  display: flex; align-items: center; justify-content: center;
  width: 100%; height: 100%; color: var(--humo25); font-size: 2rem;
}

.card-info {
  /* BOX    */ padding: 0.8rem; display: flex; flex-direction: column; gap: 0.5rem; flex-grow: 1;
}

.date {
  /* FONT   */ font-size: 0.7rem; font-family: var(--font-mono); color: var(--humo50);
}

.title {
  /* FONT   */ font-size: 0.9rem; margin: 0; font-weight: normal; color: var(--humo);
  /* TEXT   */ overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-clamp: 2;
  line-height: 1.3;
  transition: color var(--animate-fast);
}

.tags {
  /* LAYOUT */ display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: auto;
}

.tag {
  /* BOX    */ padding: 0.1rem 0.3rem; border-radius: 2px;
  /* FILL   */ background-color: var(--humo10); color: var(--lirio);
  /* FONT   */ font-size: 0.6rem;
}

.gallery-footer {
  /* LAYOUT */ display: flex; justify-content: center; align-items: center;
  /* BOX    */ padding: 1rem 0; gap: 1rem; margin-top: auto;
  /* FONT   */ color: var(--humo); font-family: var(--font-mono);
}

.navbutton {
  /* CURSOR */ cursor: pointer;
  /* BOX    */ padding: 0rem .5rem;
  /* FILL   */ background-color: transparent; color: var(--lirio);
  /* BORDER */ border: none; border-radius: var(--radius-xs); box-shadow: var(--shadow-border) var(--lirio25);
  /* FONT   */ font-size: 1.2rem;
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { background-color: var(--humo25); }
  &:disabled { cursor: not-allowed; opacity: var(--alpha-disabled); }
}

/* Scrollbar styling */
.gallery-container::-webkit-scrollbar { width: 4px; }
.gallery-container::-webkit-scrollbar-thumb { background-color: var(--lirio); border-radius: 4px; }
.gallery-container::-webkit-scrollbar-track { background-color: var(--carbon); }
</style>