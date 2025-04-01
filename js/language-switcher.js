// 현재 언어 설정을 저장할 전역 변수
let currentLang = 'en';

// 언어 전환 함수
function switchLanguage(lang) {
    try {
        // 로컬 스토리지에 언어 설정 저장
        localStorage.setItem('preferredLanguage', lang);
        console.log('언어 설정 변경:', lang);
        
        // 전역 변수 업데이트
        currentLang = lang;
        
        // 페이지 새로고침 없이 UI 텍스트 업데이트
        updateUILanguage();
    } catch (error) {
        console.error('언어 설정 변경 오류:', error);
    }
}

// UI 언어 업데이트 함수
function updateUILanguage() {
    try {
        // 언어 속성을 가진 모든 요소 찾기
        const elements = document.querySelectorAll('[data-en], [data-ko]');
        
        // 각 요소의 텍스트 업데이트
        elements.forEach(element => {
            const langText = element.getAttribute(`data-${currentLang}`);
            if (langText) {
                element.textContent = langText;
            }
        });
        
        // 현재 언어 표시 업데이트
        const langDisplay = document.getElementById('current-lang');
        if (langDisplay) {
            langDisplay.textContent = currentLang === 'ko' ? '한국어' : 'English';
        }
        
        console.log('UI 언어 업데이트 완료:', currentLang);
    } catch (error) {
        console.error('UI 언어 업데이트 오류:', error);
    }
}

// 페이지 로드 시 언어 설정 적용
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 저장된 언어 설정 가져오기
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        currentLang = savedLang;
        
        console.log('현재 언어 설정:', currentLang);
        
        // UI 언어 업데이트
        setTimeout(updateUILanguage, 500);
    } catch (error) {
        console.error('언어 설정 적용 오류:', error);
    }
});

// 전역 스코프에 함수 노출
window.switchLanguage = switchLanguage;
window.currentLang = currentLang; 