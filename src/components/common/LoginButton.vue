<template>
  <div class="header-login-area">
    <button
      v-if="!authStore.user"
      type="button"
      class="login-button"
      :class="{ compact, active }"
      @click="emit('open-login')"
    >
      <FontAwesomeIcon v-if="compact" :icon="faUser" aria-hidden="true" />
      <span class="default-label">로그인 및 회원가입</span>
      <span class="compact-label">로그인</span>
    </button>

    <div v-else ref="userArea" class="user-area">
      <button
        type="button"
        class="login-button"
        :class="{ compact, active }"
        aria-haspopup="menu"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        <FontAwesomeIcon v-if="compact" :icon="faUser" aria-hidden="true" />
        <span class="default-label">{{ authStore.user.nickname }} 님 ▾</span>
        <span class="compact-label">프로필</span>
      </button>

      <div v-if="isMenuOpen" class="user-menu" role="menu">
        <button type="button" class="menu-item" role="menuitem" @click="selectMenu('profile')">
          내 정보
        </button>
        <button type="button" class="menu-item" role="menuitem" @click="selectMenu('settings')">
          설정
        </button>
        <div class="menu-divider" aria-hidden="true"></div>
        <button type="button" class="menu-item logout-item" role="menuitem" @click="handleLogout">
          로그아웃
        </button>
      </div>
    </div>
    <div v-if="logoutMessage" class="toast">
      {{ logoutMessage }}
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { useAuthStore } from '@/stores/authStore'

defineProps({
  compact: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['open-login', 'open-settings'])
const isMenuOpen = ref(false)
const userArea = ref(null)
const logoutMessage = ref('')

const selectMenu = (menu) => {
  isMenuOpen.value = false

  if (menu === 'profile') {
    router.push('/my')
    return
  }

  emit('open-settings')
}

const handleOutsideClick = (event) => {
  if (isMenuOpen.value && !userArea.value?.contains(event.target)) {
    isMenuOpen.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  isMenuOpen.value = false

  if (route.meta.requiresAuth) {
    await router.push('/map')
  }

  logoutMessage.value = '로그아웃되었습니다.'

  setTimeout(() => {
    logoutMessage.value = ''
  }, 2000)
}

onMounted(() => document.addEventListener('click', handleOutsideClick, true))
onBeforeUnmount(() => document.removeEventListener('click', handleOutsideClick, true))
</script>

<style scoped>
.header-login-area {
  display: flex;
  margin-left: auto;
}

.user-area {
  position: relative;
}

.login-button {
  min-width: 64px;
  height: 38px;
  padding: 0 16px;
  border: 1px solid #d8d8d8;
  border-radius: 7px;
  background: #fff;
  color: #222;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.login-button:hover {
  background: #f7f7f7;
}

.compact-label {
  display: none;
}

.login-button.compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 53px;
  min-width: 0;
  height: 52px;
  padding: 0 2px;
  border: 0;
  border-radius: 9px;
  color: #666b78;
  font-size: 10px;
}

.login-button.compact svg {
  font-size: 20px;
}

.login-button.compact:hover,
.login-button.compact.active {
  background: #f0efff;
  color: #635bff;
}

.login-button.compact .default-label {
  display: none;
}

.login-button.compact .compact-label {
  display: inline;
}

.user-menu {
  position: absolute;
  top: 50px;
  right: 0;
  z-index: 400;
  width: 140px;
  padding: 6px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgb(0 0 0 / 14%);
}

.login-button.compact + .user-menu {
  top: auto;
  right: auto;
  bottom: 0;
  left: 62px;
}

.menu-item {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-divider {
  height: 1px;
  margin: 6px 4px;
  background: #e5e5e5;
}

.logout-item {
  color: #dc2626;
}

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  padding: 12px 16px;
  background: #111827;
  color: #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 6px 20px rgb(0 0 0 / 18%);
}

@media (max-width: 768px) {
  .login-button.compact {
    display: block;
    width: auto;
    min-width: 64px;
    height: 38px;
    padding: 0 16px;
    border: 1px solid #d8d8d8;
    border-radius: 7px;
    color: #222;
    font-size: 13px;
  }

  .login-button.compact svg,
  .login-button.compact .compact-label {
    display: none;
  }

  .login-button.compact .default-label {
    display: inline;
  }

  .login-button.compact + .user-menu {
    top: 50px;
    right: 0;
    bottom: auto;
    left: auto;
  }
}
</style>
