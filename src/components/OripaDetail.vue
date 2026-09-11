<template>
  <div ref="oripaDetail" class="oripa-detail">
    <!-- =========================
         이미지 + 장소명
    ========================== -->
    <div class="place-image-wrap">
      <img class="place-image" :src="currentPlaceImage" :alt="place.name" />

      <div class="place-image-overlay"></div>

      <div class="place-image-info">
        <h2>{{ place.name }}</h2>

        <p v-if="place.branchName">
          {{ place.branchName }}
        </p>
      </div>
    </div>

    <!-- =========================
         탭
    ========================== -->
    <div class="detail-tabs">
      <button
        type="button"
        class="detail-tab"
        :class="{ active: activeTab === 'all' }"
        @click="scrollToTab('all')"
      >
        전체
      </button>

      <button
        type="button"
        class="detail-tab"
        :class="{ active: activeTab === 'info' }"
        @click="scrollToTab('info')"
      >
        정보
      </button>

      <button
        type="button"
        class="detail-tab"
        :class="{ active: activeTab === 'comments' }"
        @click="scrollToTab('comments')"
      >
        댓글
      </button>
    </div>

    <div class="content">
      <!-- =========================
           핵심 정보 카드
      ========================== -->
      <div ref="infoSection" class="summary-card">
        <div class="summary-row copyable-row">
          <MapPin class="summary-icon" aria-hidden="true" />
          <div class="summary-content">
            <strong :class="{ empty: !place.address }">
              {{ place.address || '정보 없음' }}
            </strong>
          </div>
          <div class="copy-control">
            <button
              type="button"
              class="copy-button"
              aria-label="주소 복사"
              :disabled="!place.address"
              @click="copyAddress"
            >
              <Copy aria-hidden="true" />
            </button>
            <Transition name="copy-feedback">
              <span
                v-if="copyFeedbackTarget === 'address'"
                class="copy-feedback"
                role="status"
                aria-live="polite"
              >
                {{ copyFeedback }}
              </span>
            </Transition>
          </div>
        </div>

        <div class="summary-row">
          <Clock class="summary-icon" aria-hidden="true" />
          <div class="summary-content">
            <strong :class="{ empty: !place.businessHours }">
              {{ place.businessHours || '정보 없음' }}
            </strong>
          </div>
        </div>

        <div class="summary-row">
          <CalendarDays class="summary-icon" aria-hidden="true" />
          <div class="summary-content">
            <strong :class="{ empty: !place.holidayInfo }">
              {{ place.holidayInfo || '정보 없음' }}
            </strong>
          </div>
        </div>

        <div class="summary-row copyable-row">
          <Phone class="summary-icon" aria-hidden="true" />
          <div class="summary-content">
            <strong :class="{ empty: !place.phone }">
              {{ place.phone || '정보 없음' }}
            </strong>
          </div>
          <div class="copy-control">
            <button
              type="button"
              class="copy-button"
              aria-label="전화번호 복사"
              :disabled="!place.phone"
              @click="copyPhone"
            >
              <Copy aria-hidden="true" />
            </button>
            <Transition name="copy-feedback">
              <span
                v-if="copyFeedbackTarget === 'phone'"
                class="copy-feedback"
                role="status"
                aria-live="polite"
              >
                {{ copyFeedback }}
              </span>
            </Transition>
          </div>
        </div>

        <!-- <div class="summary-row">
          <ShoppingBag class="summary-icon" aria-hidden="true" />
          <div class="summary-content">
            <strong :class="{ empty: !place.oripaInfo }">
              {{ place.oripaInfo || '정보 없음' }}
            </strong>
          </div>
        </div> -->
      </div>

      <!-- =========================
           액션 버튼
      ========================== -->
      <div class="actions">
        <button type="button" :class="{ favorite: isFavorite }" @click="toggleFavorite">
          <FontAwesomeIcon :icon="isFavorite ? faHeartSolid : faHeartRegular" />
          <span>좋아요</span>
        </button>

        <button type="button" @click="sharePlace">
          <FontAwesomeIcon :icon="faShareFromSquare" />
          <span>공유</span>
        </button>

        <button type="button" @click="scrollToComments">
          <FontAwesomeIcon :icon="faComment" />
          <span>댓글</span>
        </button>

        <button type="button" @click="openDirections">
          <FontAwesomeIcon :icon="faCompass" />
          <span>길찾기</span>
        </button>
      </div>

      <!-- =========================
           정보 수정 요청
      ========================== -->
      <button class="edit-button" type="button" @click="editModalOpen = true">
        정보 수정 요청
      </button>

      <!-- =========================
           오리파 소개
      ========================== -->
      <div class="section-divider"></div>
      <h3 class="introduction-header">소개글</h3>
      <OripaIntroduction
        v-if="oripaPlace"
        :place-name="place.name"
        :oripa-place="oripaPlace"
        :tags="place.tags"
      />

      <!-- =========================
           댓글
      ========================== -->
      <CommentSection ref="commentSection" :place-id="place.id" />

      <EditRequestModal :open="editModalOpen" :place="place" @close="editModalOpen = false" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
  faHeart as faHeartRegular,
  faComment,
  faShareFromSquare,
  faCompass,
} from '@fortawesome/free-regular-svg-icons'

import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons'
import { CalendarDays, Clock, Copy, Phone, MapPin, ShoppingBag } from '@lucide/vue'

import CommentSection from '@/components/common/CommentSection.vue'
import EditRequestModal from '@/components/common/EditRequestModal.vue'
import OripaIntroduction from '@/components/OripaIntroduction.vue'

import { getFavorite, addFavorite, removeFavorite } from '@/api/favoriteApi'

import { copyToClipboard } from '@/utils/clipboard'
import { shareContent } from '@/utils/shareContent'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const DEFAULT_ORIPA_IMAGE = '/images/places/oripa-store.png'

const props = defineProps({
  place: {
    type: Object,
    required: true,
  },
})

const currentPlaceImage = computed(() => props.place.imageUrl || DEFAULT_ORIPA_IMAGE)
const oripaPlace = computed(() => {
  const detail = props.place.type === 'ORIPA' ? props.place.oripaPlace : null

  return detail && typeof detail === 'object' ? detail : null
})
const isFavorite = ref(false)

const activeTab = ref('all')

const oripaDetail = ref(null)
const infoSection = ref(null)
const commentSection = ref(null)

const editModalOpen = ref(false)
const copyFeedback = ref('')
const copyFeedbackTarget = ref('')

let scrollContainer = null
let scrollEndTimer = null
let isProgrammaticScrolling = false
let copyFeedbackTimer = null

const copyPlaceInfo = async (value, label, target) => {
  const text = value?.trim()
  if (!text) return

  clearTimeout(copyFeedbackTimer)
  copyFeedbackTarget.value = target

  try {
    await copyToClipboard(text)
    copyFeedback.value = `${label}가 복사되었습니다.`
  } catch (error) {
    console.error(`${label} 복사 실패:`, error)
    copyFeedback.value = `${label}를 복사하지 못했습니다.`
  }

  copyFeedbackTimer = setTimeout(() => {
    copyFeedback.value = ''
    copyFeedbackTarget.value = ''
  }, 1800)
}

const copyAddress = () => copyPlaceInfo(props.place?.address, '주소', 'address')
const copyPhone = () => copyPlaceInfo(props.place?.phone, '전화번호', 'phone')

/* =========================
   탭 스크롤 상태 종료
========================= */

const finishProgrammaticScroll = () => {
  clearTimeout(scrollEndTimer)

  scrollEndTimer = setTimeout(() => {
    isProgrammaticScrolling = false
    updateActiveTab()
  }, 150)
}

/* =========================
   섹션 위치 계산
========================= */

const getSectionTop = (target) => {
  if (!scrollContainer || !target) return Infinity

  return (
    target.getBoundingClientRect().top -
    scrollContainer.getBoundingClientRect().top +
    scrollContainer.scrollTop
  )
}

/* =========================
   현재 탭 변경
========================= */

const updateActiveTab = () => {
  if (!scrollContainer) return

  if (isProgrammaticScrolling) {
    finishProgrammaticScroll()
    return
  }

  const currentPosition = scrollContainer.scrollTop + 48

  const activationMargin = 4

  const infoTop = getSectionTop(infoSection.value)

  const commentsTop = getSectionTop(commentSection.value?.getCommentElement())

  if (currentPosition + activationMargin >= commentsTop) {
    activeTab.value = 'comments'
  } else if (currentPosition + activationMargin >= infoTop) {
    activeTab.value = 'info'
  } else {
    activeTab.value = 'all'
  }
}

/* =========================
   사이드바 내부 스크롤
========================= */

const scrollWithinSidebar = (target, offset = 0) => {
  const container = oripaDetail.value?.closest('.place-content')

  if (!container || !target) return

  const top =
    target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop

  container.scrollTo({
    top: top - offset,
    behavior: 'smooth',
  })
}

/* =========================
   탭 클릭
========================= */

const scrollToTab = (tab) => {
  activeTab.value = tab
  isProgrammaticScrolling = true

  finishProgrammaticScroll()

  if (tab === 'all') {
    const container = oripaDetail.value?.closest('.place-content')

    container?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    return
  }

  if (tab === 'info') {
    scrollWithinSidebar(infoSection.value, 48)

    return
  }

  commentSection.value?.scrollToComments(48)
}

/* =========================
   댓글 위치로 이동
========================= */

const scrollToComments = () => {
  activeTab.value = 'comments'
  isProgrammaticScrolling = true

  finishProgrammaticScroll()

  commentSection.value?.scrollToComments(48)
}

/* =========================
   스크롤 이벤트
========================= */

onMounted(() => {
  scrollContainer = oripaDetail.value?.closest('.place-content')

  scrollContainer?.addEventListener('scroll', updateActiveTab, { passive: true })

  updateActiveTab()
})

onBeforeUnmount(() => {
  clearTimeout(scrollEndTimer)
  clearTimeout(copyFeedbackTimer)

  scrollContainer?.removeEventListener('scroll', updateActiveTab)
})

/* =========================
   좋아요 상태 조회
========================= */

const loadFavorite = async () => {
  if (!props.place?.id) return

  if (!authStore.user) {
    isFavorite.value = false
    return
  }

  try {
    isFavorite.value = await getFavorite(props.place.id)
  } catch (error) {
    console.error('좋아요 조회 실패:', error)
  }
}

/* =========================
   좋아요 추가 / 취소
========================= */

const toggleFavorite = async () => {
  if (!props.place?.id) return

  if (!authStore.user) {
    isFavorite.value = false
    return
  }

  try {
    if (isFavorite.value) {
      await removeFavorite(props.place.id)
      isFavorite.value = false
    } else {
      await addFavorite(props.place.id)
      isFavorite.value = true
    }
  } catch (error) {
    console.error('좋아요 처리 실패:', error)
  }
}

/* =========================
   장소 변경
========================= */

watch(
  [() => props.place?.id, () => authStore.user],
  () => {
    clearTimeout(copyFeedbackTimer)
    copyFeedback.value = ''
    copyFeedbackTarget.value = ''
    activeTab.value = 'all'
    loadFavorite()
  },
  {
    immediate: true,
  },
)

/* =========================
   길찾기
========================= */

const openDirections = () => {
  const { latitude, longitude, name } = props.place

  if (!latitude || !longitude) return

  const destination = `${longitude},${latitude},${encodeURIComponent(name)}`

  const url = `https://map.naver.com/p/directions/-/${destination}/-/transit`

  window.open(url, '_blank')
}

/* =========================
   공유
========================= */

const sharePlace = async () => {
  await shareContent({
    title: props.place.name,
    text: `${props.place.name} - ` + `${props.place.branchName || ''}`,
  })
}
</script>

<style scoped>
.oripa-detail {
  width: 100%;
}

/* =========================
   이미지
========================= */

.place-image-wrap {
  position: relative;

  width: calc(100% + 20px);
  height: 230px;

  margin-left: -10px;

  overflow: hidden;
}

.place-image {
  display: block;

  width: 100%;
  height: 100%;

  object-fit: cover;
}

.image-placeholder {
  display: grid;
  place-items: center;

  background: #222;
  color: #fff;

  font-size: 26px;
  font-weight: 700;
  letter-spacing: 3px;
}

.place-image-overlay {
  position: absolute;
  inset: 0;

  background: rgba(0, 0, 0, 0.35);
}

.place-image-info {
  position: absolute;

  left: 22px;
  bottom: 20px;

  z-index: 1;

  color: #fff;
}

.place-image-info h2 {
  margin: 0;

  color: #fff;

  font-size: 24px;
  font-weight: 800;
  line-height: 1.25;

  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.place-image-info p {
  margin: 5px 0 0;

  color: #fff;

  font-size: 14px;
  font-weight: 600;

  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* =========================
   탭
========================= */

.detail-tabs {
  position: sticky;
  top: 0;
  z-index: 10;

  display: flex;
  align-items: center;
  gap: 20px;

  height: 48px;
  padding: 0 20px;

  border-bottom: 1px solid #e8e8e8;

  background: #fff;

  font-weight: 500;
}

.detail-tab {
  position: relative;

  height: 48px;
  padding: 0 2px;

  border: none;

  background: transparent;
  color: #555;

  font-size: 14px;
  font-weight: 700;

  cursor: pointer;
}

.detail-tab.active {
  color: #635bff;
}

.detail-tab.active::after {
  content: '';

  position: absolute;

  left: 0;
  right: 0;
  bottom: -1px;

  height: 2px;

  background: #635bff;
}

/* =========================
   콘텐츠
========================= */

.content {
  padding: 18px 18px 5px;
}

/* =========================
   핵심 정보
========================= */

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.summary-row.copyable-row {
  grid-template-columns: 20px minmax(0, 1fr) auto;
}

.copy-control {
  position: relative;
  align-self: center;
  justify-self: end;
}

.copy-button {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.copy-button:disabled {
  cursor: default;
  opacity: 0.45;
}

.copy-button:focus-visible {
  outline: 2px solid #635bff;
  outline-offset: 2px;
  border-radius: 3px;
}

.copy-button svg {
  width: 17px;
  height: 17px;
  color: rgb(142 148 163);
}

.copy-feedback {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 5;
  width: max-content;
  max-width: 190px;
  padding: 7px 9px;
  border-radius: 6px;
  background: #24262d;
  color: #fff;
  font-size: 12px;
  line-height: 1.3;
  pointer-events: none;
  box-shadow: 0 4px 12px rgb(0 0 0 / 16%);
}

.copy-feedback-enter-active,
.copy-feedback-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.copy-feedback-enter-from,
.copy-feedback-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

.summary-icon {
  width: 18px;
  margin-top: 2px;
  color: rgb(142 148 163);
  font-size: 17px;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.summary-label {
  color: #888;
  font-size: 12px;
  line-height: 1.4;
}

.summary-row strong {
  color: #444;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  word-break: keep-all;
}

.summary-row strong.empty {
  color: #444;
}

/* =========================
   액션
========================= */

.actions {
  display: flex;
  align-items: center;
  justify-content: space-around;

  margin: 26px 0 22px;
}

.actions button {
  display: flex;
  flex-direction: column;
  align-items: center;

  min-width: 54px;

  padding: 0;

  border: none;

  background: none;
  color: #555;

  cursor: pointer;
}

.actions button svg {
  color: #727272;

  font-size: 20px;
}

.actions button span {
  margin-top: 7px;

  color: #444;

  font-size: 13px;
}

.actions button:hover,
.actions button:hover svg,
.actions button:hover span {
  color: #635bff;
}

.actions button.favorite,
.actions button.favorite svg,
.actions button.favorite span {
  color: #635bff;
}

/* =========================
   정보 수정 요청
========================= */

.edit-button {
  width: 100%;
  height: 46px;

  margin-top: 4px;

  box-sizing: border-box;

  border: none;
  border-radius: 7px;

  /* background: #f3f4f6; */
  background: #635bff;
  color: #fff;

  font-size: 14px;
  font-weight: 700;

  cursor: pointer;

  transition: background 0.15s ease;
}

.edit-button:hover {
  background: #5147f5;
}

.section-divider {
  height: 8px;
  margin: 24px -18px;
  background: #f3f4f6;
}

.introduction-header {
  color: #222;
  font-size: 17px;
  font-weight: 700;
}
/* =========================
   모바일
========================= */

@media (max-width: 600px) {
  .place-image-wrap {
    height: 210px;
  }

  .place-image-info h2 {
    font-size: 22px;
  }

  .detail-tabs {
    padding: 0 18px;
  }

  .content {
    padding: 18px 18px 5px;
  }
}
</style>
