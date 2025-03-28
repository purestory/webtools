// WebAssembly-based Image Converter Code
let encoders = {};
let decoders = {};
let selectedFiles = [];

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
    console.log('initializeEventListeners 함수 호출됨');
    
    // File select button - 수정된 코드
    const fileSelectBtn = document.getElementById('select-file-btn');
    const fileInput = document.getElementById('file-input');
    
    console.log('파일 선택 버튼 요소:', fileSelectBtn);
    console.log('파일 입력 요소:', fileInput);
    
    if (fileSelectBtn && fileInput) {
        // 기존 이벤트 리스너 제거 (중복 방지)
        fileSelectBtn.removeEventListener('click', function(){});
        
        // 새 이벤트 리스너 등록 - 인라인 함수로 직접 정의
        console.log('파일 선택 버튼 클릭 이벤트 리스너 추가');
        fileSelectBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('파일 선택 버튼 클릭됨');
            
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
                console.log('파일 입력 요소 클릭 시도');
                fileInput.click();
            } else {
                console.error('파일 입력 요소를 찾을 수 없음');
            }
        });
    } else {
        console.error('파일 선택 버튼 또는 파일 입력 요소를 찾을 수 없음');
    }
    
    // Convert button
    const convertBtn = document.getElementById('convert-btn');
    if (convertBtn) {
        convertBtn.addEventListener('click', handleConvertButtonClick);
    }
    
    // File input
    if (fileInput) {
        console.log('파일 입력 변경 이벤트 리스너 추가');
        // 기존 이벤트 리스너 제거 (중복 방지)
        fileInput.removeEventListener('change', function(){});
        
        // 새 이벤트 리스너 등록 - 인라인 함수로 직접 정의
        fileInput.addEventListener('change', function(e) {
            console.log('파일 입력 변경됨');
            handleFileInputChange(e);
        });
    } else {
        console.error('파일 입력 요소를 찾을 수 없음');
    }
    
    // Upload area drag & drop
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        
        // 업로드 영역 클릭 시 파일 선택 대화상자 표시
        uploadArea.addEventListener('click', function(e) {
            // 버튼 클릭은 이벤트 전파 방지
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            console.log('업로드 영역 클릭됨');
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
                fileInput.click();
            }
        });
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
    
    // Format select
    const formatSelect = document.getElementById('format-select');
    if (formatSelect) {
        formatSelect.addEventListener('change', handleFormatChange);
    }
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
    console.log('File input change event triggered');
    const files = event.target.files;
    if (!files || files.length === 0) {
        console.log('No files selected');
        return;
    }
    
    console.log(`${files.length} files selected`);
    
    // Save selected files in global array
    selectedFiles = Array.from(files);
    
    const fileList = document.getElementById('file-list');
    const uploadArea = document.getElementById('upload-area');
    const convertBtn = document.getElementById('convert-btn');
    
    // Clear file list
    fileList.innerHTML = '';
    
    // Create file list display
    const fileListDisplay = document.createElement('div');
    fileListDisplay.classList.add('file-list');
    
    const filesCount = document.createElement('div');
    filesCount.classList.add('mb-2', 'file-info');
    filesCount.textContent = `${files.length}개 파일 선택됨`;
    fileListDisplay.appendChild(filesCount);
    
    // Create thumbnails for first 10 files
    const maxPreview = Math.min(files.length, 10);
    const fileGrid = document.createElement('div');
    fileGrid.classList.add('row', 'row-cols-2', 'row-cols-md-5', 'g-2');
    
    for (let i = 0; i < maxPreview; i++) {
        const file = files[i];
        
        // Check if file is an image
        if (!/^image\//.test(file.type) && !/\.pdf$/i.test(file.name) && !/\.heic$/i.test(file.name)) {
            console.warn(`File ${file.name} is not a supported image`);
            continue;
        }
        
        const fileCol = document.createElement('div');
        fileCol.classList.add('col');
        
        const fileItem = document.createElement('div');
        fileItem.classList.add('preview-item');
        
        // Thumbnail container
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('preview-image');
        
        // Create thumbnail
        const thumbnailImg = document.createElement('img');
        thumbnailImg.alt = '미리보기 불가';
        
        if (/\.pdf$/i.test(file.name)) {
            // PDF 파일은 기본 아이콘 표시
            thumbnailImg.src = 'images/file-icon.png';
        } else if (/\.heic$/i.test(file.name)) {
            // HEIC 파일은 기본 아이콘 표시
            thumbnailImg.src = 'images/file-icon.png';
        } else {
            // 일반 이미지는 썸네일 생성
            try {
                const objectUrl = URL.createObjectURL(file);
                thumbnailImg.src = objectUrl;
                
                // Cleanup URL when image is loaded
                thumbnailImg.onload = () => {
                    URL.revokeObjectURL(objectUrl);
                };
            } catch (error) {
                console.error(`Error creating thumbnail for ${file.name}:`, error);
                thumbnailImg.src = 'images/file-icon.png';
            }
        }
        
        imageContainer.appendChild(thumbnailImg);
        fileItem.appendChild(imageContainer);
        
        // File info
        const fileInfo = document.createElement('div');
        
        const fileName = document.createElement('div');
        fileName.classList.add('preview-filename');
        fileName.textContent = file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name;
        fileName.title = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.classList.add('preview-filesize');
        fileSize.textContent = formatFileSize(file.size);
        
        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);
        fileItem.appendChild(fileInfo);
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-file');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFile(i);
        });
        
        fileItem.appendChild(deleteBtn);
        fileCol.appendChild(fileItem);
        fileGrid.appendChild(fileCol);
    }
    
    fileListDisplay.appendChild(fileGrid);
    
    // Add "and more" text if more than 10 files
    if (files.length > 10) {
        const moreText = document.createElement('div');
        moreText.classList.add('mt-2', 'text-muted');
        moreText.textContent = `외 ${files.length - 10}개 파일...`;
        fileListDisplay.appendChild(moreText);
    }
    
    fileList.appendChild(fileListDisplay);
    
    // Update upload area style
    uploadArea.classList.add('has-files');
    
    // Enable convert button if files are selected and format is selected
    const formatSelect = document.getElementById('format-select');
    if (formatSelect && formatSelect.value) {
        convertBtn.disabled = false;
    } else {
        // Prompt user to select format
        showMessage('출력 형식을 선택하세요.', 'info');
    }
    
    console.log('File display updated and button state updated');
}

// Remove file from selection
function removeFile(index) {
    if (index >= 0 && index < selectedFiles.length) {
        selectedFiles.splice(index, 1);
        
        // Re-create file list display
        const dummyEvent = { target: { files: selectedFiles } };
        handleFileInputChange(dummyEvent);
        
        // If no files left, reset
        if (selectedFiles.length === 0) {
            resetFileInput();
        }
    }
}

// Format change handler
function handleFormatChange(event) {
    const convertBtn = document.getElementById('convert-btn');
    
    // Only enable convert button if files are selected
    if (selectedFiles.length > 0) {
        convertBtn.disabled = false;
    }
}

// Reset file input and UI
function resetFileInput() {
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const uploadArea = document.getElementById('upload-area');
    const convertBtn = document.getElementById('convert-btn');
    
    // Clear file input
    fileInput.value = '';
    selectedFiles = [];
    
    // Clear file list
    fileList.innerHTML = '';
    
    // Reset upload area style
    uploadArea.classList.remove('has-files');
    
    // Disable convert button
    convertBtn.disabled = true;
}

// Convert button click handler
function handleConvertButtonClick() {
    console.log('Convert button clicked');
    
    // Check if files are selected
    if (selectedFiles.length === 0) {
        showMessage('변환할 파일을 선택하세요.', 'error');
        return;
    }
    
    // Check if format is selected
    const formatSelect = document.getElementById('format-select');
    if (!formatSelect || !formatSelect.value) {
        showMessage('출력 형식을 선택하세요.', 'error');
        return;
    }
    
    // Get conversion options
    const options = {
        format: formatSelect.value,
        quality: parseInt(document.getElementById('quality-slider').value),
        resize: false,
        width: null,
        height: null,
        removeExif: document.getElementById('remove-exif').checked,
        removeTransparency: document.getElementById('remove-transparency').checked,
        optimize: document.getElementById('compress-lossless').checked
    };
    
    // Get resize option
    const activeResizeBtn = document.querySelector('.btn-group [data-resize].active');
    if (activeResizeBtn && activeResizeBtn.dataset.resize !== 'none') {
        options.resize = true;
        
        if (activeResizeBtn.dataset.resize === 'width') {
            options.width = parseInt(document.getElementById('width-input').value);
        } else if (activeResizeBtn.dataset.resize === 'height') {
            options.height = parseInt(document.getElementById('height-input').value);
        } else if (activeResizeBtn.dataset.resize === 'custom') {
            options.width = parseInt(document.getElementById('width-input').value);
            options.height = parseInt(document.getElementById('height-input').value);
        }
    }
    
    // Get max filesize if specified
    const maxFilesizeInput = document.getElementById('max-filesize');
    if (maxFilesizeInput && maxFilesizeInput.value) {
        options.maxFilesize = parseInt(maxFilesizeInput.value);
    }
    
    console.log('Conversion options:', options);
    
    // Start conversion
    convertImages(selectedFiles, options);
}

// Convert images function
async function convertImages(files, options) {
    showLoading(true);
    
    const results = [];
    let errorCount = 0;
    
    // Initialize progress
    updateProgress(0, files.length);
    
    // Convert each file
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress UI
        updateProgress(i + 1, files.length);
        updateCurrentFileInfo(file.name);
        
        try {
            // Check if file is a supported image or PDF/HEIC
            if (!/^image\//.test(file.type) && 
                !file.name.toLowerCase().endsWith('.pdf') && 
                !file.name.toLowerCase().endsWith('.heic')) {
                console.warn(`Skipping unsupported file: ${file.name}`);
                continue;
            }
            
            const result = await convertImage(file, options);
            if (result) {
                console.log(`Converted ${file.name} successfully`);
                results.push(result);
                
                // Increment conversion counter
                incrementConversionCounter();
            }
        } catch (error) {
            console.error(`Error converting ${file.name}:`, error);
            errorCount++;
        }
    }
    
    // Hide loading
    showLoading(false);
    
    // Display results
    if (results.length > 0) {
        displayResults(results);
        showMessage(`${results.length}개 파일 변환 완료. ${errorCount}개 파일 변환 실패.`, 'success');
    } else {
        showMessage('변환 실패. 파일 형식과 설정을 확인하세요.', 'error');
    }
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

// Update statistics function
function updateStats() {
    try {
        console.log('Starting stats update');
        
        // Get visitor count
        const visitorCount = localStorage.getItem('visitor_count') || '0';
        console.log('Visitor count:', visitorCount);
        
        // Get image conversion count
        const imageCount = localStorage.getItem('image_conversion_count') || '0';
        console.log('Image conversion count:', imageCount);
        
        // Update visitor count elements
        const visitorCountElements = document.querySelectorAll('.visitor-count');
        if (visitorCountElements.length > 0) {
            console.log(`Updating ${visitorCountElements.length} visitor count elements`);
            visitorCountElements.forEach(el => {
                el.textContent = parseInt(visitorCount).toLocaleString();
            });
        } else {
            console.log('No visitor count elements found');
        }
        
        // Update conversion count elements
        const conversionCountElements = document.querySelectorAll('.conversion-count');
        if (conversionCountElements.length > 0) {
            console.log(`Updating ${conversionCountElements.length} conversion count elements`);
            conversionCountElements.forEach(el => {
                el.textContent = parseInt(imageCount).toLocaleString();
            });
        } else {
            console.log('No conversion count elements found');
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