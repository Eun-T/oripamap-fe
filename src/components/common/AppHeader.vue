<template>
  <header class="app-header">
    <div class="header-left">
      <button type="button" class="brand" @click="goHome">
        <img class="brand-logo" src="/images/logo/logo-purple2.png" alt="ORIPAMAP">
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

    <LoginButton @open-login="emit('open-login')" />
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { usePlaceStore } from '@/stores/placeStore'
import LoginButton from '@/components/common/LoginButton.vue'

const placeStore = usePlaceStore()

const activeMenu = computed(() => ({ ALL: 'map', ORIPA: 'oripa', POKEMON_VENDING: 'vending' })[placeStore.selectedType])

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
    padding: env(safe-area-inset-top, 0px) max(12px, env(safe-area-inset-right)) 0 max(12px, env(safe-area-inset-left));
    gap: 8px;
  }
  .header-left { min-width: 0; }
  .brand { gap: 4px; }
  .brand-logo { height: 36px; }
  .brand-name { font-size: 16px; }
  .brand-mark { width: 24px; font-size: 22px; }
  .main-nav { display: none; }
  :deep(.header-login-area) { min-width: 0; }
  :deep(.user-area) { min-width: 0; }
  :deep(.login-button) {
    max-width: 145px;
    padding: 0 10px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
