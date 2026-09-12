<template>
  <aside class="my-page" aria-label="내 정보">
    <main class="my-content">
      <h1>내 정보</h1>

      <section class="card profile-card" aria-label="프로필">
        <div class="profile-image default-profile" aria-label="기본 프로필 이미지">
          <FontAwesomeIcon :icon="faUser" aria-hidden="true" />
        </div>
        <div class="profile-summary">
          <strong>{{ user?.nickname }}</strong>
          <span class="profile-email">{{ user?.email || '-' }}</span>
          <span class="provider-badge">{{ providerLabel }}</span>
        </div>
      </section>

      <section class="card content-section" aria-labelledby="account-heading">
        <h2 id="account-heading">계정 정보</h2>
        <dl class="account-list">
          <div class="account-row">
            <dt>닉네임</dt>
            <dd class="nickname-value">
              <template v-if="!isEditingNickname">
                <span>{{ user?.nickname }}</span>
                <button type="button" class="edit-button" @click="startNicknameEdit">수정</button>
              </template>
              <form v-else class="nickname-form" @submit.prevent="saveNickname">
                <div class="nickname-controls">
                  <input
                    v-model="nicknameDraft"
                    type="text"
                    autocomplete="nickname"
                    aria-label="새 닉네임"
                    :aria-invalid="Boolean(nicknameError)"
                    :disabled="nicknameSaving"
                    @input="nicknameError = ''"
                    @keydown.esc="cancelNicknameEdit"
                  />
                  <button type="submit" class="save-button" :disabled="nicknameSaving">
                    {{ nicknameSaving ? '저장 중...' : '저장' }}
                  </button>
                  <button
                    type="button"
                    class="cancel-button"
                    :disabled="nicknameSaving"
                    @click="cancelNicknameEdit"
                  >
                    취소
                  </button>
                </div>
                <p v-if="nicknameError" class="nickname-error" role="alert">
                  {{ nicknameError }}
                </p>
              </form>
            </dd>
          </div>
          <div class="account-row">
            <dt>이메일</dt>
            <dd>{{ user?.email || '-' }}</dd>
          </div>
          <div class="account-row">
            <dt>로그인 방식</dt>
            <dd>{{ providerLabel }}</dd>
          </div>
        </dl>
      </section>

      <section class="card content-section" aria-labelledby="favorites-heading">
        <div class="section-heading">
          <h2 id="favorites-heading">좋아요한 매장</h2>
          <span v-if="!favoritesLoading && !favoritesError">{{ favorites.length }}</span>
        </div>

        <div v-if="favoritesLoading" class="state-box">좋아요한 매장을 불러오는 중입니다.</div>
        <div v-else-if="favoritesError" class="state-box error-state" role="alert">
          <p>{{ favoritesError }}</p>
          <button type="button" @click="loadFavorites">다시 시도</button>
        </div>
        <div v-else-if="favorites.length === 0" class="state-box empty-state">
          <FontAwesomeIcon :icon="faHeart" aria-hidden="true" />
          <strong>아직 좋아요한 매장이 없습니다.</strong>
          <p>마음에 드는 매장을 좋아요하고 여기에서 모아보세요.</p>
          <RouterLink to="/map">매장 둘러보기</RouterLink>
        </div>
        <ul v-else class="favorite-list">
          <li v-for="place in favorites" :key="place.id">
            <button type="button" class="favorite-item" @click="openPlace(place)">
              <div class="place-info">
                <div class="place-title-row">
                  <strong>{{ place.name }}</strong>
                </div>
                <span class="place-type-badge">{{ placeTypeLabel(place.type) }}</span>
                <p>{{ place.address || '주소 정보 없음' }}</p>
              </div>
              <FontAwesomeIcon class="chevron" :icon="faChevronRight" aria-hidden="true" />
            </button>
          </li>
        </ul>
        <RouterLink class="inquiry-menu-row" :to="{ name: 'my-inquiries' }">
          <span>내 문의</span>
          <FontAwesomeIcon class="menu-chevron" :icon="faChevronRight" aria-hidden="true" />
        </RouterLink>
      </section>
    </main>
  </aside>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronRight, faHeart, faUser } from '@fortawesome/free-solid-svg-icons'
import { getFavorites } from '@/api/favoriteApi'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)
const favorites = ref([])
const favoritesLoading = ref(false)
const favoritesError = ref('')
const isEditingNickname = ref(false)
const nicknameDraft = ref('')
const nicknameSaving = ref(false)
const nicknameError = ref('')

const providerLabel = computed(() => {
  const provider = user.value?.provider?.toUpperCase()
  return ['NAVER', 'KAKAO', 'LOCAL'].includes(provider) ? provider : '확인 불가'
})

const placeTypeLabel = (type) =>
  ({ ORIPA: '오리파 매장', POKEMON_VENDING: '포켓몬 자판기' })[type] || type || '기타'

const startNicknameEdit = () => {
  nicknameDraft.value = user.value?.nickname || ''
  nicknameError.value = ''
  isEditingNickname.value = true
}

const cancelNicknameEdit = () => {
  if (nicknameSaving.value) return
  isEditingNickname.value = false
  nicknameError.value = ''
}

const getNicknameError = (error) => {
  const data = error.response?.data
  if (typeof data === 'string' && data.trim()) return data

  const message = data?.errors?.nickname || data?.fieldErrors?.nickname || data?.message
  return typeof message === 'string' && message.trim()
    ? message
    : '닉네임을 변경하지 못했습니다. 잠시 후 다시 시도해주세요.'
}

const saveNickname = async () => {
  if (nicknameSaving.value) return

  const nickname = nicknameDraft.value.trim()
  if (!nickname) {
    nicknameError.value = '닉네임을 입력해주세요.'
    return
  }
  if (nickname.length > 50) {
    nicknameError.value = '닉네임은 50자 이하로 입력해주세요.'
    return
  }

  nicknameSaving.value = true
  nicknameError.value = ''
  try {
    await authStore.updateNickname(nickname)
    isEditingNickname.value = false
  } catch (error) {
    nicknameError.value = getNicknameError(error)
  } finally {
    nicknameSaving.value = false
  }
}

const loadFavorites = async () => {
  favoritesLoading.value = true
  favoritesError.value = ''
  try {
    const data = await getFavorites()
    favorites.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('좋아요 매장 목록 조회 실패:', error)
    favorites.value = []
    favoritesError.value = '좋아요한 매장을 불러오지 못했습니다.'
  } finally {
    favoritesLoading.value = false
  }
}

const openPlace = (place) => {
  if (place?.publicId == null) return
  router.push({ name: 'place', params: { publicId: place.publicId } })
}

onMounted(loadFavorites)
</script>

<style scoped>
.my-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #fff;
  color: #222;
}

.my-content {
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e5e7eb;
}

h1 {
  display: none;
}
.card {
  border: 0;
  border-radius: 0;
  background: #fff;
  box-shadow: none;
}
.profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 4px 0 24px;
  border-bottom: 1px solid #e5e7eb;
}
.profile-image {
  flex: 0 0 52px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
}
.default-profile {
  display: grid;
  place-items: center;
  background: #efefff;
  color: #635bff;
  font-size: 22px;
}
.profile-summary {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
}
.profile-summary strong {
  max-width: 100%;
  overflow: hidden;
  font-size: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.profile-email {
  max-width: 100%;
  overflow: hidden;
  color: #6b7280;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.provider-badge {
  padding: 3px 7px;
  border-radius: 6px;
  background: #efefff;
  color: #635bff;
  font-size: 10px;
  font-weight: 700;
}
.content-section {
  margin-top: 0;
  padding: 24px 0;
  border-bottom: 1px solid #e5e7eb;
}
.inquiry-menu-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  margin-top: 16px;
  padding: 0 10px;
  border-top: 1px solid #eeeef2;
  border-radius: 8px;
  color: #262a33;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
}
.inquiry-menu-row:hover {
  background: #f9fafb;
}
.menu-chevron {
  color: #aaaab3;
  font-size: 13px;
}
.content-section h2 {
  margin: 0 0 12px;
  font-size: 16px;
}
.account-list {
  margin: 0;
}
.account-row {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  align-items: center;
  min-height: 52px;
  border-top: 1px solid #eeeef2;
}
.account-row dt {
  color: #74747e;
  font-size: 14px;
}
.account-row dd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  margin: 0;
  font-size: 15px;
  overflow-wrap: anywhere;
}
.edit-button,
.save-button,
.cancel-button {
  padding: 6px 8px;
  border: 1px solid #d8d6ff;
  border-radius: 7px;
  background: #f7f6ff;
  color: #635bff;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.save-button:disabled,
.cancel-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
.nickname-value {
  min-width: 0;
}
.nickname-form {
  width: 100%;
  padding: 8px 0;
}
.nickname-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.nickname-controls input {
  flex: 1 0 100%;
  min-width: 0;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #d8d8df;
  border-radius: 7px;
  outline: none;
  font: inherit;
}
.nickname-controls input:focus {
  border-color: #635bff;
  box-shadow: 0 0 0 3px rgb(99 91 255 / 12%);
}
.save-button {
  border-color: #635bff;
  background: #635bff;
  color: #fff;
}
.cancel-button {
  border-color: #dedee5;
  background: #fff;
  color: #666670;
}
.nickname-error {
  margin: 7px 0 0;
  color: #dc2626;
  font-size: 12px;
}
.section-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.section-heading h2 {
  margin: 0;
}
.section-heading span {
  color: #635bff;
  font-size: 14px;
  font-weight: 700;
}
.favorite-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.favorite-list li + li {
  border-top: 1px solid #eeeef2;
}
.favorite-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.favorite-item:hover {
  background: #f9fafb;
}
.place-info {
  flex: 1;
  min-width: 0;
}
.place-title-row {
  display: flex;
  align-items: center;
  gap: 9px;
}
.place-title-row strong {
  overflow: hidden;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.place-type-badge {
  display: inline-block;
  margin-top: 7px;
  padding: 3px 7px;
  border-radius: 5px;
  background: #f2f1ff;
  color: #635bff;
  font-size: 11px;
  font-weight: 700;
}
.place-info p {
  margin: 6px 0 0;
  overflow: hidden;
  color: #777780;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chevron {
  flex: none;
  align-self: flex-start;
  margin-top: 4px;
  color: #aaaab3;
  font-size: 13px;
}
.state-box {
  padding: 44px 20px;
  border-radius: 12px;
  background: #fafafe;
  color: #777780;
  text-align: center;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
}
.empty-state > svg {
  margin-bottom: 4px;
  color: #b9b5ff;
  font-size: 28px;
}
.empty-state strong {
  color: #3a3a42;
}
.empty-state p,
.error-state p {
  margin: 0;
  font-size: 14px;
}
.empty-state a,
.error-state button {
  display: inline-block;
  margin-top: 8px;
  padding: 9px 14px;
  border: 0;
  border-radius: 7px;
  background: #635bff;
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

@media (max-width: 768px) {
  .my-page {
    --mobile-header-height: calc(56px + env(safe-area-inset-top, 0px));
    height: 100dvh;
    overflow-y: auto;
    background: #f7f7fa;
  }
  .my-content {
    width: 100%;
    height: auto;
    padding: calc(var(--mobile-header-height) + 28px) 16px 48px;
    overflow-y: visible;
    background: transparent;
    border-right: 0;
  }
  h1 {
    display: block;
    margin-bottom: 20px;
    font-size: 24px;
  }
  .card {
    border: 1px solid #e8e8ed;
    border-radius: 12px;
    box-shadow: 0 4px 18px rgb(0 0 0 / 4%);
  }
  .profile-card,
  .content-section {
    padding: 20px;
  }
  .profile-card {
    gap: 20px;
    border-bottom: 1px solid #e8e8ed;
  }
  .content-section {
    margin-top: 20px;
  }
  .inquiry-menu-row {
    min-height: 52px;
    margin-top: 20px;
    padding: 12px 4px 0;
    border-radius: 0;
  }
  .content-section h2 {
    margin-bottom: 20px;
    font-size: 19px;
  }
  .profile-image {
    flex-basis: 64px;
    width: 64px;
    height: 64px;
  }
  .default-profile {
    font-size: 32px;
  }
  .profile-summary {
    flex: initial;
    flex-flow: row wrap;
    align-items: center;
    gap: 10px;
  }
  .profile-summary strong {
    max-width: 160px;
    font-size: 19px;
  }
  .profile-email {
    display: none;
  }
  .provider-badge {
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 12px;
  }
  .account-row {
    grid-template-columns: 96px minmax(0, 1fr);
    min-height: 58px;
  }
  .favorite-item {
    gap: 12px;
    padding: 16px 4px;
    border-radius: 0;
  }
  .place-title-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }
  .nickname-controls input {
    flex-basis: 100%;
  }
  .section-heading {
    margin-bottom: 20px;
  }
}
</style>
