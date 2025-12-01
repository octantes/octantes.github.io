<script setup>
import { ref, computed } from 'vue'

const emailInput    = ref('')
const honeyInput    = ref('')
const message       = ref('dejá tu mail acá...')
const messageState  = ref('default')
const emailRegex    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const lhCounter     = 3
const resetTimeout  = 3000

const submitButtonText = computed(() => {

  switch (messageState.value) {

    case 'success': return '✓'
    case 'error':   return '✘'

    default:        return 'suscribirme'

  }

})

function resetState() {

  message.value = 'dejá tu mail acá...'
  messageState.value = 'default'

}

function updateState(state, text, clearInput = false) {

  messageState.value = state
  message.value = text

  if (clearInput) emailInput.value = ''
  if (state !== 'default') { setTimeout(resetState, resetTimeout) }

}

function emitSubscription(e) {

    if (e) e.preventDefault() 
    if (messageState.value !== 'default') return
    
    const email = emailInput.value
    const submissionsKey = 'subscription_count'
    const currentCount   = parseInt(localStorage.getItem(submissionsKey) || '0', 10)
    
    if (honeyInput.value)                  { updateState('success', 'mail registrado!',             true); return }
    if (!email || !emailRegex.test(email)) { updateState('error',   'ese mail no es válido!',       true); return }
    if (currentCount >= lhCounter)         { updateState('error',   'no podés registrar más mails', true); return }

    if (window.umami && typeof window.umami.track === 'function') {

        window.umami.track('suscripcion', { email: email })
        localStorage.setItem(submissionsKey, currentCount + 1)

        updateState('success', `gracias por sumarte!`, true)
        
    } else { updateState('error', 'falló el registro', true) }
    
}

</script>

<template>

  <div class="subscribe">

    <div class="cta">querés enterarte cuando subo algo nuevo? sumate a la lista de mails!</div>

    <div class="form">

      <input class="honeypot" type="text"  v-model="honeyInput" name="user"  tabindex="-1" autocomplete="off"/>
      <input class="textbox"  type="email" v-model="emailInput" name="email" :placeholder="message" required :class="{ [messageState]: messageState !== 'default'}" />

      <div class="submit" :class="{ [messageState]: messageState !== 'default' }" @click="emitSubscription">{{ submitButtonText }}</div>

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