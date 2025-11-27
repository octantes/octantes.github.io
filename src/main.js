import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './04/router.js'
import App from './octantes.vue'
import gTag from 'vue-gtag'
import './04/baseline.css'
import './04/content.css'

const pinia = createPinia()

createApp(App).use(router).use(pinia).use(gTag, { config: { id: 'G-8LPD65HMJ8' } }, router).mount('#octantes')