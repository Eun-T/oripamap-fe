import { createRouter, createWebHistory } from 'vue-router'
import Map from '@/pages/Map.vue'
import MyPage from '@/pages/MyPage.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/map',
    },
    {
      path: '/map',
      name: 'map',
      component: Map,
    },
    {
      path: '/place/:publicId',
      name: 'place',
      component: Map,
    },
    {
      path: '/my',
      component: MyPage,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const authStore = useAuthStore()
  if (!authStore.user) await authStore.fetchMe()

  return authStore.user ? true : '/map'
})

export default router
