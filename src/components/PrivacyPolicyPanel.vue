<template>
  <aside class="policy-panel" aria-labelledby="policy-heading">
    <header class="policy-header">
      <button type="button" class="back-button" aria-label="설정으로 돌아가기" @click="goBack">
        <FontAwesomeIcon :icon="faChevronLeft" aria-hidden="true" />
      </button>
      <h1 id="policy-heading">오맵 개인정보처리방침</h1>
    </header>

    <article class="policy-content">
      <p class="introduction">
        오맵(이하 “서비스”)은 이용자의 개인정보를 중요하게 생각하며, 관련 법령을 준수하여
        개인정보를 처리합니다.
      </p>

      <section>
        <h2>1. 수집하는 개인정보</h2>
        <p>서비스는 회원가입 및 서비스 제공을 위해 다음 정보를 처리할 수 있습니다.</p>

        <h3>회원 정보</h3>
        <ul>
          <li>이메일</li>
          <li>닉네임</li>
          <li>로그인 제공자(LOCAL, KAKAO, NAVER)</li>
          <li>소셜 로그인 이용 시 해당 서비스에서 제공하는 회원 식별정보</li>
        </ul>
        <p>
          일반 로그인에서 비밀번호를 사용하는 경우 비밀번호는 안전한 방식으로 암호화하여
          저장하며 원문 형태로 저장하지 않습니다.
        </p>

        <h3>서비스 이용 과정에서 생성되는 정보</h3>
        <ul>
          <li>좋아요한 장소 정보</li>
          <li>작성한 댓글</li>
          <li>회원이 직접 첨부한 이미지</li>
          <li>서비스 이용 과정에서 생성되는 접속 기록 등</li>
        </ul>

        <h3>위치정보</h3>
        <p>
          서비스는 지도 및 현재 위치 기반 기능 제공을 위해 이용자가 브라우저 또는 기기의
          위치 권한을 허용한 경우 현재 위치를 사용할 수 있습니다.
        </p>
        <p>현재 위치는 해당 기능 제공을 위해 일시적으로 사용하며, 별도로 저장하지 않습니다.</p>
      </section>

      <section>
        <h2>2. 개인정보의 이용 목적</h2>
        <p>수집한 개인정보는 다음 목적으로 이용합니다.</p>
        <ul>
          <li>회원 가입 및 로그인</li>
          <li>회원 식별 및 계정 관리</li>
          <li>소셜 로그인 제공</li>
          <li>좋아요 기능 제공</li>
          <li>댓글 및 이미지 등록 기능 제공</li>
          <li>서비스 운영 및 부정 이용 방지</li>
          <li>문의 및 이용자 요청 처리</li>
        </ul>
      </section>

      <section>
        <h2>3. 개인정보의 보유 및 파기</h2>
        <p>개인정보는 원칙적으로 회원 탈퇴 시 지체 없이 파기합니다.</p>
        <p>
          다만 관계 법령에 따라 일정 기간 보관할 의무가 있는 정보가 있는 경우에는 해당
          법령에서 정한 기간 동안 보관할 수 있습니다.
        </p>
        <p>회원이 작성한 댓글 등 게시물의 처리 방법은 서비스 정책 및 관련 법령에 따릅니다.</p>
      </section>

      <section>
        <h2>4. 개인정보의 제3자 제공</h2>
        <p>서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p>
        <p>
          다만 이용자가 사전에 동의한 경우 또는 법령에 따라 제공이 요구되는 경우에는 예외로
          할 수 있습니다.
        </p>
      </section>

      <section>
        <h2>5. 개인정보 처리의 위탁 및 외부 서비스 이용</h2>
        <p>
          서비스 제공을 위해 클라우드, 이미지 저장소 및 소셜 로그인 등 외부 서비스를 이용할
          수 있습니다.
        </p>
        <p>
          외부 서비스를 이용하여 개인정보가 처리되는 경우 관련 법령에 따라 필요한 사항을
          개인정보처리방침에 공개합니다.
        </p>
      </section>

      <section>
        <h2>6. 이용자의 권리</h2>
        <p>
          이용자는 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 개인정보의
          삭제를 요청할 수 있습니다.
        </p>
        <p>
          관련 법령에서 정한 경우 개인정보 처리의 정지 등 필요한 권리를 행사할 수 있습니다.
        </p>
      </section>

      <section>
        <h2>7. 개인정보의 안전성 확보</h2>
        <p>
          서비스는 개인정보의 분실, 도난, 유출, 위조, 변조 또는 훼손을 방지하기 위해 필요한
          기술적·관리적 보호조치를 적용하도록 노력합니다.
        </p>
        <p>
          비밀번호를 사용하는 경우 복원할 수 없는 방식으로 암호화하여 저장하며, 인증 정보 및
          개인정보에 대한 접근을 필요한 범위로 제한합니다.
        </p>
      </section>

      <section>
        <h2>8. 개인정보처리방침의 변경</h2>
        <p>
          본 개인정보처리방침이 변경되는 경우 서비스 내 공지 등을 통해 변경 내용을 안내합니다.
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
.policy-panel {
  padding: 0 20px 48px;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  color: #262a33;
}

.policy-header {
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

.policy-header h1 {
  margin: 0;
  font-size: 18px;
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

.policy-content {
  padding-top: 8px;
  font-size: 14px;
  line-height: 1.75;
}

.policy-content .introduction {
  padding: 20px 0;
  border-bottom: 1px solid #f0f1f3;
}

.policy-content section {
  padding: 20px 0;
  border-bottom: 1px solid #f0f1f3;
}

.policy-content h2 {
  margin: 0 0 10px;
  color: #1f2937;
  font-size: 15px;
}

.policy-content h3 {
  margin: 18px 0 8px;
  color: #374151;
  font-size: 14px;
}

.policy-content p {
  margin: 0;
  color: #4b5563;
}

.policy-content p + p,
.policy-content p + ul,
.policy-content ul + p {
  margin-top: 10px;
}

.policy-content ul {
  margin-bottom: 0;
  padding-left: 22px;
  color: #4b5563;
}

.policy-content li + li {
  margin-top: 6px;
}

.effective-date {
  padding-top: 24px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .policy-panel {
    padding: var(--mobile-header-height) 20px 48px;
    border-right: 0;
  }

  .policy-header {
    min-height: 64px;
  }
}
</style>
