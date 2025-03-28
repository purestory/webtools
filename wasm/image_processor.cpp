#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <vector>
#include <cmath>

using namespace emscripten;

// 이미지 처리 함수들
void processImage(uint8_t* data, int width, int height, int quality) {
    const int size = width * height * 4;
    
    // 품질에 따른 압축 레벨 계산
    const float compressionLevel = (100 - quality) / 100.0f;
    
    // 픽셀 데이터 처리
    for (int i = 0; i < size; i += 4) {
        // RGB 채널 처리 (알파 채널은 유지)
        for (int j = 0; j < 3; j++) {
            float value = data[i + j];
            
            // 품질에 따른 색상 양자화
            if (compressionLevel > 0) {
                int levels = std::max(2, static_cast<int>((1 - compressionLevel) * 255));
                value = std::round(value / 255.0f * (levels - 1)) * (255.0f / (levels - 1));
            }
            
            data[i + j] = static_cast<uint8_t>(std::min(255.0f, std::max(0.0f, value)));
        }
    }
}

// 이미지 크기 조정
void resizeImage(uint8_t* input, uint8_t* output, int srcWidth, int srcHeight, int dstWidth, int dstHeight) {
    const float scaleX = static_cast<float>(srcWidth) / dstWidth;
    const float scaleY = static_cast<float>(srcHeight) / dstHeight;
    
    for (int y = 0; y < dstHeight; y++) {
        for (int x = 0; x < dstWidth; x++) {
            const int srcX = static_cast<int>(x * scaleX);
            const int srcY = static_cast<int>(y * scaleY);
            
            const int dstIdx = (y * dstWidth + x) * 4;
            const int srcIdx = (srcY * srcWidth + srcX) * 4;
            
            // 픽셀 복사
            for (int i = 0; i < 4; i++) {
                output[dstIdx + i] = input[srcIdx + i];
            }
        }
    }
}

// 이미지 필터 적용
void applyFilter(uint8_t* data, int width, int height, const std::vector<float>& kernel) {
    const int kernelSize = static_cast<int>(sqrt(kernel.size()));
    const int kernelRadius = kernelSize / 2;
    
    std::vector<uint8_t> temp(width * height * 4);
    memcpy(temp.data(), data, temp.size());
    
    for (int y = kernelRadius; y < height - kernelRadius; y++) {
        for (int x = kernelRadius; x < width - kernelRadius; x++) {
            for (int c = 0; c < 3; c++) {
                float sum = 0;
                
                for (int ky = 0; ky < kernelSize; ky++) {
                    for (int kx = 0; kx < kernelSize; kx++) {
                        const int srcX = x + kx - kernelRadius;
                        const int srcY = y + ky - kernelRadius;
                        const float kernelValue = kernel[ky * kernelSize + kx];
                        
                        sum += temp[(srcY * width + srcX) * 4 + c] * kernelValue;
                    }
                }
                
                data[(y * width + x) * 4 + c] = static_cast<uint8_t>(std::min(255.0f, std::max(0.0f, sum)));
            }
            // 알파 채널 유지
            data[(y * width + x) * 4 + 3] = temp[(y * width + x) * 4 + 3];
        }
    }
}

// JavaScript에 노출할 함수들
EMSCRIPTEN_BINDINGS(image_processor) {
    function("processImage", &processImage);
    function("resizeImage", &resizeImage);
    function("applyFilter", &applyFilter);
} 