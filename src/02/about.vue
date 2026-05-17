<script setup> 
import { ref, computed, onMounted } from 'vue'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'
const authorpic = '/assets/kaste.webp'

const store           = useStore()                                                                                                    // initializes global store
const { t }           = storeToRefs(store)

const { activeFilter, userStatus, currentPost } = storeToRefs(store)                                                                  // imports refs from main store

const displayFilter = computed(() => currentPost.value?.type || activeFilter.value)                                                   // show note type when reading, else active filter

const currentTagline  = ref('')

onMounted(() => {
  const taglines = t.value.about.taglines
  const randomIndex = Math.floor(Math.random() * taglines.length)
  currentTagline.value = taglines[randomIndex]
})

</script>

<template> 

  <div class="about">

    <div class="profile-head">

      <img class="profilepic" :src="authorpic" alt="foto de perfil" title="foto de perfil"/>

      <span class="tagline" v-if="currentTagline">{{ currentTagline }}</span>

      <div class="user-status">
        
        <span class="status-emoji" aria-hidden="true">{{ userStatus.emoji }}</span>
        <span class="status-message">{{ userStatus.message }}</span>
        
      </div>

    </div>

    <template v-for="section in ['full', 'diseño', 'desarrollo', 'musica', 'textos', 'juegos']" :key="section">

      <div v-if="displayFilter === section">

        <p v-html="t.about.sections[section]"></p>

        <br><hr><br>

        <p v-html="t.about.footers[section]"></p> <br>

      </div>

    </template>

  </div>

</template>

<style scoped> 

.about { 

  /* LAYOUT */ display: flex; flex-direction: column; text-align: center;
  /* BOX    */ z-index: 1; width: 100%; padding: 0rem 2rem 0rem 2rem; gap: 1.25rem; overflow-wrap: break-word;
  /* FILL   */ color: var(--humo);
  /* FONT   */ font-size: 1rem; line-height: 1.5; word-break: break-word;

}

.profile-head   { display: flex; flex-direction: column; position: relative; justify-content: center; align-items: center; gap: 1.5rem; }

.profilepic     { 

  /* LAYOUT */ border-radius: 50%;
  /* BOX    */ width: 5rem; height: 5rem;
  /* FONT   */ align-self: center;
  /* BORDER */ border: var(--small-outline) var(--humo25);

}

.tagline        { 

  /* FILL   */ background: linear-gradient(125deg, var(--cristal), var(--lirio));
  /* FONT   */ font-style: italic;
  /* WEBKIT */ -webkit-text-fill-color: transparent; -webkit-background-clip: text; background-clip: text;

}

.user-status    { 

  /* LAYOUT */ display: inline-flex; align-items: center; white-space: nowrap; z-index: 5;
  /* BOX    */ gap: 0.35rem; padding-left: .65rem; padding-right: .65rem; padding-top: .5rem; padding-bottom: .5rem;
  /* BORDER */ border: var(--small-outline) var(--lirio50); border-radius: 9999px;
  /* FILL   */ background-color: var(--carbon);
  
}

.status-emoji   {

  /* LAYOUT */ text-align: center;
  /* FONT   */ line-height: 1;
  /* FILL   */ color: var(--lirio);

}

.status-message {

  /* FONT   */ font-family: var(--font-mono); font-weight: bold; line-height: 1;
  /* FILL   */ color: var(--humo);
  
}

@media (max-width: 1080px) { .about { padding-bottom: 4rem; } }

@container post-viewer (min-width: 0px) { .about, .tagline, .user-status { font-size: clamp(0.50rem, 2.25cqw, 1.35rem); } }

</style>