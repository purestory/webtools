/**
 * 이미지 리사이즈 기능
 * image-converter.js에서 분리된 기능
 */

// 이미지 리사이즈 옵션 UI 생성
function createResizeOptions() {
    return `
        <div class="form-group">
            <label data-en="Resize Image" data-ko="이미지 크기 조정">Resize Image</label>
            <div class="input-group">
                <input type="number" id="width-input" class="form-control" placeholder="Width" data-en="Width" data-ko="너비">
                <span class="input-group-text">×</span>
                <input type="number" id="height-input" class="form-control" placeholder="Height" data-en="Height" data-ko="높이">
                <span class="input-group-text">px</span>
            </div>
            <small class="form-text" data-en="Leave empty to maintain original size." data-ko="비워두면 원본 크기가 유지됩니다.">Leave empty to maintain original size.</small>
        </div>
    `;
}

// 리사이즈 옵션 가져오기
function getResizeOptions() {
    const options = {};
    
    // 해상도 옵션 - 값이 있는 경우 숫자 형식인지 확인
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    
    if (widthInput && widthInput.value) {
        const width = parseInt(widthInput.value);
        if (isNaN(width) || width <= 0) {
            throw new Error(currentLang === 'ko' ? '너비는 양의 정수여야 합니다.' : 'Width must be a positive integer.');
        }
        options.width = width;
    }
    
    if (heightInput && heightInput.value) {
        const height = parseInt(heightInput.value);
        if (isNaN(height) || height <= 0) {
            throw new Error(currentLang === 'ko' ? '높이는 양의 정수여야 합니다.' : 'Height must be a positive integer.');
        }
        options.height = height;
    }
    
    return options;
}

// 이미지 리사이즈 기능 (클라이언트 측)
function resizeImage(imgElement, width, height) {
    return new Promise((resolve, reject) => {
        try {
            // Canvas 생성
            const canvas = document.createElement('canvas');
            
            // Canvas 크기 설정
            canvas.width = width || imgElement.naturalWidth;
            canvas.height = height || imgElement.naturalHeight;
            
            // Canvas에 이미지 그리기
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
            
            // 리사이즈된 이미지 데이터 반환
            resolve(canvas.toDataURL());
        } catch (error) {
            reject(error);
        }
    });
}

// 이미지 로드 Promise
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('이미지 로드 실패'));
        img.src = URL.createObjectURL(file);
    });
}

// 이미지 리사이즈 미리보기 생성
async function createResizePreview(file, width, height) {
    try {
        // 이미지 로드
        const img = await loadImage(file);
        
        // 리사이즈 옵션이 없으면 원본 반환
        if (!width && !height) {
            return img.src;
        }
        
        // 원본 비율 계산
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        // 리사이즈 크기 계산
        let newWidth = width || 0;
        let newHeight = height || 0;
        
        // 한쪽 값만 설정된 경우 비율 유지
        if (newWidth && !newHeight) {
            newHeight = Math.round(newWidth / aspectRatio);
        } else if (!newWidth && newHeight) {
            newWidth = Math.round(newHeight * aspectRatio);
        }
        
        // 이미지 리사이즈
        return await resizeImage(img, newWidth, newHeight);
    } catch (error) {
        console.error('이미지 리사이즈 미리보기 생성 실패:', error);
        return null;
    }
} 