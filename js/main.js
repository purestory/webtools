// 공통 요소를 위한 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 현재 페이지 활성화 표시
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else if (currentPage === '' && linkPage === 'index.html') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // 페이지 최상단으로 스크롤하는 버튼 처리
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollTopBtn.style.display = 'block';
            } else {
                scrollTopBtn.style.display = 'none';
            }
        });
        
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // 업로드 영역 드래그 앤 드롭 이벤트 처리
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.getElementById('file-input');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('active');
        });
        
        uploadArea.addEventListener('dragleave', function() {
            this.classList.remove('active');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('active');
            fileInput.files = e.dataTransfer.files;
            updateFileList();
        });
        
        fileInput.addEventListener('change', function() {
            updateFileList();
        });
        
        function updateFileList() {
            const fileList = document.querySelector('.file-list');
            const files = fileInput.files;
            
            if (fileList) {
                fileList.innerHTML = '';
                
                if (files.length > 0) {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const fileItem = document.createElement('div');
                        fileItem.className = 'file-item';
                        
                        fileItem.innerHTML = `
                            <div class="file-name">${file.name}</div>
                            <div class="file-info">${formatFileSize(file.size)}</div>
                            <div class="file-actions">
                                <button type="button" class="remove-file" data-index="${i}">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `;
                        
                        fileList.appendChild(fileItem);
                    }
                    
                    document.querySelectorAll('.remove-file').forEach(btn => {
                        btn.addEventListener('click', function() {
                            // 파일 제거 로직은 서버 측에서 처리해야 함
                            // 여기서는 UI에서만 제거
                            this.closest('.file-item').remove();
                        });
                    });
                } else {
                    fileList.innerHTML = '<p>선택된 파일이 없습니다.</p>';
                }
            }
        }
        
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    }
    
    // 변환 옵션에 따른 UI 변경
    const formatSelect = document.getElementById('format-select');
    const optionsContainer = document.getElementById('format-options');
    
    if (formatSelect && optionsContainer) {
        formatSelect.addEventListener('change', function() {
            const selectedFormat = this.value;
            
            // 포맷에 따른 추가 옵션 표시
            if (selectedFormat === 'jpg' || selectedFormat === 'png' || selectedFormat === 'webp') {
                optionsContainer.innerHTML = `
                    <div class="form-group">
                        <label for="quality">품질 (1-100)</label>
                        <input type="range" id="quality" class="form-control" min="1" max="100" value="90">
                        <span id="quality-value">90</span>
                    </div>
                    <div class="form-group">
                        <label for="resize">크기 조정</label>
                        <select id="resize" class="form-control">
                            <option value="none">원본 크기 유지</option>
                            <option value="percentage">비율로 조정</option>
                            <option value="exact">정확한 크기 지정</option>
                        </select>
                    </div>
                    <div id="resize-options"></div>
                `;
                
                const qualitySlider = document.getElementById('quality');
                const qualityValue = document.getElementById('quality-value');
                const resizeSelect = document.getElementById('resize');
                const resizeOptions = document.getElementById('resize-options');
                
                qualitySlider.addEventListener('input', function() {
                    qualityValue.textContent = this.value;
                });
                
                resizeSelect.addEventListener('change', function() {
                    switch (this.value) {
                        case 'none':
                            resizeOptions.innerHTML = '';
                            break;
                        case 'percentage':
                            resizeOptions.innerHTML = `
                                <div class="form-group">
                                    <label for="percentage">비율 (%)</label>
                                    <input type="number" id="percentage" class="form-control" min="1" max="100" value="50">
                                </div>
                            `;
                            break;
                        case 'exact':
                            resizeOptions.innerHTML = `
                                <div class="form-group">
                                    <label for="width">너비 (px)</label>
                                    <input type="number" id="width" class="form-control" min="1" value="800">
                                </div>
                                <div class="form-group">
                                    <label for="height">높이 (px)</label>
                                    <input type="number" id="height" class="form-control" min="1" value="600">
                                </div>
                                <div class="form-group">
                                    <label for="maintain-ratio">
                                        <input type="checkbox" id="maintain-ratio" checked> 비율 유지
                                    </label>
                                </div>
                            `;
                            break;
                    }
                });
            } else if (selectedFormat === 'srt' || selectedFormat === 'smi') {
                optionsContainer.innerHTML = `
                    <div class="form-group">
                        <label for="encoding">인코딩</label>
                        <select id="encoding" class="form-control">
                            <option value="utf-8">UTF-8</option>
                            <option value="euc-kr">EUC-KR</option>
                            <option value="cp949">CP949</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="time-shift">시간 조정 (초)</label>
                        <input type="number" id="time-shift" class="form-control" value="0" step="0.1">
                    </div>
                `;
            } else {
                optionsContainer.innerHTML = '';
            }
        });
    }
}); 