import { createRouter, createWebHistory } from 'vue-router'
import Map from '@/pages/Map.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/map',
    },
    {
      path: '/map',
      component: Map,
    },
  ],
})

export default router