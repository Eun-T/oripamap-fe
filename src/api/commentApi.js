import api from '@/api'

// 댓글 목록
export const getComments = async (placeId, page = 0, size = 5) => {
  const response = await api.get(`/api/comments/place/${placeId}`, {
    params: { page, size },
  })
  return response.data
}

// 사진이 포함된 댓글 목록
export const getPhotoComments = async (placeId) => {
  const response = await api.get(`/api/comments/place/${placeId}/photos`)
  return response.data
}

// 댓글 작성
export const addComment = async (placeId, content, file = null) => {
  const formData = new FormData()
  formData.append('content', content)

  if (file) {
    formData.append('file', file)
  }

  const response = await api.post(`/api/comments/place/${placeId}`, formData)
  return response.data
}

// 댓글 삭제
export const deleteComment = async (commentId) => {
  await api.delete(`/api/comments/${commentId}`)
}

// 댓글 수정
export const updateComment = async (commentId, content) => {
  await api.put(`/api/comments/${commentId}`, {
    content,
  })
}
// 대댓글 추가
export const addReply = async (commentId, content) => {
  const response = await api.post(`/api/comments/${commentId}/replies`, {
    content,
  })
  return response.data
}
