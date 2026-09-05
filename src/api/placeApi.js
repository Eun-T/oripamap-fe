import api from '@/api'

/**
 * 장소 목록 조회
 * GET /api/places
 */
export const getPlaces = async () => {
  const response = await api.get('/api/places')
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