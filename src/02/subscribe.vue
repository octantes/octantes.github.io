<script setup> 
import { computed } from 'vue'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const store = useStore()                                                                                                              // initializes global store

const { subEmail, subHoney, subMessage, subState } = storeToRefs(store)                                                               // imports refs from main store

const submitButtonText = computed(() => {                                                                                             // switch for message and button 

  switch (subState.value) {

    case 'success': return '     ✓     '
    case 'error':   return '     ✘     '

    default:        return 'suscribirme'

  }

})

function handleSubscription(e) { if (e) e.preventDefault(); store.emitSub() }                                                         // validate and emit subscription

</script>

<template> 

  <div class="subscribe">

    <div class="cta">querés enterarte cuando subo algo nuevo? sumate a la lista de mails!</div>

    <div class="form">

      <input class="honeypot" type="text"  v-model="subHoney" name="user"  tabindex="-1" autocomplete="off"/>
      <input class="textbox"  type="email" v-model="subEmail" name="email" :placeholder="subMessage" required :class="{ [subState]: subState !== 'default'}" />

      <div class="submit" :class="{ [subState]: subState !== 'default' }" @click="handleSubscription">{{ submitButtonText }}</div>

    </div>

  </div>

</template>

<style scoped> 

.subscribe { 

  /* LAYOUT */ display: flex; flex-direction: column; 
  /* BOX    */ padding: 1rem; gap: 1rem;
  /* FONT   */ font-size: 0.8vw;
  
}

.cta { 

  /* LAYOUT */ text-align: center;
  /* FONT   */ font-style: italic;
  /* FILL   */ color: var(--humo);

}

.form { 
  
  /* LAYOUT */ display: flex; flex-direction: row; gap: 1rem; justify-content: center;
  /* BOX    */ padding: 1rem;
  /* FILL   */ color: var(--humo);

}

.textbox { 

  /* CURSOR */ cursor: text;
  /* LAYOUT */ text-align: center;
  /* BOX    */ padding: .5rem 1rem;
  /* FILL   */ background-color: transparent; color: var(--humo);
  /* BORDER */ border: none; border-radius: var(--radius-ss); box-shadow: var(--shadow-border) var(--lirio50);
  /* FONT   */ font-family: var(--font-main); font-style: italic;
  /* MOTION */ transition: all var(--animate-fast);

  &:focus { background-color: var(--lirio25); color: var(--niebla); outline: none; box-shadow: var(--shadow-border) var(--humo25); }

}

.textbox.error   { color: var(--arcilla); box-shadow: var(--shadow-border) var(--arcilla); }
.textbox.success { color: var(--poma);    box-shadow: var(--shadow-border) var(--poma);    }
.honeypot        { display: none !important; }

.submit { 

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  /* BOX    */ padding: .5rem 1rem;
  /* FILL   */ background-color: var(--lirio); color: var(--carbon);
  /* BORDER */ border: none; border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-main); font-style: italic;
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { background-color: var(--lirio65); }

}

.submit.error   { color: var(--carbon); background-color: var(--arcilla); box-shadow: var(--shadow-border) var(--arcilla); }
.submit.success { color: var(--carbon); background-color: var(--poma);    box-shadow: var(--shadow-border) var(--poma);    }

@media (max-width: 1405px) { .subscribe { font-size: .75vw  } }
@media (max-width: 1080px) { .subscribe { font-size:   2vw; } }

</style>