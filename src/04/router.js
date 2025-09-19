  import { createRouter, createWebHistory } from 'vue-router'
  import Content from '../01/content.vue'

  const routes = [
    {
      path: '/',
      component: Content
    },
    {
      path: '/notes/:slug',
      component: Content,
      props: true // pasa el slug como prop para content
    },
    {
      path: '/:catchAll(.*)',
      component: Content,
      props: { slug: '404' } // mantener siempre al final
    }
  ]

  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
  })

  export default router