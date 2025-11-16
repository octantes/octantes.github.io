import { createRouter, createWebHistory } from 'vue-router'
import Content from '../01/content.vue'

const routes = [

  {
    path: '/',
    component: Content
  },

  {
    path: '/:filterType',
    component: Content,
    props: route => ({ filterType: route.params.filterType })
  },

  {
    path: '/:type/:slug',
    component: Content,
    props: route => ({ slug: route.params.slug, type: route.params.type }) // pasa el slug como prop para content
  },

  {
    path: '/:catchAll(.*)',
    component: Content,
    props: { slug: '404' } // mantener siempre al final
  }

]

const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })

export default router