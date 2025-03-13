// WebAssembly 기반 이미지 변환기 코드
document.addEventListener('DOMContentLoaded', function() {
    // 필요한 요소 선택
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const convertForm = document.getElementById('convert-form');
    const resultArea = document.getElementById('result-area');
    const formatSelect = document.getElementById('format-select');
    const formatOptions = document.getElementById('format-options');

    // 지원하는 이미지 포맷
    const supportedInputFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'];
    const supportedOutputFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    // 이미지 변환 설정
    const defaultOptions = {
        maxSizeMB: 2,                // 최대 파일 크기 증가
        maxWidthOrHeight: 4096,      // 최대 해상도 증가
        useWebWorker: true,          // WebWorker 사용으로 성능 향상
        preserveExif: true,          // EXIF 데이터 보존
        initialQuality: 0.9          // 초기 품질 설정
    };

    // 포맷별 최적 설정
    const formatConfigs = {
        jpg: {
            mimeType: 'image/jpeg',
            defaultQuality: 0.9,
            acceptsQuality: true
        },
        jpeg: {
            mimeType: 'image/jpeg',
            defaultQuality: 0.9,
            acceptsQuality: true
        },
        png: {
            mimeType: 'image/png',
            defaultQuality: 1,
            acceptsQuality: false
        },
        webp: {
            mimeType: 'image/webp',
            defaultQuality: 0.9,
            acceptsQuality: true
        },
        gif: {
            mimeType: 'image/gif',
            defaultQuality: 1,
            acceptsQuality: false
        }
    };

    // 파일 업로드 관련 이벤트 리스너 설정
    setupFileUpload();

    // 포맷 선택 이벤트 리스너
    if (formatSelect && formatOptions) {
        formatSelect.addEventListener('change', function() {
            const format = this.value;
            let optionsHTML = '';
            
            // 기본 옵션 (리사이즈)
            optionsHTML += `
                <div class="form-group">
                    <label>이미지 크기 조정</label>
                    <select id="resize-type" class="form-control mb-2">
                        <option value="original" selected>원본 크기</option>
                        <option value="percentage">비율로 조정</option>
                        <option value="pixel">픽셀로 조정</option>
                        <option value="preset">프리셋 크기</option>
                    </select>
                    
                    <!-- 비율 조정 옵션 -->
                    <div id="percentage-options" class="resize-option-group" style="display: none;">
                        <div class="input-group">
                            <input type="number" id="percentage-input" class="form-control" value="100" min="1" max="200">
                            <span class="input-group-text">%</span>
                        </div>
                        <div class="quick-ratio-buttons">
                            <button type="button" class="ratio-btn btn" data-ratio="0.1">1/10</button>
                            <button type="button" class="ratio-btn btn" data-ratio="0.33">1/3</button>
                            <button type="button" class="ratio-btn btn" data-ratio="0.5">1/2</button>
                            <button type="button" class="ratio-btn btn" data-ratio="0.75">3/4</button>
                            <button type="button" class="ratio-btn btn" data-ratio="1">원본</button>
                        </div>
                    </div>
                    
                    <!-- 픽셀 조정 옵션 -->
                    <div id="pixel-options" class="resize-option-group" style="display: none;">
                        <div class="input-group">
                            <input type="number" id="width-input" class="form-control" placeholder="너비">
                            <span class="input-group-text">×</span>
                            <input type="number" id="height-input" class="form-control" placeholder="높이">
                            <span class="input-group-text">px</span>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" id="maintain-aspect-ratio" class="form-check-input" checked>
                            <label class="form-check-label" for="maintain-aspect-ratio">비율 유지</label>
                        </div>
                    </div>
                    
                    <!-- 프리셋 크기 옵션 -->
                    <div id="preset-options" class="resize-option-group" style="display: none;">
                        <select id="preset-size" class="form-control">
                            <option value="custom">사용자 정의</option>
                            <option value="hd">HD (1280×720)</option>
                            <option value="fhd">Full HD (1920×1080)</option>
                            <option value="2k">2K (2048×1080)</option>
                            <option value="4k">4K (3840×2160)</option>
                            <option value="8k">8K (7680×4320)</option>
                        </select>
                    </div>
                </div>
            `;
            
            // 포맷별 고유 옵션
            if (['jpg', 'jpeg', 'webp'].includes(format)) {
                optionsHTML += `
                    <div class="form-group">
                        <label for="quality-input">이미지 품질</label>
                        <div class="quality-slider">
                            <input type="range" id="quality-input" class="form-control-range" min="1" max="100" value="90">
                            <span id="quality-value">90</span>
                        </div>
                    </div>
                `;
            }
            
            // PNG 최적화 옵션
            if (format === 'png') {
                optionsHTML += `
                    <div class="form-group">
                        <label for="compression-level">압축 레벨</label>
                        <select id="compression-level" class="form-control">
                            <option value="0">무압축</option>
                            <option value="3">낮음</option>
                            <option value="6" selected>중간</option>
                            <option value="9">높음</option>
                        </select>
                    </div>
                `;
            }
            
            // WebP 고급 옵션
            if (format === 'webp') {
                optionsHTML += `
                    <div class="form-group">
                        <div class="form-check">
                            <input type="checkbox" id="lossless-webp" class="form-check-input">
                            <label class="form-check-label" for="lossless-webp">무손실 압축</label>
                        </div>
                    </div>
                `;
            }
            
            formatOptions.innerHTML = optionsHTML;
            
            // 리사이즈 타입 이벤트 리스너 설정
            const resizeType = document.getElementById('resize-type');
            if (resizeType) {
                resizeType.addEventListener('change', function() {
                    document.querySelectorAll('.resize-option-group').forEach(el => {
                        el.style.display = 'none';
                    });
                    
                    const selectedOption = document.getElementById(this.value + '-options');
                    if (selectedOption) {
                        selectedOption.style.display = 'block';
                    }
                });
            }
            
            // 품질 슬라이더 이벤트 설정
            const qualityInput = document.getElementById('quality-input');
            const qualityValue = document.getElementById('quality-value');
            if (qualityInput && qualityValue) {
                qualityInput.addEventListener('input', function() {
                    qualityValue.textContent = this.value;
                });
            }
            
            // 비율 버튼 이벤트 설정
            const ratioButtons = document.querySelectorAll('.ratio-btn');
            ratioButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const ratio = parseFloat(this.dataset.ratio);
                    const percentageInput = document.getElementById('percentage-input');
                    if (percentageInput) {
                        percentageInput.value = Math.round(ratio * 100);
                    }
                    
                    // 활성 버튼 표시
                    ratioButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                });
            });
            
            // 비율 유지 체크박스 이벤트 설정
            const maintainAspectRatio = document.getElementById('maintain-aspect-ratio');
            const widthInput = document.getElementById('width-input');
            const heightInput = document.getElementById('height-input');
            
            if (maintainAspectRatio && widthInput && heightInput) {
                let aspectRatio = 1;
                
                widthInput.addEventListener('change', function() {
                    if (maintainAspectRatio.checked && this.value) {
                        heightInput.value = Math.round(this.value / aspectRatio);
                    }
                });
                
                heightInput.addEventListener('change', function() {
                    if (maintainAspectRatio.checked && this.value) {
                        widthInput.value = Math.round(this.value * aspectRatio);
                    }
                });
                
                maintainAspectRatio.addEventListener('change', function() {
                    if (this.checked && widthInput.value && heightInput.value) {
                        aspectRatio = widthInput.value / heightInput.value;
                    }
                });
            }
            
            // 프리셋 크기 이벤트 설정
            const presetSize = document.getElementById('preset-size');
            if (presetSize) {
                presetSize.addEventListener('change', function() {
                    const widthInput = document.getElementById('width-input');
                    const heightInput = document.getElementById('height-input');
                    
                    if (!widthInput || !heightInput) return;
                    
                    const presets = {
                        'hd': [1280, 720],
                        'fhd': [1920, 1080],
                        '2k': [2048, 1080],
                        '4k': [3840, 2160],
                        '8k': [7680, 4320]
                    };
                    
                    const preset = presets[this.value];
                    if (preset) {
                        widthInput.value = preset[0];
                        heightInput.value = preset[1];
                    }
                });
            }
        });
        
        // 초기 옵션 표시
        if (formatSelect.value) {
            formatSelect.dispatchEvent(new Event('change'));
        }
    }

    // 변환 폼 제출 이벤트
    if (convertForm) {
        convertForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 필수 값 확인
            if (fileInput.files.length === 0) {
                showMessage('변환할 파일을 선택해주세요.', 'error');
                return;
            }
            
            if (formatSelect.value === '') {
                showMessage('변환할 포맷을 선택해주세요.', 'error');
                return;
            }
            
            // 포맷 유효성 검사
            const format = formatSelect.value.toLowerCase();
            
            // 파일 확장자 확인
            const filesArray = Array.from(fileInput.files);
            
            // 파일 형식 유효성 검사
            for (const file of filesArray) {
                const fileExt = getFileExtension(file.name);
                if (!fileExt || !supportedInputFormats.includes(fileExt.toLowerCase())) {
                    showMessage(`지원되지 않는 파일입니다: ${file.name}. 지원되는 형식의 이미지 파일을 선택해주세요.`, 'error');
                    return;
                }
            }
            
            // 변환 옵션 수집
            const options = getConversionOptions();
            
            // 로딩 UI 표시
            showLoadingUI();
            
            try {
                // 병렬로 이미지 변환 처리 (청크 단위로 처리)
                const chunkSize = 5;
                const results = [];
                
                for (let i = 0; i < filesArray.length; i += chunkSize) {
                    const chunk = filesArray.slice(i, i + chunkSize);
                    const chunkPromises = chunk.map(file => convertImage(file, options));
                    const chunkResults = await Promise.all(chunkPromises);
                    results.push(...chunkResults);
                    
                    // 진행률 업데이트
                    const progress = Math.min(((i + chunkSize) / filesArray.length) * 100, 100);
                    updateProgressBar(progress);
                }
                
                hideLoadingUI();
                showResults(results);
                
                // 이미지가 모두 로드된 후 URL 해제를 위해 타이머 설정
                setTimeout(() => {
                    results.forEach(result => {
                        if (result.dataUrl) {
                            URL.revokeObjectURL(result.dataUrl);
                        }
                    });
                }, 3000);
            } catch (error) {
                hideLoadingUI();
                console.error('변환 오류:', error);
                showMessage(error.message || '변환 중 오류가 발생했습니다.', 'error');
            }
        });
    }

    /**
     * 이미지를 변환합니다.
     * @param {File} file - 변환할 파일
     * @param {Object} options - 변환 옵션
     * @returns {Promise<Object>} 변환 결과
     */
    async function convertImage(file, options = {}) {
        try {
            const format = options.format || file.type.split('/')[1];
            if (!supportedOutputFormats.includes(format.toLowerCase())) {
                throw new Error('지원하지 않는 출력 포맷입니다.');
            }

            // 이미지를 Canvas로 로드
            const img = await createImageBitmap(file);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 리사이즈 옵션 적용
            let targetWidth = img.width;
            let targetHeight = img.height;

            if (options.scale) {
                targetWidth = Math.round(img.width * options.scale);
                targetHeight = Math.round(img.height * options.scale);
            } else if (options.width || options.height) {
                if (options.width && options.height) {
                    targetWidth = options.width;
                    targetHeight = options.height;
                } else if (options.width) {
                    const ratio = options.width / img.width;
                    targetWidth = options.width;
                    targetHeight = Math.round(img.height * ratio);
                } else {
                    const ratio = options.height / img.height;
                    targetHeight = options.height;
                    targetWidth = Math.round(img.width * ratio);
                }
            }

            // 캔버스 크기 설정 및 이미지 그리기
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // 이미지 품질 유지를 위한 설정
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // 이미지 그리기
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            // 포맷 설정 가져오기
            const formatConfig = formatConfigs[format.toLowerCase()];
            if (!formatConfig) {
                throw new Error('지원하지 않는 출력 포맷입니다.');
            }

            // 변환 옵션 설정
            const conversionOptions = {
                ...defaultOptions,
                maxSizeMB: options.maxSizeMB || defaultOptions.maxSizeMB,
                maxWidthOrHeight: Math.max(targetWidth, targetHeight),
                useWebWorker: true
            };

            // 품질 설정
            const quality = options.quality || formatConfig.defaultQuality;
            if (formatConfig.acceptsQuality) {
                conversionOptions.quality = quality;
            }

            // 이미지 압축 및 변환
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, formatConfig.mimeType, quality);
            });

            // browser-image-compression으로 추가 최적화
            const compressedFile = await imageCompression(
                new File([blob], file.name, { type: formatConfig.mimeType }),
                conversionOptions
            );

            // 결과 파일 생성
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
            const timestamp = new Date().getTime();
            const newFileName = `${originalNameWithoutExt}_${format}_${timestamp}.${format}`;

            const convertedFile = new File([compressedFile], newFileName, { type: formatConfig.mimeType });
            convertedFile.originalName = file.name;
            convertedFile.originalSize = file.size;
            convertedFile.format = format;

            // Data URL 생성
            const reader = new FileReader();
            const dataUrl = await new Promise((resolve) => {
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(convertedFile);
            });
            convertedFile.dataUrl = dataUrl;

            return convertedFile;
        } catch (error) {
            console.error('이미지 변환 오류:', error);
            throw error;
        }
    }
    
    /**
     * 변환 결과를 화면에 표시합니다.
     * @param {Array} results - 변환 결과 배열
     */
    function showResults(results) {
        if (!resultArea) return;
        
        if (results.length === 0) {
            resultArea.innerHTML = '<p>변환된 파일이 없습니다.</p>';
            return;
        }
        
        let html = '<div class="result-files">';
        
        // 일괄 다운로드 버튼 추가
        if (results.length > 1) {
            html += `
                <div class="bulk-download">
                    <button onclick="downloadAllImages()" class="btn btn-primary">
                        전체 다운로드 (${results.length}개 파일)
                    </button>
                </div>
            `;
        }
        
        for (const result of results) {
            const originalSizeFormatted = formatFileSize(result.originalSize || result.size);
            const convertedSizeFormatted = formatFileSize(result.size);
            const sizeReduction = result.originalSize ? (100 - (result.size / result.originalSize * 100)) : 0;
            const format = result.format || result.type.split('/')[1];
            
            html += `
                <div class="result-file">
                    <div class="result-preview">
                        <img src="${result.dataUrl}" alt="${result.name}">
                    </div>
                    <div class="result-info">
                        <h3>${result.name}</h3>
                        <p>원본: ${result.originalName || result.name} (${originalSizeFormatted})</p>
                        <p>변환: ${format.toUpperCase()} (${convertedSizeFormatted})</p>
                        <p>용량 감소: ${sizeReduction.toFixed(1)}%</p>
                        <div class="result-actions">
                            <button onclick="downloadImage('${result.dataUrl}', '${result.name}')" class="btn">다운로드</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        resultArea.innerHTML = html;

        // 전역 변수에 결과 저장
        window.convertedImages = results;
    }
    
    /**
     * 파일 업로드 영역 설정
     */
    function setupFileUpload() {
        if (!uploadArea || !fileInput || !fileList) return;
        
        // 파일 드래그 앤 드롭 이벤트 처리
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        uploadArea.addEventListener('drop', handleDrop, false);
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => handleFiles(fileInput.files));
        
        // 이벤트 기본 동작 방지
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // 드래그 영역 하이라이트
        function highlight() {
            uploadArea.classList.add('highlight');
        }
        
        // 드래그 영역 하이라이트 제거
        function unhighlight() {
            uploadArea.classList.remove('highlight');
        }
        
        // 파일 드롭 처리
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }
        
        // 파일 처리 및 미리보기 표시
        function handleFiles(files) {
            if (!files || files.length === 0) {
                fileList.innerHTML = '<p>선택된 파일이 없습니다.</p>';
                return;
            }
            
            fileList.innerHTML = '';
            uploadArea.classList.add('has-files');
            
            // 미리보기 컨테이너 추가
            if (!document.querySelector('.preview-container')) {
                const previewContainer = document.createElement('div');
                previewContainer.className = 'preview-container';
                uploadArea.appendChild(previewContainer);
            }
            
            const previewContainer = document.querySelector('.preview-container');
            previewContainer.innerHTML = '';
            
            // 파일 미리보기 처리
            for (const file of files) {
                // 파일 확장자 검사
                const fileExt = getFileExtension(file.name);
                if (!fileExt || !supportedInputFormats.includes(fileExt.toLowerCase())) {
                    showMessage(`지원되지 않는 파일 형식입니다: ${file.name}`, 'error');
                    continue;
                }
                
                // 파일 아이템 생성
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                
                // 파일 미리보기 생성
                const filePreview = document.createElement('div');
                filePreview.className = 'file-preview';
                
                // 이미지 파일인 경우 미리보기 표시
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                const previewImage = document.createElement('div');
                previewImage.className = 'preview-image';
                
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    const fileURL = URL.createObjectURL(file);
                    img.src = fileURL;
                    img.alt = file.name;
                    img.onload = () => {
                        setTimeout(() => {
                            URL.revokeObjectURL(fileURL);
                        }, 1000);
                    };
                    previewImage.appendChild(img);
                } else {
                    // 비이미지 파일은 아이콘 표시
                    const icon = document.createElement('div');
                    icon.className = 'file-icon';
                    icon.innerHTML = '<i class="far fa-file"></i>';
                    previewImage.appendChild(icon);
                }
                
                const previewFilename = document.createElement('div');
                previewFilename.className = 'preview-filename';
                
                // 파일 이름이 길면 줄임 처리
                let displayName = file.name;
                if (displayName.length > 20) {
                    const ext = getFileExtension(displayName);
                    const baseName = displayName.substring(0, displayName.lastIndexOf('.'));
                    displayName = baseName.substring(0, 15) + '...' + (ext ? '.' + ext : '');
                }
                
                previewFilename.textContent = displayName;
                previewFilename.title = file.name;
                
                const previewFilesize = document.createElement('div');
                previewFilesize.className = 'preview-filesize';
                previewFilesize.textContent = formatFileSize(file.size);
                
                previewItem.appendChild(previewImage);
                previewItem.appendChild(previewFilename);
                previewItem.appendChild(previewFilesize);
                
                // 삭제 버튼 추가
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-file';
                deleteButton.innerHTML = '×';
                deleteButton.title = '파일 제거';
                deleteButton.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    previewItem.remove();
                    
                    // 모든 파일이 제거되었는지 확인
                    if (!document.querySelector('.preview-item')) {
                        fileList.innerHTML = '<p>선택된 파일이 없습니다.</p>';
                        uploadArea.classList.remove('has-files');
                    }
                };
                
                previewItem.appendChild(deleteButton);
                previewContainer.appendChild(previewItem);
            }
        }
    }
    
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
     * @param {number} percent - 진행률 (0-100)
     */
    function updateProgressBar(percent) {
        const progressBar = document.getElementById('conversion-progress');
        const progressText = document.getElementById('progress-text');
        
        if (progressBar && progressText) {
            progressBar.style.width = `${percent}%`;
            progressText.textContent = `${Math.round(percent)}%`;
        }
    }
    
    /**
     * 현재 처리 중인 파일 정보를 업데이트합니다.
     * @param {string} filename - 파일명
     * @param {number} percent - 진행률 (0-100)
     * @param {string} [status] - 상태 메시지
     */
    function updateCurrentFileInfo(filename, percent, status = '') {
        const currentFileInfo = document.getElementById('current-file-info');
        
        if (currentFileInfo) {
            currentFileInfo.textContent = `${filename} - ${status || `${percent}%`}`;
        }
        
        updateProgressBar(percent);
    }
    
    /**
     * 메시지를 표시합니다.
     * @param {string} message - 표시할 메시지
     * @param {string} type - 메시지 유형 (info, error, success)
     */
    function showMessage(message, type = 'info') {
        // 기존 메시지 제거
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 메시지 요소 생성
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        
        // 메시지를 body에 추가
        document.body.appendChild(messageElement);
        
        // 3초 후 메시지 제거
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.classList.add('message-hiding');
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.remove();
                    }
                }, 500);
            }
        }, 3000);
    }
    
    /**
     * 파일 크기를 포맷팅합니다.
     * @param {number} bytes - 바이트 단위 파일 크기
     * @returns {string} 포맷팅된 파일 크기
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 파일명에서 확장자를 추출합니다.
     * @param {string} filename - 파일명
     * @returns {string} 확장자 (없으면 빈 문자열)
     */
    function getFileExtension(filename) {
        if (!filename) return '';
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) return ''; // 확장자 없음
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    // 이미지 다운로드 함수
    window.downloadImage = function(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 전체 이미지 다운로드 함수
    window.downloadAllImages = async function() {
        if (!window.convertedImages || window.convertedImages.length === 0) {
            showMessage('다운로드할 이미지가 없습니다.', 'error');
            return;
        }

        // JSZip 라이브러리가 없는 경우 동적으로 로드
        if (typeof JSZip === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const zip = new JSZip();
        const images = window.convertedImages;

        // 로딩 UI 표시
        showLoadingUI();
        updateCurrentFileInfo('압축 파일 생성 중...', 0);

        try {
            // 각 이미지를 ZIP 파일에 추가
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const base64Data = image.dataUrl.split(',')[1];
                zip.file(image.name, base64Data, { base64: true });
                
                // 진행률 업데이트
                updateProgressBar((i + 1) / images.length * 100);
            }

            // ZIP 파일 생성
            const content = await zip.generateAsync({ type: 'blob' });
            const zipUrl = URL.createObjectURL(content);

            // ZIP 파일 다운로드
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const link = document.createElement('a');
            link.href = zipUrl;
            link.download = `converted_images_${timestamp}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 리소스 정리
            setTimeout(() => {
                URL.revokeObjectURL(zipUrl);
            }, 1000);

            showMessage('전체 다운로드가 완료되었습니다.', 'success');
        } catch (error) {
            console.error('ZIP 파일 생성 오류:', error);
            showMessage('ZIP 파일 생성 중 오류가 발생했습니다.', 'error');
        } finally {
            hideLoadingUI();
        }
    };

    // 변환 옵션 수집 함수 업데이트
    function getConversionOptions() {
        const options = {
            format: formatSelect.value,
            quality: 0.9
        };
        
        // 리사이즈 옵션
        const resizeType = document.getElementById('resize-type');
        if (resizeType) {
            const type = resizeType.value;
            
            if (type === 'percentage') {
                const percentageInput = document.getElementById('percentage-input');
                if (percentageInput && percentageInput.value) {
                    const scale = parseInt(percentageInput.value) / 100;
                    options.scale = scale;
                }
            } else if (type === 'pixel') {
                const widthInput = document.getElementById('width-input');
                const heightInput = document.getElementById('height-input');
                
                if (widthInput && widthInput.value) {
                    options.width = parseInt(widthInput.value);
                }
                if (heightInput && heightInput.value) {
                    options.height = parseInt(heightInput.value);
                }
            }
        }
        
        // 품질 옵션
        const qualityInput = document.getElementById('quality-input');
        if (qualityInput && qualityInput.value) {
            options.quality = parseInt(qualityInput.value) / 100;
        }
        
        // PNG 압축 레벨
        if (options.format === 'png') {
            const compressionLevel = document.getElementById('compression-level');
            if (compressionLevel) {
                options.compressionLevel = parseInt(compressionLevel.value);
            }
        }
        
        // WebP 무손실 옵션
        if (options.format === 'webp') {
            const losslessWebp = document.getElementById('lossless-webp');
            if (losslessWebp) {
                options.lossless = losslessWebp.checked;
            }
        }
        
        return options;
    }
});

/**
 * Squoosh 라이브러리를 사용한 이미지 처리 클래스
 */
class ImagePool {
    constructor() {
        if (!window.Squoosh) {
            throw new Error('Squoosh 라이브러리가 로드되지 않았습니다.');
        }
        
        // Squoosh 인스턴스 생성
        this.pool = new window.Squoosh.ImagePool();
        this.initialized = true;
    }
    
    /**
     * 이미지를 풀에 추가합니다.
     * @param {ArrayBuffer} imageData - 이미지 데이터
     * @returns {ImageProcessor} 이미지 프로세서
     */
    async ingestImage(imageData) {
        if (!this.initialized) {
            throw new Error('ImagePool이 초기화되지 않았습니다.');
        }
        
        const image = await this.pool.ingestImage(imageData);
        return new ImageProcessor(image, this.pool);
    }
    
    /**
     * 이미지 풀을 정리합니다.
     */
    async close() {
        if (this.pool) {
            await this.pool.close();
        }
    }
}

/**
 * 단일 이미지 처리 클래스
 */
class ImageProcessor {
    constructor(image, pool) {
        this.image = image;
        this.pool = pool;
        this._disposed = false;
    }
    
    /**
     * 이미지를 전처리합니다.
     * @param {Object} options - 전처리 옵션
     * @returns {Promise<void>} 완료 시 해결되는 Promise
     */
    async preprocess(options) {
        if (this._disposed) {
            throw new Error('이미 처리가 완료된 이미지입니다.');
        }
        
        try {
            // 리사이징 처리
            if (options.width || options.height) {
                await this.image.preprocess({
                    resize: {
                        enabled: true,
                        width: options.width || this.image.decoded.bitmap.width,
                        height: options.height || this.image.decoded.bitmap.height,
                        method: 'lanczos3'
                    }
                });
            }
        } catch (error) {
            throw new Error(`이미지 전처리 오류: ${error.message}`);
        }
    }
    
    /**
     * 이미지를 인코딩합니다.
     * @param {Object} options - 인코딩 옵션
     * @returns {Promise<Object>} 인코딩된 이미지 데이터
     */
    async encode(options) {
        if (this._disposed) {
            throw new Error('이미 처리가 완료된 이미지입니다.');
        }
        
        try {
            const encodeOptions = {};
            
            // JPEG 인코딩
            if (options.format === 'jpeg') {
                encodeOptions.mozjpeg = {
                    quality: Math.round((options.quality || 0.9) * 100)
                };
            }
            
            // PNG 인코딩
            else if (options.format === 'png') {
                encodeOptions.oxipng = {
                    level: 3
                };
            }
            
            // WebP 인코딩
            else if (options.format === 'webp') {
                encodeOptions.webp = {
                    quality: Math.round((options.quality || 0.9) * 100)
                };
            }
            
            else {
                throw new Error(`지원되지 않는 출력 형식: ${options.format}`);
            }
            
            // 이미지 인코딩
            await this.image.encode(encodeOptions);
            
            // 인코딩된 데이터 가져오기
            const encoded = await this.image.encodedWith[options.format];
            
            // Blob 생성
            const blob = new Blob([encoded.binary], { type: `image/${options.format}` });
            const url = URL.createObjectURL(blob);
            
            // 리소스 정리
            this.dispose();
            
            return {
                binary: encoded.binary,
                blob: blob,
                url: url
            };
        } catch (error) {
            throw new Error(`이미지 인코딩 오류: ${error.message}`);
        }
    }
    
    /**
     * 리소스를 정리합니다.
     */
    dispose() {
        if (!this._disposed) {
            if (this.image) {
                this.image.close();
            }
            this._disposed = true;
        }
    }
} 