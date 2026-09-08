import api from '@/api'

/**
 * 장소 목록 조회
 * GET /api/places
 */
export const getPlaces = async () => {
  const response = await api.get('/api/places')
  return response.data
}

/**
 * GET /api/places/{id}
 */
export const getPlace = async (id) => {
  const response = await api.get(`/api/places/${id}`)
  return response.data
}

/**
 * ORIPA 매장 상세 수정
 * 기존 이미지는 data.images의 id로, 신규 이미지는 fileIndex와 files part로 전달합니다.
 */
export const updateOripaPlace = async (placeId, data, files) => {
  const formData = new FormData()
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))

  files.forEach((file) => formData.append('files', file))

  const response = await api.put(`/api/places/${placeId}/oripa`, formData)
  return response.data
}

// 검색창에서 검색한 결과
export const searchPlaces = async (keyword) => {
  const response = await api.get('/api/places/search', {
    params: {
      keyword,
    },
  })

  return response.data
}
