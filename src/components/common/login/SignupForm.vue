<script setup>
import { ref } from 'vue'
import api from '@/api/index.js'

const emit = defineEmits(['open-login'])

const email = ref('')
const nickname = ref('')
const password = ref('')
const passwordConfirm = ref('')

const loading = ref(false)
const errorMessage = ref('')

const signup = async () => {
  if (!email.value || !nickname.value || !password.value || !passwordConfirm.value) {
    errorMessage.value = '모든 항목을 입력해주세요.'
    return
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''

    const params = new URLSearchParams()

    params.append('email', email.value)
    params.append('password', password.value)
    params.append('nickname', nickname.value)

    await api.post('/api/member', params)

    emit('open-login')
  } catch (error) {
    if (error.response?.status === 409) {
      errorMessage.value = '이미 가입된 이메일입니다.'
    } else {
      errorMessage.value = '회원가입 중 오류가 발생했습니다.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="auth-form" @submit.prevent="signup">
    <div class="form-field">
      <label>이메일</label>
      <input v-model="email" type="email" placeholder="you@example.com" />
    </div>

    <div class="form-field">
      <label>닉네임</label>
      <input v-model="nickname" type="text" placeholder="닉네임을 입력해주세요" />
    </div>

    <div class="form-field">
      <label>비밀번호</label>
      <input v-model="password" type="password" placeholder="비밀번호를 입력해주세요" />
    </div>

    <div class="form-field">
      <label>비밀번호 확인</label>
      <input v-model="passwordConfirm" type="password" placeholder="비밀번호를 다시 입력해주세요" />
    </div>

    <p v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </p>

    <button type="submit" class="main-button" :disabled="loading">
      {{ loading ? '가입 중...' : '회원가입' }}
    </button>
  </form>

  <footer class="auth-footer">
    <span>이미 회원이신가요?</span>

    <button type="button" class="text-button strong" @click="emit('open-login')">로그인</button>
  </footer>
</template>
