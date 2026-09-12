<template>
  <aside class="inquiries-panel" aria-labelledby="inquiries-heading">
    <header class="inquiries-header">
      <button type="button" class="back-button" aria-label="내 정보로 돌아가기" @click="goBack">
        <FontAwesomeIcon :icon="faChevronLeft" aria-hidden="true" />
      </button>
      <h1 id="inquiries-heading">내 문의</h1>
    </header>

    <div v-if="loading" class="loading-state">
      <LoadingSpinner />
    </div>
    <div v-else-if="errorMessage" class="list-state error-state" role="alert">
      <p>{{ errorMessage }}</p>
      <button type="button" @click="loadInquiries">다시 시도</button>
    </div>
    <p v-else-if="inquiries.length === 0" class="list-state">등록한 문의가 없습니다.</p>
    <ul v-else class="inquiry-list">
      <li v-for="inquiry in inquiries" :key="inquiry.id">
        <RouterLink
          class="inquiry-item"
          :to="{ name: 'my-inquiry-detail', params: { id: inquiry.id } }"
        >
          <div class="item-heading">
            <span class="type-label">{{ inquiryTypeLabel(inquiry.type) }}</span>
            <span
              class="status-label"
              :class="{ 'status-resolved': inquiry.status === 'RESOLVED' }"
            >
              {{ inquiryStatusLabel(inquiry.status) }}
            </span>
          </div>
          <strong class="inquiry-title">{{ inquiry.title }}</strong>
          <time :datetime="inquiry.createdAt">{{ formatCreatedAt(inquiry.createdAt) }}</time>
        </RouterLink>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { getInquiries } from '@/api/inquiryApi'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const inquiries = ref([])
const loading = ref(false)
const errorMessage = ref('')

const inquiryTypeLabel = (type) =>
  ({
    GENERAL: '일반 문의',
    STORE_REGISTRATION: '매장 등록 요청',
    INFO_CORRECTION: '정보 수정 요청',
    BUG: '오류 신고',
    ETC: '기타',
  })[type] ||
  type ||
  '-'

const inquiryStatusLabel = (status) =>
  ({
    PENDING: '접수 대기',
    RESOLVED: '처리 완료',
  })[status] ||
  status ||
  '-'

const formatCreatedAt = (createdAt) => {
  if (!createdAt) return '-'

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return createdAt

  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const goBack = () => router.push({ name: 'my' })

const loadInquiries = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await getInquiries()
    inquiries.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('내 문의 목록 조회 실패:', error)
    inquiries.value = []
    errorMessage.value = '문의 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(loadInquiries)
</script>

<style scoped>
.inquiries-panel {
  padding: 0 20px 48px;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  color: #262a33;
}

.inquiries-header {
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

.inquiries-header h1 {
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

.inquiry-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.inquiry-list li + li {
  border-top: 1px solid #eeeef2;
}

.inquiry-item {
  display: block;
  padding: 18px 4px;
  color: inherit;
  text-decoration: none;
}

.inquiry-item:hover {
  background: #f9fafb;
}

.item-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.type-label,
.status-label,
.inquiry-item time {
  font-size: 12px;
}

.type-label {
  color: #635bff;
  font-weight: 700;
}

.status-label {
  color: #8a6b18;
  font-weight: 700;
}

.status-resolved {
  color: #39745a;
}

.inquiry-title {
  display: block;
  margin-top: 8px;
  font-size: 15px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.inquiry-item time {
  display: block;
  margin-top: 8px;
  color: #777780;
}

.list-state {
  margin: 0;
  padding: 48px 12px;
  color: #777780;
  font-size: 14px;
  text-align: center;
}

.loading-state {
  display: grid;
  place-items: center;
  padding: 48px 12px;
}

.error-state p {
  margin: 0;
}

.error-state button {
  margin-top: 12px;
  padding: 7px 10px;
  border: 1px solid #d8d6ff;
  border-radius: 7px;
  background: #f7f6ff;
  color: #635bff;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 768px) {
  .inquiries-panel {
    padding: var(--mobile-header-height) 20px 48px;
    border-right: 0;
  }

  .inquiries-header {
    height: 64px;
  }
}
</style>
