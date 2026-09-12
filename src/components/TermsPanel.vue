<template>
  <aside class="terms-panel" aria-labelledby="terms-heading">
    <header class="terms-header">
      <button type="button" class="back-button" aria-label="설정으로 돌아가기" @click="goBack">
        <FontAwesomeIcon :icon="faChevronLeft" aria-hidden="true" />
      </button>
      <h1 id="terms-heading">오맵 서비스 이용약관</h1>
    </header>

    <article class="terms-content">
      <section v-for="section in terms" :key="section.title">
        <h2>{{ section.title }}</h2>
        <template v-for="(paragraph, index) in section.paragraphs" :key="index">
          <p>{{ paragraph }}</p>
        </template>
        <component :is="section.ordered ? 'ol' : 'ul'" v-if="section.items">
          <li v-for="item in section.items" :key="item">{{ item }}</li>
        </component>
        <p v-if="section.closing">{{ section.closing }}</p>
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

const terms = [
  {
    title: '1. 목적',
    paragraphs: [
      '본 약관은 오맵(이하 “서비스”)이 제공하는 오리파 매장, 포켓몬 카드 자판기 등 트레이딩 카드 관련 장소 정보 및 관련 서비스의 이용 조건과 절차, 서비스와 회원 간의 권리·의무 및 책임사항을 규정하는 것을 목적으로 합니다.',
    ],
  },
  {
    title: '2. 용어의 정의',
    paragraphs: [],
    ordered: true,
    items: [
      '“서비스”란 오리파 매장, 포켓몬 카드 자판기 등 트레이딩 카드 관련 장소의 위치 및 정보를 제공하는 지도 기반 서비스를 말합니다.',
      '“회원”이란 서비스에 가입하여 서비스가 제공하는 기능을 이용하는 사용자를 말합니다.',
      '“장소 정보”란 매장명, 주소, 위치, 영업시간, 휴무일, 연락처, 소개, 이미지 등 서비스에서 제공되는 장소 관련 정보를 말합니다.',
      '“게시물”이란 회원이 서비스를 이용하면서 작성하거나 등록한 댓글, 이미지 및 기타 콘텐츠를 말합니다.',
    ],
  },
  {
    title: '3. 약관의 효력 및 변경',
    paragraphs: [
      '본 약관은 서비스 내에 게시하거나 기타 적절한 방법으로 회원에게 안내함으로써 효력이 발생합니다.',
      '서비스는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있으며, 중요한 변경이 있는 경우 적용일 및 변경 내용을 사전에 공지합니다.',
    ],
  },
  {
    title: '4. 서비스의 제공',
    paragraphs: ['서비스는 다음과 같은 기능을 제공할 수 있습니다.'],
    items: [
      '오리파 매장 및 포켓몬 카드 자판기 위치 조회',
      '매장 및 자판기 상세 정보 제공',
      '장소 검색',
      '관심 장소 저장',
      '댓글 및 이미지 등록',
      '장소 정보 수정 요청',
      '기타 서비스가 추가로 제공하는 기능',
    ],
    closing: '서비스의 내용은 운영 또는 기술상의 필요에 따라 변경될 수 있습니다.',
  },
  {
    title: '5. 장소 정보의 정확성',
    paragraphs: [
      '서비스에서 제공하는 매장, 자판기, 영업시간, 휴무일, 연락처 등의 정보는 운영자 또는 이용자의 제보, 공개된 정보 등을 기반으로 제공될 수 있습니다.',
      '이러한 정보는 실제 현황과 다를 수 있으며, 서비스는 모든 정보의 정확성, 최신성 또는 완전성을 보장하지 않습니다.',
      '중요한 정보는 방문 전에 해당 매장 또는 관련 기관을 통해 직접 확인하는 것을 권장합니다.',
    ],
  },
  {
    title: '6. 회원의 의무',
    paragraphs: [
      '회원은 서비스를 이용할 때 관련 법령 및 본 약관을 준수해야 합니다.',
      '회원은 다음과 같은 행위를 해서는 안 됩니다.',
    ],
    items: [
      '허위 또는 부정확한 정보를 고의로 등록하는 행위',
      '타인을 비방하거나 권리를 침해하는 게시물을 등록하는 행위',
      '불법적인 콘텐츠를 등록하거나 서비스를 불법적인 목적으로 이용하는 행위',
      '서비스의 정상적인 운영을 방해하는 행위',
      '다른 회원의 계정 또는 개인정보를 부정하게 이용하는 행위',
      '기타 관련 법령에 위반되는 행위',
    ],
  },
  {
    title: '7. 게시물',
    paragraphs: [
      '회원이 작성한 댓글, 이미지 등 게시물에 대한 책임은 해당 게시물을 작성한 회원에게 있습니다.',
      '서비스는 다음에 해당하는 게시물을 사전 통지 없이 삭제하거나 이용을 제한할 수 있습니다.',
    ],
    items: [
      '관련 법령을 위반하는 게시물',
      '타인의 권리 또는 개인정보를 침해하는 게시물',
      '욕설, 비방, 광고 또는 스팸성 게시물',
      '서비스의 목적과 명백하게 관련이 없는 게시물',
      '기타 서비스 운영에 부적절하다고 판단되는 게시물',
    ],
  },
  {
    title: '8. 서비스 이용 제한',
    paragraphs: [
      '회원이 본 약관 또는 관련 법령을 위반하거나 서비스의 정상적인 운영을 방해한 경우 서비스 이용을 제한할 수 있습니다.',
      '필요한 경우 게시물 삭제, 기능 이용 제한 또는 계정 이용 제한 등의 조치가 이루어질 수 있습니다.',
    ],
  },
  {
    title: '9. 서비스의 변경 및 중단',
    paragraphs: [
      '서비스는 운영상 또는 기술상의 필요에 따라 서비스의 일부 또는 전부를 변경하거나 일시적으로 중단할 수 있습니다.',
      '천재지변, 서버 장애, 통신 장애, 외부 서비스 장애 등 서비스가 합리적으로 통제하기 어려운 사유로 서비스 제공이 중단될 수 있습니다.',
    ],
  },
  {
    title: '10. 책임의 제한',
    paragraphs: [
      '서비스는 회원에게 제공되는 장소 정보의 정확성, 최신성 및 완전성을 항상 보장하지 않습니다.',
      '회원이 서비스에서 제공되는 정보를 이용하여 발생한 손해에 대해서는 관련 법령에서 서비스의 책임이 인정되는 경우를 제외하고 책임을 부담하지 않습니다.',
      '다만 서비스의 고의 또는 중대한 과실로 발생한 손해에 대해서는 관련 법령에 따릅니다.',
    ],
  },
  {
    title: '11. 회원 탈퇴',
    paragraphs: [
      '회원은 언제든지 서비스에서 제공하는 회원 탈퇴 기능을 통해 이용계약의 해지를 요청할 수 있습니다.',
      '회원 탈퇴 시 개인정보 및 게시물의 처리 방법은 개인정보처리방침 및 관련 법령에 따릅니다.',
    ],
  },
  {
    title: '12. 준거법',
    paragraphs: [
      '본 약관은 대한민국 법령에 따라 해석되고 적용됩니다.',
      '서비스 이용과 관련하여 분쟁이 발생하는 경우 당사자 간 협의를 통해 해결하도록 노력하며, 해결되지 않는 경우 관련 법령에서 정하는 절차에 따릅니다.',
    ],
  },
]
</script>

<style scoped>
.terms-panel {
  padding: 0 20px 48px;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  color: #262a33;
}

.terms-header {
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

.terms-header h1 {
  margin: 0;
  font-size: 19px;
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

.terms-content {
  padding-top: 8px;
  font-size: 14px;
  line-height: 1.75;
}

.terms-content section {
  padding: 20px 0;
  border-bottom: 1px solid #f0f1f3;
}

.terms-content h2 {
  margin: 0 0 10px;
  color: #1f2937;
  font-size: 15px;
}

.terms-content p {
  margin: 0;
  color: #4b5563;
}

.terms-content p + p,
.terms-content p + ul,
.terms-content p + ol,
.terms-content ul + p {
  margin-top: 10px;
}

.terms-content ul,
.terms-content ol {
  margin-bottom: 0;
  padding-left: 22px;
  color: #4b5563;
}

.terms-content li + li {
  margin-top: 6px;
}

.effective-date {
  padding-top: 24px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .terms-panel {
    padding: var(--mobile-header-height) 20px 48px;
    border-right: 0;
  }

  .terms-header {
    min-height: 64px;
  }
}
</style>
