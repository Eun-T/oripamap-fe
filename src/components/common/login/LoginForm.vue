<template>
  <form class="auth-form" @submit.prevent="login">
    <div class="form-field">
      <label>이메일</label>
      <input
        v-model="email"
        type="email"
        placeholder="you@example.com"
      />
    </div>

    <div class="form-field">
      <label>비밀번호</label>
      <input
        v-model="password"
        type="password"
        placeholder="비밀번호를 입력해주세요"
      />
    </div>

    <div class="login-options">
      <label class="remember">
        <input v-model="rememberMe" type="checkbox" />
        <span>로그인 상태 유지</span>
      </label>

      <button type="button" class="text-button">
        비밀번호 찾기
      </button>
    </div>

    <p v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </p>

    <button
      type="submit"
      class="main-button"
      :disabled="loading"
    >
      {{ loading ? '로그인 중...' : '로그인' }}
    </button>
  </form>

  <div class="divider">
    <span></span>
    <p>다른 방법으로 로그인</p>
    <span></span>
  </div>

  <div class="social-login">
    <button class="social-button kakao" @click="loginWithKakao">
      <span class="kakao-logo">T</span>
      <span>카카오 로그인</span>
    </button>

    <button class="social-button naver" @click="loginWithNaver">
      <span class="naver-logo">N</span>
      <span>네이버 로그인</span>
    </button>

    <button class="social-button google">
      <span class="google-logo">G</span>
      <span>구글 로그인</span>
    </button>
  </div>

  <footer class="auth-footer">
    <span>아직 회원이 아니신가요?</span>

    <button
      type="button"
      class="text-button strong"
      @click="emit('open-signup')"
    >
      회원가입
    </button>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/index.js'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits(['close', 'open-signup'])

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const login = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = '이메일과 비밀번호를 입력해주세요.'
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''

    await api.post('/api/auth/login', {
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value,
    })

    await authStore.fetchMe()

    emit('close')
  } catch (error) {
    if (error.response?.status === 401) {
      errorMessage.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
    } else {
      errorMessage.value = '로그인 중 오류가 발생했습니다.'
    }
  } finally {
    loading.value = false
  }
}

const loginWithKakao = () => {
  window.location.href = 'http://localhost/api/auth/kakao'
}

const loginWithNaver = () => {
  window.location.href = 'http://localhost/api/auth/naver'
}
</script>
