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
    if (index.length > 0) { const cleanUrl = index[0].url.replace(/^\/posts/, ''); latestPost.value = { title: index[0].title, url: cleanUrl } }

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