<template>
  <div class="header-login-area">
    <button v-if="!authStore.user" type="button" class="login-button" @click="emit('open-login')">
      로그인 및 회원가입
    </button>

    <div v-else ref="userArea" class="user-area">
      <button
        type="button"
        class="login-button"
        aria-haspopup="menu"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        {{ authStore.user.nickname }} 님 ▾
      </button>

      <div v-if="isMenuOpen" class="user-menu" role="menu">
        <button type="button" class="menu-item" role="menuitem" @click="selectMenu('profile')">
          내 정보
        </button>
        <button type="button" class="menu-item" role="menuitem" @click="selectMenu('settings')">
          설정
        </button>
        <div class="menu-divider" aria-hidden="true"></div>
        <button
          type="button"
          class="menu-item logout-item"
          role="menuitem"
          @click="handleLogout"
        >
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
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const emit = defineEmits(['open-login', 'open-settings'])

const isMenuOpen = ref(false)
const userArea = ref(null)

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

onMounted(() => {
  document.addEventListener('click', handleOutsideClick, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick, true)
})

const logoutMessage = ref('')

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

.user-menu {
  position: absolute;
  top: 50px;
  right: 0;

  width: 140px;

  padding: 6px;

  background: #fff;

  border: 1px solid #e5e5e5;
  border-radius: 10px;

  box-shadow: 0 6px 20px rgb(0 0 0 / 14%);

  z-index: 400;
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
</style>
