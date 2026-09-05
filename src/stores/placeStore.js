import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getPlaces, searchPlaces } from '@/api/placeApi'

export const usePlaceStore = defineStore('place', () => {
  // API에서 받은 장소 목록
  const places = ref([])

  // 현재 선택한 장소
  const selectedPlace = ref(null)

  // 필터
  const selectedType = ref('ALL')

  // 로딩
  const loading = ref(false)

  // 에러
  const error = ref(null)

  // 검색
  const searchResults = ref([])
  const searchLoading = ref(false)

  // 필터링된 장소
  const filteredPlaces = computed(() => {
    if (selectedType.value === 'ALL') {
      return places.value
    }

    return places.value.filter((place) => place.type === selectedType.value)
  })

  // 장소 목록 API 조회
  const fetchPlaces = async () => {
    loading.value = true
    error.value = null

    try {
      places.value = await getPlaces()
      // console.log('장소 목록:', places.value)
    } catch (err) {
      console.error('장소 조회 실패:', err)
      error.value = '장소 조회에 실패했습니다.'
      places.value = []
    } finally {
      loading.value = false
    }
  }

  // 검색
  const searchPlaceList = async (keyword) => {
    const searchKeyword = keyword.trim()

    if (!searchKeyword) {
      searchResults.value = []
      return
    }

    searchLoading.value = true

    try {
      searchResults.value = await searchPlaces(searchKeyword)
    } catch (err) {
      console.error('장소 검색 실패:', err)
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }

  // 검색 결과 초기화
  const clearSearchResults = () => {
    searchResults.value = []
  }

  // 장소 목록 직접 저장
  const setPlaces = (data) => {
    places.value = data
  }

  // 마커 / 검색 결과 클릭
  const selectPlace = (place) => {
    selectedPlace.value = place
  }

  // 상세 패널 닫기
  const clearSelectedPlace = () => {
    selectedPlace.value = null
  }

  // 필터 변경
  const setType = (type) => {
    selectedType.value = type
  }

  return {
    places,
    selectedPlace,
    selectedType,
    loading,
    error,
    filteredPlaces,

    searchResults,
    searchLoading,

    fetchPlaces,
    searchPlaceList,
    clearSearchResults,

    setPlaces,
    selectPlace,
    clearSelectedPlace,
    setType,
  }
})
