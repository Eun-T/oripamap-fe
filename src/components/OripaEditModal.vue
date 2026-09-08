<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-backdrop"
      @mousedown="backdropPressed = $event.target === $event.currentTarget"
      @mouseup="closeFromBackdrop"
    >
      <form class="modal" aria-labelledby="oripa-edit-title" @submit.prevent="submit">
        <header class="modal-header">
          <div>
            <h2 id="oripa-edit-title">매장 정보 수정</h2>
            <p>
              {{ place.name }}<template v-if="place.branchName"> · {{ place.branchName }}</template>
            </p>
          </div>
          <button
            type="button"
            class="close-button"
            aria-label="닫기"
            :disabled="submitting"
            @click="close"
          >
            ×
          </button>
        </header>

        <label class="field">
          <span>한줄 소개</span>
          <input
            v-model="summary"
            type="text"
            maxlength="200"
            placeholder="매장을 한 문장으로 소개해주세요."
          />
        </label>

        <label class="field">
          <span>상세 소개</span>
          <textarea
            v-model="introduction"
            maxlength="5000"
            rows="6"
            placeholder="매장에 대한 상세한 소개를 입력해주세요."
          ></textarea>
        </label>

        <section class="form-section" aria-labelledby="social-link-title">
          <div class="section-heading">
            <h3 id="social-link-title">소셜 링크</h3>
            <button type="button" class="text-button" @click="addSocialLink">+ 링크 추가</button>
          </div>
          <p v-if="!socialLinks.length" class="empty-text">등록된 소셜 링크가 없습니다.</p>
          <div v-for="(link, index) in socialLinks" :key="link.key" class="social-row">
            <input
              v-model="link.platform"
              type="text"
              maxlength="30"
              aria-label="플랫폼"
              placeholder="INSTAGRAM"
            />
            <input
              v-model="link.url"
              type="url"
              maxlength="1000"
              aria-label="링크 주소"
              placeholder="https://..."
            />
            <button
              type="button"
              class="remove-row-button"
              :aria-label="`${index + 1}번 링크 삭제`"
              @click="removeSocialLink(index)"
            >
              ×
            </button>
          </div>
        </section>

        <section class="form-section" aria-labelledby="image-title">
          <div class="section-heading">
            <div>
              <h3 id="image-title">매장 이미지</h3>
              <small>위에서 아래 순서대로 상세 화면에 표시됩니다.</small>
            </div>
            <button type="button" class="text-button" @click="imageInput?.click()">
              + 이미지 추가
            </button>
            <input
              ref="imageInput"
              class="hidden-input"
              type="file"
              accept="image/*"
              multiple
              @change="addImages"
            />
          </div>
          <p v-if="!images.length" class="empty-text">등록된 이미지가 없습니다.</p>
          <div class="image-list">
            <article v-for="(image, index) in images" :key="image.key" class="image-item">
              <img :src="image.previewUrl" :alt="`${index + 1}번 매장 이미지`" />
              <div class="image-meta">
                <strong>{{ image.kind === 'existing' ? '기존 이미지' : image.file.name }}</strong>
                <span>{{ index + 1 }}번째</span>
              </div>
              <div class="image-actions">
                <button
                  type="button"
                  :disabled="index === 0"
                  :aria-label="`${index + 1}번 이미지를 앞으로 이동`"
                  @click="moveImage(index, -1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  :disabled="index === images.length - 1"
                  :aria-label="`${index + 1}번 이미지를 뒤로 이동`"
                  @click="moveImage(index, 1)"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="delete-button"
                  :aria-label="`${index + 1}번 이미지 삭제`"
                  @click="removeImage(index)"
                >
                  삭제
                </button>
              </div>
            </article>
          </div>
        </section>

        <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>

        <footer class="modal-actions">
          <button type="button" class="cancel-button" :disabled="submitting" @click="close">
            취소
          </button>
          <button type="submit" class="submit-button" :disabled="submitting">
            {{ submitting ? '저장 중...' : '저장' }}
          </button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { usePlaceStore } from '@/stores/placeStore'

const props = defineProps({
  open: { type: Boolean, default: false },
  place: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const placeStore = usePlaceStore()

const summary = ref('')
const introduction = ref('')
const socialLinks = ref([])
const images = ref([])
const imageInput = ref(null)
const submitting = ref(false)
const errorMessage = ref('')
const backdropPressed = ref(false)
let nextKey = 0

const sortedExistingImages = () =>
  (Array.isArray(props.place.oripaPlace?.images) ? props.place.oripaPlace.images : [])
    .map((image, originalIndex) => ({ ...image, originalIndex }))
    .sort((a, b) => {
      const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : Infinity
      const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : Infinity
      return aOrder - bOrder || a.originalIndex - b.originalIndex
    })

const revokeNewImageUrls = () => {
  images.value.forEach((image) => {
    if (image.kind === 'new') URL.revokeObjectURL(image.previewUrl)
  })
}

const initialize = () => {
  revokeNewImageUrls()
  const detail = props.place.oripaPlace || {}
  summary.value = detail.summary || ''
  introduction.value = detail.introduction || ''
  socialLinks.value = (Array.isArray(detail.socialLinks) ? detail.socialLinks : []).map((link) => ({
    key: `social-${nextKey++}`,
    platform: link.platform || '',
    url: link.url || '',
  }))
  images.value = sortedExistingImages()
    .filter((image) => image?.imageUrl)
    .map((image) => ({
      key: `existing-${image.id ?? nextKey++}`,
      kind: 'existing',
      id: image.id,
      previewUrl: image.imageUrl,
    }))
  errorMessage.value = ''
  if (imageInput.value) imageInput.value.value = ''
}

const addSocialLink = () => {
  socialLinks.value.push({ key: `social-${nextKey++}`, platform: '', url: '' })
}
const removeSocialLink = (index) => socialLinks.value.splice(index, 1)

const addImages = (event) => {
  const files = Array.from(event.target.files || []).filter((file) =>
    file.type.startsWith('image/'),
  )
  files.forEach((file) => {
    images.value.push({
      key: `new-${nextKey++}`,
      kind: 'new',
      file,
      previewUrl: URL.createObjectURL(file),
    })
  })
  event.target.value = ''
}

const removeImage = (index) => {
  const [removed] = images.value.splice(index, 1)
  if (removed?.kind === 'new') URL.revokeObjectURL(removed.previewUrl)
}
const moveImage = (index, offset) => {
  const targetIndex = index + offset
  if (targetIndex < 0 || targetIndex >= images.value.length) return
  const [image] = images.value.splice(index, 1)
  images.value.splice(targetIndex, 0, image)
}

const close = () => {
  if (submitting.value) return
  emit('close')
}
const closeFromBackdrop = (event) => {
  if (backdropPressed.value && event.target === event.currentTarget) close()
  backdropPressed.value = false
}

const submit = async () => {
  if (submitting.value) return
  errorMessage.value = ''

  const links = socialLinks.value
    .map((link) => ({ platform: link.platform.trim(), url: link.url.trim() }))
    .filter((link) => link.platform || link.url)

  if (links.some((link) => !link.platform || !link.url)) {
    errorMessage.value = '소셜 링크의 플랫폼과 주소를 모두 입력해주세요.'
    return
  }
  if (images.value.some((image) => image.kind === 'existing' && image.id == null)) {
    errorMessage.value = '기존 이미지 식별정보가 없어 저장할 수 없습니다. 다시 시도해주세요.'
    return
  }

  const files = images.value.filter((image) => image.kind === 'new').map((image) => image.file)
  const fileIndexes = new Map(files.map((file, index) => [file, index]))
  const data = {
    summary: summary.value.trim(),
    introduction: introduction.value.trim(),
    socialLinks: links,
    images: images.value.map((image) =>
      image.kind === 'existing' ? { id: image.id } : { fileIndex: fileIndexes.get(image.file) },
    ),
  }

  try {
    submitting.value = true
    await placeStore.saveOripaPlace(props.place.id, data, files)
    emit('close')
  } catch (error) {
    console.error('ORIPA 매장 정보 수정 실패:', error)
    if (error.response?.status === 403) {
      errorMessage.value = '이 매장 정보를 수정할 권한이 없습니다.'
    } else {
      errorMessage.value = '저장하지 못했습니다. 입력 내용은 유지되니 잠시 후 다시 시도해주세요.'
    }
  } finally {
    submitting.value = false
  }
}

watch([() => props.open, () => props.place.id], ([open]) => {
  if (open) {
    initialize()
  } else {
    revokeNewImageUrls()
    images.value = []
  }
})
onBeforeUnmount(revokeNewImageUrls)
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(15 23 42 / 38%);
  backdrop-filter: blur(3px);
}
.modal {
  width: min(640px, 100%);
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  padding: 24px;
  box-sizing: border-box;
  border-radius: 12px;
  background: #fff;
  color: #292929;
}
.modal-header,
.section-heading,
.modal-actions,
.social-row,
.image-item,
.image-actions {
  display: flex;
  align-items: center;
}
.modal-header {
  justify-content: space-between;
  margin-bottom: 20px;
}
.modal-header h2,
.form-section h3 {
  margin: 0;
}
.modal-header h2 {
  font-size: 20px;
}
.modal-header p {
  margin: 4px 0 0;
  color: #777;
  font-size: 13px;
}
.close-button {
  padding: 4px 8px;
  border: 0;
  background: none;
  color: #555;
  font-size: 27px;
  cursor: pointer;
}
.field {
  display: block;
  margin-top: 16px;
}
.field > span,
.form-section h3 {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
}
.field input,
.field textarea,
.social-row input {
  width: 100%;
  padding: 10px 12px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  font: inherit;
  font-size: 14px;
}
.field textarea {
  resize: vertical;
  line-height: 1.6;
}
.field input:focus,
.field textarea:focus,
.social-row input:focus {
  border-color: #635bff;
}
.form-section {
  margin-top: 24px;
}
.section-heading {
  justify-content: space-between;
  gap: 12px;
}
.section-heading h3 {
  margin-bottom: 0;
}
.section-heading small {
  display: block;
  margin-top: 3px;
  color: #888;
}
.text-button {
  flex: 0 0 auto;
  padding: 7px 10px;
  border: 1px solid #dedcf8;
  border-radius: 7px;
  background: #f7f6ff;
  color: #635bff;
  font-weight: 700;
  cursor: pointer;
}
.social-row {
  gap: 8px;
  margin-top: 9px;
}
.social-row input:first-child {
  flex: 0 0 125px;
}
.remove-row-button {
  flex: 0 0 34px;
  height: 38px;
  border: 0;
  background: transparent;
  color: #888;
  font-size: 22px;
  cursor: pointer;
}
.hidden-input {
  display: none;
}
.empty-text {
  margin: 10px 0 0;
  color: #999;
  font-size: 13px;
}
.image-list {
  display: grid;
  gap: 9px;
  margin-top: 10px;
}
.image-item {
  gap: 12px;
  padding: 9px;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
}
.image-item img {
  flex: 0 0 72px;
  width: 72px;
  height: 58px;
  border-radius: 6px;
  object-fit: cover;
  background: #f3f4f6;
}
.image-meta {
  flex: 1;
  min-width: 0;
}
.image-meta strong,
.image-meta span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.image-meta strong {
  font-size: 13px;
}
.image-meta span {
  margin-top: 3px;
  color: #888;
  font-size: 12px;
}
.image-actions {
  gap: 4px;
}
.image-actions button {
  min-width: 31px;
  height: 31px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  color: #555;
  cursor: pointer;
}
.image-actions button:disabled {
  opacity: 0.35;
  cursor: default;
}
.image-actions .delete-button {
  color: #c24141;
}
.error-message {
  margin: 16px 0 0;
  padding: 10px 12px;
  border-radius: 7px;
  background: #fff1f1;
  color: #b42318;
  font-size: 13px;
}
.modal-actions {
  justify-content: flex-end;
  gap: 9px;
  margin-top: 22px;
}
.modal-actions button {
  min-width: 82px;
  height: 42px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
.cancel-button {
  border: 1px solid #ddd;
  background: #fff;
  color: #555;
}
.submit-button {
  border: 0;
  background: #635bff;
  color: #fff;
}
.modal-actions button:disabled,
.close-button:disabled {
  opacity: 0.6;
  cursor: default;
}
@media (max-width: 600px) {
  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }
  .modal {
    max-height: 92dvh;
    padding: 20px 16px calc(20px + env(safe-area-inset-bottom, 0px));
    border-radius: 16px 16px 0 0;
  }
  .social-row {
    align-items: stretch;
    flex-wrap: wrap;
  }
  .social-row input:first-child {
    flex: 1 1 110px;
  }
  .social-row input:nth-child(2) {
    flex: 2 1 220px;
  }
  .image-item {
    flex-wrap: wrap;
  }
  .image-actions {
    margin-left: auto;
  }
}
</style>
