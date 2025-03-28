/**
 * API 설정 파일
 * 환경에 따라 적절한 API 엔드포인트를 제공합니다.
 */

// 배포 환경에 따른 API 기본 URL 설정
const API_BASE_URL = getApiBaseUrl();

/**
 * 환경에 따른 API 기본 URL을 반환합니다.
 * 
 * @returns {string} API 기본 URL
 */
function getApiBaseUrl() {
    // 현재 호스트 확인 (로컬 개발 vs Netlify 배포)
    const host = window.location.hostname;
    
    if (host === 'localhost' || host === '127.0.0.1') {
        // 로컬 개발 환경
        return 'http://localhost:5000/api';
    } else if (host.includes('netlify.app')) {
        // Netlify 배포 환경 - 프록시 사용 (백엔드에서 /api 접두사가 제거됨)
        return '';
    } else {
        // 기타 환경 (기본값) - 직접 서버 호출 (HTTPS 대신 HTTP 사용)
        return 'http://itsmyzone.iptime.org';
    }
}

/**
 * API URL을 생성합니다.
 * 
 * @param {string} endpoint - API 엔드포인트 경로 (예: 'convert-image')
 * @returns {string} 완전한 API URL
 */
function getApiUrl(endpoint) {
    // 슬래시 중복 방지
    if (endpoint.startsWith('/')) {
        endpoint = endpoint.substring(1);
    }
    
    // API 기본 URL이 비어있지 않은 경우에만 슬래시 추가
    const baseUrl = API_BASE_URL === '' ? '' : API_BASE_URL + '/';
    const url = `${baseUrl}${endpoint}`;
    
    console.log(`API URL 생성: ${url}`);
    return url;
}

// 외부에서 사용하기 위해 내보내기
export { API_BASE_URL, getApiUrl }; 