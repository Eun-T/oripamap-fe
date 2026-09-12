<template>
  <div class="map-side-panel">
    <PlaceSidebar :place="placeStore.selectedPlace" @close="closePlace" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceSidebar from '@/components/PlaceSidebar.vue'
import { usePlaceStore } from '@/stores/placeStore'

const router = useRouter()
const placeStore = usePlaceStore()
const closePlace = () => router.push({ name: 'map' })
</script>

<style scoped>
.map-side-panel {
  display: contents;
}
</style>
