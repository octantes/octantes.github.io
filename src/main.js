import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './04/router.js'
import App from './octantes.vue'
import Gtag from 'vue-gtag'
import './04/baseline.css'
import './04/content.css'

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)

app.use(Gtag, { config: { id: 'G-8LPD65HMJ8' } }, router)

app.mount('#octantes')