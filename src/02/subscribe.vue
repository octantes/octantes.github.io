<script setup> 
import { computed } from 'vue'
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'

const store = useStore()                                                                                                              // initializes global store

const { subEmail, subHoney, subMessage, subState, subDone } = storeToRefs(store)                                                               // imports refs from main store

const submitButtonText = computed(() => {                                                                                             // switch for message and button 

  switch (subState.value) {

    case 'success': return '✓'
    case 'error':   return '✘'

    default:        return 'suscribirme'

  }

})

function handleSubscription(e) { if (e) e.preventDefault(); store.emitSub() }                                                         // validate and emit subscription

</script>

<template> 

  <div class="subscribe">

    <template v-if="subDone">
      <div class="cta">ya estás en la lista, gracias por sumarte!</div>
    </template>

    <template v-else>

    <div class="cta" :class="{ [subState]: subState !== 'default' }">{{ subState !== 'default' ? subMessage : 'querés enterarte cuando subo algo nuevo? sumate a la lista de mails!' }}</div>

    <form class="form" @submit.prevent="handleSubscription">

      <input class="honeypot" type="text"  v-model="subHoney" name="user"  tabindex="-1" autocomplete="off" aria-hidden="true"/>
      <input class="textbox"  type="email" v-model="subEmail" name="email" :placeholder="subMessage" required :class="{ [subState]: subState !== 'default'}" title="ingresar tu correo para suscribirte" aria-label="campo para ingresar correo electrónico"/>

      <button type="submit" class="submit" :class="{ [subState]: subState !== 'default' }" :title="subState === 'default' ? 'hacer click para suscribirte' : subMessage" aria-label="botón para enviar la suscripción">{{ submitButtonText }}</button>

    </form>

    </template>

  </div>

</template>

<style scoped> 

.subscribe { 

  /* LAYOUT */ display: flex; flex-direction: column; 
  /* BOX    */ padding: 1rem; gap: 1rem;
  /* FONT   */ font-size: 1rem;
  
}

.cta {

  /* LAYOUT */ text-align: center;
  /* FONT   */ font-style: italic;
  /* FILL   */ color: var(--humo);
  /* MOTION */ transition: color var(--animate-fast);

  &.error   { color: var(--arcilla); }
  &.success { color: var(--poma);    }

}

.form { 
  
  /* LAYOUT */ display: flex; flex-direction: row; gap: 1rem; justify-content: center;
  /* BOX    */ padding-top: 1rem; padding-bottom: 1rem; padding-left: 4rem; padding-right: 4rem; width: 100%;
  /* FILL   */ color: var(--humo);

}

.textbox { 

  /* CURSOR */ cursor: text;
  /* LAYOUT */ text-align: center; flex: 1 1 auto;
  /* BOX    */ padding: .5rem 1rem; min-width: 0;
  /* FILL   */ background-color: transparent; color: var(--humo);
  /* BORDER */ border: none; border-radius: var(--radius-ss); box-shadow: var(--shadow-border) var(--lirio50);
  /* FONT   */ font-family: var(--font-main); font-style: italic; font-size: 1rem;
  /* MOTION */ transition: all var(--animate-fast);

  &:focus { background-color: var(--lirio25); color: var(--niebla); outline: none; box-shadow: var(--shadow-border) var(--humo25); }

}

.textbox.error   { color: var(--arcilla); box-shadow: var(--shadow-border) var(--arcilla); }
.textbox.success { color: var(--poma);    box-shadow: var(--shadow-border) var(--poma);    }
.honeypot        { display: none !important; }

.submit { 

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ display: flex; align-items: center; justify-content: center; flex: 0 1 auto;
  /* BOX    */ padding: .5rem 1rem; width: 10rem; max-width: 100%;
  /* FILL   */ background-color: var(--lirio); color: var(--carbon);
  /* BORDER */ border: none; border-radius: var(--radius-ss);
  /* FONT   */ font-family: var(--font-main); font-style: italic; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { background-color: var(--lirio65); }

}

.submit.error   { color: var(--carbon); background-color: var(--arcilla); box-shadow: var(--shadow-border) var(--arcilla); }
.submit.success { color: var(--carbon); background-color: var(--poma);    box-shadow: var(--shadow-border) var(--poma);    }

@media (max-width: 1405px) { .subscribe { font-size: .65rem; } }
@media (max-width: 1080px) { .subscribe { font-size:   1rem; } }

</style>