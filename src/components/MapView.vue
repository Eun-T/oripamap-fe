<template>
  <div class="map-view">
    <div v-if="mapError" class="map-error">
      지도를 불러오지 못했습니다.
    </div>
    <div v-else ref="mapContainer" class="map-canvas"></div>
  </div>
</template>

<script>
let savedViewport = null
</script>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { loadNaverMapScript } from '@/utils/naverMapLoader'
import { usePlaceStore } from '@/stores/placeStore'

const emit = defineEmits(['ready'])
const router = useRouter()
const placeStore = usePlaceStore()

const mapContainer = ref(null)
const mapError = ref(false)

let map = null
let mapIdleListener = null
let resizeObserver = null

const markers = new Map()

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
  place.id ??
  `${place.type}:${place.latitude}:${place.longitude}:${place.name}`

const getMarkerIconOptions = (place) => {
  const isSelected =
    placeStore.selectedPlace &&
    getMarkerKey(placeStore.selectedPlace) === getMarkerKey(place)

  const iconUrl = getMarkerIcon(place.type, isSelected)

  if (!iconUrl) return null

  return {
    url: iconUrl,
    size: new window.naver.maps.Size(40, 48),
    scaledSize: new window.naver.maps.Size(40, 48),
    anchor: new window.naver.maps.Point(20, 48),
  }
}

const openPlace = (place) => {
  if (place?.publicId == null) return

  router.push({
    name: 'place',
    params: {
      publicId: place.publicId,
    },
  })
}

const createMarker = (place, position) => {
  const markerOptions = {
    map,
    position,
  }

  const icon = getMarkerIconOptions(place)

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

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return
    }

    const matchesFilter =
      placeStore.selectedType === 'ALL' ||
      place.type === placeStore.selectedType

    if (!matchesFilter) {
      return
    }

    const position = new window.naver.maps.LatLng(latitude, longitude)

    if (!bounds.hasLatLng(position)) {
      return
    }

    const markerKey = getMarkerKey(place)

    visibleMarkerKeys.add(markerKey)

    const cachedMarker = markers.get(markerKey)

    if (cachedMarker) {
      if (!cachedMarker.getMap()) {
        cachedMarker.setMap(map)
      }

      const icon = getMarkerIconOptions(place)

      if (icon) {
        cachedMarker.setIcon(icon)
      }

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

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  return new window.naver.maps.LatLng(latitude, longitude)
}

const rememberViewport = () => {
  if (!map) return

  const center = map.getCenter()

  savedViewport = {
    latitude: center.lat(),
    longitude: center.lng(),
    zoom: map.getZoom(),
  }
}

const initMap = () => {
  const selectedPosition = getPlacePosition(placeStore.selectedPlace)

  const savedPosition = savedViewport
    ? new window.naver.maps.LatLng(
        savedViewport.latitude,
        savedViewport.longitude,
      )
    : null

  map = new window.naver.maps.Map(mapContainer.value, {
    center:
      selectedPosition ||
      savedPosition ||
      new window.naver.maps.LatLng(37.5572, 126.9245),
    zoom: selectedPosition ? 15 : (savedViewport?.zoom ?? 15),
  })

  mapIdleListener = window.naver.maps.Event.addListener(
    map,
    'idle',
    () => {
      rememberViewport()
      syncVisibleMarkers()
    },
  )

  resizeObserver = new ResizeObserver(() => {
    if (!map) return

    const center = map.getCenter()

    window.naver.maps.Event.trigger(map, 'resize')
    map.setCenter(center)
  })

  resizeObserver.observe(mapContainer.value)

  syncVisibleMarkers()
}

watch(
  () => placeStore.selectedPlace,
  (place) => {
    syncVisibleMarkers()

    if (!place || !map) {
      return
    }

    const position = getPlacePosition(place)

    if (position) {
      map.morph(position, Math.max(map.getZoom(), 15))
    }
  },
)

watch(
  () => placeStore.selectedType,
  syncVisibleMarkers,
)

watch(
  () => placeStore.places,
  syncVisibleMarkers,
)

onMounted(async () => {
  try {
    if (placeStore.places.length === 0) {
      await placeStore.fetchPlaces()
    }

    await loadNaverMapScript()
    await nextTick()

    initMap()

    emit('ready')
  } catch (error) {
    console.error('네이버 지도 로딩 실패:', error)
    mapError.value = true
  }
})

onBeforeUnmount(() => {
  rememberViewport()

  resizeObserver?.disconnect()

  if (mapIdleListener) {
    window.naver.maps.Event.removeListener(mapIdleListener)
  }

  markers.forEach((marker) => {
    marker.setMap(null)
  })

  markers.clear()

  map = null
})
</script>

<style scoped>
.map-view,
.map-canvas {
  width: 100%;
  height: 100%;
}

.map-view {
  position: relative;
  min-width: 0;
  min-height: 0;
}

.map-error {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: #6b7280;
  background: #f7f7fa;
}
</style>