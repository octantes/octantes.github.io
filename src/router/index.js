import { createRouter, createWebHistory } from 'vue-router'
import Content from '../visores/content.vue'

const routes = [
  {
    path: '/',
    component: Content
  },
  {
    path: '/:slug',
    component: Content,
    props: true // pasa el slug como prop
  },
  {
    path: '/:catchAll(.*)',
    component: Content,
    props: { slug: '404' } // fallback para rutas inexistentes
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router