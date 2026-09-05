import api from '@/api'

/**
 * 이미지를 S3에 단독 업로드합니다.
 * multipart Content-Type은 브라우저가 boundary와 함께 자동 설정합니다.
 *
 * @param {File} file
 * @returns {Promise<{ key: string, url: string }>}
 */
export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/api/images', formData)
  return response.data
}
