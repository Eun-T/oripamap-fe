<template>
  <aside class="inquiry-panel" aria-labelledby="inquiry-heading">
    <header class="inquiry-header">
      <button type="button" class="back-button" aria-label="설정으로 돌아가기" @click="goBack">
        <FontAwesomeIcon :icon="faChevronLeft" aria-hidden="true" />
      </button>
      <h1 id="inquiry-heading">문의하기</h1>
    </header>

    <div v-if="!submittedInquiry" class="inquiry-content">
      <p class="description">
        서비스 이용 중 궁금한 점이나 불편한 사항을 남겨주세요.
      </p>

      <form class="inquiry-form" @submit.prevent="submitInquiry">
        <div class="form-field">
          <label for="inquiry-type">문의 유형 <span class="required-mark" aria-hidden="true">*</span></label>
          <select id="inquiry-type" v-model="form.type" required :disabled="submitting">
            <option v-for="option in inquiryTypes" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="form-field">
          <label for="inquiry-title">제목 <span class="required-mark" aria-hidden="true">*</span></label>
          <input
            id="inquiry-title"
            v-model="form.title"
            type="text"
            required
            maxlength="100"
            placeholder="문의 제목을 입력해주세요."
            :disabled="submitting"
            @input="clearMessage"
          />
        </div>

        <div class="form-field">
          <div class="field-heading">
            <label for="inquiry-content">내용 <span class="required-mark" aria-hidden="true">*</span></label>
            <span>{{ form.content.length }} / 2,000</span>
          </div>
          <textarea
            id="inquiry-content"
            v-model="form.content"
            required
            maxlength="2000"
            rows="9"
            placeholder="문의 내용을 입력해주세요."
            :disabled="submitting"
            @input="clearMessage"
          ></textarea>
        </div>

        <p
          v-if="message"
          class="form-message"
          role="alert"
        >
          {{ message }}
        </p>

        <button type="submit" class="submit-button" :disabled="!canSubmit">
          {{ submitting ? '등록 중...' : '문의 등록' }}
        </button>
      </form>
    </div>

    <div v-else class="completion-content">
      <div class="completion-icon" aria-hidden="true">
        <FontAwesomeIcon :icon="faCheck" />
      </div>
      <h2>문의가 접수되었습니다.</h2>
      <p class="completion-description">
        소중한 의견을 보내주셔서 감사합니다.<br />
        내용을 확인한 후 처리하겠습니다.
      </p>

      <dl class="receipt-info">
        <div>
          <dt>처리 상태</dt>
          <dd>{{ inquiryStatusLabel(submittedInquiry.status) }}</dd>
        </div>
        <div>
          <dt>문의 유형</dt>
          <dd>{{ inquiryTypeLabel(submittedInquiry.type) }}</dd>
        </div>
        <div>
          <dt>제목</dt>
          <dd>{{ submittedInquiry.title }}</dd>
        </div>
        <div>
          <dt>접수일시</dt>
          <dd>{{ formatCreatedAt(submittedInquiry.createdAt) }}</dd>
        </div>
      </dl>

      <button type="button" class="confirm-button" @click="goBack">확인</button>
    </div>
  </aside>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { createInquiry } from '@/api/inquiryApi'

const router = useRouter()
const submitting = ref(false)
const message = ref('')
const submittedInquiry = ref(null)
const form = reactive({
  type: 'GENERAL',
  title: '',
  content: '',
})

const inquiryTypes = [
  { value: 'GENERAL', label: '일반 문의' },
  { value: 'STORE_REGISTRATION', label: '매장 등록 요청' },
  { value: 'INFO_CORRECTION', label: '정보 수정 요청' },
  { value: 'BUG', label: '오류 신고' },
  { value: 'ETC', label: '기타' },
]

const canSubmit = computed(
  () => !submitting.value && Boolean(form.title.trim()) && Boolean(form.content.trim()),
)

const goBack = () => router.push({ name: 'my-settings' })
const clearMessage = () => {
  message.value = ''
}

const inquiryTypeLabel = (type) =>
  inquiryTypes.find((option) => option.value === type)?.label || type || '-'

const inquiryStatusLabel = (status) =>
  ({ PENDING: '접수 대기' })[status] || status || '-'

const formatCreatedAt = (createdAt) => {
  if (!createdAt) return '-'

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return createdAt

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const getServerMessage = (error) => {
  if (error.response?.status !== 400) return ''

  const data = error.response.data
  if (typeof data === 'string' && data.trim()) return data

  const validationMessage =
    data?.errors?.title ||
    data?.errors?.content ||
    data?.fieldErrors?.title ||
    data?.fieldErrors?.content ||
    data?.message

  return typeof validationMessage === 'string' ? validationMessage : ''
}

const resetForm = () => {
  form.type = 'GENERAL'
  form.title = ''
  form.content = ''
}

const submitInquiry = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  clearMessage()
  const request = {
    type: form.type,
    title: form.title.trim(),
    content: form.content.trim(),
  }

  try {
    const response = await createInquiry(request)
    submittedInquiry.value = {
      id: response.id,
      type: response.type || request.type,
      status: response.status,
      createdAt: response.createdAt,
      title: request.title,
    }
    resetForm()
  } catch (error) {
    message.value = getServerMessage(error) || '문의를 등록하지 못했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.inquiry-panel {
  padding: 0 20px 48px;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  color: #262a33;
}

.inquiry-header {
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

.inquiry-header h1 {
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

.inquiry-content {
  padding-top: 24px;
}

.description {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.inquiry-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  color: #374151;
  font-size: 13px;
  font-weight: 700;
}

.required-mark {
  color: #dc2626 !important;
  font-size: 11px !important;
}

.field-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-heading span {
  color: #9ca3af;
  font-size: 12px;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  border: 1px solid #d8dbe1;
  border-radius: 8px;
  outline: none;
  background: #fff;
  color: #262a33;
  font: inherit;
  font-size: 14px;
}

.form-field input,
.form-field select {
  height: 44px;
  padding: 0 12px;
}

.form-field textarea {
  min-height: 180px;
  padding: 12px;
  line-height: 1.55;
  resize: none;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: #8b85ff;
  box-shadow: 0 0 0 3px rgb(99 91 255 / 10%);
}

.form-field input:disabled,
.form-field select:disabled,
.form-field textarea:disabled {
  background: #f8f8fa;
  cursor: not-allowed;
}

.form-message {
  margin: -4px 0 0;
  color: #dc2626;
  font-size: 13px;
  line-height: 1.5;
}

.submit-button {
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: 8px;
  background: #635bff;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.submit-button:hover:not(:disabled) {
  background: #5147f5;
}

.submit-button:disabled {
  background: #c9c7e8;
  cursor: not-allowed;
}

.completion-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100% - 68px);
  padding: 32px 0;
  text-align: center;
}

.completion-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f0efff;
  color: #635bff;
  font-size: 24px;
}

.completion-content h2 {
  margin: 20px 0 0;
  color: #20232a;
  font-size: 20px;
}

.completion-description {
  margin: 12px 0 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}

.receipt-info {
  width: 100%;
  margin: 32px 0 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.receipt-info > div {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 12px;
  padding: 13px 4px;
}

.receipt-info > div + div {
  border-top: 1px solid #f0f1f3;
}

.receipt-info dt {
  color: #7b808a;
  font-size: 13px;
}

.receipt-info dd {
  min-width: 0;
  margin: 0;
  color: #30343c;
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.confirm-button {
  width: 100%;
  height: 46px;
  margin-top: 28px;
  border: 0;
  border-radius: 8px;
  background: #635bff;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.confirm-button:hover {
  background: #5147f5;
}

@media (max-width: 768px) {
  .inquiry-panel {
    padding: var(--mobile-header-height) 20px 48px;
    border-right: 0;
  }

  .inquiry-header {
    height: 64px;
  }

  .form-field textarea {
    min-height: 200px;
  }

  .completion-content {
    min-height: calc(100dvh - var(--mobile-header-height) - 64px);
  }
}
</style>
