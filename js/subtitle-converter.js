// API 설정 가져오기
import { API_BASE_URL, getApiUrl } from './api-config.js';

// 자막 변환 로직
document.addEventListener('DOMContentLoaded', function() {
    const convertForm = document.getElementById('convert-form');
    const resultArea = document.getElementById('result-area');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // 탭 전환 기능
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // 모든 탭 버튼 비활성화
                tabButtons.forEach(btn => btn.classList.remove('active'));
                // 클릭한 탭 버튼 활성화
                this.classList.add('active');
                
                // 모든 탭 패널 숨기기
                tabPanes.forEach(pane => pane.classList.remove('active'));
                // 해당 탭 패널 보이기
                document.getElementById(tabId + '-tab').classList.add('active');
            });
        });
    }
    
    // 변환 폼 제출 처리
    if (convertForm) {
        convertForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('file-input');
            const formatSelect = document.getElementById('format-select');
            const timeShift = document.getElementById('time-shift');
            const encodingSelect = document.getElementById('encoding-select');
            
            // 필수 값 확인
            if (fileInput.files.length === 0) {
                showMessage('변환할 파일을 선택해주세요.', 'error');
                return;
            }
            
            if (!formatSelect.value) {
                showMessage('변환할 포맷을 선택해주세요.', 'error');
                return;
            }
            
            // 확장자 검사
            const invalidFiles = Array.from(fileInput.files).filter(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                return ext !== 'srt' && ext !== 'smi';
            });
            
            if (invalidFiles.length > 0) {
                showMessage('지원하지 않는 파일 형식이 포함되어 있습니다. SRT 또는 SMI 파일만 업로드해주세요.', 'error');
                return;
            }
            
            // 변환 옵션 수집
            const options = {
                format: formatSelect.value,
                timeAdjust: parseFloat(timeShift.value) || 0,
                encoding: encodingSelect.value || 'utf-8'
            };
            
            // 변환 진행 상태 표시
            showLoadingUI();
            
            // 실제 변환 작업 처리
            convertSubtitles(fileInput.files, options)
                .then(results => {
                    showResults(results);
                })
                .catch(error => {
                    showMessage('변환 중 오류가 발생했습니다: ' + error.message, 'error');
                })
                .finally(() => {
                    hideLoadingUI();
                });
        });
    }
    
    function showLoadingUI() {
        resultArea.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>변환 중입니다. 잠시만 기다려주세요...</p>
            </div>
        `;
    }
    
    function hideLoadingUI() {
        const loadingElement = resultArea.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    function showMessage(message, type = 'info') {
        const alertClass = type === 'error' ? 'alert-error' : 'alert-info';
        const alertHTML = `
            <div class="alert ${alertClass}">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <p>${message}</p>
            </div>
        `;
        
        // 기존 알림 제거
        const existingAlert = resultArea.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        resultArea.insertAdjacentHTML('afterbegin', alertHTML);
        
        // 에러가 아닌 경우 3초 후 자동 제거
        if (type !== 'error') {
            setTimeout(() => {
                const alert = resultArea.querySelector('.alert');
                if (alert) {
                    alert.remove();
                }
            }, 3000);
        }
    }
    
    function showResults(results) {
        let resultsHTML = '<h3>변환 완료</h3>';
        
        if (results.length === 0) {
            resultsHTML += '<p>변환된 파일이 없습니다.</p>';
        } else {
            resultsHTML += '<div class="result-files subtitle-results">';
            
            results.forEach(result => {
                if (!result.success) {
                    // 실패한 경우
                    resultsHTML += `
                        <div class="result-file error">
                            <div class="result-file-icon">
                                <i class="fas fa-exclamation-circle"></i>
                            </div>
                            <div class="result-file-info">
                                <p class="result-filename">${result.original_filename || '파일'}</p>
                                <p class="result-error">${result.error || '변환 실패'}</p>
                            </div>
                        </div>
                    `;
                    return;
                }
                
                // 성공한 경우
                resultsHTML += `
                    <div class="result-file">
                        <div class="result-file-icon">
                            <i class="fas fa-closed-captioning"></i>
                        </div>
                        <div class="result-file-info">
                            <p class="result-filename">${result.converted_filename}</p>
                            <p class="result-details">원본: ${result.original_format.toUpperCase()} → 변환: ${result.converted_format.toUpperCase()}</p>
                            <p class="result-details">인코딩: ${result.encoding_used}</p>
                            <p class="result-details">시간 조정: ${result.time_adjustment}초</p>
                        </div>
                        <div class="result-file-actions">
                            <a href="${result.download_url}" class="btn" download="${result.converted_filename}">
                                <i class="fas fa-download"></i> 다운로드
                            </a>
                        </div>
                    </div>
                `;
            });
            
            resultsHTML += '</div>';
            resultsHTML += '<div class="bulk-actions">';
            resultsHTML += '<button class="btn" id="download-all"><i class="fas fa-download"></i> 모두 다운로드</button>';
            resultsHTML += '</div>';
        }
        
        resultArea.innerHTML = resultsHTML;
        
        // 모두 다운로드 버튼 이벤트
        const downloadAllBtn = document.getElementById('download-all');
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', function() {
                results.forEach(result => {
                    if (result.success && result.download_url) {
                        // 각 파일 다운로드 링크 클릭
                        const link = document.createElement('a');
                        link.href = result.download_url;
                        link.download = result.converted_filename;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                });
            });
        }
    }
    
    async function convertSubtitles(files, options) {
        const results = [];
        
        // 각 파일을 순차적으로 처리
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const result = await uploadAndConvertSubtitle(file, options);
                results.push(result);
            } catch (error) {
                console.error(`자막 변환 실패: ${file.name}`, error);
                // 실패한 파일 정보 추가
                results.push({
                    success: false,
                    original_filename: file.name,
                    error: error.message || '알 수 없는 오류'
                });
            }
        }
        
        return results;
    }
    
    async function uploadAndConvertSubtitle(file, options) {
        // FormData 생성
        const formData = new FormData();
        formData.append('file', file);
        
        // 옵션 추가
        Object.keys(options).forEach(key => {
            if (options[key] !== undefined && options[key] !== null) {
                formData.append(key, options[key]);
            }
        });
        
        console.log('변환 요청:', file.name, options);
        
        try {
            // API URL 생성
            const apiUrl = getApiUrl('convert-subtitle');
            console.log('API 요청 URL:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '서버 오류');
            }
            
            return await response.json();
        } catch (error) {
            console.error('변환 요청 실패:', error);
            throw error;
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // CSS 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        .alert {
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .alert-info {
            background-color: rgba(52, 152, 219, 0.1);
            color: var(--primary-color);
        }
        
        .alert-error {
            background-color: rgba(231, 76, 60, 0.1);
            color: #e74c3c;
        }
        
        .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            gap: 1rem;
        }
        
        .loading i {
            font-size: 2rem;
            color: var(--primary-color);
        }
        
        .result-files {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .subtitle-results .result-file {
            display: flex;
            align-items: center;
            border: 1px solid #e0e0e0;
            border-radius: 0.5rem;
            padding: 1rem;
            background-color: #f9f9f9;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .subtitle-results .result-file:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .subtitle-results .result-file.error {
            background-color: rgba(231, 76, 60, 0.05);
            border-color: rgba(231, 76, 60, 0.2);
        }
        
        .subtitle-results .result-file-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 1rem;
            flex-shrink: 0;
        }
        
        .subtitle-results .result-file.error .result-file-icon {
            background-color: #e74c3c;
        }
        
        .subtitle-results .result-file-icon i {
            font-size: 1.5rem;
        }
        
        .subtitle-results .result-file-info {
            flex-grow: 1;
        }
        
        .subtitle-results .result-filename {
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .subtitle-results .result-details {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }
        
        .subtitle-results .result-error {
            color: #e74c3c;
            font-size: 0.9rem;
        }
        
        .subtitle-results .result-file-actions {
            flex-shrink: 0;
        }
        
        .bulk-actions {
            margin-top: 1rem;
            display: flex;
            justify-content: flex-end;
        }
        
        @media (max-width: 768px) {
            .subtitle-results .result-file {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .subtitle-results .result-file-icon {
                margin-right: 0;
                margin-bottom: 1rem;
            }
            
            .subtitle-results .result-file-info {
                margin-bottom: 1rem;
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // 드래그 앤 드롭 지원
    const dropZone = document.getElementById('drop-zone');
    
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropZone.classList.add('highlight');
        }
        
        function unhighlight() {
            dropZone.classList.remove('highlight');
        }
        
        dropZone.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                const fileInput = document.getElementById('file-input');
                fileInput.files = files;
                
                // 파일 이름 표시
                const fileDisplay = document.querySelector('.file-display');
                if (fileDisplay) {
                    if (files.length === 1) {
                        fileDisplay.textContent = files[0].name;
                    } else {
                        fileDisplay.textContent = `${files.length}개 파일이 선택됨`;
                    }
                }
            }
        }
    }

    // 변환 카운터 업데이트 함수
    function updateSubtitleConversionCounter(count) {
        try {
            console.log('자막 변환 카운터 업데이트 시작 - 추가할 개수:', count);
            
            // 로컬 스토리지에서 현재 변환 횟수 가져오기
            let conversions = parseInt(localStorage.getItem('subtitle_conversion_count') || '0');
            console.log('현재 저장된 자막 변환 횟수:', conversions);
            
            // 변환 횟수 증가
            conversions += count;
            
            // 로컬 스토리지에 저장
            localStorage.setItem('subtitle_conversion_count', conversions.toString());
            
            console.log('자막 변환 카운터 업데이트 완료:', conversions);
            
            // 이미지 변환 카운터와 합산하여 전체 변환 카운터 업데이트
            updateTotalConversionCounter();
            
            // 메인 페이지의 카운터 업데이트 함수가 있으면 호출
            if (window.parent && typeof window.parent.updateStats === 'function') {
                console.log('부모 창의 updateStats 함수 호출');
                window.parent.updateStats();
            } else if (typeof updateStats === 'function') {
                // 현재 페이지에 updateStats 함수가 있으면 호출
                console.log('현재 페이지의 updateStats 함수 호출');
                updateStats();
            }
        } catch (error) {
            console.error('자막 변환 카운터 업데이트 오류:', error);
        }
    }

    // 전체 변환 카운터 업데이트 함수
    function updateTotalConversionCounter() {
        try {
            // 각 변환기의 카운터 값 가져오기
            const imageConversions = parseInt(localStorage.getItem('image_conversion_count') || '0');
            const subtitleConversions = parseInt(localStorage.getItem('subtitle_conversion_count') || '0');
            
            // 합산하여 전체 변환 카운터 업데이트
            const totalConversions = imageConversions + subtitleConversions;
            localStorage.setItem('conversion_count', totalConversions.toString());
            
            console.log('전체 변환 카운터 업데이트:', totalConversions, 
                '(이미지:', imageConversions, '+ 자막:', subtitleConversions, ')');
        } catch (error) {
            console.error('전체 변환 카운터 업데이트 오류:', error);
        }
    }

    // 페이지 로드 시 카운터 초기화
    if (localStorage.getItem('subtitle_conversion_count') === null) {
        localStorage.setItem('subtitle_conversion_count', '0');
        console.log('자막 변환 카운터 초기화: 0');
    }
    
    // 전체 변환 카운터 업데이트
    updateTotalConversionCounter();

    // 변환 버튼 클릭 이벤트에 카운터 업데이트 추가
    const convertBtn = document.getElementById('convert-btn');
    if (convertBtn) {
        // 기존 이벤트 리스너를 보존하기 위해 새 이벤트 리스너 추가
        convertBtn.addEventListener('click', function() {
            // 변환이 성공적으로 완료되었는지 확인하는 타이머 설정
            setTimeout(function() {
                const resultArea = document.getElementById('result');
                if (resultArea && resultArea.textContent && !resultArea.textContent.includes('Error')) {
                    // 변환 성공 시 카운터 증가
                    updateSubtitleConversionCounter(1);
                }
            }, 1000); // 1초 후 확인
        });
    }
});