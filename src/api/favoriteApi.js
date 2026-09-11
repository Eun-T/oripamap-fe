import api from '@/api'

// 로그인 사용자의 좋아요 매장 목록
export const getFavorites = async () => {
  const response = await api.get('/api/favorites')
  return response.data
}

// 좋아요 여부
export const getFavorite = async (placeId) => {
  const response = await api.get(`/api/favorites/${placeId}`)
  return response.data
}

// 좋아요 추가
export const addFavorite = async (placeId) => {
  await api.post(`/api/favorites/${placeId}`)
}

// 좋아요 취소
export const removeFavorite = async (placeId) => {
  await api.delete(`/api/favorites/${placeId}`)
}
