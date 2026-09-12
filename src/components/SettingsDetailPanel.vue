<template>
  <aside class="settings-detail-panel" aria-labelledby="detail-heading">
    <header class="detail-header">
      <button type="button" class="back-button" aria-label="설정으로 돌아가기" @click="goBack">
        <FontAwesomeIcon :icon="faChevronLeft" aria-hidden="true" />
      </button>
      <h1 id="detail-heading">{{ title }}</h1>
    </header>

    <p class="preparing-message">상세 내용은 준비 중입니다.</p>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

const route = useRoute()
const router = useRouter()
const titles = {
  notices: '공지사항',
  contact: '문의하기',
  terms: '이용약관',
  privacy: '개인정보처리방침',
  licenses: '오픈소스 라이선스',
  'delete-account': '회원 탈퇴',
}

const title = computed(() => titles[route.params.section] || '설정')
const goBack = () => router.push({ name: 'my-settings' })
</script>

<style scoped>
.settings-detail-panel {
  padding: 0 20px 40px;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  color: #222;
}

.detail-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 68px;
  background: #fff;
  border-bottom: 1px solid #f0f1f3;
}

.detail-header h1 {
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

.preparing-message {
  margin: 28px 0 0;
  color: #6b7280;
  font-size: 14px;
}

@media (max-width: 768px) {
  .settings-detail-panel {
    padding: var(--mobile-header-height) 20px 48px;
    border-right: 0;
  }

  .detail-header {
    height: 64px;
  }
}
</style>
