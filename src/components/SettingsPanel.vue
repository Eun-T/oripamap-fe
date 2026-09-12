<template>
  <aside class="settings-panel" aria-labelledby="settings-heading">
    <header class="settings-header">
      <button type="button" class="back-button" aria-label="내 정보로 돌아가기" @click="goBack">
        <FontAwesomeIcon :icon="faChevronLeft" aria-hidden="true" />
      </button>
      <h1 id="settings-heading">설정</h1>
    </header>

    <section
      v-for="section in settingsSections"
      :key="section.title"
      class="settings-section"
      :aria-labelledby="section.id"
    >
      <h2 :id="section.id">{{ section.title }}</h2>
      <ul class="settings-list">
        <li v-for="item in section.items" :key="item.key">
          <RouterLink
            v-if="item.route"
            class="settings-row"
            :class="{ danger: item.danger }"
            :to="getItemRoute(item.route)"
          >
            <span>{{ item.label }}</span>
            <FontAwesomeIcon class="chevron" :icon="faChevronRight" aria-hidden="true" />
          </RouterLink>
          <div v-else class="settings-row static-row">
            <span>{{ item.label }}</span>
            <span class="setting-value">{{ item.value }}</span>
          </div>
        </li>
      </ul>
    </section>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

const router = useRouter()
const goBack = () => router.push({ name: 'my' })
const getItemRoute = (route) => {
  if (route === 'terms') return { name: 'my-settings-terms' }
  if (route === 'privacy') return { name: 'my-settings-privacy' }
  if (route === 'location-terms') return { name: 'my-settings-location-terms' }
  if (route === 'contact') return { name: 'my-settings-contact' }
  return { name: 'my-settings-detail', params: { section: route } }
}

const settingsSections = [
  {
    id: 'service-settings',
    title: '서비스',
    items: [
      { key: 'notices', label: '공지사항', route: 'notices' },
      { key: 'contact', label: '문의하기', route: 'contact' },
    ],
  },
  {
    id: 'legal-settings',
    title: '약관 및 정보',
    items: [
      { key: 'terms', label: '이용약관', route: 'terms' },
      { key: 'privacy', label: '개인정보처리방침', route: 'privacy' },
      {
        key: 'location-terms',
        label: '위치기반서비스 이용약관',
        route: 'location-terms',
      },
      { key: 'version', label: '앱 버전', value: '1.0.0' },
    ],
  },
  {
    id: 'account-settings',
    title: '계정',
    items: [{ key: 'delete-account', label: '회원 탈퇴', route: 'delete-account', danger: true }],
  },
]
</script>

<style scoped>
.settings-panel {
  padding: 0 20px 40px;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  color: #222;
}

.settings-header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 68px;
  background: #fff;
  border-bottom: 1px solid #f0f1f3;
}

.settings-header h1 {
  margin: 0;
  font-size: 20px;
}

.back-button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #374151;
  font-size: 15px;
  cursor: pointer;
}

.back-button:hover {
  background: #f5f6f7;
}

.settings-section {
  padding-top: 24px;
}

.settings-section h2 {
  margin: 0 0 8px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 700;
}

.settings-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.settings-list li + li {
  border-top: 1px solid #f0f1f3;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 52px;
  margin: 0 -10px;
  padding: 0 10px;
  border-radius: 8px;
  color: #262a33;
  font-size: 14px;
  text-decoration: none;
}

a.settings-row:hover {
  background: #f7f7f8;
}

.chevron {
  flex: none;
  color: #b5b8bf;
  font-size: 11px;
}

.setting-value {
  color: #747983;
  font-size: 13px;
}

.settings-row.danger {
  color: #dc2626;
}

@media (max-width: 768px) {
  .settings-panel {
    padding: var(--mobile-header-height) 20px 48px;
    border-right: 0;
  }

  .settings-header {
    height: 64px;
  }
}
</style>
