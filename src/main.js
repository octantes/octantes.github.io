import { createApp } from 'vue'
import router from './04/router.js'
import App from './octantes.vue'
import './04/baseline.css'
import './04/content.css'

createApp(App).use(router).mount('#octantes')