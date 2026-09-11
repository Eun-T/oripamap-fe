<template>
  <header class="app-header">
    <div class="header-left">
      <button type="button" class="brand" @click="goHome">
        <img class="brand-logo" src="/images/logo/logo-purple2.png" alt="ORIPAMAP" />
      </button>

      <nav class="main-nav" aria-label="주요 메뉴">
        <button
          v-for="menu in menus"
          :key="menu.id"
          type="button"
          class="nav-item"
          :class="{ active: activeMenu === menu.id }"
          :aria-current="activeMenu === menu.id ? 'page' : undefined"
          @click="selectMenu(menu.id)"
        >
          <component :is="menu.icon" class="nav-icon" aria-hidden="true" />
          <span class="main-nav-text">{{ menu.label }}</span>
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
        <FontAwesomeIcon :icon="faSliders" aria-hidden="true" />
        <span class="desktop-manager-label">{{ managerLoading ? '로딩 중' : '관리' }}</span>
        <span class="mobile-manager-label">
          {{ managerLoading ? '불러오는 중...' : '매장 관리' }}
        </span>
      </button>
      <LoginButton
        compact
        :active="route.path === '/my'"
        @open-login="emit('open-login')"
        @open-settings="emit('open-settings')"
      />
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
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMap, faMobileScreenButton, faSliders, faStore } from '@fortawesome/free-solid-svg-icons'
import { usePlaceStore } from '@/stores/placeStore'
import { useAuthStore } from '@/stores/authStore'
import { userHasRole } from '@/utils/userRole'
import LoginButton from '@/components/common/LoginButton.vue'
import OripaEditModal from '@/components/OripaEditModal.vue'
import { Map, Store, Smartphone } from '@lucide/vue'

const placeStore = usePlaceStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const menus = [
  { id: 'map', label: '지도', icon: Map },
  { id: 'oripa', label: '오리파', icon: Store },
  { id: 'vending', label: '자판기', icon: Smartphone },
]

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

const activeMenu = computed(() => {
  if (route.path === '/my') return 'profile'
  return { ALL: 'map', ORIPA: 'oripa', POKEMON_VENDING: 'vending' }[placeStore.selectedType]
})

const goHome = () => {
  placeStore.setType('ALL')
  router.push('/map')
}

const selectMenu = (menu) => {
  const placeType = {
    map: 'ALL',
    oripa: 'ORIPA',
    vending: 'POKEMON_VENDING',
  }[menu]

  if (placeType) placeStore.setType(placeType)

  if (route.name !== 'map' && route.name !== 'place') {
    router.push('/map')
  }
}

const emit = defineEmits(['open-login', 'open-settings'])
</script>

<style scoped>
.app-header {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 500;
  display: flex;
  flex-direction: column;
  width: 65px;
  height: 100vh;
  padding: 8px 6px 10px;
  background: #fff;
  border-right: 1px solid #e9e9e9;
  box-shadow: 2px 0 12px rgb(0 0 0 / 4%);
}

.header-left,
.main-nav,
.header-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-left {
  gap: 10px;
  margin-top: 10px;
}

.main-nav {
  gap: 12px;
}

.main-nav-text {
  font-weight: 500;
}

.header-actions {
  gap: 8px;
  margin-top: auto;
}

.brand {
  display: grid;
  place-items: center;
  width: 53px;
  height: 53px;
  padding: 5px;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.brand-logo {
  display: block;
  width: auto;
  height: 30px;
}

.nav-item,
.manage-store-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 53px;
  height: 56px;
  padding: 0 2px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #666b78;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.nav-item span {
  white-space: pre-line;
  text-align: center;
  line-height: 1.25;
}

.nav-item svg,
.manage-store-button svg {
  font-size: 20px;
}

.nav-item:hover,
.manage-store-button:hover {
  background: #f7f7fa;
  color: #333744;
}

.nav-item.active {
  background: #f0efff;
  color: #635bff;
}

.mobile-manager-label {
  display: none;
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

@media (max-width: 768px) {
  .app-header {
    position: absolute;
    inset: 0 0 auto;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: var(--mobile-header-height);
    padding: env(safe-area-inset-top, 0px) max(12px, env(safe-area-inset-right)) 0
      max(12px, env(safe-area-inset-left));
    border-right: 0;
    border-bottom: 1px solid #e9e9e9;
    box-shadow: none;
  }

  .header-left {
    flex-direction: row;
    min-width: 0;
  }

  .header-actions {
    flex-direction: row;
    gap: 6px;
    margin-top: 0;
    margin-left: auto;
  }

  .main-nav {
    display: none;
  }

  .brand {
    width: auto;
    height: auto;
    padding: 0;
  }

  .brand-logo {
    height: 36px;
  }

  .manage-store-button {
    flex-direction: row;
    width: auto;
    min-width: 74px;
    height: 38px;
    padding: 0 9px;
    border: 1px solid #635bff;
    border-radius: 7px;
    color: #635bff;
    font-size: 12px;
  }

  .manage-store-button svg {
    display: none;
  }

  .desktop-manager-label {
    display: none;
  }

  .mobile-manager-label {
    display: inline;
  }

  :deep(.header-login-area),
  :deep(.user-area) {
    min-width: 0;
  }

  :deep(.login-button) {
    max-width: 115px;
    padding: 0 10px;
    overflow: hidden;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
