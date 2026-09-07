<template>
  <section class="photo-section">
    <div class="photo-header">
      <h3>
        방문자 사진
        <span v-if="photoComments.length">{{ photoComments.length }}</span>
      </h3>

      <button
        v-if="photoComments.length > PREVIEW_COUNT"
        type="button"
        class="photo-all-button"
        @click="showAll = !showAll"
      >
        {{ showAll ? '접기' : '사진 전체' }}
        <span :class="{ expanded: showAll }">›</span>
      </button>
    </div>

    <div v-if="loading" class="photo-status">사진을 불러오는 중입니다.</div>

    <div v-else-if="loadFailed" class="photo-status">
      <span>사진을 불러오지 못했습니다.</span>
      <button type="button" @click="refresh">다시 시도</button>
    </div>

    <div v-else-if="photoComments.length === 0" class="photo-status">
      아직 등록된 사진이 없습니다.
    </div>

    <div v-else class="photo-list">
      <button
        v-for="comment in visiblePhotoComments"
        :key="comment.id"
        type="button"
        class="photo-item"
        :aria-label="`${comment.nickname}님의 사진 크게 보기`"
        @click="openPhoto(comment)"
      >
        <img :src="comment.imageUrl" :alt="`${comment.nickname}님의 방문 사진`" loading="lazy" />
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="selectedPhoto"
        class="photo-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="방문자 사진 크게 보기"
        @click.self="closePhoto"
      >
        <button type="button" class="lightbox-close" aria-label="사진 닫기" @click="closePhoto">
          ×
        </button>

        <img :src="selectedPhoto.imageUrl" :alt="`${selectedPhoto.nickname}님의 방문 사진`" />
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getPhotoComments } from '@/api/commentApi'

const PREVIEW_COUNT = 3

const emit = defineEmits(['loaded'])

const props = defineProps({
  placeId: {
    type: Number,
    required: true,
  },
})

const photoComments = ref([])
const loading = ref(false)
const loadFailed = ref(false)
const showAll = ref(false)
const selectedPhoto = ref(null)
let requestId = 0
let previousBodyOverflow = ''

const visiblePhotoComments = computed(() =>
  showAll.value ? photoComments.value : photoComments.value.slice(0, PREVIEW_COUNT),
)

const openPhoto = (comment) => {
  selectedPhoto.value = comment
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

const closePhoto = () => {
  if (!selectedPhoto.value) return
  selectedPhoto.value = null
  document.body.style.overflow = previousBodyOverflow
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') closePhoto()
}

const refresh = async () => {
  if (!props.placeId) {
    photoComments.value = []
    return
  }

  const currentRequestId = ++requestId
  loading.value = true
  loadFailed.value = false

  try {
    const comments = await getPhotoComments(props.placeId)

    if (currentRequestId === requestId) {
      photoComments.value = Array.isArray(comments) ? comments : []
      emit('loaded', photoComments.value)
    }
  } catch (error) {
    if (currentRequestId === requestId) {
      console.error('방문자 사진 조회 실패:', error)
      photoComments.value = []
      loadFailed.value = true
      emit('loaded', [])
    }
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
    }
  }
}

watch(
  () => props.placeId,
  () => {
    closePhoto()
    showAll.value = false
    refresh()
  },
  { immediate: true },
)

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  closePhoto()
})

defineExpose({ refresh })
</script>

<style scoped>
.photo-section {
  padding: 0;
}

.photo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.photo-header h3 {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  color: #222;
  font-size: 17px;
  font-weight: 700;
}

.photo-header h3 span {
  color: #635bff;
  font-size: 15px;
}

.photo-all-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: none;
  color: #333;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.photo-all-button:hover {
  color: #635bff;
}

.photo-all-button span {
  font-size: 22px;
  line-height: 1;
  transition: transform 0.2s ease;
}

.photo-all-button span.expanded {
  transform: rotate(90deg);
}

.photo-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.photo-item {
  aspect-ratio: 1;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  cursor: pointer;
}

.photo-item img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.photo-item:hover img {
  transform: scale(1.04);
}

.photo-item:focus-visible {
  outline: 2px solid #635bff;
  outline-offset: 2px;
}

.photo-lightbox {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.8);
}

.photo-lightbox img {
  display: block;
  max-width: min(92vw, 1200px);
  max-height: 88vh;
  border-radius: 8px;
  object-fit: contain;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.lightbox-close {
  position: fixed;
  top: 18px;
  right: 22px;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  background: transparent;
  color: #fff;
  font-size: 38px;
  line-height: 1;
  cursor: pointer;
}

.lightbox-close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.photo-status {
  padding: 30px 0;
  color: #999;
  font-size: 13px;
  text-align: center;
}

.photo-status button {
  margin-left: 8px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: #fff;
  color: #555;
  cursor: pointer;
}

@media (max-width: 600px) {
  .photo-header h3 {
    font-size: 16px;
  }

  .photo-lightbox {
    padding: 16px;
  }

  .photo-lightbox img {
    max-width: 94vw;
    max-height: 82vh;
  }
}
</style>
