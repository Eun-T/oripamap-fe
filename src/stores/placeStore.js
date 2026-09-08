import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getPlace, getPlaces, searchPlaces, updateOripaPlace } from '@/api/placeApi'

export const usePlaceStore = defineStore('place', () => {
  // API에서 받은 장소 목록
  const places = ref([])

  // 현재 선택한 장소
  const selectedPlace = ref(null)
  const placeDetailCache = new Map()
  const pendingPlaceDetails = new Map()

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

  const getPlaceDetail = async (placeId) => {
    if (placeId == null) return null

    const cacheKey = String(placeId)
    const listPlace = places.value.find((place) => String(place.id) === String(placeId))
    const currentPlace =
      selectedPlace.value && String(selectedPlace.value.id) === String(placeId)
        ? selectedPlace.value
        : null
    const placeWithDetail = [currentPlace, listPlace].find(
      (place) =>
        place?.type === 'ORIPA' && place.oripaPlace && typeof place.oripaPlace === 'object',
    )

    if (placeWithDetail) {
      placeDetailCache.set(cacheKey, placeWithDetail)
      return placeWithDetail
    }

    const cachedPlace = placeDetailCache.get(cacheKey)
    if (cachedPlace) return { ...listPlace, ...cachedPlace }

    let detailRequest = pendingPlaceDetails.get(cacheKey)

    if (!detailRequest) {
      detailRequest = getPlace(placeId)
      pendingPlaceDetails.set(cacheKey, detailRequest)
    }

    try {
      const detail = await detailRequest
      const mergedPlace = { ...listPlace, ...detail }
      placeDetailCache.set(cacheKey, mergedPlace)
      return mergedPlace
    } finally {
      if (pendingPlaceDetails.get(cacheKey) === detailRequest) {
        pendingPlaceDetails.delete(cacheKey)
      }
    }
  }

  // 마커 / 검색 결과 클릭
  const selectPlace = async (place) => {
    selectedPlace.value = place

    if (place?.id == null) return

    try {
      const detail = await getPlaceDetail(place.id)

      if (String(selectedPlace.value?.id) === String(place.id)) {
        selectedPlace.value = { ...place, ...detail }
      }
    } catch (err) {
      console.error('장소 상세 조회 실패:', err)
    }
  }

  // 상세 패널 닫기
  const clearSelectedPlace = () => {
    selectedPlace.value = null
  }

  const saveOripaPlace = async (placeId, data, files) => {
    const responseData = await updateOripaPlace(placeId, data, files)
    const listPlace = places.value.find((place) => String(place.id) === String(placeId))
    const currentPlace =
      String(selectedPlace.value?.id) === String(placeId) ? selectedPlace.value : listPlace
    let updatedPlace

    if (responseData?.oripaPlace && typeof responseData.oripaPlace === 'object') {
      updatedPlace = { ...currentPlace, ...responseData }
    } else if (
      responseData &&
      typeof responseData === 'object' &&
      ['summary', 'introduction', 'socialLinks', 'images'].some((key) => key in responseData)
    ) {
      updatedPlace = { ...currentPlace, oripaPlace: responseData }
    } else {
      // 204 응답처럼 수정 결과가 없는 경우에만 최신 상세를 다시 조회합니다.
      updatedPlace = await getPlace(placeId)
    }

    placeDetailCache.set(String(placeId), updatedPlace)
    places.value = places.value.map((place) =>
      String(place.id) === String(placeId) ? { ...place, ...updatedPlace } : place,
    )

    if (String(selectedPlace.value?.id) === String(placeId)) {
      selectedPlace.value = { ...selectedPlace.value, ...updatedPlace }
    }

    return updatedPlace
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
    getPlaceDetail,
    selectPlace,
    saveOripaPlace,
    clearSelectedPlace,
    setType,
  }
})
