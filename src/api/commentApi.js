import api from '@/api'

// 댓글 목록
export const getComments = async (placeId) => {
  const response = await api.get(`/api/comments/place/${placeId}`)
  return response.data
}

// 댓글 작성
export const addComment = async (placeId, content) => {
  await api.post(`/api/comments/place/${placeId}`, {
    content,
  })
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
  await api.post(`/api/comments/${commentId}/replies`, {
    content,
  })
}