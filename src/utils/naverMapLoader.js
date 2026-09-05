/**
 * 네이버 지도 API 스크립트를 동적으로 로드하는 함수
 * - 중복 로드를 방지하고, SDK가 글로벌 객체(window.naver)에 완벽히 바인딩될 때까지 보장합니다.
 * @returns {Promise<void>} 
 */

export const loadNaverMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.naver?.maps?.Service) {
      resolve()
      return
    }

    const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID

    if (!clientId) {
      reject(new Error('네이버 지도 Client ID가 설정되지 않았습니다.'))
      return
    }

    const existingScript = document.getElementById('naver-map-script')

    if (existingScript) {
      waitForNaverMap(resolve, reject)
      return
    }

    const script = document.createElement('script')
    script.id = 'naver-map-script'
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`
    script.async = true
    script.defer = true

    script.onload = () => {
      waitForNaverMap(resolve, reject)
    }

    script.onerror = () => {
      reject(new Error('지도 로드 실패'))
    }

    document.head.appendChild(script)
  })
}

const waitForNaverMap = (resolve, reject) => {
  const checkInterval = setInterval(() => {
    if(window.naver?.maps?.Service){
      clearInterval(checkInterval)
      clearTimeout(timeout)
      resolve()
    }
  }, 50)

  const timeout = setTimeout(() => {
    clearInterval(checkInterval)
    reject(new Error('네이버 지도 로딩 시간 초과'))
  },10000)
}