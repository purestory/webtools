// API 설정
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : `http://${window.location.hostname}`;

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
        // FormData 객체 생성
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', options.format);
        formData.append('encoding', options.encoding);
        formData.append('time_adjust', options.timeAdjust);
        
        // API 호출
        const response = await fetch(`${API_BASE_URL}/api/convert-subtitle`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '서버 오류');
        }
        
        return await response.json();
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
});