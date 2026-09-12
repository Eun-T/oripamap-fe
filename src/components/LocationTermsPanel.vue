<template>
  <aside class="location-terms-panel" aria-labelledby="location-terms-heading">
    <header class="document-header">
      <button type="button" class="back-button" aria-label="설정으로 돌아가기" @click="goBack">
        <FontAwesomeIcon :icon="faChevronLeft" aria-hidden="true" />
      </button>
      <h1 id="location-terms-heading">위치기반서비스 이용약관</h1>
    </header>

    <article class="document-content">
      <section>
        <h2>1. 목적</h2>
        <p>
          본 약관은 오맵(이하 “서비스”)이 제공하는 위치기반 기능의 이용과 관련하여 서비스와
          이용자 간의 권리, 의무 및 기타 필요한 사항을 규정하는 것을 목적으로 합니다.
        </p>
      </section>

      <section>
        <h2>2. 이용하는 위치정보</h2>
        <p>
          서비스는 이용자가 브라우저 또는 기기의 위치정보 이용을 허용한 경우 이용자의 현재
          위치(위도 및 경도)를 이용할 수 있습니다.
        </p>
        <p>위치정보 제공 여부는 이용자가 직접 선택할 수 있습니다.</p>
      </section>

      <section>
        <h2>3. 위치정보의 이용 목적</h2>
        <p>서비스는 이용자의 현재 위치를 다음 목적으로 이용합니다.</p>
        <ul>
          <li>지도에서 이용자의 현재 위치 표시</li>
          <li>현재 위치를 기준으로 지도 이동</li>
          <li>현재 위치를 기반으로 한 주변 장소 탐색</li>
          <li>기타 이용자가 요청한 위치 기반 기능 제공</li>
        </ul>
      </section>

      <section>
        <h2>4. 위치정보의 보관</h2>
        <p>
          서비스는 현재 위치 기능을 통해 확인한 이용자의 위치정보를 서버에 별도로 저장하지
          않습니다.
        </p>
        <p>위치정보는 해당 위치 기반 기능을 제공하기 위한 범위에서 일시적으로 이용됩니다.</p>
      </section>

      <section>
        <h2>5. 위치정보 이용 동의 및 거부</h2>
        <p>
          이용자는 브라우저 또는 기기의 설정을 통해 위치정보 이용을 허용하거나 거부할 수
          있습니다.
        </p>
        <p>
          위치정보 이용을 거부하더라도 장소 검색, 지도 조회 등 현재 위치가 반드시 필요하지 않은
          서비스는 이용할 수 있습니다.
        </p>
        <p>
          다만 현재 위치 표시 및 현재 위치를 기반으로 하는 일부 기능은 이용이 제한될 수
          있습니다.
        </p>
      </section>

      <section>
        <h2>6. 이용자의 권리</h2>
        <p>
          이용자는 언제든지 브라우저 또는 기기의 설정을 통해 위치정보 이용 권한을 변경하거나
          철회할 수 있습니다.
        </p>
        <p>
          위치정보 이용과 관련한 문의는 서비스에서 제공하는 문의하기 기능을 통해 요청할 수
          있습니다.
        </p>
      </section>

      <section>
        <h2>7. 서비스의 변경</h2>
        <p>
          위치기반 기능의 내용이 변경되거나 위치정보의 이용 또는 보관 방식이 변경되는 경우 관련
          법령에 따라 필요한 사항을 안내합니다.
        </p>
      </section>

      <p class="effective-date">시행일자: 2026년 ○월 ○일</p>
    </article>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

const router = useRouter()
const goBack = () => router.push({ name: 'my-settings' })
</script>

<style scoped>
.location-terms-panel {
  padding: 0 20px 48px;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  color: #262a33;
}

.document-header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 68px;
  background: #fff;
  border-bottom: 1px solid #f0f1f3;
}

.document-header h1 {
  margin: 0;
  font-size: 17px;
}

.back-button {
  display: grid;
  place-items: center;
  flex: 0 0 36px;
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

.document-content {
  padding-top: 8px;
  font-size: 14px;
  line-height: 1.75;
}

.document-content section {
  padding: 20px 0;
  border-bottom: 1px solid #f0f1f3;
}

.document-content h2 {
  margin: 0 0 10px;
  color: #1f2937;
  font-size: 15px;
}

.document-content p {
  margin: 0;
  color: #4b5563;
}

.document-content p + p,
.document-content p + ul {
  margin-top: 10px;
}

.document-content ul {
  margin-bottom: 0;
  padding-left: 22px;
  color: #4b5563;
}

.document-content li + li {
  margin-top: 6px;
}

.effective-date {
  padding-top: 24px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .location-terms-panel {
    padding: var(--mobile-header-height) 20px 48px;
    border-right: 0;
  }

  .document-header {
    min-height: 64px;
  }
}
</style>
