<script setup> 
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()                                                                                                            // handles note open route
const btcPrice = ref('---')                                                                                                           // btc price fetch result
const latestPost = ref({ title: 'cargando...', url: '' })                                                                             // latest note fetch result
const currentTime = ref('--:--')                                                                                                      // current time fetch result
const barContent = ref('/ '.repeat(300))                                                                                              // progress bar animation content

let timeInterval = null                                                                                                               // time update interval
let btcInterval = null                                                                                                                // btc update interval

function openLatest() { if (latestPost.value.url) { router.push(latestPost.value.url) } }

function fetchTime() {                                                                                                                // fetch and update current time 

  const now = new Date()

  currentTime.value = now.toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })

}

async function fetchLatest() { 

  try {

    const response = await fetch('/index.json')
    if (!response.ok) throw new Error('no se encontró el index.json')
    const index = await response.json()
    if (index.length > 0) { const cleanUrl = index[0].url.replace(/^\/posts/, ''); latestPost.value = { title: index[0].title, url: cleanUrl } }

  } catch (e) { console.error('error buscando la última nota:', e); latestPost.value.title = 'error cargando ultima nota' }

}

async function fetchBTC() { 

  try {

    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    if (!response.ok) throw new Error('la respuesta de la api falló')
    const data = await response.json()
    const price = data.bitcoin.usd
    const formattedPrice = Math.floor((price / 1000) * 10) / 10
    btcPrice.value = `${formattedPrice}K`

  } catch (e) { console.error('error buscando el precio de btc:', e); btcPrice.value = 'error' }

}

onMounted(() => { 

  fetchLatest() ;
  fetchBTC()    ; btcInterval    = setInterval(fetchBTC, 60000);
  fetchTime()  ; timeInterval   = setInterval(fetchTime, 15000);

})

onUnmounted(() => { clearInterval(timeInterval); clearInterval(btcInterval) })

</script>

<template> 

  <div class="statusbar">

    <div class="stleft">

      <a href="#" @click.prevent="openLatest">ultima nota - {{ latestPost.title }}</a>

    </div>

    <div class="stcenter">
      <div class="progress-bar">
        <div class="progress-track">{{ barContent }}</div>
      </div>
    </div>
    
    <div class="stright">

      <span>BTC: {{ btcPrice }}</span>
      <span>//</span>
      <span>{{ currentTime }}</span>

    </div>

  </div>

</template>

<style scoped> 

.statusbar { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: flex; justify-content: space-between; align-items: center;
  /* BOX    */ min-width: 0; width: 100%; padding: 1rem 1.5rem; gap: 1.5rem; overflow: hidden;
  /* FILL   */ background-color: var(--carbon); color: var(--humo);
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-xs);
  
}

.stcenter { 

  /* LAYOUT */ flex-grow: 1;
  /* BOX    */ min-width: 0; padding: 0.25rem 0;

}

.stleft, .stright { 

  /* LAYOUT */ display: flex; flex-shrink: 0; align-items: center;
  /* BOX    */ min-width: 0; gap: 1rem; overflow: hidden;
  /* FILL   */ color: var(--humo);
  /* FONT   */ white-space: nowrap;

  & a {

    /* BOX    */ min-width: 0; overflow: hidden;
    /* FONT   */ text-overflow: ellipsis; white-space: nowrap;

  }

}

.stleft { margin-bottom: .25rem; }

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

</style>