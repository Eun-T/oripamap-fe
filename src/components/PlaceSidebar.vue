<template>
  <aside class="place-sidebar">


    <!-- 장소 선택했을 때만 -->
    <div class="place-content">
      <template v-if="place">

      <PokemonVendingDetail
        v-if="place.type === 'POKEMON_VENDING'"
        :place="place"
      />

      <OripaDetail
        v-else-if="place.type === 'ORIPA'"
        :place="place"
      />
    </template>
    </div>
  </aside>
</template>

<script setup>
import PokemonVendingDetail from './PokemonVendingDetail.vue'
import OripaDetail from './OripaDetail.vue'
defineProps({
  place: {
    type: Object,
    default: null,
  },
})

defineEmits(['close'])
</script>

<style scoped>
.place-sidebar {
  position: relative;
  flex: 0 0 380px;
  height: 100%;
  padding-top: 84px;
  box-sizing: border-box;
  z-index: 100;
  background: white;

  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.place-content {
  flex: 1;
  min-height: 0;
  padding: 0px 10px 10px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.4s ease;
}

.place-sidebar:hover .place-content {
  scrollbar-color: #c7cbd1 transparent;
}

@media (max-width: 600px) {
  .place-sidebar {
    position: absolute;
    top: 0;
    left: 0;

    flex: none;
    width: 100%;
  }
}
.place-content::-webkit-scrollbar {
  width: 6px;
}

.place-content::-webkit-scrollbar-track {
  background: transparent;
}

.place-content::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background-color 0.4s ease;
}

.place-sidebar:hover .place-content::-webkit-scrollbar-thumb {
  background: #c7cbd1;
}
</style>
