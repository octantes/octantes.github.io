<script setup> 
import { computed, onMounted, onUnmounted } from 'vue'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const store      = useStore()                                                                                                         // setup store usage
const latestPost = computed(() => store.loadLatestPost)                                                                               // latest note fetch result

const { btcPrice, currentTime, barContent, processing } = storeToRefs(store)                                                                      // imports refs from main store

onMounted(() => { store.loadNotesIndex(); store.startStatusUpdates() })
onUnmounted(() => { store.stopStatusUpdates() })

</script>

<template> 

  <div class="statusbar" :class="{ disabled: processing }">

    <div class="stleft">

      <RouterLink :to="latestPost.url || '/'" :title="store.t.status.openLatest" :aria-label="store.t.status.openLatest">{{ latestPost.title }}</RouterLink>
      <span class="divisions">//</span>
      <a :href="'mailto:' + store.mailtoDir" :title="store.t.status.contact" :aria-label="store.t.status.contact">{{ store.t.status.contact }}</a>
      <span class="divisions">//</span>
      <RouterLink to="/portfolio" :title="store.t.status.portfolioTitle" :aria-label="store.t.status.portfolioTitle">{{ store.t.status.portfolioLabel }}</RouterLink>

    </div>

    <div class="stcenter">

      <div class="progress-bar">
        <div class="progress-track">{{ barContent }}</div>
      </div>
      
    </div>
    
    <div class="stright">

      <a :href="store.t.status.archiveLink" :title="store.t.status.archive" :aria-label="store.t.status.archive">{{ store.t.status.archive }}</a>
      <span class="btc divisions">//</span>
      <a href="/feed.xml" target="_blank" :title="store.t.status.rssTitle" :aria-label="store.t.status.rssAria">{{ store.t.status.rssLabel }}</a>
      <span class="btc divisions">//</span>
      <template v-if="btcPrice !== null">
        <span class="btc">{{ store.t.status.btcLabel }} {{ btcPrice }}</span>
        <span class="btc divisions">//</span>
      </template>
      <span>{{ currentTime }}</span>

    </div>

  </div>

</template>

<style scoped> 

.statusbar { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: flex; justify-content: space-between; align-items: center;
  /* BOX    */ min-width: 0; width: 100%; padding: .5rem 1rem; gap: 1.5rem; overflow: hidden;
  /* FILL   */ background-color: var(--carbon); color: var(--humo);
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-ss);
  /* FONT   */ font-size: 1rem;
  
}

.stcenter { 

  /* LAYOUT */ flex-grow: 1; flex-basis: 0;
  /* BOX    */ min-width: 0; padding: 0.25rem 0;

}

.stleft { 

  /* LAYOUT */ display: flex; flex-shrink: 1; align-items: center;
  /* BOX    */ min-width: 0; height: 2rem; gap: 1rem; overflow: hidden;
  /* FILL   */ color: var(--humo);
  /* FONT   */ white-space: nowrap;

  & a {

    /* BOX    */ min-width: 0; overflow: hidden;
    /* FONT   */ text-overflow: ellipsis; white-space: nowrap;

  }

}

.stright { 

  /* LAYOUT */ display: flex; flex-shrink: 0; align-items: center;
  /* BOX    */ min-width: 0; height: 2rem; gap: 1rem; overflow: hidden;
  /* FILL   */ color: var(--humo);
  /* FONT   */ white-space: nowrap;

  & a {

    /* BOX    */ min-width: 0; overflow: hidden;
    /* FONT   */ text-overflow: ellipsis; white-space: nowrap;

  }

}

.divisions { color: var(--humo50); }

.progress-bar { 

  /* CURSOR */ user-select: none;
  /* BOX    */ width: 100%; overflow: hidden;
  /* FILL   */ background-color: var(--carbon); color: var(--humo50);
  /* BORDER */ border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-mono); line-height: 1.5; white-space: nowrap;

  /* MASK   */
  -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
  mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
  
}

.progress-track { 
  
  /* LAYOUT */ display: inline-block;
  /* MOTION */ animation: scroll-progress 4s linear infinite;

}

@keyframes scroll-progress { from { transform: translateX(0); } to { transform: translateX(-8ch); } }

.statusbar.disabled { pointer-events: none; opacity: var(--alpha-disabled); }

@media (max-width: 768px) { .stleft > :nth-child(-n+2) { display: none; } }
@media (max-width: 590px) { .stcenter { display: none; }       .btc { display: none; }           }
@media (max-width: 432px) { .stleft { display: flex; } .stleft > :nth-child(-n+2) { display: none; } .stleft > .divisions { display: none; } .stright > :nth-child(-n+4) { display: none; } .statusbar { justify-content: center; } }

</style>