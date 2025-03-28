// 언어 전환 함수
function changeLanguage(lang) {
    try {
        // 로컬 스토리지에 언어 설정 저장
        localStorage.setItem('preferredLanguage', lang);
        console.log('언어 설정 변경:', lang);
        
        // 페이지 새로고침
        location.reload();
    } catch (error) {
        console.error('언어 설정 변경 오류:', error);
    }
}

// 페이지 로드 시 언어 설정 적용
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 저장된 언어 설정 가져오기
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        
        // 언어 선택 드롭다운 업데이트
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = savedLang;
        }
        
        console.log('현재 언어 설정:', savedLang);
    } catch (error) {
        console.error('언어 설정 적용 오류:', error);
    }
}); 