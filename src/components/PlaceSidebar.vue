<template>
  <Transition name="detail-slide" @after-leave="clearPreviousPlace">
  <aside v-if="!isMobile || place" class="place-sidebar" aria-label="장소 상세">

    <!-- 장소 선택했을 때만 -->
    <div ref="placeContent" class="place-content">
      <div v-if="displayedPlace" class="detail-body">
        <button type="button" class="image-back-button" aria-label="지도로 돌아가기" @click="returnToMap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5L8 12L15 19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

      <PokemonVendingDetail
        v-if="displayedPlace.type === 'POKEMON_VENDING'"
        :place="displayedPlace"
      />

      <OripaDetail
        v-else-if="displayedPlace.type === 'ORIPA'"
        :place="displayedPlace"
      />
      </div>
    </div>
    <div class="mobile-detail-footer">
      <button type="button" class="back-button" @click="returnToMap">뒤로 돌아가기</button>
    </div>
  </aside>
  </Transition>
</template>

<script setup>
import PokemonVendingDetail from './PokemonVendingDetail.vue'
import OripaDetail from './OripaDetail.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

const props = defineProps({
  place: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])
const returnToMap = () => emit('close')
const mobileQuery = window.matchMedia('(max-width: 768px)')
const isMobile = ref(mobileQuery.matches)
const placeContent = ref(null)
const previousPlace = shallowRef(props.place)
const displayedPlace = computed(() => props.place || (isMobile.value ? previousPlace.value : null))
watch(() => props.place, (place) => {
  if (place) previousPlace.value = place
}, { flush: 'sync' })
watch(
  () => props.place?.id,
  async (placeId, previousPlaceId) => {
    if (placeId == null || String(placeId) === String(previousPlaceId)) return

    await nextTick()
    placeContent.value?.scrollTo({ top: 0, behavior: 'instant' })
  },
)
const clearPreviousPlace = () => {
  if (!props.place) previousPlace.value = null
}
const updateViewport = (event) => {
  isMobile.value = event.matches
  clearPreviousPlace()
}
onMounted(() => mobileQuery.addEventListener('change', updateViewport))
onBeforeUnmount(() => mobileQuery.removeEventListener('change', updateViewport))
</script>

<style scoped>
.place-sidebar {
  position: relative;
  flex: 0 0 380px;
  height: 100%;
  padding-top: 84px;
  box-sizing: border-box;
  z-index: 100;
  background: white;

  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.place-content {
  flex: 1;
  min-height: 0;
  padding: 0px 10px 10px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.4s ease;
}

.place-sidebar:hover .place-content {
  scrollbar-color: #c7cbd1 transparent;
}

.mobile-detail-footer, .image-back-button { display: none; }

@media (max-width: 768px) {
  .place-sidebar {
    --detail-footer-height: calc(73px + env(safe-area-inset-bottom, 0px));
    position: fixed;
    inset: 0;
    z-index: 700;
    flex: none;
    width: 100vw;
    height: 100dvh;
    padding-top: env(safe-area-inset-top, 0px);
  }
  .detail-slide-enter-active,
  .detail-slide-leave-active {
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .detail-slide-enter-from,
  .detail-slide-leave-to {
    transform: translateX(100%);
  }
  .detail-slide-enter-to,
  .detail-slide-leave-from {
    transform: translateX(0);
  }
  .detail-slide-leave-active { pointer-events: none; }
  .detail-body { position: relative; }
  .image-back-button {
    position: absolute;
    top: 12px;
    left: 6px;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgb(0 0 0 / 50%);
    color: #fff;
    cursor: pointer;
  }
  .mobile-detail-footer {
    display: block;
    position: fixed;
    inset: auto 0 0;
    height: var(--detail-footer-height);
    padding: 12px max(16px, env(safe-area-inset-right)) calc(12px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left));
    background: #fff;
    border-top: 1px solid #e9e9ef;
    box-shadow: 0 -4px 16px rgb(0 0 0 / 6%);
  }
  .back-button {
    width: 100%;
    height: 48px;
    border: 0;
    border-radius: 4px;
    background: #635bff;
    color: #fff;
    font: inherit;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
  }
  .place-content {
    min-width: 0;
    padding-bottom: calc(var(--detail-footer-height) + 16px);
    scroll-padding-bottom: calc(var(--detail-footer-height) + 16px);
    padding-right: max(10px, env(safe-area-inset-right));
    padding-left: max(10px, env(safe-area-inset-left));
    overscroll-behavior-y: contain;
    overflow-wrap: anywhere;
  }
  :deep(.edit-button),
  :deep(.edit-button:hover) {
    height: 44px;
    border: none;
    border-radius: 4px;
    background: #f3f4f6;
    color: #374151;
  }
  :deep(.place-image-wrap) { height: 250px; }
  :deep(.place-image-info) { right: 16px; left: 16px; }
  :deep(.place-image-info h2) { font-size: 20px; }
}
.place-content::-webkit-scrollbar {
  width: 6px;
}

@media (prefers-reduced-motion: reduce) {
  .detail-slide-enter-active,
  .detail-slide-leave-active { transition: none; }
}

.place-content::-webkit-scrollbar-track {
  background: transparent;
}

.place-content::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
  transition: background-color 0.4s ease;
}

.place-sidebar:hover .place-content::-webkit-scrollbar-thumb {
  background: #c7cbd1;
}
</style>
