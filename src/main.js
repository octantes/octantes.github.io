import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './04/router.js'
import App from './main.vue'
import './styles.css'

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)

if (!document.documentElement.classList.contains('archive')) app.mount('#octantes')