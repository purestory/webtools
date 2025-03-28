// WebAssembly-based Image Converter Code
let encoders = {};
let decoders = {};

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing image converter');
    
    // Initialize encoders and decoders
    encoders = {
        webp: window.jsquash.webp.encode,
        jpeg: window.jsquash.jpeg.encode,
        png: window.jsquash.png.encode,
        avif: window.jsquash.avif.encode
    };
    
    decoders = {
        webp: window.jsquash.webp.decode,
        jpeg: window.jsquash.jpeg.decode,
        png: window.jsquash.png.decode,
        avif: window.jsquash.avif.decode
    };
    
    // Initialize conversion counter
    initializeConversionCounter();
    
    // Update statistics
    updateStats();
    
    // Register event listeners
    initializeEventListeners();
    
    console.log('Image converter initialization complete');
});

function initializeEventListeners() {
    // File select button
    const fileSelectBtn = document.getElementById('select-file-btn');
    if (fileSelectBtn) {
        fileSelectBtn.addEventListener('click', () => document.getElementById('file-input').click());
    }
    
    // Convert button
    const convertBtn = document.getElementById('convert-btn');
    if (convertBtn) {
        convertBtn.addEventListener('click', handleConvertButtonClick);
    }
    
    // File input
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileInputChange);
    }
    
    // Upload area drag & drop
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }
    
    // Quality slider
    const qualitySlider = document.getElementById('quality-slider');
    if (qualitySlider) {
        qualitySlider.addEventListener('input', function() {
            document.getElementById('quality-value').textContent = `${this.value}%`;
        });
    }
    
    // Resize buttons
    document.querySelectorAll('.btn-group [data-resize]').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.btn-group [data-resize]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            const resizeOptions = document.getElementById('resize-options');
            resizeOptions.style.display = this.dataset.resize === 'none' ? 'none' : 'block';
        });
    });
}

async function convertImage(file, options) {
    try {
        let processedFile = file;
        
        // HEIC 이미지 처리
        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
            processedFile = await convertHeicImage(file, options);
        }
        // PDF 처리
        else if (file.type === 'application/pdf') {
            processedFile = await convertPdfToImage(file, options);
        }
        
        // 이미지 압축 옵션
        const compressionOptions = {
            maxSizeMB: options.maxFilesize ? options.maxFilesize / 1024 : undefined,
            maxWidthOrHeight: options.maxDimension,
            useWebWorker: true,
            fileType: options.format,
            quality: options.quality / 100,
            preserveExif: !options.removeExif,
            alwaysKeepResolution: !options.resize
        };
        
        // 이미지 압축 및 변환
        let convertedFile;
        if (options.format === 'png' && options.optimize) {
            // PNG 최적화를 위해 Canvas API 사용
            const img = await createImageBitmap(processedFile);
            const canvas = document.createElement('canvas');
            canvas.width = options.resize ? Math.min(img.width, options.maxDimension) : img.width;
            canvas.height = options.resize ? Math.min(img.height, options.maxDimension) : img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png', 1.0);
            });
            
            convertedFile = new File([blob], getOutputFilename(file.name, options.format), {
                type: 'image/png'
            });
        } else {
            // browser-image-compression 라이브러리 사용
            convertedFile = await imageCompression(processedFile, compressionOptions);
        }
        
        return {
            originalFile: file,
            convertedFile: convertedFile,
            originalSize: file.size,
            convertedSize: convertedFile.size,
            name: getOutputFilename(file.name, options.format),
            url: URL.createObjectURL(convertedFile)
        };
    } catch (error) {
        console.error(`Error converting ${file.name}:`, error);
        showMessage(`${file.name} 변환 중 오류가 발생했습니다.`, 'error');
        return null;
    }
}

function getImageFormat(mimeType) {
    const format = mimeType.split('/')[1];
    return format === 'jpeg' ? 'jpeg' : format;
}

async function convertHeicImage(file, options) {
    try {
        const blob = await heic2any({
            blob: file,
            toType: options.format,
            quality: options.quality / 100
        });
        return new File([blob], file.name.replace(/\.heic$/i, `.${options.format}`), {
            type: `image/${options.format}`
        });
    } catch (error) {
        console.error('HEIC conversion error:', error);
        throw new Error('HEIC 이미지 변환에 실패했습니다.');
    }
}

async function convertPdfToImage(file, options) {
    try {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, `image/${options.format}`, options.quality / 100);
        });
        
        return new File([blob], file.name.replace(/\.pdf$/i, `.${options.format}`), {
            type: `image/${options.format}`
        });
    } catch (error) {
        console.error('PDF conversion error:', error);
        throw new Error('PDF 변환에 실패했습니다.');
    }
}

// Initialize conversion counter function
function initializeConversionCounter() {
    try {
        if (!localStorage.getItem('image_conversion_count')) {
            localStorage.setItem('image_conversion_count', '0');
            console.log('Image conversion counter initialized');
        }
    } catch (error) {
        console.error('Conversion counter initialization error:', error);
    }
}

// Drag over handler
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('dragover');
}

// Drag leave handler
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('dragover');
}

// Drop handler
function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget;
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        document.getElementById('file-input').files = files;
        handleFileInputChange({ target: { files } });
    }
}

// File input change handler
function handleFileInputChange(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const fileList = document.getElementById('file-list');
    const uploadArea = document.getElementById('upload-area');
    const convertBtn = document.getElementById('convert-btn');
    
    // Clear file list
    fileList.innerHTML = '';
    
    // Update upload area style
    uploadArea.classList.add('has-files');
    
    // Enable convert button
    if (convertBtn) {
        convertBtn.disabled = false;
    }
    
    // Display file information
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    fileInfo.innerHTML = `<p><strong>Selected files: ${files.length}</strong></p>`;
    fileList.appendChild(fileInfo);
    
    // Create preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    previewContainer.style.display = 'grid';
    previewContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
    previewContainer.style.gap = '10px';
    previewContainer.style.marginTop = '10px';
    fileList.appendChild(previewContainer);
    
    // Process each file
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.style.border = '1px solid #ddd';
        previewItem.style.borderRadius = '4px';
        previewItem.style.padding = '8px';
        previewItem.style.backgroundColor = '#fff';
        
        const previewImage = document.createElement('div');
        previewImage.className = 'preview-image';
        previewImage.style.width = '100%';
        previewImage.style.height = '120px';
        previewImage.style.overflow = 'hidden';
        previewImage.style.marginBottom = '5px';
        previewImage.style.borderRadius = '4px';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        previewImage.appendChild(img);
        
        const fileName = document.createElement('div');
        fileName.className = 'preview-filename';
        fileName.style.fontSize = '0.8rem';
        fileName.style.overflow = 'hidden';
        fileName.style.textOverflow = 'ellipsis';
        fileName.style.whiteSpace = 'nowrap';
        fileName.title = file.name;
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.className = 'preview-filesize';
        fileSize.style.fontSize = '0.75rem';
        fileSize.style.color = '#666';
        fileSize.textContent = formatFileSize(file.size);
        
        previewItem.appendChild(previewImage);
        previewItem.appendChild(fileName);
        previewItem.appendChild(fileSize);
        
        previewContainer.appendChild(previewItem);
    });
    
    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-danger';
    cancelButton.innerHTML = '<i class="fas fa-times"></i> Cancel';
    cancelButton.style.marginTop = '10px';
    cancelButton.onclick = function() {
        resetFileInput();
    };
    fileList.appendChild(cancelButton);
}

// Reset file input function
function resetFileInput() {
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const uploadArea = document.getElementById('upload-area');
    const convertBtn = document.getElementById('convert-btn');
    
    // Reset file input
    fileInput.value = '';
    
    // Clear file list
    fileList.innerHTML = '';
    
    // Reset upload area style
    uploadArea.classList.remove('has-files');
    
    // Disable convert button
    if (convertBtn) {
        convertBtn.disabled = true;
    }
}

// Format change handler
function handleFormatChange(event) {
    const format = event.target.value;
    const formatOptions = document.getElementById('format-options');
    
    // Clear format options
    formatOptions.innerHTML = '';
    
    if (!format) return;
    
    // Add format-specific options
    if (format === 'jpg') {
        formatOptions.innerHTML = `
            <div class="form-group">
                <label for="jpg-quality">JPEG Quality</label>
                <div class="quality-slider">
                    <input type="range" id="jpg-quality" min="0" max="100" value="90" class="form-control">
                    <span id="jpg-quality-value">90%</span>
                </div>
            </div>
        `;
        
        document.getElementById('jpg-quality').addEventListener('input', function() {
            document.getElementById('jpg-quality-value').textContent = `${this.value}%`;
        });
    } else if (format === 'webp') {
        formatOptions.innerHTML = `
            <div class="form-group">
                <label for="webp-quality">WebP Quality</label>
                <div class="quality-slider">
                    <input type="range" id="webp-quality" min="0" max="100" value="90" class="form-control">
                    <span id="webp-quality-value">90%</span>
                </div>
            </div>
        `;
        
        document.getElementById('webp-quality').addEventListener('input', function() {
            document.getElementById('webp-quality-value').textContent = `${this.value}%`;
        });
    } else if (format === 'png') {
        formatOptions.innerHTML = `
            <div class="form-group">
                <label for="png-compression">PNG Compression Level</label>
                <div class="quality-slider">
                    <input type="range" id="png-compression" min="0" max="9" value="6" class="form-control">
                    <span id="png-compression-value">6</span>
                </div>
            </div>
        `;
        
        document.getElementById('png-compression').addEventListener('input', function() {
            document.getElementById('png-compression-value').textContent = this.value;
        });
    }
}

// Convert button click handler
function handleConvertButtonClick() {
    const files = document.getElementById('file-input').files;
    if (!files || files.length === 0) return;
    
    const format = document.getElementById('format-select').value;
    if (!format) {
        showMessage('출력 형식을 선택해주세요.', 'error');
        return;
    }
    
    // 변환 옵션 수집
    const options = {
        format: format,
        quality: parseInt(document.getElementById('quality-slider').value),
        maxFilesize: parseInt(document.getElementById('max-filesize').value) || undefined,
        removeExif: document.getElementById('remove-exif').checked,
        resize: false,
        maxDimension: undefined
    };
    
    // 해상도 변경 옵션 처리
    const activeResizeBtn = document.querySelector('.btn-group [data-resize].active');
    if (activeResizeBtn && activeResizeBtn.dataset.resize !== 'none') {
        options.resize = true;
        if (activeResizeBtn.dataset.resize === 'width') {
            options.maxDimension = parseInt(document.getElementById('width-input').value);
        } else if (activeResizeBtn.dataset.resize === 'height') {
            options.maxDimension = parseInt(document.getElementById('height-input').value);
        } else if (activeResizeBtn.dataset.resize === 'custom') {
            options.maxDimension = Math.max(
                parseInt(document.getElementById('width-input').value) || 0,
                parseInt(document.getElementById('height-input').value) || 0
            );
        }
    }
    
    // 변환 버튼 비활성화
    document.getElementById('convert-btn').disabled = true;
    
    // 이미지 변환 시작
    convertImages(files, options);
}

// Image conversion processing function
async function convertImages(files, options) {
    const results = [];
    const total = files.length;
    let current = 0;
    
    showLoading(true);
    
    try {
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            
            updateProgress(current, total);
                updateCurrentFileInfo(file.name);
            
            const result = await convertImage(file, options);
            if (result) {
                results.push(result);
            }
            
            current++;
        }
        
        updateProgress(total, total);
        incrementConversionCounter(results.length);
        displayResults(results);
    } catch (error) {
        console.error('Image conversion error:', error);
        showMessage('이미지 변환 중 오류가 발생했습니다.', 'error');
    } finally {
        showLoading(false);
    }
    
    return results;
}

// WebAssembly 모듈 초기화
let wasmModule;

async function initializeWasm() {
    try {
        const response = await fetch('wasm/image_processor.wasm');
        const wasmBinary = await response.arrayBuffer();
        wasmModule = await WebAssembly.instantiate(wasmBinary, {
            env: {
                memory: new WebAssembly.Memory({ initial: 256 }),
                abort: () => console.error('Wasm abort called')
            }
        });
        console.log('WebAssembly module initialized');
    } catch (error) {
        console.error('WebAssembly initialization error:', error);
    }
}

// 유틸리티 함수들
async function getImageData(file) {
    const img = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
}

async function createFileFromImageData(imageData, format, quality) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, `image/${format}`, quality / 100);
    });
    
    return new File([blob], `converted.${format}`, { type: `image/${format}` });
}

function applyImageAdjustments(imageData, adjustments) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        // 밝기 조정
        if (adjustments.brightness) {
            data[i] = Math.min(255, data[i] + adjustments.brightness);     // R
            data[i+1] = Math.min(255, data[i+1] + adjustments.brightness); // G
            data[i+2] = Math.min(255, data[i+2] + adjustments.brightness); // B
        }
        // 대비 조정
        if (adjustments.contrast) {
            const factor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast));
            data[i] = factor * (data[i] - 128) + 128;     // R
            data[i+1] = factor * (data[i+1] - 128) + 128; // G
            data[i+2] = factor * (data[i+2] - 128) + 128; // B
        }
    }
}

// Output filename generation function
function getOutputFilename(filename, format) {
    const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
    return `${baseName}.${format}`;
}

// File size formatting function
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Display results function
function displayResults(results) {
    const resultArea = document.getElementById('result-area');
    const template = document.getElementById('result-template');
    
    resultArea.innerHTML = '';
    
    if (results.length === 0) {
        resultArea.innerHTML = '<p class="text-center text-muted">변환된 이미지가 없습니다.</p>';
        return;
    }
    
    results.forEach(result => {
        const resultElement = template.content.cloneNode(true);
        
        // 미리보기 이미지 설정
        const previewImg = resultElement.querySelector('.result-preview img');
        previewImg.src = result.url;
        previewImg.alt = result.name;
        
        // 파일 정보 설정
        resultElement.querySelector('.filename').textContent = result.name;
        resultElement.querySelector('.original-size').textContent = `원본 크기: ${formatFileSize(result.originalSize)}`;
        resultElement.querySelector('.converted-size').textContent = `변환 크기: ${formatFileSize(result.convertedSize)}`;
        
        // 압축률 계산 및 표시
        const compressionRatio = ((1 - (result.convertedSize / result.originalSize)) * 100).toFixed(1);
        resultElement.querySelector('.compression-ratio').textContent = 
            `압축률: ${compressionRatio}% ${compressionRatio > 0 ? '감소' : '증가'}`;
        
        // 다운로드 버튼 설정
        const downloadBtn = resultElement.querySelector('.download-btn');
        downloadBtn.href = result.url;
        downloadBtn.download = result.name;
        
        // URL 복사 버튼 설정
        const copyBtn = resultElement.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(result.url)
                .then(() => showMessage('URL이 클립보드에 복사되었습니다.', 'success'))
                .catch(() => showMessage('URL 복사에 실패했습니다.', 'error'));
        });
        
        resultArea.appendChild(resultElement);
    });
    
    // 모든 이미지 다운로드 버튼 추가
    if (results.length > 1) {
        const downloadAllBtn = document.createElement('button');
        downloadAllBtn.className = 'btn btn-primary download-all-btn';
        downloadAllBtn.innerHTML = '<i class="fas fa-download"></i> 모든 이미지 다운로드';
        downloadAllBtn.addEventListener('click', () => {
            results.forEach(result => {
                    const link = document.createElement('a');
                link.href = result.url;
                link.download = result.name;
                    link.click();
            });
        });
        resultArea.appendChild(downloadAllBtn);
    }
}

// Loading display function
function showLoading(show) {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (show) {
        loadingOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        loadingOverlay.style.display = 'none';
        document.body.style.overflow = '';
        // 변환 버튼 활성화
        document.getElementById('convert-btn').disabled = false;
    }
}

// Progress update function
function updateProgress(current, total) {
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.getElementById('progress-inner-text');
    const progress = Math.round((current / total) * 100);
    
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
}

// Current file info display function
function updateCurrentFileInfo(filename) {
    const fileInfo = document.getElementById('current-file-info');
    fileInfo.textContent = `처리 중: ${filename}`;
}

// Message display function
function showMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.classList.add('message-hiding');
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, 3000);
}

// Increment conversion counter function
function incrementConversionCounter(count = 1) {
    try {
        let imageCount = parseInt(localStorage.getItem('image_conversion_count') || '0');
        imageCount += count;
        localStorage.setItem('image_conversion_count', imageCount.toString());
        console.log('Image conversion counter incremented:', imageCount);
        
        // Update statistics
        updateStats();
    } catch (error) {
        console.error('Conversion counter increment error:', error);
    }
}

function updateStats() {
    try {
        console.log('Starting stats update');
        
        // Get image conversion counter
        let imageCount = 0;
        try {
            const storedCount = localStorage.getItem('image_conversion_count');
            console.log('Raw image counter value from localStorage:', storedCount);
            
            if (storedCount !== null && storedCount !== undefined && storedCount !== '') {
                imageCount = parseInt(storedCount);
                if (isNaN(imageCount)) {
                    console.log('Image counter value is not a number, resetting to 0');
                    imageCount = 0;
                    // Reset if invalid value
                    localStorage.setItem('image_conversion_count', '0');
                }
            } else {
                console.log('Image counter value not found, resetting to 0');
                // Initialize counter if not found
                localStorage.setItem('image_conversion_count', '0');
            }
        } catch (e) {
            console.error('Error reading image counter value:', e);
        }
        
        console.log('Current image conversion count:', imageCount);
        
        // Get subtitle conversion counter
        let subtitleCount = 0;
        try {
            const storedCount = localStorage.getItem('subtitle_conversion_count');
            console.log('Raw subtitle counter value from localStorage:', storedCount);
            
            if (storedCount !== null && storedCount !== undefined && storedCount !== '') {
                subtitleCount = parseInt(storedCount);
                if (isNaN(subtitleCount)) {
                    console.log('Subtitle counter value is not a number, resetting to 0');
                    subtitleCount = 0;
                    // Reset if invalid value
                    localStorage.setItem('subtitle_conversion_count', '0');
                }
            } else {
                console.log('Subtitle counter value not found, resetting to 0');
                // Initialize counter if not found
                localStorage.setItem('subtitle_conversion_count', '0');
            }
        } catch (e) {
            console.error('Error reading subtitle counter value:', e);
        }
        
        console.log('Current subtitle conversion count:', subtitleCount);
        
        // Calculate total conversion count
        const totalCount = imageCount + subtitleCount;
        console.log('Total conversion count:', totalCount, '(Images:', imageCount, '+ Subtitles:', subtitleCount, ')');
        
        // Update counter elements
        const imageCountElement = document.getElementById('image-conversion-count');
        const subtitleCountElement = document.getElementById('subtitle-conversion-count');
        const totalCountElement = document.getElementById('total-conversion-count');
        
        if (imageCountElement) {
            imageCountElement.textContent = imageCount.toLocaleString();
            console.log('Image conversion counter element updated:', imageCount);
        } else {
            console.log('Image conversion counter element not found');
        }
        
        if (subtitleCountElement) {
            subtitleCountElement.textContent = subtitleCount.toLocaleString();
            console.log('Subtitle conversion counter element updated:', subtitleCount);
        } else {
            console.log('Subtitle conversion counter element not found');
        }
        
        if (totalCountElement) {
            totalCountElement.textContent = totalCount.toLocaleString();
            console.log('Total conversion counter element updated:', totalCount);
        } else {
            console.log('Total conversion counter element not found');
        }
        
        // Update parent window stats (if in iframe)
        if (window !== window.parent) {
            try {
                console.log('Attempting to update parent window stats');
                if (window.parent && typeof window.parent.updateStats === 'function') {
                    console.log('Calling parent window updateStats function');
                    window.parent.updateStats();
                } else {
                    console.log('Parent window updateStats function not found');
                }
            } catch (e) {
                console.error('Parent window stats update error:', e);
            }
        }
        
        console.log('Stats update complete');
    } catch (error) {
        console.error('Stats update error:', error);
    }
} 