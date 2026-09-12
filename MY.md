idle 이 머지?

prefetch + client-side cache 구조로 가져오기? 뭐를?
prefetch = 사용자가 누르기 전에 미리 가져오기
client-side cache = 가져온 데이터를 브라우저 메모리에 잠깐 저장해두기
debounce = 지도 움직임이 연속으로 발생해도 매번 호출하지 말고 300ms 정도 기다렸다 한 번만 호출

Client-side cache는 받아온 데이터를 브라우저 쪽에 잠깐 저장해두는 것. 보통 이미지 파일 자체를 Pinia 등에 넣는 게 아니라:

{
  placeId: 3,
  photoUrls: [...],
  fetchedAt: ...
}

처럼 사진 URL과 데이터만 저장함. 예를 들어 TTL을 10분으로 정하면 10분 동안 같은 장소 사진 API를 다시 호출하지 않는 방식.

실제 JPG/PNG 파일은 별도로 브라우저 HTTP 캐시가 관리함.

그리고 화면에 마커가 많을 때 기존 API:

GET /api/comments/place/{placeId}/photos

를 모든 마커에 미리 호출하면:

마커 30개
→ API 최대 30번

이 될 수 있음. 그래서 제대로 prefetch를 구현한다면 나중에:

GET /api/places/photo-previews?ids=1,2,3,4,...

같은 배치 API를 만들어 여러 장소의 사진 정보를 한 번에 가져오는 방법이 있음.
refetch가 무조건 좋은 건 아님.

사용자가 클릭하지 않을 장소의 S3 이미지까지 미리 다운로드하면 S3 요청/데이터 전송량이 오히려 증가할 수 있음.

---> 비용 증가

그래서 역할이:

정리 =
Vue 캐시: "3번 장소에는 abc.jpg가 있다"를 기억
HTTP 캐시: "abc.jpg 실제 파일은 이거다"를 기억

------------------------------------------------------
3. 이미지 최적화
------------------------------------------------------

### 현재 처리 방식
- 프론트에서 `browser-image-compression` 라이브러리 사용
- 업로드 전에 브라우저에서 이미지 리사이즈/압축
- 원본 최대 크기: 5MB
- JPG/PNG만 허용
- 긴 변 최대 1600px
- JPEG 품질: 0.8
- PNG 품질: 1
- Web Worker 사용으로 이미지 처리 중 UI 멈춤 최소화

### 현재 처리 흐름

사진 선택
→ 파일 형식 검사
→ 원본 5MB 이하인지 검사
→ 브라우저에서 리사이즈/압축
→ 처리된 파일을 미리보기
→ 서버 업로드
→ S3 저장

### 왜 프론트에서 먼저 압축하는가
- 큰 원본 이미지를 그대로 서버/S3에 보내지 않기 위해
- 업로드 속도 개선
- S3 저장 용량 감소
- 이미지 다운로드 용량 감소
- 화면 표시 속도 개선

### JPEG와 PNG 차이

| 항목 | JPEG | PNG |
|---|---|---|
| 주 용도 | 일반 사진 | 로고, 캡처, 투명 이미지 |
| 압축 방식 | 손실 압축 | 무손실 압축 |
| 일반 사진 용량 | 비교적 작음 | 비교적 큼 |
| 투명 배경 | 지원 안 함 | 지원 |
| 현재 품질 설정 | 0.8 | 1 |

PNG는 투명도와 원본 특성을 유지하기 위해 품질을 1로 사용했지만,
일반 사진을 PNG로 유지하면 용량이 크게 나올 수 있음.

### 실제 확인한 이미지 크기 예시
- 273,676 bytes ≈ 0.27MB
- 121,575 bytes ≈ 0.12MB
- 1,100,647 bytes ≈ 1.10MB

같은 용도의 이미지라도 포맷과 내용에 따라 용량 차이가 크게 발생함.

### WebP 검토
WebP는 웹용 이미지 포맷으로 JPEG/PNG보다 같은 체감 화질에서
더 작은 파일 크기를 만들 수 있는 경우가 많음.

검토 중인 설정:

- 긴 변 최대 1200px
- WebP 변환
- quality 0.75

예상 흐름:

JPG / PNG 원본
→ 1200px 리사이즈
→ WebP 변환
→ S3 업로드

### WebP 적용 전 확인할 것
- `browser-image-compression`에서 WebP 변환 가능한지
- 백엔드가 `image/webp`를 허용하는지
- S3의 Content-Type이 `image/webp`로 저장되는지
- 파일 확장자 `.webp` 처리 여부
- 댓글 조회/표시/삭제 로직에 영향 없는지

### 추가로 배운 점
- Vue의 client-side cache에는 이미지 파일 자체가 아니라 URL/메타데이터를 저장
- 실제 이미지 파일 캐시는 브라우저 HTTP cache가 관리
- URL만 prefetch하면 API 응답 대기 시간은 줄지만 S3 이미지 다운로드 시간은 남음
- 이미지까지 preload하면 클릭 시 더 빠르지만 S3 요청/전송량이 증가할 수 있음

### HEIC/HEIF 처리 적용
- JPG/PNG는 기존 처리 유지
- HEIC/HEIF만 `heic2any`를 동적 import해 JPEG Blob으로 변환
- 변환 결과를 `browser-image-compression`으로 최대 1200px, quality 0.75 WebP 처리
- 최종 파일은 `.webp`, `image/webp`
- HEIC 변환 실패 시 원본을 업로드하지 않고 안내
- 기존 5MB 제한, Web Worker, AbortController, 중복 처리 차단, Object URL 정리 유지
- `npm run build` 통과

------------------------------------------------------
4. 이미지 최적화 트러블슈팅 - iOS Safari WebP 변환
------------------------------------------------------

### 문제 상황

댓글 이미지 업로드 용량을 줄이기 위해
`browser-image-compression`을 사용하여 JPG/PNG 이미지를 WebP로 변환하도록 변경했다.

설정:
- 최대 긴 변: 1200px
- WebP Quality: 0.75
- 원본 최대 크기: 5MB

Chrome에서는 정상적으로 WebP가 생성됐지만,
iPhone Safari에서는 WebP 변환을 요청해도 실제 결과가 PNG로 반환되는 문제가 발생했다.

### 원인

`browser-image-compression`은 자체 WebP 인코더를 가지고 있는 것이 아니라
브라우저의 Canvas 이미지 인코딩 기능을 사용한다.

따라서 브라우저가 Canvas WebP 인코딩을 지원하지 않으면
`image/webp`를 요청하더라도 실제 결과가 PNG로 fallback될 수 있었다.

단순히 반환된 PNG Blob의 MIME Type이나 확장자만
`.webp`로 변경하는 것은 실제 이미지 포맷을 WebP로 변환하는 것이 아니므로
올바른 해결 방법이 아니었다.

### 해결

Safari에서 실제 WebP가 생성되지 않은 경우에만
`@jsquash/webp`의 WASM WebP Encoder를 사용하도록 fallback을 추가했다.

처리 흐름:

JPG / PNG / HEIC
↓
필요 시 HEIC 변환
↓
browser-image-compression
- 최대 1200px
- WebP Quality 0.75
↓
실제 결과 MIME 확인
↓
image/webp이면 그대로 사용
↓
WebP가 아니라면 Safari fallback
↓
Canvas에서 ImageData 추출
↓
@jsquash/webp WASM Encoder
↓
실제 WebP 파일 생성
↓
업로드

### 추가 최적화

`@jsquash/webp`는 모든 사용자에게 처음부터 로드하지 않고
WebP 변환에 실패한 경우에만 Dynamic Import한다.

따라서 WebP 인코딩이 정상적으로 지원되는 브라우저에서는
추가 WASM 모듈을 불필요하게 다운로드하지 않는다.

### 결과

- Chrome 등 WebP 인코딩 지원 브라우저 정상 동작
- iPhone Safari에서도 실제 WebP 생성 가능
- JPG / PNG / HEIC 업로드 정상 동작
- PNG 파일의 MIME Type만 WebP로 변경하던 잘못된 방식 제거
- 이미지 최대 1200px + WebP Quality 0.75 적용
- 기존 5MB 제한, 작업 취소, Object URL 정리 로직 유지

### 배운 점

- 이미지 확장자나 MIME Type을 변경한다고 실제 이미지 포맷이 변환되는 것은 아니다.
- 라이브러리를 사용하더라도 내부적으로 브라우저 기능에 의존할 수 있으므로 브라우저별 지원 여부를 확인해야 한다.
- 브라우저가 지원하지 않는 기능은 WASM 기반 Encoder를 fallback으로 사용할 수 있다.
- 무거운 fallback 라이브러리는 Dynamic Import를 사용하면 필요한 환경에서만 로드할 수 있다.


------------------------------------------------------
5. Object URL 정리
------------------------------------------------------

업로드 전 이미지 미리보기를 만들 때 사용할 수 있다.

```js
const url = URL.createObjectURL(file)


------------------------------------------------------
6. 장소 상세정보 클라이언트 사이드 캐시
------------------------------------------------------

장소 상세정보(`/api/places/{id}`)는 프론트의 `Map`을 이용해 메모리에 캐싱한다.

js
const placeDetailCache = new Map()
클라이언트 사이드 메모리 캐시(Client-side In-memory Cache)
저장 위치: 사용자 브라우저 RAM
같은 장소 재조회 시 API 호출 없이 캐시 사용
새로고침하면 캐시 삭제
pendingPlaceDetails로 동일 API 중복 요청 방지
현재 별도의 캐시 만료시간(TTL)은 없음
주의사항

S3 Presigned URL은 만료시간이 있으므로, 상세 캐시는 남아 있지만 이미지 URL만 만료될 수 있다.

추후 필요하면 캐시 TTL을 적용하고 Presigned URL 만료시간도 함께 고려한다.

------------------------------------------------------
7. 장소 상세 URL 라우팅
------------------------------------------------------

### 현재 구조

현재 장소 마커를 클릭해도 URL은 항상 동일하다.

```text
/map
```

선택된 장소는 Pinia의 `selectedPlace` 같은 클라이언트 상태로만 관리한다.

```text
/map
→ 마커 클릭
→ selectedPlace = 17
→ URL은 /map 그대로
```

### 개선 구조

장소를 선택하면 URL에도 장소 ID를 반영한다.

```text
/map
→ /place/17
```

화면 자체는 기존처럼 `지도 + 장소 상세 사이드바`를 유지하고,
URL만 현재 선택된 장소를 표현하도록 한다.

장소 상세을 닫으면 다시:

```text
/place/17
→ /map
```

### 장점

- 장소 상세 URL을 카카오톡/SNS 등에 바로 공유 가능
- 새로고침해도 해당 장소 상세 복원 가능
- 브라우저 뒤로가기/앞으로가기 자연스럽게 동작
- 장소별 새 탭 열기 가능
- Capacitor 앱 딥링크 구현의 기반
- 장소마다 고유 URL이 생겨 향후 SEO에 유리
- GA 등에서 장소별 페이지 조회 분석이 쉬워짐
- 삭제되거나 존재하지 않는 장소 URL의 에러 처리가 명확해짐
- Router와 Pinia의 역할을 명확하게 분리 가능

### 역할 분리

```text
Router
→ 현재 어떤 장소를 보고 있는지 관리
→ /place/:id

Pinia
→ 장소 데이터 및 상세 캐시 관리

Component
→ 지도와 장소 상세 UI 표시
```

### 오맵 적용 예시

```text
/map
→ 지도 기본 화면

/place/17
→ 17번 장소 선택 + 기존 상세 사이드바 표시
```

`/place/:id`로 직접 접속하면:

1. URL에서 placeId 확인
2. Pinia 상세 캐시 확인
3. 캐시에 있으면 재사용
4. 없으면 `GET /api/places/{id}` 호출
5. 기존 장소 상세 사이드바 표시

### 결론

오맵처럼 `지도 → 마커 선택 → 장소 상세`이 핵심인 서비스에서는
장소 선택 상태를 Pinia에만 저장하기보다 URL에도 반영하는 것이 좋다.

새로운 상세 페이지를 만드는 개념이 아니라,
**현재 보고 있는 장소를 URL로도 표현하도록 만드는 것**이다.

------------------------------------------------------
8. Capacitor Android API 연결 트러블슈팅
------------------------------------------------------

### 문제
웹에서는 정상 동작했지만 Capacitor 앱에서 지도가 뜨지 않고 아래 오류 발생.

`places.forEach is not a function`

Network 확인 결과 `/api/places`가 Spring이 아닌 `https://localhost/api/places`로 요청되고 있었고, JSON 대신 앱의 `index.html`이 반환됨.

### 원인
웹에서는 Vite Proxy가 `/api` 요청을 Nginx로 전달하지만, Capacitor 앱에는 Vite 개발 서버/Proxy가 없음.

```text
웹: /api → Vite Proxy → Nginx → Spring
앱: /api → https://localhost ❌
```

### 해결
Axios의 `baseURL`을 환경변수로 변경.

```js
baseURL: import.meta.env.VITE_API_BASE_URL || ''
```

Android Emulator에서 PC의 localhost는 `10.0.2.2`이므로 Capacitor 빌드 환경에 설정.

```env
VITE_API_BASE_URL=http://10.0.2.2
```

현재 Nginx가 80포트에서 요청을 받고 있어 `:8080`은 붙이지 않음.

변경 후:

```bash
npm run android:sync
```

Android 빌드에서만 `.env.android`의 에뮬레이터 API 주소를 사용한다.

최종적으로:

```text
Android Emulator → 10.0.2.2 → Nginx → Spring
```

※ 실제 배포 시 `10.0.2.2` 대신 AWS의 실제 API 주소를 사용한다.

------------------------------------------------------
9. Capacitor 안드로이드 스튜디오 설정
------------------------------------------------------

	"server": {
		"androidScheme": "http"
	}

  android:usesCleartextTraffic="true"
  android:networkSecurityConfig="@xml/network_security_config"
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  VITE_API_BASE_URL=http://10.0.2.2

  <?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true" />
</network-security-config> 이거는 정확히 기억이 안남
