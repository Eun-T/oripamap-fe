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