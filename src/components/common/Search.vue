<template>
  <div class="search-container" ref="searchContainer">
    <div class="search-input-wrap">
      <input
        ref="searchInput"
        class="search-input"
        type="text"
        :value="keyword"
        placeholder="매장, 지역, 지점명 검색"
        @input="handleInput"
        @keyup.down.prevent="moveDown"
        @keyup.up.prevent="moveUp"
        @keyup.enter.prevent="handleEnter"
        @keyup.esc="closeAutocomplete"
        @focus="isFocused = true"
      />

      <button type="button" class="search-button" @click="handleSearch">
        <FontAwesomeIcon :icon="faMagnifyingGlass" />
      </button>
    </div>

    <ul v-if="isFocused && visibleSearchResults.length > 0" ref="resultList" class="search-results">
      <li
        v-for="(place, index) in visibleSearchResults"
        :key="place.id"
        :data-index="index"
        class="search-result-item"
        :class="{ active: selectedIndex === index }"
        @mouseenter="selectedIndex = index"
        @click="selectPlace(place)"
      >
        <strong>{{ place.name }}</strong>
        <span>{{ place.branchName }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {  faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

import { usePlaceStore } from '@/stores/placeStore'

const keyword = ref('')
const isFocused = ref(false)
const selectedIndex = ref(-1)

const resultList = ref(null)
const searchContainer = ref(null)
const searchInput = ref(null)

const placeStore = usePlaceStore()

let timer = null

// 현재 선택된 장소는 자동완성 결과에서 제외
const visibleSearchResults = computed(() => {
  const selectedId = placeStore.selectedPlace?.id
  const selectedType = placeStore.selectedType

  return placeStore.searchResults.filter((place) => {
    const isNotSelected = place.id !== selectedId

    const matchesType = selectedType === 'ALL' || place.type === selectedType

    return isNotSelected && matchesType
  })
})

// 검색어 debounce
watch(keyword, (value) => {
  clearTimeout(timer)

  selectedIndex.value = -1

  timer = setTimeout(async () => {
    const searchKeyword = value.trim()

    if (!searchKeyword) {
      placeStore.clearSearchResults()
      return
    }

    try {
      await placeStore.searchPlaceList(searchKeyword)
      isFocused.value = true
    } catch (error) {
      console.error('장소 검색 실패:', error)
      placeStore.clearSearchResults()
    }
  }, 200)
})

// input 입력
const handleInput = (event) => {
  keyword.value = event.target.value
}

// 현재 선택된 자동완성 항목이 보이도록 스크롤
const scrollToSelected = () => {
  if (!resultList.value || selectedIndex.value < 0) {
    return
  }

  const selectedItem = resultList.value.querySelector(`[data-index="${selectedIndex.value}"]`)

  selectedItem?.scrollIntoView({
    block: 'nearest',
  })
}

// 아래 방향키
const moveDown = () => {
  const length = visibleSearchResults.value.length

  if (length === 0) {
    return
  }

  isFocused.value = true

  selectedIndex.value = (selectedIndex.value + 1) % length

  scrollToSelected()
}

// 위 방향키
const moveUp = () => {
  const length = visibleSearchResults.value.length

  if (length === 0) {
    return
  }

  isFocused.value = true

  if (selectedIndex.value <= 0) {
    selectedIndex.value = length - 1
  } else {
    selectedIndex.value -= 1
  }

  scrollToSelected()
}

// Enter
const handleEnter = () => {
  const results = visibleSearchResults.value

  if (results.length > 0) {
    const index = selectedIndex.value >= 0 ? selectedIndex.value : 0

    selectPlace(results[index])
    return
  }

  handleSearch()
}

// 검색 버튼 클릭
const handleSearch = async () => {
  const searchKeyword = keyword.value.trim()

  if (!searchKeyword) {
    return
  }

  await placeStore.searchPlaceList(searchKeyword)

  const results = visibleSearchResults.value

  if (results.length > 0) {
    selectPlace(results[0])
  }
}

// 장소 선택
const selectPlace = (place) => {
  placeStore.selectPlace(place)

  resetSearch()
}

// 검색 상태 초기화
const resetSearch = () => {
  keyword.value = ''

  placeStore.clearSearchResults()

  isFocused.value = false
  selectedIndex.value = -1
}

// ESC
const closeAutocomplete = () => {
  isFocused.value = false
  selectedIndex.value = -1
}

// 검색창 바깥 클릭
const handleClickOutside = (event) => {
  if (!searchContainer.value?.contains(event.target)) {
    searchInput.value?.blur()
    closeAutocomplete()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)

  clearTimeout(timer)
})
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
}

.search-input-wrap {
  display: flex;
  align-items: center;

  width: 100%;
  height: 40px;

  box-sizing: border-box;

  background: #fff;

  border: 2px solid #635bff;
  border-radius: 2px;

  overflow: hidden;
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 100%;

  padding: 0 14px;

  border: none;
  outline: none;

  background: transparent;

  color: #222;
  font-size: 16px;
  font-weight: 500;
}

.search-input::placeholder {
  color: #999;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  width: 46px;
  height: 100%;

  padding: 0;

  border: none;

  background: #635bff;
  color: #fff;

  font-size: 17px;

  cursor: pointer;

  transition: background 0.15s ease;
}

.search-button:hover {
  background: #5147f5;
}

.search-results {
  position: absolute;
  top: 52px;
  left: 0;

  width: 100%;
  max-height: 300px;

  padding: 6px 0;
  margin: 0;

  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #c7cbd1 transparent;
  list-style: none;

  background: #fff;

  border: 1px solid #e5e7eb;
  border-radius: 8px;

  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);

  z-index: 500;
}

.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.search-results::-webkit-scrollbar-thumb {
  background: #c7cbd1;
  border-radius: 999px;
}

.search-result-item {
  display: flex;
  flex-direction: column;
  gap: 3px;

  padding: 10px 12px;

  cursor: pointer;

  transition: background-color 0.15s ease;
}

.search-result-item:hover,
.search-result-item.active {
  background: #f6f5ff;
}

.search-result-item strong {
  color: #222;
  font-size: 14px;
}

.search-result-item span {
  color: #888;
  font-size: 12px;
}

.search-result-item.active strong {
  color: #635bff;
}
</style>
