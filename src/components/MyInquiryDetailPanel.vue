<template>
  <aside class="inquiry-detail-panel" aria-labelledby="inquiry-detail-heading">
    <header class="detail-header">
      <button
        type="button"
        class="back-button"
        aria-label="내 문의 목록으로 돌아가기"
        @click="goBack"
      >
        <FontAwesomeIcon :icon="faChevronLeft" aria-hidden="true" />
      </button>
      <h1 id="inquiry-detail-heading">내 문의</h1>
    </header>

    <div v-if="loading" class="loading-state">
      <LoadingSpinner />
    </div>
    <div v-else-if="errorMessage" class="detail-state error-state" role="alert">
      <p>{{ errorMessage }}</p>
      <button type="button" @click="goBack">목록으로 돌아가기</button>
    </div>
    <article v-else-if="inquiry" class="detail-content">
      <div class="detail-meta">
        <span class="type-label">{{ inquiryTypeLabel(inquiry.type) }}</span>
        <span class="status-label" :class="{ 'status-resolved': inquiry.status === 'RESOLVED' }">
          {{ inquiryStatusLabel(inquiry.status) }}
        </span>
      </div>

      <h2>{{ inquiry.title }}</h2>
      <time :datetime="inquiry.createdAt">{{ formatDateTime(inquiry.createdAt) }}</time>

      <section class="content-section" aria-labelledby="content-heading">
        <h3 id="content-heading">문의 내용</h3>
        <p>{{ inquiry.content }}</p>
      </section>

      <section class="answer-section" aria-labelledby="answer-heading">
        <h3 id="answer-heading">답변</h3>
        <template v-if="inquiry.answer">
          <p>{{ inquiry.answer }}</p>
          <time v-if="inquiry.answeredAt" :datetime="inquiry.answeredAt">
            {{ formatDateTime(inquiry.answeredAt) }}
          </time>
        </template>
        <p v-else class="empty-answer">아직 답변이 등록되지 않았습니다.</p>
      </section>
    </article>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { getInquiry } from '@/api/inquiryApi'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const inquiry = ref(null)
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

const formatDateTime = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const pad = (number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const goBack = () => router.push({ name: 'my-inquiries' })

const loadInquiry = async (id) => {
  loading.value = true
  errorMessage.value = ''
  inquiry.value = null

  try {
    inquiry.value = await getInquiry(id)
  } catch (error) {
    console.error('문의 상세 조회 실패:', error)
    errorMessage.value = '문의 내용을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, loadInquiry, { immediate: true })
</script>

<style scoped>
.inquiry-detail-panel {
  padding: 0 20px 48px;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  color: #262a33;
}

.detail-header {
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

.detail-content {
  padding: 24px 4px 0;
}

.detail-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.type-label,
.status-label,
.detail-content time {
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

.detail-content h2 {
  margin: 16px 0 0;
  font-size: 19px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.detail-content > time,
.answer-section time {
  display: block;
  margin-top: 8px;
  color: #777780;
}

.content-section,
.answer-section {
  padding-top: 24px;
}

.content-section h3,
.answer-section h3 {
  margin: 0 0 12px;
  font-size: 14px;
}

.content-section p,
.answer-section p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.answer-section {
  margin-top: 28px;
  border-top: 1px solid #e5e7eb;
}

.empty-answer {
  color: #777780;
}

.detail-state {
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
  .inquiry-detail-panel {
    padding: var(--mobile-header-height) 20px 48px;
    border-right: 0;
  }

  .detail-header {
    height: 64px;
  }
}
</style>
