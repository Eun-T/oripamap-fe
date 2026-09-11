import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/index.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)

  const fetchMe = async () => {
    try {
      loading.value = true

      const { data } = await api.get('/api/users/me')

      user.value = data
    } catch (error) {
      if (error.response?.status === 401) {
        user.value = null
        return
      }

      console.error('로그인 상태 확인 실패:', error)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout')
    } finally {
      user.value = null
    }
  }

  const updateNickname = async (nickname) => {
    const { data } = await api.patch('/api/users/me', { nickname })
    user.value = { ...user.value, ...data }
    return user.value
  }

  return {
    user,
    loading,
    fetchMe,
    updateNickname,
    logout,
  }
})
