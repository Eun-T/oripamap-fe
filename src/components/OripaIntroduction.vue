<template>
  <section class="oripa-introduction" aria-label="매장 소개">
    <div v-if="oripaImages.length" class="oripa-carousel">
      <Transition name="oripa-image-fade">
        <img
          :key="currentOripaImage.id ?? currentOripaImage.imageUrl"
          class="oripa-carousel-image"
          :src="currentOripaImage.imageUrl"
          :alt="`${placeName} 소개 이미지 ${currentOripaImageIndex + 1}`"
        />
      </Transition>

      <template v-if="oripaImages.length > 1">
        <button
          type="button"
          class="carousel-button carousel-button-prev"
          aria-label="이전 이미지"
          @click="showPreviousImage"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <button
          type="button"
          class="carousel-button carousel-button-next"
          aria-label="다음 이미지"
          @click="showNextImage"
        >
          <span aria-hidden="true">›</span>
        </button>

        <div class="carousel-pagination" aria-label="소개 이미지 선택">
          <button
            v-for="(image, index) in oripaImages"
            :key="image.id ?? image.imageUrl"
            type="button"
            class="carousel-dot"
            :class="{ active: currentOripaImageIndex === index }"
            :aria-label="`${index + 1}번째 이미지 보기`"
            :aria-current="currentOripaImageIndex === index ? 'true' : undefined"
            @click="currentOripaImageIndex = index"
          ></button>
        </div>
      </template>
    </div>

    <h3 v-if="oripaPlace.summary" class="introduction-summary">
      {{ oripaPlace.summary }}
    </h3>

    <p v-if="oripaPlace.introduction" class="introduction-text">
      {{ oripaPlace.introduction }}
    </p>

    <div v-if="socialLinks.length" class="dividers"></div>

    <!-- <h3 class="social-head">공식 채널</h3> -->
    <!-- <h4 class="social-summary">더 많은 소식과 새로운 정보를 확인해 주세요!</h4> -->
    <nav v-if="socialLinks.length" class="social-links" aria-label="소셜 링크">
      <a
        v-for="(link, index) in socialLinks"
        :key="`${link.platform}-${link.url}-${index}`"
        class="social-link"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`${getSocialPlatformLabel(link.platform)} 새 탭에서 열기`"
        :title="getSocialPlatformLabel(link.platform)"
      >
        <FontAwesomeIcon :icon="getSocialIcon(link.platform)" aria-hidden="true" />
      </a>
    </nav>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faLink } from '@fortawesome/free-solid-svg-icons'

import {
  faInstagram,
  faFacebook,
  faThreads,
  faYoutube,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons'

const props = defineProps({
  placeName: {
    type: String,
    default: '',
  },
  oripaPlace: {
    type: Object,
    required: true,
  },
})

const oripaImages = computed(() =>
  (Array.isArray(props.oripaPlace.images) ? props.oripaPlace.images : [])
    .filter((image) => image?.imageUrl)
    .map((image, index) => ({
      ...image,
      originalIndex: index,
    }))
    .sort((a, b) => {
      const aOrder = Number.isFinite(Number(a.sortOrder)) ? Number(a.sortOrder) : Infinity

      const bOrder = Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : Infinity

      return aOrder - bOrder || a.originalIndex - b.originalIndex
    }),
)

const socialLinks = computed(() =>
  (Array.isArray(props.oripaPlace.socialLinks) ? props.oripaPlace.socialLinks : []).filter(
    (link) => link?.url,
  ),
)

const currentOripaImageIndex = ref(0)

const currentOripaImage = computed(
  () => oripaImages.value[currentOripaImageIndex.value] || oripaImages.value[0],
)

const normalizePlatform = (platform) =>
  String(platform || '')
    .trim()
    .toUpperCase()

const getSocialPlatformLabel = (platform) => {
  const normalizedPlatform = normalizePlatform(platform)

  if (normalizedPlatform === 'INSTAGRAM') return faInstagram
  if (normalizedPlatform === 'FACEBOOK') return faFacebook
  if (normalizedPlatform === 'THREADS') return faThreads
  if (normalizedPlatform === 'YOUTUBE') return faYoutube
  if (normalizedPlatform === 'X' || normalizedPlatform === 'TWITTER') return faXTwitter

  return faLink
}

const getSocialIcon = (platform) => {
  const normalizedPlatform = normalizePlatform(platform)

  if (normalizedPlatform === 'INSTAGRAM') {
    return faInstagram
  }

  if (normalizedPlatform === 'FACEBOOK') {
    return faFacebook
  }

  if (normalizedPlatform === 'THREADS') {
    return faThreads
  }

  if (normalizedPlatform === 'YOUTUBE') {
    return faYoutube
  }

  if (normalizedPlatform === 'X' || normalizedPlatform === 'TWITTER') {
    return faXTwitter
  }

  return faLink
}

const showPreviousImage = () => {
  currentOripaImageIndex.value =
    (currentOripaImageIndex.value - 1 + oripaImages.value.length) % oripaImages.value.length
}

const showNextImage = () => {
  currentOripaImageIndex.value = (currentOripaImageIndex.value + 1) % oripaImages.value.length
}

watch(oripaImages, () => {
  currentOripaImageIndex.value = 0
})
</script>

<style scoped>
.oripa-introduction {
  margin-top: 18px;
  /* padding: 0 18px; */
  overflow: hidden;
  /* border: 1px solid #e5e7eb; */
  /* border-radius: 10px; */
  background: #fff;
}

.introduction-container {
  position: relative;
  padding: 28px 22px 24px;

  background: #faf7f0;
  border-radius: 20px;

  box-shadow: 0 6px 20px rgb(0 0 0 / 7%);

  border: 1px solid rgb(0 0 0 / 2%);
}

.introduction-summary {
  margin: 20px 0 0;
  color: #292929;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.45;
  word-break: keep-all;
}

.oripa-carousel {
  position: relative;
  height: 220px;
  /* margin: 0 -20px 20px; */
  overflow: hidden;
  background: #f3f4f6;
  box-shadow: 0 3px 10px rgb(0 0 0 / 6%);
}

.oripa-carousel-image {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.oripa-image-fade-enter-active,
.oripa-image-fade-leave-active {
  transition: opacity 0.25s ease;
}

.oripa-image-fade-enter-from,
.oripa-image-fade-leave-to {
  opacity: 0;
}

.carousel-button {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0 0 3px;
  transform: translateY(-50%);
  border: none;
  border-radius: 50%;
  background: rgb(0 0 0 / 42%);
  color: #fff;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.carousel-button-prev {
  left: 10px;
}

.carousel-button-next {
  right: 10px;
}

.carousel-pagination {
  position: absolute;
  right: 0;
  bottom: 10px;
  left: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.carousel-dot {
  width: 7px;
  height: 7px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 58%);
  box-shadow: 0 1px 3px rgb(0 0 0 / 25%);
  cursor: pointer;
}

.carousel-dot.active {
  width: 18px;
  border-radius: 999px;
  background: #fff;
}

.introduction-text {
  margin: 12px 0 15px;
  color: #555;
  font-size: 14px;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: keep-all;
  letter-spacing: -0.2px;
  overflow-wrap: anywhere;
}

.dividers {
  border-bottom: 1px solid #e5e7eb;
}

.social-summary {
  margin: 15px 0 4px;
  color: #292929;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.45;
  word-break: keep-all;
}

.social-head {
  margin: 15px 0 4px;
  color: #8b8b8b;
  font-size: 12px;
  line-height: 1.5;
  letter-spacing: -0.2px;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin: 15px 0 0;
}

.social-link {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid #dedcf8;
  border-radius: 12px;
  background: #f7f6ff;
  color: #635bff;
  font-size: 17px;
  text-decoration: none;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.social-link:hover {
  background: #635bff;
  color: #fff;
}

.social-link svg {
  width: 18px;
  height: 18px;
}
</style>
