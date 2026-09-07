<template>
  <div v-if="mode === 'comment'" class="comment-editor" :class="{ disabled: !user }">
    <textarea
      ref="commentTextarea"
      v-model="content"
      :maxlength="MAX_CONTENT_LENGTH"
      rows="1"
      :disabled="!user"
      :placeholder="
        user ? `${user.nickname}로 댓글 남기기` : '로그인 후 댓글을 작성할 수 있습니다.'
      "
      @input="resizeTextarea"
    ></textarea>

    <div v-if="previewImage" class="comment-image-preview">
      <img :src="previewImage" alt="첨부 사진 미리보기" />
      <button
        type="button"
        class="remove-image-button"
        aria-label="첨부 사진 삭제"
        @click="removeImage"
      >
        ×
      </button>
    </div>

    <div class="comment-editor-actions">
      <button
        type="button"
        class="editor-icon-button"
        :disabled="!user || imageProcessing"
        :aria-label="imageProcessing ? '사진 처리 중' : '사진 첨부'"
        @click="openImagePicker"
      >
        <FontAwesomeIcon :icon="faCamera" />
      </button>
      <input
        ref="imageInput"
        class="hidden-file-input"
        type="file"
        accept="image/jpeg,image/png"
        :disabled="imageProcessing"
        @change="handleImageChange"
      />
      <button
        type="button"
        class="editor-icon-button submit-icon"
        :disabled="!user || loading || imageProcessing || !content.trim()"
        aria-label="댓글 등록"
        @click="submit"
      >
        <FontAwesomeIcon :icon="faPen" />
      </button>
    </div>
  </div>

  <div v-else class="reply-form">
    <textarea
      v-model="content"
      :maxlength="MAX_CONTENT_LENGTH"
      placeholder="답글을 입력해주세요."
    ></textarea>
    <div class="reply-form-actions">
      <button type="button" class="reply-cancel-button" @click="emit('cancel')">취소</button>
      <button type="button" class="reply-submit-button" :disabled="loading" @click="submit">
        {{ loading ? '등록 중...' : '답글 등록' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCamera, faPen } from '@fortawesome/free-solid-svg-icons'
import imageCompression from 'browser-image-compression'

const props = defineProps({
  mode: { type: String, default: 'comment' },
  user: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'cancel'])
const content = ref('')
const commentTextarea = ref(null)
const imageInput = ref(null)
const selectedImage = ref(null)
const previewImage = ref(null)
const imageProcessing = ref(false)
const MAX_CONTENT_LENGTH = 300
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png']
let compressionController = null
let compressionRequestId = 0

const openImagePicker = () => {
  if (!props.user || imageProcessing.value) return
  imageInput.value?.click()
}

const clearSelectedImage = () => {
  if (previewImage.value) URL.revokeObjectURL(previewImage.value)
  selectedImage.value = null
  previewImage.value = null
}

const cancelImageProcessing = () => {
  compressionRequestId += 1
  compressionController?.abort()
  compressionController = null
  imageProcessing.value = false
}

const removeImage = () => {
  cancelImageProcessing()
  clearSelectedImage()
  if (imageInput.value) imageInput.value.value = ''
}

const handleImageChange = async (event) => {
  const input = event.target
  const file = input.files?.[0]
  if (!file) return

  input.value = ''

  if (imageProcessing.value) return

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    alert('JPG 또는 PNG 이미지만 첨부할 수 있습니다.')
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    alert('이미지 크기는 5MB 이하여야 합니다.')
    return
  }

  const requestId = ++compressionRequestId
  const controller = new AbortController()
  compressionController = controller
  imageProcessing.value = true

  try {
    const compressedImage = await imageCompression(file, {
      maxWidthOrHeight: 1600,
      initialQuality: file.type === 'image/jpeg' ? 0.8 : 1,
      fileType: file.type,
      useWebWorker: true,
      signal: controller.signal,
    })

    if (requestId !== compressionRequestId) return

    const processedFile =
      compressedImage instanceof File
        ? compressedImage
        : new File([compressedImage], file.name, {
            type: file.type,
            lastModified: file.lastModified,
          })

    clearSelectedImage()
    selectedImage.value = processedFile
    previewImage.value = URL.createObjectURL(processedFile)
  } catch (error) {
    if (requestId === compressionRequestId && !controller.signal.aborted) {
      console.error('이미지 처리 실패:', error)
      alert('이미지를 처리하지 못했습니다. 다른 이미지를 선택해주세요.')
    }
  } finally {
    if (requestId === compressionRequestId) {
      compressionController = null
      imageProcessing.value = false
    }
  }
}
const resizeTextarea = () => {
  if (!commentTextarea.value) return
  commentTextarea.value.style.height = 'auto'
  commentTextarea.value.style.height = `${commentTextarea.value.scrollHeight}px`
}
const resetEditor = async () => {
  content.value = ''
  removeImage()
  await nextTick()
  if (commentTextarea.value) commentTextarea.value.style.height = 'auto'
}
const submit = () => {
  if (imageProcessing.value) return
  if (content.value.length > MAX_CONTENT_LENGTH) {
    alert(`댓글과 답글은 ${MAX_CONTENT_LENGTH}자 이내로 입력해주세요.`)
    return
  }

  const trimmedContent = content.value.trim()
  if (!trimmedContent) {
    alert(props.mode === 'reply' ? '답글 내용을 입력해주세요.' : '댓글 내용을 입력해주세요.')
    return
  }
  emit('submit', trimmedContent, selectedImage.value)
}

defineExpose({ resetEditor })
onBeforeUnmount(removeImage)
</script>

<style scoped>
.comment-editor {
  position: relative;
  width: 100%;
  margin-bottom: 5px;
  padding: 12px 14px 10px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}
.comment-editor:focus-within {
  border-color: #635bff;
}
.comment-editor.disabled {
  background: #f8f8f8;
}
.comment-editor textarea {
  display: block;
  width: 100%;
  min-height: 28px;
  max-height: 180px;
  padding: 0 0 10px;
  box-sizing: border-box;
  border: none;
  outline: none;
  resize: none;
  overflow-y: auto;
  background: transparent;
  color: #222;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.comment-editor textarea::placeholder {
  color: #aaa;
}
.comment-editor-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.editor-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: #635bff;
  font-size: 18px;
  cursor: pointer;
}
.editor-icon-button:disabled {
  color: #bbb;
  cursor: default;
}
.hidden-file-input {
  display: none;
}
.comment-image-preview {
  position: relative;
  width: 86px;
  height: 86px;
  margin: 5px 0 10px;
}
.comment-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
.remove-image-button {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #222;
  color: #fff;
  cursor: pointer;
}
.reply-form {
  margin-top: 14px;
  padding: 12px;
  border-radius: 8px;
  background: #f7f7fa;
}
.reply-form textarea {
  width: 100%;
  min-height: 72px;
  padding: 10px 12px;
  box-sizing: border-box;
  resize: none;
  border: 1px solid #ddd;
  border-radius: 7px;
  outline: none;
  background: #fff;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
}
.reply-form textarea:focus {
  border-color: #635bff;
}
.reply-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.reply-form-actions button {
  height: 34px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.reply-cancel-button {
  border: 1px solid #ddd;
  background: #fff;
  color: #555;
}
.reply-submit-button {
  border: none;
  background: #635bff;
  color: #fff;
}
.reply-submit-button:disabled {
  opacity: 0.6;
  cursor: default;
}
@media (max-width: 600px) {
  .comment-editor textarea,
  .reply-form textarea {
    font-size: 13px;
  }
}
</style>
