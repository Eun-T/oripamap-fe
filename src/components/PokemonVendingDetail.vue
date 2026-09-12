<template>
  <div ref="vendingDetail" class="vending-detail">
    <!-- 이미지 + 장소명 -->
    <div class="place-image-wrap">
      <Transition name="place-image-fade">
        <img
          v-if="currentPlaceImage"
          :key="currentPlaceImage"
          class="place-image"
          :src="currentPlaceImage"
          :alt="place.name"
        />
      </Transition>

      <div class="place-image-overlay"></div>

      <div class="place-image-info">
        <h2>{{ place.name }}</h2>
        <p v-if="place.branchName">
          {{ place.branchName }}
        </p>
      </div>
    </div>

    <!-- 탭 -->
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
      <!-- 핵심 정보 카드 -->
      <div ref="infoSection" class="summary-card">
        <div class="summary-row address-row">
          <MapPin class="summary-icon" />
          <div class="summary-content">
            <button
              ref="addressValue"
              type="button"
              class="expandable-summary-value"
              :class="{ expanded: addressExpanded }"
              :disabled="!addressOverflowing && !addressExpanded"
              :aria-expanded="addressExpanded"
              :title="
                addressOverflowing || addressExpanded
                  ? addressExpanded
                    ? '주소 접기'
                    : '전체 주소 보기'
                  : undefined
              "
              @click="toggleAddress"
            >
              {{ place.address || '정보 없음' }}
            </button>
          </div>
          <button class="copy-button" @click="copyAddress">
            <Copy />
          </button>
        </div>

        <div class="summary-row">
          <Navigation class="summary-icon" />
          <div class="summary-content">
            <button
              ref="locationValue"
              type="button"
              class="expandable-summary-value"
              :class="{ expanded: locationExpanded }"
              :disabled="!locationOverflowing && !locationExpanded"
              :aria-expanded="locationExpanded"
              :title="
                locationOverflowing || locationExpanded
                  ? locationExpanded
                    ? '설치 위치 접기'
                    : '전체 설치 위치 보기'
                  : undefined
              "
              @click="toggleLocation"
            >
              {{ place.locationDetail || '정보 없음' }}
            </button>
          </div>
        </div>

        <div class="summary-row">
          <Clock class="summary-icon" />
          <div class="summary-content">
            <strong>{{ place.businessHours || '정보 없음' }}</strong>
          </div>
        </div>

        <div class="summary-row">
          <CalendarDays class="summary-icon" />
          <div class="summary-content">
            <strong>{{ place.holidayInfo || '정보 없음' }}</strong>
          </div>
        </div>
      </div>

      <!-- 좋아요 / 공유 / 댓글 / 길찾기 -->
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

      <!-- 정보 수정 요청 -->
      <button class="edit-button" type="button" @click="editModalOpen = true">
        정보 수정 요청
      </button>

      <!-- 댓글 -->
      <CommentSection ref="commentSection" :place-id="place.id" @photos-changed="setPlacePhotos" />

      <EditRequestModal :open="editModalOpen" :place="place" @close="editModalOpen = false" />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch, onMounted, onBeforeUnmount } from 'vue'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
  faHeart as faHeartRegular,
  faComment,
  faShareFromSquare,
  faCompass,
} from '@fortawesome/free-regular-svg-icons'

import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons'

import { MapPin, CalendarDays, Navigation, Copy, Clock } from '@lucide/vue'

import CommentSection from '@/components/common/CommentSection.vue'
import EditRequestModal from '@/components/common/EditRequestModal.vue'

import { getFavorite, addFavorite, removeFavorite } from '@/api/favoriteApi'
import { copyToClipboard } from '@/utils/clipboard'
import { shareContent } from '@/utils/shareContent'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const DEFAULT_VENDING_IMAGE = '/images/places/vending-machine.png'

const props = defineProps({
  place: {
    type: Object,
    required: true,
  },
})

const isFavorite = ref(false)
const activeTab = ref('all')
const vendingDetail = ref(null)
const infoSection = ref(null)
const commentSection = ref(null)
const editModalOpen = ref(false)
const placePhotos = ref([])
const currentImageIndex = ref(0)
const addressExpanded = ref(false)
const locationExpanded = ref(false)
const addressValue = ref(null)
const locationValue = ref(null)
const addressOverflowing = ref(false)
const locationOverflowing = ref(false)
let scrollContainer = null
let scrollEndTimer = null
let imageCarouselTimer = null
let summaryResizeObserver = null
let isProgrammaticScrolling = false

const copyAddress = async () => {
  const address = props.place?.address?.trim()
  if (!address) return

  try {
    await copyToClipboard(address)
  } catch (error) {
    console.error('주소 복사 실패:', error)
  }
}

const updateSummaryOverflow = () => {
  if (!addressExpanded.value && addressValue.value) {
    addressOverflowing.value = addressValue.value.scrollWidth > addressValue.value.clientWidth + 1
  }

  if (!locationExpanded.value && locationValue.value) {
    locationOverflowing.value =
      locationValue.value.scrollWidth > locationValue.value.clientWidth + 1
  }
}

const toggleAddress = async () => {
  if (!addressOverflowing.value && !addressExpanded.value) return
  addressExpanded.value = !addressExpanded.value

  if (!addressExpanded.value) {
    await nextTick()
    updateSummaryOverflow()
  }
}

const toggleLocation = async () => {
  if (!locationOverflowing.value && !locationExpanded.value) return
  locationExpanded.value = !locationExpanded.value

  if (!locationExpanded.value) {
    await nextTick()
    updateSummaryOverflow()
  }
}

const currentPlaceImage = computed(
  () => placePhotos.value[currentImageIndex.value]?.imageUrl || DEFAULT_VENDING_IMAGE,
)

const stopImageCarousel = () => {
  clearInterval(imageCarouselTimer)
  imageCarouselTimer = null
}

const startImageCarousel = () => {
  stopImageCarousel()

  if (placePhotos.value.length < 2) return

  imageCarouselTimer = setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % placePhotos.value.length
  }, 3000)
}

const getCreatedAtTime = (createdAt) => {
  if (Array.isArray(createdAt)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = createdAt
    return new Date(year, month - 1, day, hour, minute, second).getTime()
  }

  const time = Date.parse(createdAt)
  return Number.isNaN(time) ? 0 : time
}

const setPlacePhotos = (comments) => {
  const previousImageUrl = placePhotos.value[currentImageIndex.value]?.imageUrl

  const nextPhotos = (Array.isArray(comments) ? comments : [])
    .filter((comment) => comment?.parentCommentId == null && comment.imageUrl)
    .sort((a, b) => getCreatedAtTime(b.createdAt) - getCreatedAtTime(a.createdAt))
    .slice(0, 3)

  const previousImageIndex = nextPhotos.findIndex(
    (comment) => comment.imageUrl === previousImageUrl,
  )

  placePhotos.value = nextPhotos
  currentImageIndex.value = previousImageIndex >= 0 ? previousImageIndex : 0

  startImageCarousel()
}

const finishProgrammaticScroll = () => {
  clearTimeout(scrollEndTimer)

  scrollEndTimer = setTimeout(() => {
    isProgrammaticScrolling = false
    updateActiveTab()
  }, 150)
}

const getSectionTop = (target) => {
  if (!scrollContainer || !target) return Infinity

  return (
    target.getBoundingClientRect().top -
    scrollContainer.getBoundingClientRect().top +
    scrollContainer.scrollTop
  )
}

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

const scrollWithinSidebar = (target, offset = 0) => {
  const scrollContainer = vendingDetail.value?.closest('.place-content')

  if (!scrollContainer || !target) return

  const top =
    target.getBoundingClientRect().top -
    scrollContainer.getBoundingClientRect().top +
    scrollContainer.scrollTop

  scrollContainer.scrollTo({ top: top - offset, behavior: 'smooth' })
}

const scrollToTab = (tab) => {
  activeTab.value = tab
  isProgrammaticScrolling = true
  finishProgrammaticScroll()

  if (tab === 'all') {
    const scrollContainer = vendingDetail.value?.closest('.place-content')
    scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  if (tab === 'info') {
    scrollWithinSidebar(infoSection.value, 48)
    return
  }

  commentSection.value?.scrollToComments(48)
}

// 댓글 위치로 이동
const scrollToComments = () => {
  activeTab.value = 'comments'
  isProgrammaticScrolling = true
  finishProgrammaticScroll()
  commentSection.value?.scrollToComments(48)
}

onMounted(() => {
  scrollContainer = vendingDetail.value?.closest('.place-content')
  scrollContainer?.addEventListener('scroll', updateActiveTab, { passive: true })
  summaryResizeObserver = new ResizeObserver(updateSummaryOverflow)
  if (addressValue.value) summaryResizeObserver.observe(addressValue.value)
  if (locationValue.value) summaryResizeObserver.observe(locationValue.value)
  updateSummaryOverflow()
  updateActiveTab()
})

onBeforeUnmount(() => {
  clearTimeout(scrollEndTimer)
  stopImageCarousel()
  summaryResizeObserver?.disconnect()
  scrollContainer?.removeEventListener('scroll', updateActiveTab)
})

// 좋아요 상태 조회
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

// 좋아요 추가 / 취소
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

// 장소 변경 시 좋아요 다시 조회
watch(
  [() => props.place?.id, () => authStore.user],
  () => {
    loadFavorite()
  },
  { immediate: true },
)

watch(
  () => props.place?.id,
  async () => {
    addressExpanded.value = false
    locationExpanded.value = false
    stopImageCarousel()
    currentImageIndex.value = 0
    placePhotos.value = []
    await nextTick()
    updateSummaryOverflow()
  },
  { immediate: true },
)

// 길찾기
const openDirections = () => {
  const { latitude, longitude, name } = props.place

  const destination = `${longitude},${latitude},${encodeURIComponent(name)}`

  const url = `https://map.naver.com/p/directions/-/${destination}/-/transit`

  window.open(url, '_blank')
}

// 공유하기
const sharePlace = async () => {
  await shareContent({
    title: props.place.name,
    text: `${props.place.name} - ${props.place.branchName || ''}`,
  })
}
</script>

<style scoped>
.vending-detail {
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
  position: absolute;
  inset: 0;

  display: block;

  width: 100%;
  height: 100%;

  object-fit: cover;
}

.place-image-fade-enter-active,
.place-image-fade-leave-active {
  transition: opacity 0.5s ease;
}

.place-image-fade-enter-from,
.place-image-fade-leave-to {
  opacity: 0;
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

  background: #fff;
  font-weight: 500;
  border-bottom: 1px solid #e8e8e8;
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

.summary-row.address-row {
  grid-template-columns: 20px minmax(0, 1fr) auto;
}

.copy-button {
  display: grid;
  place-items: center;
  align-self: start;
  justify-self: end;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.copy-button svg {
  width: 17px;
  height: 17px;
  color: rgb(142 148 163);
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
  color: #393c46;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  word-break: keep-all;
}

.expandable-summary-value {
  flex: 1;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  border: none;
  background: none;
  color: #393c46;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.expandable-summary-value.expanded {
  overflow: visible;
  white-space: normal;
  word-break: keep-all;
}

.expandable-summary-value:focus-visible {
  outline: 2px solid #635bff;
  outline-offset: 2px;
  border-radius: 2px;
}

.expandable-summary-value:disabled {
  cursor: default;
}

/* =========================
   액션 버튼
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

/* =========================
   칸막이 divider
========================= */

.section-divider {
  height: 8px;
  margin: 24px -18px;
  background: #f3f4f6;
}
</style>
