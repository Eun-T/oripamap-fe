<template>
  <div class="page">
    <AppHeader class="map-app-header" @open-login="authModal = 'login'" />

    <div class="map-page">
      <div class="map-search-header">
        <button type="button" class="mobile-filter-button" aria-label="장소 유형 필터 열기">
          <SlidersHorizontal aria-hidden="true" />
        </button>
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

      <PlaceSidebar :place="placeStore.selectedPlace" @close="closePlace" />

      <div v-if="mapError" class="map-error">지도를 불러오지 못했습니다.</div>

      <div v-else id="map"></div>
    </div>
    <section v-if="isSettingsOpen" class="mobile-settings" aria-label="설정">
      <button type="button" @click="isSettingsOpen = false" aria-label="설정 닫기">닫기</button>
      <h2>설정</h2>
      <p>설정 기능을 준비 중입니다.</p>
    </section>
    <BottomNavigation :active-tab="activeMobileTab" @select="selectMobileTab" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SlidersHorizontal } from '@lucide/vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import { loadNaverMapScript } from '@/utils/naverMapLoader'
import PlaceSidebar from '@/components/PlaceSidebar.vue'
import Search from '@/components/common/Search.vue'
import BaseModal from '@/components/common/login/BaseModal.vue'
import LoginForm from '@/components/common/login/LoginForm.vue'
import SignupForm from '@/components/common/login/SignupForm.vue'

import { useAuthStore } from '@/stores/authStore'

import { usePlaceStore } from '@/stores/placeStore'
import AppHeader from '@/components/common/AppHeader.vue'

const mapError = ref(false)
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
const activeMobileTab = computed(() =>
  isSettingsOpen.value
    ? 'settings'
    : { ALL: 'map', ORIPA: 'oripa', POKEMON_VENDING: 'vending' }[placeStore.selectedType],
)
const selectMobileTab = (tab) => {
  isSettingsOpen.value = tab.id === 'settings'
  if (tab.type) placeStore.setType(tab.type)
}

let map = null
let mapIdleListener = null

const markers = new Map()

const openPlace = (place) => {
  if (place?.publicId == null) return
  router.push({ name: 'place', params: { publicId: place.publicId } })
}

const closePlace = () => router.push({ name: 'map' })

const syncRouteSelection = (publicId) => {
  if (publicId == null) {
    placeStore.clearSelectedPlace()
    return Promise.resolve()
  }

  return placeStore.selectPlaceByPublicId(publicId)
}

const getMarkerIcon = (type, isSelected = false) => {
  if (type === 'POKEMON_VENDING') {
    return isSelected
      ? '/images/markers/vending-marker-use.png'
      : '/images/markers/vending-marker.png'
  }

  if (type === 'ORIPA') {
    return isSelected
      ? '/images/markers/vending-marker-use.png'
      : '/images/markers/oripa-marker.png'
  }

  return null
}

const getMarkerKey = (place) =>
  place.id ?? `${place.type}:${place.latitude}:${place.longitude}:${place.name}`

const getMarkerIconOptions = (place) => {
  const isSelected =
    placeStore.selectedPlace && getMarkerKey(placeStore.selectedPlace) === getMarkerKey(place)
  const iconUrl = getMarkerIcon(place.type, isSelected)

  if (!iconUrl) return null

  return {
    url: iconUrl,
    size: new window.naver.maps.Size(40, 48),
    scaledSize: new window.naver.maps.Size(40, 48),
    anchor: new window.naver.maps.Point(20, 48),
  }
}

const createMarker = (place, position) => {
  const icon = getMarkerIconOptions(place)

  const markerOptions = {
    map,
    position,
  }

  if (icon) {
    markerOptions.icon = icon
  }

  const marker = new window.naver.maps.Marker(markerOptions)

  window.naver.maps.Event.addListener(marker, 'click', () => {
    openPlace(place)
  })

  return marker
}

const syncVisibleMarkers = () => {
  if (!map) return

  const bounds = map.getBounds()
  const visibleMarkerKeys = new Set()

  placeStore.places.forEach((place) => {
    const latitude = Number(place.latitude)
    const longitude = Number(place.longitude)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return

    const matchesFilter =
      placeStore.selectedType === 'ALL' || place.type === placeStore.selectedType

    if (!matchesFilter) return

    const position = new window.naver.maps.LatLng(latitude, longitude)

    if (!bounds.hasLatLng(position)) return

    const markerKey = getMarkerKey(place)
    visibleMarkerKeys.add(markerKey)

    const cachedMarker = markers.get(markerKey)

    if (cachedMarker) {
      if (!cachedMarker.getMap()) cachedMarker.setMap(map)
      const icon = getMarkerIconOptions(place)
      if (icon) cachedMarker.setIcon(icon)
      return
    }

    markers.set(markerKey, createMarker(place, position))
  })

  markers.forEach((marker, markerKey) => {
    if (!visibleMarkerKeys.has(markerKey) && marker.getMap()) {
      marker.setMap(null)
    }
  })
}

const getPlacePosition = (place) => {
  const latitude = Number(place?.latitude)
  const longitude = Number(place?.longitude)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return new window.naver.maps.LatLng(latitude, longitude)
}

const initMap = () => {
  const center =
    getPlacePosition(placeStore.selectedPlace) || new window.naver.maps.LatLng(37.5572, 126.9245)

  map = new window.naver.maps.Map('map', {
    center,
    zoom: 15,
  })

  mapIdleListener = window.naver.maps.Event.addListener(map, 'idle', syncVisibleMarkers)
  syncVisibleMarkers()
}

watch(
  () => route.params.publicId,
  (publicId) => {
    if (placesReady.value) syncRouteSelection(publicId)
  },
)

watch(
  () => placeStore.selectedPlace,
  (place) => {
    syncVisibleMarkers()

    if (!place || !map) {
      return
    }

    const position = getPlacePosition(place)
    if (!position) return

    map.morph(position, Math.max(map.getZoom(), 15))
  },
)

watch(() => placeStore.selectedType, syncVisibleMarkers)

onMounted(async () => {
  authStore.fetchMe()

  try {
    await placeStore.fetchPlaces()
    placesReady.value = true
    await syncRouteSelection(route.params.publicId)

    await loadNaverMapScript()

    initMap()
  } catch (error) {
    console.error('네이버 지도 로딩 실패:', error)
    mapError.value = true
  }
})

onBeforeUnmount(() => {
  if (mapIdleListener) {
    window.naver.maps.Event.removeListener(mapIdleListener)
  }

  markers.forEach((marker) => marker.setMap(null))
  markers.clear()
})
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

#map {
  flex: 1;
  min-width: 0;
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
.mobile-filter-button {
  display: none;
}

@media (max-width: 768px) {
  .page {
    --mobile-nav-height: calc(68px + env(safe-area-inset-bottom, 0px));
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
  #map {
    flex-basis: 100%;
    width: 100%;
  }

  .map-app-header {
    display: none;
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
  .mobile-filter-button {
    display: grid;
    place-items: center;
    flex: 0 0 55px;
    width: 55px;
    height: 45px;
    padding: 0;
    border: 1px solid #dedee8;
    border-radius: 2px;
    background: #635bff;
    color: #fff;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.16);
    cursor: pointer;
  }
  .mobile-filter-button svg {
    width: 19px;
    height: 19px;
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
