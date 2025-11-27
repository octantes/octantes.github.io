<script setup> 
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const router     = useRouter()                                                                                                        // handles note open route
const store      = useStore()                                                                                                         // setup store usage
const latestPost = computed(() => store.loadLatestPost)                                                                               // latest note fetch result

const { btcPrice, currentTime, barContent } = storeToRefs(store)                                                                      // imports refs from main store

function openLatest() { if (latestPost.value.url) { router.push(latestPost.value.url) } }                                             // opens latest post

onMounted(() => { store.loadNotesIndex(); store.startStatusUpdates() })
onUnmounted(() => { store.stopStatusUpdates() })

</script>

<template> 

  <div class="statusbar">

    <div class="stleft">

      <a href="#" @click.prevent="openLatest">ultima nota - {{ latestPost.title }}</a>
      <span>//</span>
      <a :href="'mailto:' + store.mailtoDir" target="_blank">contactame!</a>

    </div>

    <div class="stcenter">

      <div class="progress-bar">
        <div class="progress-track">{{ barContent }}</div>
      </div>
      
    </div>
    
    <div class="stright">

      <a href="/feed.xml" target="_blank" title="feed RSS">RSS</a>
      <span class="btc">//</span>
      <span class="btc">BTC: {{ btcPrice }}</span>
      <span class="btc">//</span>
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
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-xs);
  
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

.progress-bar { 

  /* CURSOR */ user-select: none;
  /* BOX    */ width: 100%; overflow: hidden;
  /* FILL   */ background-color: var(--carbon); color: var(--humo50);
  /* BORDER */ border-radius: var(--radius-xs);
  /* FONT   */ font-family: var(--font-mono); line-height: 1.5; white-space: nowrap;
  
}

.progress-track { 
  
  /* LAYOUT */ display: inline-block;
  /* MOTION */ animation: scroll-progress 4s linear infinite;

}

@keyframes scroll-progress { from { transform: translateX(0); } to { transform: translateX(-8ch); } }

@media (max-width: 590px) { .stcenter { display: none; } .btc { display: none; } }
@media (max-width: 312px) { .stleft { display: none; } .statusbar { justify-content: center; } }

</style>