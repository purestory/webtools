// API 설정
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : `http://${window.location.hostname}`;

// 지원하는 이미지 포맷
const SUPPORTED_FORMATS = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'ico', 'svg', 'avif', 'heif', 'heic'
];

// 파일 형식 검증 함수 추가
function isValidFormat(format) {
    const lowercaseFormat = format.toLowerCase();
    return SUPPORTED_FORMATS.includes(lowercaseFormat);
}

// 파일 확장자 추출 함수
function getFileExtension(filename) {
    if (!filename) return '';
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return ''; // 확장자 없음
    return filename.substring(lastDotIndex + 1).toLowerCase();
}

// 이미지 변환 로직
document.addEventListener('DOMContentLoaded', function() {
    const convertForm = document.getElementById('convert-form');
    const resultArea = document.getElementById('result-area');
    let formatSelect = document.getElementById('format-select');
    
    // 페이지 로드 시 기본 포맷 옵션 표시
    if (formatSelect && formatSelect.value) {
        showFormatOptions(formatSelect.value);
    }
    
    // 리사이즈 타입 선택 이벤트 리스너 추가
    const resizeType = document.getElementById('resize-type');
    if (resizeType) {
        // 페이지 로드 시 초기 리사이즈 옵션 표시
        showResizeOptions(resizeType.value || 'original');
    }
    
    // 리사이즈 이벤트 핸들러 설정
    setupResizeEventHandlers();
    
    // 제약 조건 선택 이벤트 리스너 추가
    const constraintType = document.getElementById('constraint-type');
    if (constraintType) {
        // 페이지 로드 시 초기 제약 조건 적용
        updateConstraints(constraintType.value || 'none');
        
        // 제약 조건 변경 시 이벤트 리스너
        constraintType.addEventListener('change', function() {
            updateConstraints(this.value);
        });
    }
    
    if (convertForm) {
        convertForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('file-input');
            
            // 필수 값 확인
            if (fileInput.files.length === 0) {
                showMessage(currentLang === 'ko' ? '변환할 파일을 선택해주세요.' : 'Please select files to convert.', 'error');
                return;
            }
            
            if (formatSelect.value === '') {
                showMessage(currentLang === 'ko' ? '변환할 포맷을 선택해주세요.' : 'Please select a format to convert to.', 'error');
                return;
            }
            
            // 포맷 유효성 검사
            const format = formatSelect.value.toLowerCase();
            if (!isValidFormat(format)) {
                showMessage(`${currentLang === 'ko' ? '지원되지 않는 형식입니다' : 'Unsupported format'}: ${format}. ${currentLang === 'ko' ? '지원 형식' : 'Supported formats'}: ${SUPPORTED_FORMATS.join(', ')}`, 'error');
                return;
            }
            
            // 파일 확장자 확인
            const filesArray = Array.from(fileInput.files);
            
            // 파일 형식 유효성 검사
            for (const file of filesArray) {
                const fileExt = getFileExtension(file.name);
                if (!fileExt || !isValidFormat(fileExt)) {
                    showMessage(currentLang === 'ko' ? `지원되지 않는 파일입니다: ${file.name}. 지원되는 형식의 이미지 파일을 선택해주세요.` : `Unsupported file: ${file.name}. Please select image files with supported formats.`, 'error');
                    return;
                }
                
                // 파일 크기 확인
                const fileSizeMB = file.size / (1024 * 1024);
                
                // BMP 변환 시 파일 크기 제한 강화
                const maxSize = (format === 'bmp') ? 3 : 20; // BMP는 3MB, 다른 형식은 20MB
                
                if (fileSizeMB > maxSize) {
                    if (format === 'bmp') {
                        showMessage(currentLang === 'ko' ? `BMP 변환 시에는 ${maxSize}MB 이하의 파일만 처리 가능합니다: ${file.name} (${fileSizeMB.toFixed(1)}MB)` : `For BMP conversion, only files below ${maxSize}MB can be processed: ${file.name} (${fileSizeMB.toFixed(1)}MB)`, 'error');
                    } else {
                        showMessage(currentLang === 'ko' ? `파일 크기가 너무 큽니다: ${file.name} (${fileSizeMB.toFixed(1)}MB). ${maxSize}MB 이하의 파일을 선택해주세요.` : `File is too large: ${file.name} (${fileSizeMB.toFixed(1)}MB). Please select files below ${maxSize}MB.`, 'error');
                    }
                    return;
                }
                
                // 빈 파일 확인
                if (file.size === 0) {
                    showMessage(currentLang === 'ko' ? `빈 파일은 처리할 수 없습니다: ${file.name}` : `Cannot process empty file: ${file.name}`, 'error');
                    return;
                }
            }
            
            // 변환 옵션 수집
            const options = {
                format: format,
            };
            
            try {
                // 리사이즈 유형 확인
                const resizeType = document.getElementById('resize-type')?.value || 'original';
                
                if (resizeType === 'original') {
                    // 원본 크기 유지 (리사이즈 옵션 추가 안함)
                    console.log('원본 크기 유지');
                } 
                else if (resizeType === 'percentage') {
                    // 비율에 따른 리사이즈
                    const percentageInput = document.getElementById('percentage-input');
                    if (percentageInput && percentageInput.value) {
                        const percentage = parseInt(percentageInput.value, 10);
                        if (percentage > 0) {
                            if (originalWidth > 0 && originalHeight > 0) {
                                options.width = Math.round(originalWidth * percentage / 100);
                                options.height = Math.round(originalHeight * percentage / 100);
                                console.log(`비율 조정: ${percentage}%, ${options.width}x${options.height}`);
                            }
                        }
                    }
                } 
                else if (resizeType === 'free') {
                    // 자유 조정 또는 비율 유지 모드
            const widthInput = document.getElementById('width-input');
            const heightInput = document.getElementById('height-input');
            
            if (widthInput && widthInput.value) {
                        options.width = parseInt(widthInput.value, 10);
            }
            
            if (heightInput && heightInput.value) {
                        options.height = parseInt(heightInput.value, 10);
                    }
                    
                    console.log(`자유 조정: ${options.width}x${options.height}`);
            }
            
                // 품질 옵션 가져오기 (모든 포맷에 적용)
            const qualityInput = document.getElementById('quality-input');
                if (qualityInput) {
                    options.quality = parseInt(qualityInput.value, 10);
            }
            
            // 로딩 UI 표시
            showLoadingUI();
            
            // 변환 요청
            convertImages(filesArray, options)
                .then(results => {
                    hideLoadingUI();
                    showResults(results);
                })
                .catch(error => {
                    hideLoadingUI();
                        showMessage(error.message || (currentLang === 'ko' ? '변환 중 오류가 발생했습니다.' : 'An error occurred during conversion.'), 'error');
                    });
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
    
    // 포맷 변경 시 해당 옵션 표시
    if (formatSelect) {
        formatSelect.addEventListener('change', function() {
            showFormatOptions(this.value);
        });
    }
    
    // 파일 업로드 영역 설정
    setupFileUpload();
    
    /**
     * 로딩 UI를 표시합니다.
     */
    function showLoadingUI() {
        // 기존 로딩 오버레이가 있으면 제거
        hideLoadingUI();
        
        // 로딩 오버레이 생성
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.id = 'loading-overlay';
        
        // 로딩 스피너 생성
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        loadingOverlay.appendChild(spinner);
        
        // 로딩 메시지 생성
        const loadingMessage = document.createElement('div');
        loadingMessage.textContent = '이미지 변환 중입니다...';
        loadingOverlay.appendChild(loadingMessage);
        
        // 진행 상태 컨테이너 생성
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        
        // 진행 상태 바 생성
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.id = 'conversion-progress';
        progressContainer.appendChild(progressBar);
        
        // 진행 상태 텍스트 생성
        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.id = 'progress-text';
        progressText.textContent = '0%';
        progressContainer.appendChild(progressText);
        
        loadingOverlay.appendChild(progressContainer);
        
        // 현재 처리 중인 파일 정보 표시
        const currentFileInfo = document.createElement('div');
        currentFileInfo.id = 'current-file-info';
        loadingOverlay.appendChild(currentFileInfo);
        
        // 로딩 오버레이를 body에 추가
        document.body.appendChild(loadingOverlay);
    }
    
    /**
     * 로딩 UI를 숨깁니다.
     */
    function hideLoadingUI() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
    
    /**
     * 진행 상태 바를 업데이트합니다.
     * @param {number} percent - 진행 상태 퍼센트 (0-100)
     * @param {string} currentFile - 현재 처리 중인 파일 이름
     * @param {number} currentIndex - 현재 처리 중인 파일 인덱스
     * @param {number} totalFiles - 총 파일 수
     */
    function updateProgressBar(percent, currentFile, currentIndex, totalFiles) {
        const progressBar = document.getElementById('conversion-progress');
        const progressText = document.getElementById('progress-text');
        const currentFileInfo = document.getElementById('current-file-info');
        
        if (progressBar && progressText) {
            progressBar.style.width = percent + '%';
            progressText.textContent = percent + '%';
            
            if (currentFileInfo && currentFile) {
                currentFileInfo.textContent = `파일 ${currentIndex}/${totalFiles}: ${currentFile}`;
            }
        }
    }
    
    function showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `alert alert-${type}`;
        messageElement.role = 'alert';
        messageElement.textContent = message;
        
        // 기존 메시지 제거
        const existingMessages = document.querySelectorAll('.alert');
        existingMessages.forEach(element => element.remove());
        
        // 결과 영역에 메시지 추가
        resultArea.innerHTML = '';
        resultArea.appendChild(messageElement);
        
        // 자동으로 메시지 제거 (5초 후)
        if (type !== 'error') {
            setTimeout(() => {
                messageElement.remove();
            }, 5000);
        }
        
        // 스크롤
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }
    
    function showResults(results) {
        resultArea.innerHTML = '';
        
        if (results.length === 0) {
            showMessage(currentLang === 'ko' ? '변환된 파일이 없습니다.' : 'No files converted.', 'warning');
            return;
        }
        
        const successResults = results.filter(result => result.success);
        const errorResults = results.filter(result => !result.success);
        
        // 성공 결과 표시
        if (successResults.length > 0) {
            const successHeader = document.createElement('h3');
            successHeader.textContent = currentLang === 'ko' ? '변환 완료' : 'Conversion Complete';
            resultArea.appendChild(successHeader);
            
            const resultTable = document.createElement('table');
            resultTable.className = 'result-table';
            
            // 테이블 헤더
            const tableHeader = document.createElement('thead');
            tableHeader.innerHTML = `
                <tr>
                    <th style="width: 300px; text-align: center;" data-en="Original File" data-ko="원본 파일">Original File</th>
                    <th style="width: 300px; text-align: center;" data-en="Converted File" data-ko="변환 파일">Converted File</th>
                    <th style="width: 100px; text-align: center;" data-en="Format" data-ko="형식">Format</th>
                    <th style="width: 150px; text-align: center;" data-en="Original Size" data-ko="원본 크기">Original Size</th>
                    <th style="width: 150px; text-align: center;" data-en="Converted Size" data-ko="변환 크기">Converted Size</th>
                    <th style="width: 100px; text-align: center;" data-en="Download" data-ko="다운로드">Download</th>
                </tr>
            `;
            resultTable.appendChild(tableHeader);
            
            // 테이블 본문
            const tableBody = document.createElement('tbody');
            
            successResults.forEach(result => {
                const row = document.createElement('tr');
                
                // 파일명이 긴 경우 말줄임표로 표시 (35자로 증가)
                const originalName = result.original_name.length > 35 ? result.original_name.substring(0, 32) + '...' : result.original_name;
                const convertedName = result.converted_name.length > 35 ? result.converted_name.substring(0, 32) + '...' : result.converted_name;
                
                row.innerHTML = `
                    <td title="${result.original_name}" style="text-align: center;">${originalName}</td>
                    <td title="${result.converted_name}" style="text-align: center;">${convertedName}</td>
                    <td style="text-align: center;">${result.format}</td>
                    <td style="text-align: center;">${result.original_size}</td>
                    <td style="text-align: center;">${result.converted_size}</td>
                    <td style="text-align: center;">
                        <a href="${result.download_url}" class="download-btn" download>
                            <i class="fas fa-download"></i>
                        </a>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            resultTable.appendChild(tableBody);
            resultArea.appendChild(resultTable);
            
            // 모두 다운로드 버튼
            if (successResults.length > 1) {
                const downloadAllBtn = document.createElement('button');
                downloadAllBtn.className = 'btn download-all-btn';
                downloadAllBtn.innerHTML = `<i class="fas fa-download"></i> ${currentLang === 'ko' ? '모든 파일 다운로드' : 'Download All Files'}`;
                downloadAllBtn.addEventListener('click', function() {
                    // 각 파일 순차적으로 다운로드
                    successResults.forEach((result, index) => {
                        setTimeout(() => {
                            const link = document.createElement('a');
                            link.href = result.download_url;
                            link.download = result.converted_name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }, index * 500); // 500ms 간격으로 다운로드
                    });
                });
                
                resultArea.appendChild(downloadAllBtn);
            }
        }
        
        // 오류 결과 표시
        if (errorResults.length > 0) {
            const errorHeader = document.createElement('h3');
            errorHeader.textContent = currentLang === 'ko' ? '변환 실패' : 'Conversion Failed';
            errorHeader.className = 'text-danger';
            resultArea.appendChild(errorHeader);
            
            const errorList = document.createElement('ul');
            errorList.className = 'error-list';
            
            errorResults.forEach(result => {
                const errorItem = document.createElement('li');
                errorItem.innerHTML = `<strong>${result.original_name}</strong>: ${result.error}`;
                errorList.appendChild(errorItem);
            });
            
            resultArea.appendChild(errorList);
        }
        
        // 다국어 요소 업데이트
        if (typeof currentLang !== 'undefined') {
            const elements = resultArea.querySelectorAll('[data-en], [data-ko]');
            elements.forEach(function(element) {
                if (element.hasAttribute('data-' + currentLang)) {
                    element.textContent = element.getAttribute('data-' + currentLang);
                }
            });
        }
        
        // 스크롤
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * 선택된 파일들을 변환합니다.
     * @param {FileList} files - 변환할 파일 목록
     * @param {Object} options - 변환 옵션
     * @returns {Promise<Array>} 변환 결과 목록
     */
    async function convertImages(files, options) {
        showLoadingUI();

        try {
        const results = [];
            const totalFiles = files.length;
            
            // 각 파일별 초기 진행률 설정
            updateProgressBar(0, '', 0, totalFiles);
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const currentFileNumber = i + 1;
                
                try {
                    // 진행 상황 업데이트
                    const progressPercent = ((i / totalFiles) * 100).toFixed(0);
                    updateProgressBar(progressPercent, file.name, currentFileNumber, totalFiles);
                    
                    // 사용자에게 현재 진행 상황에 대한 피드백을 제공하기 위해 잠시 대기
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                const result = await uploadAndConvert(file, options);
                results.push(result);
                    
                    // 각 파일 완료 후 진행 상황 업데이트
                    const fileCompletedPercent = ((currentFileNumber / totalFiles) * 100).toFixed(0);
                    updateProgressBar(fileCompletedPercent, file.name, currentFileNumber, totalFiles);
            } catch (error) {
                results.push({
                    success: false,
                        original_filename: file.name,
                    error: error.message || '변환 중 오류가 발생했습니다.'
                });
                    
                    console.error(`파일 변환 오류 (${file.name}):`, error);
                    
                    // 오류가 발생해도 진행 상황 업데이트
                    const currentPercent = ((currentFileNumber / totalFiles) * 100).toFixed(0);
                    updateProgressBar(currentPercent, file.name, currentFileNumber, totalFiles);
                }
            }
            
            // 모든 파일 변환 완료
            updateProgressBar(100, '변환 완료', totalFiles, totalFiles);
            
            // 사용자에게 완료 상태에 대한 피드백을 제공하기 위해 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 500));
        
        return results;
        } catch (error) {
            console.error('이미지 변환 오류:', error);
            return [{
                success: false,
                error: error.message || '변환 프로세스 중 오류가 발생했습니다.'
            }];
        } finally {
            hideLoadingUI();
        }
    }
    
    async function uploadAndConvert(file, options) {
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
        
        // 파일 유효성 다시 확인
        if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heif') && !file.name.toLowerCase().endsWith('.heic') && !file.name.toLowerCase().endsWith('.avif')) {
            console.error('이미지 파일이 아님:', file.name, file.type);
            return {
                success: false,
                original_name: file.name,
                error: `이미지 파일이 아닙니다: ${file.name} (${file.type || '알 수 없는 타입'})`
            };
        }
        
        // 크기 제한 로직 제거 - 용량 제한 없음
        // console.log(`파일 크기: ${(file.size / (1024 * 1024)).toFixed(2)}MB, 형식: ${options.format}`);
        
        try {
            console.log(`${file.name} 변환 시작 (크기: ${formatFileSize(file.size)}, 타입: ${file.type})`);
            
            const response = await fetch(`${API_BASE_URL}/api/convert-image`, {
                method: 'POST',
                body: formData
            });
            
            // 응답 로깅 (너무 길지 않게)
            const responseText = await response.text();
            const truncatedResponse = responseText.length > 300 
                ? responseText.substring(0, 150) + '...' + responseText.substring(responseText.length - 150) 
                : responseText;
            console.log('API 응답 텍스트:', truncatedResponse);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('파싱된 데이터:', data);
            } catch (parseError) {
                console.error('JSON 파싱 오류:', parseError, `응답 시작: ${responseText.substring(0, 50)}`);
                
                // HTML 응답인지 확인
                if (responseText.trim().startsWith('<')) {
                    console.error('HTML 응답을 받음 - 서버 오류 발생 가능성');
                    
                    // 오류 메시지 구성
                    let errorMsg = `서버에서 오류가 발생했습니다 (${file.name})`;
                    
                    // 응답에서 구체적인 오류 메시지를 찾으려고 시도
                    const titleMatch = /<title>(.*?)<\/title>/i.exec(responseText);
                    if (titleMatch && titleMatch[1]) {
                        errorMsg += `: ${titleMatch[1]}`;
                    }
                    
                    // 로그 추가 정보
                    console.error(`파일 정보 - 이름: ${file.name}, 크기: ${formatFileSize(file.size)}, 타입: ${file.type}`);
                    console.error(`응답 미리보기: ${responseText.substring(0, 200)}...`);
                    
                    throw new Error(errorMsg);
                } else {
                    throw new Error(`서버 응답을 처리할 수 없습니다: ${responseText.substring(0, 100)}...`);
                }
            }
            
            if (!response.ok) {
                throw new Error(data.error || `서버 오류: ${response.status} ${response.statusText}`);
            }
            
            if (data.error) {
                return {
                    success: false,
                    original_name: file.name,
                    error: data.error
                };
            }
            
            return {
                success: true,
                original_name: data.original_name,
                converted_name: data.converted_name,
                format: data.format,
                original_size: data.original_size,
                converted_size: data.converted_size,
                download_url: data.download_url
            };
        } catch (error) {
            console.error('변환 오류:', error);
            return {
                success: false,
                original_name: file.name,
                error: error.message || '네트워크 오류가 발생했습니다.'
            };
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function setupFileUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const fileList = document.getElementById('file-list');
        const selectFileBtn = document.getElementById('select-file-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const previewContainer = document.getElementById('preview-container');
        
        if (uploadArea && fileInput && selectFileBtn) {
            // 파일 선택 버튼 클릭 이벤트
            selectFileBtn.addEventListener('click', function() {
                fileInput.click();
            });
            
            // 취소 버튼 클릭 이벤트
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    resetUploadArea();
                });
            }
            
            // 드래그 앤 드롭 이벤트
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, preventDefaults, false);
                document.body.addEventListener(eventName, preventDefaults, false);
            });
            
            // 하이라이트 효과
            ['dragenter', 'dragover'].forEach(eventName => {
                uploadArea.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, unhighlight, false);
            });
            
            // 파일 드롭 처리
            uploadArea.addEventListener('drop', handleDrop, false);
            
            // 파일 선택 처리
            fileInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                handleFiles(this.files);
                }
            });
        }
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        function highlight() {
            uploadArea.classList.add('highlight');
        }
        
        function unhighlight() {
            uploadArea.classList.remove('highlight');
        }
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            handleFiles(files);
        }
        
        // 파일 업로드 영역 문구 변경
        function handleFiles(files) {
            if (files.length === 0) {
                resetUploadArea();
                return;
            }
            
            // 최대 5개 파일만 허용
            if (files.length > 5) {
                showMessage('최대 5개 파일까지만 선택 가능합니다.', 'warning');
                // FileList는 수정 불가능하므로 처음 5개 파일만 선택
                const limitedFiles = Array.from(files).slice(0, 5);
                // 새로운 FileList와 유사한 객체를 생성하기 위해 DataTransfer 사용
                const dataTransfer = new DataTransfer();
                limitedFiles.forEach(file => dataTransfer.items.add(file));
                fileInput.files = dataTransfer.files;
                files = fileInput.files; // 제한된 파일 목록으로 업데이트
            }
            
            // 파일 목록 숨기기
            if (fileList) {
                fileList.style.display = 'none';
            }
            
            // 업로드 영역 초기화 및 미리보기 컨테이너 생성
            const h3 = uploadArea.querySelector('h3');
            const p = uploadArea.querySelector('p');
            
            // 파일이 있는 상태로 클래스 추가
            uploadArea.classList.add('has-files');
            
            // 제목과 설명 텍스트 숨기기
            if (h3) h3.style.display = 'none';
            if (p) p.style.display = 'none';
            
            // 기존 미리보기 컨테이너가 있으면 내용 초기화
            if (previewContainer) {
                previewContainer.innerHTML = '';
                previewContainer.style.display = 'flex';
                
                // 미리보기 생성
                createPreviews(files);
            }
            
            // 취소 버튼 표시
            if (cancelBtn) {
                cancelBtn.style.display = 'inline-block';
            }
        }
        
        // 미리보기 생성 함수
        function createPreviews(files) {
            Array.from(files).forEach((file, index) => {
                // 이미지 파일 확인
                if (file.type.startsWith('image/')) {
                    // 미리보기 아이템 컨테이너
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.style.display = 'inline-block';
                    
                    // 이미지 요소 생성
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(file);
                    img.className = 'preview-image';
                    img.style.maxWidth = '300px'; // 최대 가로 300px로 제한
                    img.style.height = '300px'; // 정확히 300px 높이로 설정
                    img.style.borderRadius = '4px';
                    img.style.objectFit = 'contain';
                    img.style.border = 'none'; // 테두리 제거
                    img.style.outline = 'none'; // 외곽선 제거
                    img.setAttribute('data-no-markers', 'true'); // 마커 비활성화
                    
                    // 첫 번째 이미지만 원본 크기 정보 저장
                    if (index === 0) {
                        img.onload = function() {
                            // 원본 이미지 크기 저장
                            setOriginalDimensions(this.naturalWidth, this.naturalHeight);
                            
                            // 사용자 지정 크기 입력 필드에 원본 크기 표시
                            if (document.getElementById('width-input')) {
                                document.getElementById('width-input').value = this.naturalWidth;
                            }
                            
                            if (document.getElementById('height-input')) {
                                document.getElementById('height-input').value = this.naturalHeight;
                            }
                            
                            // 리소스 해제
                            URL.revokeObjectURL(this.src);
                        };
                    } else {
                        // 리소스 해제
                        img.onload = function() {
                            URL.revokeObjectURL(this.src);
                        };
                    }
                    
                    // 파일명 표시
                    const fileName = document.createElement('div');
                    fileName.className = 'file-name';
                    fileName.textContent = file.name.length > 35 ? file.name.substring(0, 32) + '...' : file.name;
                    fileName.style.fontSize = '12px';
                    fileName.style.marginTop = '3px';
                    fileName.title = file.name; // 전체 파일명은 툴팁으로 표시
                    
                    // 요소 추가
                    previewItem.appendChild(img);
                    previewItem.appendChild(fileName);
                    previewContainer.appendChild(previewItem);
                } else {
                    // 이미지가 아닌 경우 아이콘 표시
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.style.display = 'inline-block';
                    previewItem.style.margin = '0 10px';
                    previewItem.style.width = '120px';
                    
                    // 파일 아이콘
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-file';
                    icon.style.fontSize = '32px';
                    icon.style.color = '#666';
                    icon.style.display = 'block';
                    icon.style.marginBottom = '10px';
                    
                    // 파일명 표시
                    const fileName = document.createElement('div');
                fileName.className = 'file-name';
                    fileName.textContent = file.name.length > 35 ? file.name.substring(0, 32) + '...' : file.name;
                    fileName.style.fontSize = '12px';
                    fileName.style.marginTop = '3px';
                    fileName.title = file.name; // 전체 파일명은 툴팁으로 표시
                    
                    // 요소 추가
                    previewItem.appendChild(icon);
                    previewItem.appendChild(fileName);
                    previewContainer.appendChild(previewItem);
                }
            });
        }
        
        // 업로드 영역 초기화
        function resetUploadArea() {
            // 텍스트 표시 복원
            const h3 = uploadArea.querySelector('h3');
            const p = uploadArea.querySelector('p');
            
            // 업로드 영역 클래스 제거
            uploadArea.classList.remove('has-files');
            
            // 제목과 설명 텍스트 표시
            if (h3) h3.style.display = 'block';
            if (p) p.style.display = 'block';
            
            // 미리보기 컨테이너 초기화
            if (previewContainer) {
                previewContainer.innerHTML = '';
                previewContainer.style.display = 'none';
            }
            
            // 파일 입력 필드 초기화
            fileInput.value = '';
            
            // 파일 목록 초기화 (표시하지 않음)
            if (fileList) {
                fileList.style.display = 'none';
            }
            
            // 취소 버튼 숨기기
            if (cancelBtn) {
                cancelBtn.style.display = 'none';
            }
        }
    }
    
    // 포맷 옵션 표시 함수
    function showFormatOptions(format) {
        if (!format) return;
        
        // 특정 포맷 선택 시 경고 메시지 표시
        const formatOptions = document.getElementById('convert-form');
        if (!formatOptions) return;
        
        // 기존 경고 메시지 제거
        const existingWarning = document.getElementById('format-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        // 새 경고 메시지 추가 (필요한 경우)
        const warningContainer = document.createElement('div');
        warningContainer.id = 'format-warning';
        warningContainer.style.marginBottom = '15px';
        
        if (format.toLowerCase() === 'svg') {
            warningContainer.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <strong>Warning</strong>: 
                    Conversion to SVG format only supports converting SVG files to other formats. Regular images cannot be converted to SVG.
                </div>
            `;
            formatOptions.insertBefore(warningContainer, formatOptions.querySelector('button[type="submit"]'));
        } else if (format.toLowerCase() === 'heif' || format.toLowerCase() === 'heic') {
            warningContainer.innerHTML = `
                <div class="alert alert-info" role="alert">
                    <strong>Info</strong>: 
                    HEIF/HEIC format may not be supported in some browsers. Please download and check after conversion.
                </div>
            `;
            formatOptions.insertBefore(warningContainer, formatOptions.querySelector('button[type="submit"]'));
        } else if (format.toLowerCase() === 'avif') {
            warningContainer.innerHTML = `
                <div class="alert alert-info" role="alert">
                    <strong>Info</strong>: 
                    AVIF format may not be supported in some browsers. Please download and check after conversion.
                </div>
            `;
            formatOptions.insertBefore(warningContainer, formatOptions.querySelector('button[type="submit"]'));
        }
        
        // 품질 슬라이더 이벤트 설정
        const qualityInput = document.getElementById('quality-input');
        const qualityValue = document.getElementById('quality-value');
        
        if (qualityInput && qualityValue) {
            // 기존 이벤트 리스너 제거를 위해 복제 후 교체
            const newQualityInput = qualityInput.cloneNode(true);
            qualityInput.parentNode.replaceChild(newQualityInput, qualityInput);
            
            // 새 이벤트 리스너 추가
            newQualityInput.addEventListener('input', function() {
                qualityValue.textContent = this.value;
            });
        }
        
        // 리사이즈 타입 선택 이벤트 리스너 추가
        setupResizeEventHandlers();
    }
    
    // 리사이즈 옵션 표시 함수
    function showResizeOptions(type) {
        console.log(`리사이즈 옵션 표시: ${type}`);
        
        try {
            // 모든 옵션 그룹 숨기기
            document.querySelectorAll('.resize-option-group').forEach(el => {
                el.style.display = 'none';
            });
            
            // 선택된 옵션 그룹 표시
            const selectedOption = document.getElementById(type === 'original' ? 'original-size-options' : type + '-options');
            if (selectedOption) {
                selectedOption.style.display = 'block';
                console.log(`옵션 그룹 표시: ${type === 'original' ? 'original-size-options' : type + '-options'}`);
            } else {
                console.warn(`옵션 그룹을 찾을 수 없음: ${type === 'original' ? 'original-size-options' : type + '-options'}`);
            }
            
            // 리사이즈 타입 선택 요소 업데이트
            const resizeTypeSelect = document.getElementById('resize-type');
            if (resizeTypeSelect && resizeTypeSelect.value !== type) {
                console.log(`리사이즈 타입 선택 요소 업데이트: ${type}`);
                resizeTypeSelect.value = type;
            }
            
            // 선택된 유형에 따라 이전 입력값 관리
            if (type === 'original') {
                // 원본 크기 유지를 위해 입력값 초기화
                const widthInput = document.getElementById('width-input');
                const heightInput = document.getElementById('height-input');
                if (widthInput) widthInput.value = '';
                if (heightInput) heightInput.value = '';
            } else if (type === 'percentage') {
                // 퍼센트 옵션 선택 시 원본 크기 정보 표시
                updatePercentageSizeInfo();
            } else if (type === 'free') {
                // 자유 조정 모드일 때 비율 고정 체크박스 설정
                setupKeepRatioCheckbox();
                
                // 원본 크기가 있는 경우 기본값 설정
                const widthInput = document.getElementById('width-input');
                const heightInput = document.getElementById('height-input');
                
                if (originalWidth > 0 && originalHeight > 0) {
                    console.log(`자유 조정 모드 - 원본 크기: ${originalWidth}x${originalHeight}`);
                    if (widthInput && (!widthInput.value || widthInput.value === '0')) {
                        widthInput.value = originalWidth;
                    }
                    if (heightInput && (!heightInput.value || heightInput.value === '0')) {
                        heightInput.value = originalHeight;
                    }
                }
            }
        } catch (error) {
            console.error('리사이즈 옵션 표시 중 오류 발생:', error);
        }
    }
    
    // 퍼센트 크기 정보 업데이트 함수
    function updatePercentageSizeInfo() {
        // 원본 크기 정보 표시
        const originalWidthSpan = document.getElementById('percentage-original-width');
        const originalHeightSpan = document.getElementById('percentage-original-height');
        const resizedWidthSpan = document.getElementById('percentage-resized-width');
        const resizedHeightSpan = document.getElementById('percentage-resized-height');
        const percentageInput = document.getElementById('percentage-input');
        
        if (originalWidthSpan && originalHeightSpan && resizedWidthSpan && resizedHeightSpan && percentageInput) {
            // 원본 크기 표시
            originalWidthSpan.textContent = originalWidth || 0;
            originalHeightSpan.textContent = originalHeight || 0;
            
            // 변환 후 크기 계산 및 표시
            const percentage = parseInt(percentageInput.value, 10) || 100;
            const resizedWidth = Math.round((originalWidth * percentage) / 100);
            const resizedHeight = Math.round((originalHeight * percentage) / 100);
            
            resizedWidthSpan.textContent = resizedWidth || 0;
            resizedHeightSpan.textContent = resizedHeight || 0;
            
            // 퍼센트 변경 시 크기 정보 업데이트 이벤트 추가
            percentageInput.addEventListener('input', function() {
                const newPercentage = parseInt(this.value, 10) || 100;
                const newResizedWidth = Math.round((originalWidth * newPercentage) / 100);
                const newResizedHeight = Math.round((originalHeight * newPercentage) / 100);
                
                resizedWidthSpan.textContent = newResizedWidth || 0;
                resizedHeightSpan.textContent = newResizedHeight || 0;
            });
        }
    }
    
    // 비율 고정 체크박스 설정 함수
    function setupKeepRatioCheckbox() {
        const keepRatioCheckbox = document.getElementById('keep-ratio-checkbox');
        const widthInput = document.getElementById('width-input');
        const heightInput = document.getElementById('height-input');
        
        if (keepRatioCheckbox && widthInput && heightInput) {
            // 기존 이벤트 리스너 제거를 위해 복제 후 교체
            const newKeepRatioCheckbox = keepRatioCheckbox.cloneNode(true);
            keepRatioCheckbox.parentNode.replaceChild(newKeepRatioCheckbox, keepRatioCheckbox);
            
            // 너비 입력 필드 이벤트 핸들러
            const newWidthInput = widthInput.cloneNode(true);
            widthInput.parentNode.replaceChild(newWidthInput, widthInput);
            
            // 높이 입력 필드 이벤트 핸들러
            const newHeightInput = heightInput.cloneNode(true);
            heightInput.parentNode.replaceChild(newHeightInput, heightInput);
            
            // 체크박스 이벤트 리스너 추가
            newKeepRatioCheckbox.addEventListener('change', function() {
                if (this.checked && originalWidth > 0 && originalHeight > 0) {
                    // 비율 고정이 체크되면 현재 너비 기준으로 높이 계산
                    if (newWidthInput.value && parseFloat(newWidthInput.value) > 0) {
                        const width = parseFloat(newWidthInput.value);
                        const aspectRatio = originalWidth / originalHeight;
                        const newHeight = Math.round(width / aspectRatio);
                        newHeightInput.value = newHeight;
                    }
                }
            });
            
            // 너비 입력 이벤트 리스너 추가
            newWidthInput.addEventListener('input', function() {
                if (newKeepRatioCheckbox.checked && originalWidth > 0 && originalHeight > 0) {
                    const width = parseFloat(this.value) || 0;
                    if (width > 0) {
                        const aspectRatio = originalWidth / originalHeight;
                        const newHeight = Math.round(width / aspectRatio);
                        newHeightInput.value = newHeight;
                    }
                }
            });
            
            // 높이 입력 이벤트 리스너 추가
            newHeightInput.addEventListener('input', function() {
                if (newKeepRatioCheckbox.checked && originalWidth > 0 && originalHeight > 0) {
                    const height = parseFloat(this.value) || 0;
                    if (height > 0) {
                        const aspectRatio = originalWidth / originalHeight;
                        const newWidth = Math.round(height * aspectRatio);
                        newWidthInput.value = newWidth;
                    }
                }
            });
        }
    }
    
    // 리사이즈 이벤트 핸들러 설정
    function setupResizeEventHandlers() {
        console.log('리사이즈 이벤트 핸들러 설정');
        
        try {
            // 리사이즈 타입 선택 이벤트 핸들러
            const resizeType = document.getElementById('resize-type');
            if (resizeType) {
                // 기존 이벤트 리스너 제거를 위해 복제 후 교체
                const newResizeType = resizeType.cloneNode(true);
                resizeType.parentNode.replaceChild(newResizeType, resizeType);
                
                // 새 이벤트 리스너 추가
                newResizeType.addEventListener('change', function() {
                    console.log('리사이즈 타입 변경:', this.value);
                    // 선택된 옵션 표시
                    showResizeOptions(this.value);
                });
                
                // 현재 선택된 값으로 옵션 표시 (초기화)
                console.log('현재 선택된 리사이즈 타입:', newResizeType.value);
                showResizeOptions(newResizeType.value || 'original');
            }
            
            // 퍼센트 입력 필드 이벤트 핸들러
            const percentageInput = document.getElementById('percentage-input');
            if (percentageInput) {
                // 기존 이벤트 리스너 제거를 위해 복제 후 교체
                const newPercentageInput = percentageInput.cloneNode(true);
                percentageInput.parentNode.replaceChild(newPercentageInput, percentageInput);
                
                // 새 이벤트 리스너 추가
                newPercentageInput.addEventListener('input', function() {
                    console.log('퍼센트 입력값 변경:', this.value);
                    updatePercentageSizeInfo();
                });
            }
            
            // 비율 버튼 이벤트 핸들러 설정 추가
            const ratioButtons = document.querySelectorAll('.ratio-btn');
            if (ratioButtons.length > 0 && percentageInput) {
                console.log('비율 버튼 이벤트 핸들러 설정:', ratioButtons.length, '개 버튼 발견');
                
                // 기존 이벤트 리스너 제거를 위해 각 버튼을 복제 후 교체
                ratioButtons.forEach(button => {
                    const newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);
                    
                    // 새 이벤트 리스너 추가
                    newButton.addEventListener('click', function() {
                        console.log('비율 버튼 클릭:', this.getAttribute('data-ratio'));
                        const ratio = this.getAttribute('data-ratio');
                        document.getElementById('percentage-input').value = ratio;
                        
                        // 리사이즈된 크기 업데이트
                        updateResizedSize();
                        
                        // 변경 이벤트 발생시켜 미리보기 업데이트
                        const event = new Event('change');
                        document.getElementById('percentage-input').dispatchEvent(event);
                        
                        // 퍼센트 크기 정보 업데이트
                        updatePercentageSizeInfo();
                        
                        // 버튼 스타일 업데이트
                        document.querySelectorAll('.ratio-btn').forEach(btn => {
                            btn.classList.remove('active');
                            btn.classList.remove('btn-primary');
                            btn.classList.add('btn-outline-secondary');
                        });
                        this.classList.add('active');
                        this.classList.add('btn-primary');
                        this.classList.remove('btn-outline-secondary');
                    });
                });
            }
            
            // 자유 조정 모드일 때 비율 고정 체크박스 설정
            if (document.getElementById('resize-type')?.value === 'free') {
                setupKeepRatioCheckbox();
            }
        } catch (error) {
            console.error('리사이즈 이벤트 핸들러 설정 중 오류 발생:', error);
        }
    }
    
    // 이미지 비율 설정 함수
    let originalWidth = 0;
    let originalHeight = 0;
    let aspectRatio = 1.0;
    
    // 이미지 비율 설정 함수
    function setOriginalDimensions(width, height) {
        console.log(`원본 이미지 크기 설정: ${width}x${height}`);
        originalWidth = width;
        originalHeight = height;
        aspectRatio = width / height;
        
        // 현재 선택된 리사이즈 타입 확인
        const resizeType = document.getElementById('resize-type')?.value;
        
        // 퍼센트 옵션이 선택되어 있으면 크기 정보 업데이트
        if (resizeType === 'percentage') {
            updatePercentageSizeInfo();
        }
        
        // 자유 조정 모드에서 비율 고정이 체크되어 있으면 비율 계산 적용
        if (resizeType === 'free') {
            const keepRatioCheckbox = document.getElementById('keep-ratio-checkbox');
            const widthInput = document.getElementById('width-input');
            const heightInput = document.getElementById('height-input');
            
            // 입력값이 없는 경우 원본 크기 설정
            if (widthInput && (!widthInput.value || widthInput.value === '0')) {
                widthInput.value = width;
            }
            if (heightInput && (!heightInput.value || heightInput.value === '0')) {
                heightInput.value = height;
            }
            
            // 비율 고정이 체크되어 있으면 비율 계산 적용
            if (keepRatioCheckbox && keepRatioCheckbox.checked) {
                if (widthInput && widthInput.value && parseFloat(widthInput.value) > 0) {
                    const width = parseFloat(widthInput.value);
                    const newHeight = Math.round(width / aspectRatio);
                    heightInput.value = newHeight;
                }
            }
        }
    }
    
    // 제약 조건 업데이트
    function updateConstraints(constraintType) {
        console.log(`제약 조건 업데이트: ${constraintType}`);
        
        const widthInput = document.getElementById('width-input');
        const heightInput = document.getElementById('height-input');
        
        if (!widthInput || !heightInput) return;
        
        // 제약 조건에 따라 입력 필드 활성화
        widthInput.readOnly = false;
        heightInput.readOnly = false;
    }
    
    // 스크롤 탑 버튼
    const scrollTopButton = document.getElementById('scroll-top');
    if (scrollTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollTopButton.style.display = 'block';
            } else {
                scrollTopButton.style.display = 'none';
            }
        });
        
        scrollTopButton.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 리사이즈된 크기 업데이트 함수
    function updateResizedSize() {
        const percentageInput = document.getElementById('percentage-input');
        const originalWidthEl = document.getElementById('percentage-original-width');
        const originalHeightEl = document.getElementById('percentage-original-height');
        const resizedWidthEl = document.getElementById('percentage-resized-width');
        const resizedHeightEl = document.getElementById('percentage-resized-height');
        
        if (percentageInput && originalWidthEl && originalHeightEl && resizedWidthEl && resizedHeightEl) {
            const percentage = parseFloat(percentageInput.value) || 100;
            const originalWidth = parseInt(originalWidthEl.textContent) || 0;
            const originalHeight = parseInt(originalHeightEl.textContent) || 0;
            
            // 리사이즈된 크기 계산 및 표시
            const resizedWidth = Math.round(originalWidth * percentage / 100);
            const resizedHeight = Math.round(originalHeight * percentage / 100);
            
            resizedWidthEl.textContent = resizedWidth;
            resizedHeightEl.textContent = resizedHeight;
        }
    }
}); 
