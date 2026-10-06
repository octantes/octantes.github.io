import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import Shell from './shell.vue'
import '@/styles.css'

const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:any(.*)*', component: { render: () => null } }] })

createApp(Shell).use(createPinia()).use(router).mount('#octantes')