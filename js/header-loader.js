// API 설정 가져오기 - 일반 전역 스크립트로 변경
// import { API_BASE_URL } from './api-config.js';

// 헤더를 로드하고 현재 페이지에 맞게 스타일을 적용하는 함수
document.addEventListener('DOMContentLoaded', function() {
    // 헤더 컨테이너 요소
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) return;
    
    // 현재 페이지 파일명 가져오기
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageName = currentPage.replace('.html', '');
    
    // 헤더 가져오기
    fetch('components/header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            // 헤더 컨테이너에 HTML 삽입
            headerContainer.innerHTML = data;
            
            // 현재 페이지에 해당하는 메뉴 항목에 active 클래스 추가
            const menuItems = document.querySelectorAll('.nav-link');
            menuItems.forEach(item => {
                if (item.getAttribute('data-page') === pageName) {
                    item.classList.add('active');
                }
            });
            
            // API 정보를 콘솔에 출력 (디버깅용)
            // console.log('API 기본 주소:', API_BASE_URL);
            
            // 언어 설정 업데이트
            updateLanguageDisplay();
        })
        .catch(error => {
            console.error('헤더 로드 중 오류 발생:', error);
            headerContainer.innerHTML = '<div class="error-message">헤더를 로드할 수 없습니다.</div>';
        });
});

// 언어 표시 업데이트 함수
function updateLanguageDisplay() {
    const langDisplay = document.getElementById('current-lang');
    if (!langDisplay) return;
    
    // 현재 언어 가져오기 (글로벌 변수 currentLang 사용)
    if (typeof window.currentLang !== 'undefined') {
        langDisplay.textContent = window.currentLang === 'ko' ? '한국어' : 'English';
    } else if (typeof currentLang !== 'undefined') {
        langDisplay.textContent = currentLang === 'ko' ? '한국어' : 'English';
    } else {
        // 기본값 설정
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        langDisplay.textContent = savedLang === 'ko' ? '한국어' : 'English';
    }
} 