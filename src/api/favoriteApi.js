import api from '@/api'

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