import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Octantes from '../01/octantes.vue'
import Portfolio from '../01/portfolio.vue'
import { ROOM_WALLS } from './config.js'
import { offline } from '../03/shelf.js'

const wallPath  = `/havitat/:wall(${ROOM_WALLS.flatMap(w => [w.es, w.en]).join('|')})`
const depthPath = `${wallPath}/:thing`
const Havitat   = () => import('../01/havitat.vue')
const Vitacora  = () => import('../01/vitacora.vue')

const routes = [

  { path: '/portfolio',      component: Portfolio }, // opens the portfolio page
  { path: '/vitacora',       component: Vitacora  }, // opens the vitacora boards
  { path: '/havitat',        component: Havitat   }, // opens the havitat from intro
  { path: wallPath,          component: Havitat   }, // opens a specific havitat wall
  { path: depthPath,         component: Havitat   }, // opens a specific havitat depth
  { path: '/portal',         component: Octantes  }, // opens the portal
  { path: '/about',          component: Octantes  }, // opens the portal's about
  { path: '/info',           component: Octantes  }, // opens the portal's about in spanish
  { path: '/:type/:slug',    component: Octantes  }, // opens a specific note
  { path: '/:filterType',    component: Octantes  }, // opens a section - direct load opens its about
  { path: '/',               component: Octantes  }, // opens the portal page
  { path: '/:catchAll(.*)',  component: Octantes  }  // keep at the end

]

const router = createRouter({ history: offline ? createWebHashHistory() : createWebHistory(import.meta.env.BASE_URL), routes })

export default router