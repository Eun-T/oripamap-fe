<template>
  <div class="map-filter">
    <button
      type="button"
      class="filter-button"
      @click="isOpen = !isOpen"
    >
      필터
    </button>

    <div
      v-if="isOpen"
      class="filter-menu"
    >
      <button
        type="button"
        class="filter-option"
        :class="{ active: placeStore.selectedType === 'ALL' }"
        @click="selectType('ALL')"
      >
        전체
      </button>

      <button
        type="button"
        class="filter-option"
        :class="{ active: placeStore.selectedType === 'POKEMON_VENDING' }"
        @click="selectType('POKEMON_VENDING')"
      >
        자판기
      </button>

      <button
        type="button"
        class="filter-option"
        :class="{ active: placeStore.selectedType === 'ORIPA' }"
        @click="selectType('ORIPA')"
      >
        오리파
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePlaceStore } from '@/stores/placeStore'

const isOpen = ref(false)

const placeStore = usePlaceStore()

const selectType = (type) => {
  placeStore.setType(type)
  isOpen.value = false
}
</script>

<style scoped>
.map-filter {
  position: relative;
}

.filter-button {
  width: 56px;
  height: 42px;

  border: 1px solid #ddd;
  border-radius: 8px;

  background: #fff;
  color: #333;

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;

  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
}

.filter-menu {
  position: absolute;
  top: 50px;
  right: 0;

  width: 120px;

  padding: 6px;

  background: #fff;

  border: 1px solid #e5e5e5;
  border-radius: 10px;

  box-shadow: 0 6px 20px rgb(0 0 0 / 14%);
}

.filter-option {
  width: 100%;
  height: 38px;

  padding: 0 12px;

  border: none;
  border-radius: 6px;

  background: transparent;

  text-align: left;

  font-size: 14px;

  cursor: pointer;
}

.filter-option:hover {
  background: #f5f5f5;
}

.filter-option.active {
  background: #fff0f2;
  color: #ff3042;
  font-weight: 700;
}
</style>
