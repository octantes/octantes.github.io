import { createApp } from 'vue'
import router from './04/router.js'
import App from './octantes.vue'
import './style.css'

createApp(App).use(router).mount('#octantes')