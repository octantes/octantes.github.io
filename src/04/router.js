import { createRouter, createWebHistory } from 'vue-router'
import Octantes from '../00/octantes.vue'
import Portfolio from '../00/portfolio.vue'

const routes = [

  { path: '/portfolio',      component: Portfolio }, // opens custom portfolio component
  { path: '/:type/:slug',    component: Octantes  }, // opens a note
  { path: '/:filterType',    component: Octantes  }, // opens a section, a direct load opens its about
  { path: '/',               component: Octantes  },
  { path: '/:catchAll(.*)',  component: Octantes  }  // keep at the end

]

const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })

export default router
