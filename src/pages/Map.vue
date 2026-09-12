<template>
  <div class="page" :class="{ 'my-route': isMyRoute }">
    <AppHeader
      class="map-app-header"
      @open-login="authModal = 'login'"
      @open-settings="openSettings"
    />

    <div class="map-page">
      <div v-if="!isMyRoute" class="map-search-header">
        <div ref="mobileFilter" class="mobile-filter">
          <button
            type="button"
            class="mobile-filter-button"
            aria-haspopup="menu"
            :aria-expanded="isMobileFilterOpen"
            :aria-label="'장소 유형 필터: ' + mobileFilterLabel"
            @click="isMobileFilterOpen = !isMobileFilterOpen"
          >
            <SlidersHorizontal aria-hidden="true" />
            <span>{{ mobileFilterLabel }}</span>
          </button>
          <div v-if="isMobileFilterOpen" class="mobile-filter-menu" role="menu">
            <button
              v-for="option in mobileFilterOptions"
              :key="option.type"
              type="button"
              role="menuitemradio"
              :aria-checked="placeStore.selectedType === option.type"
              :class="{ active: placeStore.selectedType === option.type }"
              @click="selectMobileFilter(option.type)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <Search />
      </div>

      <Transition name="auth-slide">
        <BaseModal v-if="authModal" @close="authModal = null">
          <template #header>
            <div class="auth-header">
              <template v-if="displayedAuthModal === 'login'">
                <h1>로그인</h1>
                <p>오리파맵을 더 편리하게 이용해보세요.</p>
              </template>

              <template v-else>
                <h1>회원가입</h1>
                <p>오리파맵 계정을 만들어보세요.</p>
              </template>
            </div>
          </template>

          <LoginForm
            v-if="displayedAuthModal === 'login'"
            @close="authModal = null"
            @open-signup="authModal = 'signup'"
          />

          <SignupForm v-else @open-login="authModal = 'login'" />
        </BaseModal>
      </Transition>

      <RouterView v-slot="{ Component }">
        <component :is="Component" class="route-panel" />
      </RouterView>

      <MapView class="map-view" @ready="handleMapReady" />
    </div>
    <section v-if="isSettingsOpen" class="mobile-settings" aria-label="설정">
      <button type="button" @click="isSettingsOpen = false" aria-label="설정 닫기">닫기</button>
      <h2>설정</h2>
      <p>설정 기능을 준비 중입니다.</p>
    </section>
    <BottomNavigation
      v-if="!isMyRoute"
      :active-tab="activeMobileTab"
      @select="selectMobileTab"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SlidersHorizontal } from '@lucide/vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import MapView from '@/components/MapView.vue'
import Search from '@/components/common/Search.vue'
import BaseModal from '@/components/common/login/BaseModal.vue'
import LoginForm from '@/components/common/login/LoginForm.vue'
import SignupForm from '@/components/common/login/SignupForm.vue'

import { useAuthStore } from '@/stores/authStore'

import { usePlaceStore } from '@/stores/placeStore'
import AppHeader from '@/components/common/AppHeader.vue'

const isLoginOpen = ref(false)
const isSignupOpen = ref(false)
const authModal = ref(null)
// 닫히는 애니메이션 중에도 현재 폼을 유지합니다.
const displayedAuthModal = ref('login')
watch(
  authModal,
  (value) => {
    if (value) displayedAuthModal.value = value
  },
  { flush: 'sync' },
)

const placeStore = usePlaceStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const placesReady = ref(false)
const isSettingsOpen = ref(false)
const isMobileFilterOpen = ref(false)
const mobileFilter = ref(null)
const isMyRoute = computed(() => route.path.startsWith('/my'))
const mobileFilterOptions = [
  { type: 'ALL', label: '전체' },
  { type: 'ORIPA', label: '오리파' },
  { type: 'POKEMON_VENDING', label: '자판기' },
]
const mobileFilterLabel = computed(
  () =>
    mobileFilterOptions.find((option) => option.type === placeStore.selectedType)?.label || '전체',
)
const activeMobileTab = computed(() => (isSettingsOpen.value ? 'settings' : 'map'))
const selectMobileTab = (tab) => {
  isSettingsOpen.value = tab.id === 'settings'
}
const selectMobileFilter = (type) => {
  placeStore.setType(type)
  isMobileFilterOpen.value = false
}
const closeMobileFilterOnOutsideClick = (event) => {
  if (isMobileFilterOpen.value && !mobileFilter.value?.contains(event.target)) {
    isMobileFilterOpen.value = false
  }
}

const openSettings = () => router.push({ name: 'my-settings' })

const syncRouteSelection = (publicId) => {
  if (publicId == null) {
    placeStore.clearSelectedPlace()
    return Promise.resolve()
  }

  return placeStore.selectPlaceByPublicId(publicId)
}

watch(
  [() => route.name, () => route.params.publicId],
  ([routeName, publicId]) => {
    if (placesReady.value && ['map', 'place'].includes(routeName)) syncRouteSelection(publicId)
  },
)

const handleMapReady = async () => {
  placesReady.value = true
  if (['map', 'place'].includes(route.name)) await syncRouteSelection(route.params.publicId)
}

onMounted(() => {
  authStore.fetchMe()
  document.addEventListener('click', closeMobileFilterOnOutsideClick)
})

onBeforeUnmount(() => document.removeEventListener('click', closeMobileFilterOnOutsideClick))
</script>

<style scoped>
.page {
  width: 100vw;
  height: 100vh;
  padding-left: 65px;

  overflow: hidden;
}

.map-page {
  position: relative;
  display: flex;

  width: 100%;
  height: 100vh;
}

.map-view {
  flex: 1;
  min-width: 0;
  height: 100%;
}

.route-panel {
  position: relative;
  z-index: 100;
  flex: 0 0 390px;
  width: 390px;
  height: 100%;
}

.map-search-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 380px;
  height: 84px;

  display: flex;
  align-items: center;

  padding: 0 20px;
  box-sizing: border-box;

  z-index: 200;
}

.mobile-settings {
  display: none;
}
.mobile-filter {
  display: none;
}

@media (max-width: 768px) {
  .page {
    --mobile-nav-height: calc(68px + env(safe-area-inset-bottom, 0px));
    --mobile-header-height: calc(56px + env(safe-area-inset-top, 0px));
    position: relative;
    width: 100vw;
    height: 100dvh;
    padding-left: 0;
    overflow: hidden;
  }
  .map-page {
    width: 100%;
    height: calc(100dvh - var(--mobile-nav-height));
  }
  .map-view {
    flex-basis: 100%;
    width: 100%;
  }

  .map-app-header {
    display: none;
  }

  .my-route .map-app-header {
    display: flex;
  }

  .my-route .route-panel {
    position: absolute;
    inset: 0;
    z-index: 300;
    width: 100%;
    height: 100%;
  }

  .my-route .map-view {
    visibility: hidden;
  }

  .map-search-header {
    top: 0;
    gap: 8px;
    width: 100%;
    margin-top: 15px;
    height: calc(64px + env(safe-area-inset-top, 0px));
    padding: env(safe-area-inset-top, 0px) max(12px, env(safe-area-inset-right)) 0
      max(12px, env(safe-area-inset-left));
  }
  .mobile-filter {
    position: relative;
    display: block;
    flex: 0 0 68px;
  }
  .mobile-filter-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    width: 68px;
    height: 48px;
    padding: 0;
    border: 1px solid #dedee8;
    border-radius: 4px;
    background: #635bff;
    color: #fff;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.16);
    cursor: pointer;
  }
  .mobile-filter-button svg {
    width: 16px;
    height: 16px;
  }
  .mobile-filter-button span {
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
  }
  .mobile-filter-menu {
    position: absolute;
    top: 55px;
    left: 0;
    z-index: 500;
    width: 124px;
    padding: 6px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 8px 22px rgb(0 0 0 / 14%);
  }
  .mobile-filter-menu button {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #374151;
    font: inherit;
    font-size: 14px;
    text-align: left;
    cursor: pointer;
  }
  .mobile-filter-menu button:hover {
    background: #f7f7f8;
  }
  .mobile-filter-menu button.active {
    background: #f0efff;
    color: #635bff;
    font-weight: 700;
  }
  .map-search-header :deep(.search-container) {
    flex: 1;
    min-width: 0;
  }
  .map-search-header:focus-within {
    z-index: 400;
  }
  :deep(.search-results) {
    max-height: min(
      300px,
      calc(100dvh - env(safe-area-inset-top, 0px) - var(--mobile-nav-height) - 76px)
    );
    overscroll-behavior-y: contain;
  }
  .mobile-settings {
    display: block;
    position: absolute;
    inset: 0 0 var(--mobile-nav-height);
    z-index: 450;
    padding: calc(24px + env(safe-area-inset-top, 0px)) 24px 24px;
    background: #fff;
  }
  .mobile-settings button {
    float: right;
    padding: 10px;
    border: 0;
    border-radius: 8px;
    background: #f3f2ff;
    color: #635bff;
  }
}
</style>
