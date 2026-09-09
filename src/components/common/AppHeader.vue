<template>
  <header class="app-header">
    <div class="header-left">
      <button type="button" class="brand" @click="goHome">
        <img class="brand-logo" src="/images/logo/logo-purple2.png" alt="ORIPAMAP" />
        <!-- <span class="brand-mark">◩</span>
        <span class="brand-name">ORIPAMAP</span> -->
      </button>

      <nav class="main-nav">
        <button
          type="button"
          class="nav-item"
          :class="{ active: activeMenu === 'map' }"
          @click="selectMenu('map')"
        >
          지도
        </button>

        <button
          type="button"
          class="nav-item"
          :class="{ active: activeMenu === 'oripa' }"
          @click="selectMenu('oripa')"
        >
          오리파
        </button>

        <button
          type="button"
          class="nav-item"
          :class="{ active: activeMenu === 'vending' }"
          @click="selectMenu('vending')"
        >
          포켓몬 자판기
        </button>
      </nav>
    </div>

    <div class="header-actions">
      <button
        v-if="isOwner"
        type="button"
        class="manage-store-button"
        :disabled="managerLoading"
        @click="openStoreManager"
      >
        {{ managerLoading ? '불러오는 중...' : '매장 관리' }}
      </button>
      <LoginButton @open-login="emit('open-login')" />
    </div>

    <OripaEditModal
      v-if="managerPlace"
      :open="managerModalOpen"
      :place="managerPlace"
      @close="managerModalOpen = false"
    />

    <div v-if="managerError" class="manager-toast" role="alert">{{ managerError }}</div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { usePlaceStore } from '@/stores/placeStore'
import { useAuthStore } from '@/stores/authStore'
import { userHasRole } from '@/utils/userRole'
import LoginButton from '@/components/common/LoginButton.vue'
import OripaEditModal from '@/components/OripaEditModal.vue'

const placeStore = usePlaceStore()
const authStore = useAuthStore()

const isOwner = computed(
  () => userHasRole(authStore.user, 'OWNER') && !userHasRole(authStore.user, 'ADMIN'),
)
const managerPlace = ref(null)
const managerModalOpen = ref(false)
const managerLoading = ref(false)
const managerError = ref('')
let managerErrorTimer = null

const showManagerError = (message) => {
  clearTimeout(managerErrorTimer)
  managerError.value = message
  managerErrorTimer = setTimeout(() => {
    managerError.value = ''
  }, 3000)
}

const openStoreManager = async () => {
  if (managerLoading.value || !isOwner.value) return

  const owner = authStore.user
  const placeId = owner?.placeId
  if (placeId == null) {
    showManagerError('연결된 매장 정보가 없습니다.')
    return
  }

  try {
    managerLoading.value = true
    const place = await placeStore.getPlaceDetail(placeId)

    if (
      authStore.user !== owner ||
      !isOwner.value ||
      String(authStore.user?.placeId) !== String(placeId)
    ) {
      return
    }

    // ORIPA 상세 행은 매장 정보를 처음 저장할 때 생성되므로,
    // 아직 oripaPlace가 없는 연결 매장도 빈 편집 화면을 열 수 있어야 합니다.
    if (place?.type !== 'ORIPA') {
      showManagerError('연결된 ORIPA 매장 정보를 불러오지 못했습니다.')
      return
    }

    managerPlace.value = place
    managerModalOpen.value = true
  } catch (error) {
    console.error('OWNER 매장 정보 조회 실패:', error)
    showManagerError('매장 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
  } finally {
    managerLoading.value = false
  }
}

watch(
  [() => authStore.user, isOwner, () => authStore.user?.placeId],
  ([user, owner, placeId], [previousUser]) => {
    if (user !== previousUser || !owner || placeId == null) {
      managerModalOpen.value = false
      managerPlace.value = null
    }
  },
  { flush: 'sync' },
)

onBeforeUnmount(() => clearTimeout(managerErrorTimer))

const activeMenu = computed(
  () => ({ ALL: 'map', ORIPA: 'oripa', POKEMON_VENDING: 'vending' })[placeStore.selectedType],
)

const goHome = () => {
  placeStore.setType('ALL')
}

const selectMenu = (menu) => {
  if (menu === 'map') {
    placeStore.setType('ALL')
  }

  if (menu === 'oripa') {
    placeStore.setType('ORIPA')
  }

  if (menu === 'vending') {
    placeStore.setType('POKEMON_VENDING')
  }
}

const emit = defineEmits(['open-login'])
</script>

<style scoped>
.app-header {
  position: relative;
  z-index: 500;

  display: flex;
  align-items: center;

  width: 100%;
  height: 72px;

  padding: 0 28px;
  box-sizing: border-box;

  background: #fff;
  border-bottom: 1px solid #e9e9e9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-left: auto;
}

.header-actions :deep(.header-login-area) {
  margin-left: 0;
}

.manage-store-button {
  min-width: 84px;
  height: 38px;
  padding: 0 14px;
  border: 1px solid #635bff;
  border-radius: 7px;
  background: #fff;
  color: #635bff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.manage-store-button:hover {
  background: #f7f6ff;
}

.manage-store-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.manager-toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2200;
  padding: 12px 16px;
  border-radius: 10px;
  background: #111827;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 6px 20px rgb(0 0 0 / 18%);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;

  padding-left: 20px;

  border: 0;
  background: transparent;

  cursor: pointer;
}

.brand-logo {
  display: block;
  width: auto;
  height: 38px;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 30px;
  height: 30px;

  color: #635bff;
  font-size: 26px;
  font-weight: 800;
}

.brand-name {
  color: #111827;

  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 8px;

  height: 100%;
}

.nav-item {
  position: relative;

  height: 72px;
  padding: 0 18px;

  border: 0;
  background: transparent;

  color: #333;

  font-size: 20px;
  font-weight: 700;

  cursor: pointer;
}

.nav-item:hover {
  color: #111;
}

.nav-item.active {
  color: #635bff;
}

@media (max-width: 768px) {
  .app-header {
    position: absolute;
    top: 0;
    left: 0;
    height: var(--mobile-header-height);
    padding: env(safe-area-inset-top, 0px) max(12px, env(safe-area-inset-right)) 0
      max(12px, env(safe-area-inset-left));
    gap: 8px;
  }
  .header-left {
    min-width: 0;
  }
  .header-actions {
    gap: 6px;
  }
  .manage-store-button {
    min-width: 74px;
    padding: 0 9px;
    font-size: 12px;
  }
  .brand {
    gap: 4px;
  }
  .brand-logo {
    height: 36px;
  }
  .brand-name {
    font-size: 16px;
  }
  .brand-mark {
    width: 24px;
    font-size: 22px;
  }
  .main-nav {
    display: none;
  }
  :deep(.header-login-area) {
    min-width: 0;
  }
  :deep(.user-area) {
    min-width: 0;
  }
  :deep(.login-button) {
    max-width: 115px;
    padding: 0 10px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
