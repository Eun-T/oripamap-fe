<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-backdrop"
      @mousedown="handleBackdropMouseDown"
      @mouseup="handleBackdropMouseUp"
    >
      <div class="modal">
        <div class="modal-header">
          <h2>정보 수정 요청</h2>

          <button type="button" class="close-button" @click="closeModal">×</button>
        </div>

        <div class="place-summary">
          <strong>{{ place.name }}</strong>

          <!-- <span v-if="place.branchName">
          {{ place.branchName }}
        </span> -->

          <p>{{ place.address }}</p>
        </div>

        <div class="request-section">
          <h3>
            어떤 정보가 잘못됐나요?
            <span>*</span>
            (중복 가능)
          </h3>

          <label
            v-for="item in requestTypes"
            :key="item.value"
            class="request-option"
            :class="{ selected: selectedTypes.includes(item.value) }"
          >
            <input v-model="selectedTypes" type="checkbox" :value="item.value" />

            <span class="custom-checkbox"></span>

            <span class="option-label">
              {{ item.label }}
            </span>
          </label>
        </div>

        <div class="memo-section">
          <label for="requestMemo">
            추가 설명
            <span>(선택)</span>
          </label>

          <textarea
            id="requestMemo"
            v-model="memo"
            maxlength="500"
            placeholder="올바른 정보나 추가로 알려주실 내용을 적어주세요."
          ></textarea>

          <div class="memo-count">{{ memo.length }} / 500</div>
        </div>

        <div class="modal-actions">
          <button type="button" class="cancel-button" @click="closeModal">취소</button>

          <button
            type="button"
            class="submit-button"
            :disabled="!authStore.user || selectedTypes.length === 0 || submitting"
            @click="submitRequest"
          >
            {{ authStore.user ? '수정 요청 보내기' : '로그인 후 요청 가능' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { addEditRequest } from '@/api/editRequestApi'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },

  place: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])
const authStore = useAuthStore()

const requestTypes = [
  {
    value: 'PLACE_CLOSED',
    label: '장소가 없어졌어요',
  },
  {
    value: 'LOCATION_WRONG',
    label: '위치가 잘못됐어요',
  },
  {
    value: 'BUSINESS_HOURS_WRONG',
    label: '운영시간 / 휴무일이 달라요',
  },
  {
    value: 'NAME_WRONG',
    label: '장소명 / 지점명이 달라요',
  },
  {
    value: 'OTHER',
    label: '기타 정보가 잘못됐어요',
  },
]

const selectedTypes = ref([])
const memo = ref('')
const submitting = ref(false)

const resetForm = () => {
  selectedTypes.value = []
  memo.value = ''
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const submitRequest = async () => {
  if (!authStore.user) return
  if (selectedTypes.value.length === 0) return
  if (submitting.value) return

  try {
    submitting.value = true

    await addEditRequest({
      placeId: props.place.id,
      requestTypes: selectedTypes.value,
      memo: memo.value.trim(),
    })

    alert('수정 요청이 접수되었습니다.')

    resetForm()
    emit('close')
  } catch (error) {
    console.error('수정 요청 실패:', error)
    alert('수정 요청에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

const backdropMouseDown = ref(false)

const handleBackdropMouseDown = (event) => {
  backdropMouseDown.value = event.target === event.currentTarget
}

const handleBackdropMouseUp = (event) => {
  const mouseUpOnBackdrop = event.target === event.currentTarget

  if (backdropMouseDown.value && mouseUpOnBackdrop) {
    closeModal()
  }

  backdropMouseDown.value = false
}

watch(
  () => props.open,
  (open) => {
    if (!open) {
      resetForm()
    }
  },
)
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background: rgba(15, 23, 42, 0.32);
  backdrop-filter: blur(3px);

  z-index: 2000;
}

.modal {
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 40px);

  padding: 22px;

  overflow-y: auto;

  border-radius: 8px;

  background: #fff;

  box-sizing: border-box;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 16px;
}

.modal-header h2 {
  margin: 0;

  color: #222;

  font-size: 18px;
  font-weight: 700;
}

.close-button {
  border: none;
  background: none;

  color: #333;

  font-size: 26px;
  line-height: 1;

  cursor: pointer;
}

.place-summary {
  display: flex;
  flex-direction: column;
  gap: 0px;

  padding: 12px 14px;

  border: 1px solid #e3e5e8;
  border-radius: 10px;

  background: #f7f8fa;
}

.place-summary strong {
  color: #222;

  font-size: 15px;
}

.place-summary span {
  color: #555;

  font-size: 14px;
}

.place-summary p {
  margin: 2px 0 0;

  color: #777;

  font-size: 13px;
}

.request-section {
  margin-top: 16px;
}

.request-section h3 {
  margin: 0 0 10px;

  color: #222;

  font-size: 14px;
  font-weight: 700;
}

.request-section h3 span {
  color: #635bff;
}

.request-option {
  display: flex;
  align-items: center;
  gap: 10px;

  min-height: 44px;

  padding: 0 12px;
  margin-bottom: 7px;

  border: 1px solid #e5e5e5;
  border-radius: 10px;

  cursor: pointer;

  box-sizing: border-box;
}

.request-option:hover {
  border-color: #bcb8ff;
  background: #faf9ff;
}

.request-option input {
  display: none;
}

.custom-checkbox {
  position: relative;

  flex-shrink: 0;

  width: 20px;
  height: 20px;

  border: 1px solid #d8d8d8;
  border-radius: 6px;

  background: #fff;

  box-sizing: border-box;
}

.request-option input:checked + .custom-checkbox {
  border-color: #635bff;
  background: #635bff;
}

.request-option input:checked + .custom-checkbox::after {
  content: '';

  position: absolute;

  /* top: 3px; */
  left: 6px;

  width: 6px;
  height: 10px;

  border: solid #fff;
  border-width: 0 2px 2px 0;

  transform: rotate(45deg);
}

.option-label {
  color: #333;

  font-size: 14px;
}

.memo-section {
  margin-top: 16px;
}

.memo-section label {
  display: block;

  margin-bottom: 9px;

  color: #333;

  font-size: 14px;
  font-weight: 700;
}

.memo-section label span {
  color: #999;

  font-weight: 400;
}

.memo-section textarea {
  width: 100%;
  min-height: 90px;

  padding: 10px 12px;

  resize: none;

  border: 1px solid #ddd;
  border-radius: 10px;

  outline: none;

  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;

  box-sizing: border-box;
}

.memo-section textarea:focus {
  border-color: #635bff;
}

.memo-count {
  margin-top: 5px;

  color: #aaa;

  font-size: 12px;
  text-align: right;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  margin-top: 10px;
}

.cancel-button,
.submit-button {
  height: 40px;

  padding: 0 18px;

  border-radius: 8px;

  font-size: 14px;
  font-weight: 700;

  cursor: pointer;
}

.cancel-button {
  border: 1px solid #ddd;

  background: #fff;
  color: #444;
}

.submit-button {
  border: none;

  background: #635bff;
  color: #fff;
}

.submit-button:disabled {
  background: #ddd;
  color: #999;

  cursor: default;
}

.request-option.selected {
  border-color: #635bff;
  background: #f7f6ff;
}

.request-option.selected .option-label {
  color: #222;
}
</style>
