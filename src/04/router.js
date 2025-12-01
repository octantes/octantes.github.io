import { createRouter, createWebHistory } from 'vue-router'
import Content from '../01/content.vue'

const routes = [

  { path: '/:type/:slug', component: Content, props: route => ({ slug: route.params.slug, type: route.params.type }) }, // sends slug to content as prop
  { path: '/:filterType', component: Content, props: route => ({ filterType: route.params.filterType }) },
  { path: '/', component: Content },
  { path: '/:catchAll(.*)', component: Content, props: { slug: '404' } } // keep at the end

]

const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })

export default router