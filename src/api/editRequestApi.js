import api from '@/api'

export const addEditRequest = async (data) => {
  await api.post('/api/edit-requests', data)
}