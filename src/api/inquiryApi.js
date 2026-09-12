import api from '@/api'

export const getInquiries = async () => {
  const response = await api.get('/api/inquiries/me')
  return response.data
}

export const getInquiry = async (id) => {
  const response = await api.get(`/api/inquiries/${id}`)
  return response.data
}

export const createInquiry = async (data) => {
  const response = await api.post('/api/inquiries', data)
  return response.data
}
