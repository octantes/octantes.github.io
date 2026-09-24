import { createRouter, createWebHistory } from 'vue-router'
import Octantes from '../00/octantes.vue'
import Portfolio from '../00/portfolio.vue'

const routes = [

  { path: '/portfolio',      component: Portfolio }, // opens the portfolio page
  { path: '/portal',         component: Octantes  }, // opens the portal
  { path: '/about',          component: Octantes  }, // opens the portal's about
  { path: '/info',           component: Octantes  }, // opens the portal's about in spanish
  { path: '/:type/:slug',    component: Octantes  }, // opens a specific note
  { path: '/:filterType',    component: Octantes  }, // opens a section - direct load opens its about
  { path: '/',               component: Octantes  }, // opens the portal page
  { path: '/:catchAll(.*)',  component: Octantes  }  // keep at the end

]

const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })

export default router