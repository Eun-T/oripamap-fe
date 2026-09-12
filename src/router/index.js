import { createRouter, createWebHistory } from 'vue-router'
import Map from '@/pages/Map.vue'
import MapSidePanel from '@/components/MapSidePanel.vue'
import MyPage from '@/pages/MyPage.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import SettingsDetailPanel from '@/components/SettingsDetailPanel.vue'
import TermsPanel from '@/components/TermsPanel.vue'
import PrivacyPolicyPanel from '@/components/PrivacyPolicyPanel.vue'
import LocationTermsPanel from '@/components/LocationTermsPanel.vue'
import InquiryPanel from '@/components/InquiryPanel.vue'
import MyInquiriesPanel from '@/components/MyInquiriesPanel.vue'
import MyInquiryDetailPanel from '@/components/MyInquiryDetailPanel.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Map,
      children: [
        {
          path: '',
          redirect: '/map',
        },
        {
          path: 'map',
          name: 'map',
          component: MapSidePanel,
        },
        {
          path: 'place/:publicId',
          name: 'place',
          component: MapSidePanel,
        },
        {
          path: 'my',
          name: 'my',
          component: MyPage,
          meta: { requiresAuth: true },
        },
        {
          path: 'my/settings',
          name: 'my-settings',
          component: SettingsPanel,
          meta: { requiresAuth: true },
        },
        {
          path: 'my/inquiries',
          name: 'my-inquiries',
          component: MyInquiriesPanel,
          meta: { requiresAuth: true },
        },
        {
          path: 'my/inquiries/:id',
          name: 'my-inquiry-detail',
          component: MyInquiryDetailPanel,
          meta: { requiresAuth: true },
        },
        {
          path: 'my/settings/terms',
          name: 'my-settings-terms',
          component: TermsPanel,
          meta: { requiresAuth: true },
        },
        {
          path: 'my/settings/privacy',
          name: 'my-settings-privacy',
          component: PrivacyPolicyPanel,
          meta: { requiresAuth: true },
        },
        {
          path: 'my/settings/location-terms',
          name: 'my-settings-location-terms',
          component: LocationTermsPanel,
          meta: { requiresAuth: true },
        },
        {
          path: 'my/settings/contact',
          name: 'my-settings-contact',
          component: InquiryPanel,
          meta: { requiresAuth: true },
        },
        {
          path: 'my/settings/:section',
          name: 'my-settings-detail',
          component: SettingsDetailPanel,
          meta: { requiresAuth: true },
        },
      ],
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
