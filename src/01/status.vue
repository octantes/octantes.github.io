<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const btcPrice = ref('---')
const latestPost = ref({ title: 'cargando...', url: '' })
const currentTime = ref('--:--')
const isLive = ref(false)
const liveUrl = ref('#')
const barContent = ref('/ '.repeat(300))

let statusInterval = null
let timeInterval = null
let btcInterval = null

const liveStatusText = computed(() => isLive.value ? 'TRANSMITIENDO EN VIVO' : 'TRANSMISION OFFLINE')
const statusIndicatorClass = computed(() => isLive.value ? 'live' : 'offline')

function openLatest() { if (latestPost.value.url) { router.push(latestPost.value.url) } }
function updateTime() { const now = new Date(); currentTime.value = now.toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour12: false, hour: '2-digit', minute: '2-digit' }) }

async function fetchStream() { 
  
  try {

    const shouldBeLive = Math.random() > 0.5
    const mockApiResponse = { isLive: shouldBeLive, url: shouldBeLive ? 'https://www.twitch.tv/octantes' : '#' }
    isLive.value = mockApiResponse.isLive
    liveUrl.value = mockApiResponse.url

  } catch (e) { console.error('error chequeando el estado en vivo:', e); isLive.value = false }

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

async function fetchLatest() { 

  try {

    const response = await fetch('/index.json')
    if (!response.ok) throw new Error('no se encontró el index.json')
    const index = await response.json()
    if (index.length > 0) { latestPost.value = { title: index[0].title, url: index[0].url } }

  } catch (e) { console.error('error buscando la última nota:', e); latestPost.value.title = 'error cargando ultima nota' }

}

onUnmounted(() => { clearInterval(statusInterval); clearInterval(timeInterval); clearInterval(btcInterval) })

onMounted(() => { 

  fetchLatest()
  fetchStream(); statusInterval = setInterval(fetchStream, 120000)
  fetchBTC(); btcInterval = setInterval(fetchBTC, 60000)
  updateTime(); timeInterval = setInterval(updateTime, 15000)

})

</script>

<template>

  <div class="statusbar">

    <div class="stleft">

      <a :href="liveUrl" target="_blank" class="live-status" :class="{ 'disabled': !isLive }">
        <div class="status-indicator" :class="statusIndicatorClass"></div>
        <span>{{ liveStatusText }}</span>
      </a>

      <span>//</span>

      <a href="#" @click.prevent="openLatest">{{ latestPost.title }}</a>

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

<style>

@media (max-width: 1080px) { button { display: none; } }

.statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem 1.5rem;
  background-color: #1B1C1C;
  color: #AAABAC;
  border: 1px solid #AAABAC25;
  border-radius: 5px;
  user-select: none;
  gap: 1.5rem;
}

.stcenter {
  flex-grow: 1;
  min-width: 0;
  padding: 0.25rem 0;
}

.stleft, .stright {
  color: #AAABAC;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.live-status { display: flex; align-items: center; gap: 0.5rem; transition: opacity 0.25s ease; }
.live-status.disabled { opacity: 0.5; pointer-events: none; cursor: default; }
.status-indicator { width: 10px; height: 10px; border-radius: 50%; border: 1px solid #AAABAC25; animation: pulse 2s infinite cubic-bezier(0.66, 0, 0, 1); }
.status-indicator.live { background-color: #8AB6BB; }
.status-indicator.offline { background-color: #986C98; }

@keyframes pulse {

  0%, 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(170, 171, 172, 0.2); }
  70%      { transform: scale(1);    box-shadow: 0 0 0 5px rgba(170, 171, 172, 0); }
  80%      { transform: scale(0.95);                                                 }

}

.progress-bar {
  width: 100%;
  background-color: #1B1C1C;
  color: #AAABAC50;
  border-radius: 5px;
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
  font-family: monospace;
  line-height: 1.5;
  box-sizing: border-box;
}

.progress-track { display: inline-block; animation: scroll-progress 4s linear infinite; }
@keyframes scroll-progress { from { transform: translateX(0); } to { transform: translateX(-8ch); } }

</style>