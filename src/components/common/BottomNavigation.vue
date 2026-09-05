<template>
  <nav class="bottom-navigation" aria-label="모바일 주요 메뉴">
    <button v-for="tab in tabs" :key="tab.id" type="button"
      :class="{ active: activeTab === tab.id }"
      :aria-current="activeTab === tab.id ? 'page' : undefined"
      @click="emit('select', tab)">
      <FontAwesomeIcon :icon="tab.icon" aria-hidden="true" />
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMap, faStore, faMobileScreenButton, faGear } from '@fortawesome/free-solid-svg-icons'

defineProps({ activeTab: { type: String, default: 'map' } })
const emit = defineEmits(['select'])
// 추가 탭은 이 목록에 등록하면 같은 너비로 배치됩니다.
const tabs = [
  { id: 'map', label: '지도', icon: faMap, type: 'ALL' },
  { id: 'oripa', label: '오리파', icon: faStore, type: 'ORIPA' },
  { id: 'vending', label: '자판기', icon: faMobileScreenButton, type: 'POKEMON_VENDING' },
  { id: 'settings', label: '설정', icon: faGear },
]
</script>

<style scoped>
.bottom-navigation { display: none; }
@media (max-width: 768px) {
  .bottom-navigation {
    position: fixed;
    inset: auto 0 0;
    z-index: 600;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    height: var(--mobile-nav-height);
    padding: 0 env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
    box-sizing: border-box;
    background: #fff;
    border-top: 1px solid #e9e9ef;
    box-shadow: 0 -2px 12px rgb(0 0 0 / 5%);
  }
  button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 0;
    border: 0;
    background: transparent;
    color: #858995;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  svg { font-size: 21px; }
  button.active { color: #635bff; font-weight: 700; }
}
</style>
