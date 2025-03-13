#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import requests
from PIL import Image
import io

# 테스트 이미지 생성
def create_test_image(width, height, color, filename):
    """지정된 크기와 색상으로 테스트 이미지를 생성합니다."""
    img = Image.new('RGB', (width, height), color)
    img.save(filename)
    print(f"테스트 이미지 생성: {filename}, 크기: {width}x{height}, 색상: {color}")
    return filename

# 이미지 변환 API 호출
def convert_image(file_path, output_format, width=None, height=None, quality=90):
    """이미지 변환 API를 호출하여 이미지를 변환합니다."""
    url = "http://localhost:5000/api/convert-image"
    
    # 파라미터 설정
    files = {'file': open(file_path, 'rb')}
    data = {'format': output_format, 'quality': str(quality)}
    
    if width:
        data['width'] = str(width)
    if height:
        data['height'] = str(height)
    
    # API 호출
    print(f"API 호출: {url}, 파일: {file_path}, 파라미터: {data}")
    response = requests.post(url, files=files, data=data)
    
    # 응답 확인
    if response.status_code == 200:
        result = response.json()
        print(f"변환 성공: {result}")
        return result
    else:
        print(f"변환 실패: {response.status_code}, {response.text}")
        return None

# 변환된 이미지 다운로드
def download_image(download_url, save_path):
    """변환된 이미지를 다운로드합니다."""
    url = f"http://localhost:5000{download_url}"
    response = requests.get(url)
    
    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            f.write(response.content)
        print(f"이미지 다운로드 완료: {save_path}")
        return save_path
    else:
        print(f"이미지 다운로드 실패: {response.status_code}, {response.text}")
        return None

# 이미지 크기 확인
def check_image_size(image_path):
    """이미지 파일의 크기를 확인합니다."""
    try:
        with Image.open(image_path) as img:
            width, height = img.size
            print(f"이미지 크기: {width}x{height}, 파일: {image_path}")
            return width, height
    except Exception as e:
        print(f"이미지 크기 확인 실패: {e}")
        return None, None

# 메인 테스트 함수
def main():
    # 테스트 디렉토리 설정
    test_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(test_dir, exist_ok=True)
    
    # 테스트 이미지 생성
    test_image_large = create_test_image(1000, 800, (255, 0, 0), os.path.join(test_dir, "test_large.png"))
    test_image_medium = create_test_image(500, 400, (0, 255, 0), os.path.join(test_dir, "test_medium.png"))
    test_image_small = create_test_image(200, 150, (0, 0, 255), os.path.join(test_dir, "test_small.png"))
    
    # 테스트 케이스 정의
    test_cases = [
        {"file": test_image_large, "format": "jpg", "width": 300, "height": 200, "name": "large_to_300x200"},
        {"file": test_image_large, "format": "jpg", "width": 200, "name": "large_to_width_200"},
        {"file": test_image_large, "format": "jpg", "height": 200, "name": "large_to_height_200"},
        {"file": test_image_medium, "format": "png", "width": 100, "height": 100, "name": "medium_to_100x100"},
        {"file": test_image_small, "format": "webp", "width": 400, "height": 300, "name": "small_to_400x300"},
    ]
    
    # 테스트 실행
    for i, test in enumerate(test_cases):
        print(f"\n===== 테스트 {i+1}: {test['name']} =====")
        
        # 원본 이미지 크기 확인
        orig_width, orig_height = check_image_size(test["file"])
        
        # 이미지 변환
        result = convert_image(
            test["file"], 
            test["format"], 
            width=test.get("width"), 
            height=test.get("height")
        )
        
        if result and result.get("success"):
            # 변환된 이미지 다운로드
            download_path = os.path.join(test_dir, f"result_{test['name']}.{test['format']}")
            downloaded = download_image(result["download_url"], download_path)
            
            if downloaded:
                # 변환된 이미지 크기 확인
                new_width, new_height = check_image_size(download_path)
                
                # 리사이즈 결과 검증
                if test.get("width") and test.get("height"):
                    # 너비와 높이 모두 지정한 경우
                    if new_width == test["width"] and new_height == test["height"]:
                        print(f"✅ 리사이즈 성공: {orig_width}x{orig_height} -> {new_width}x{new_height}")
                    else:
                        print(f"❌ 리사이즈 실패: 예상 크기 {test['width']}x{test['height']}, 실제 크기 {new_width}x{new_height}")
                elif test.get("width"):
                    # 너비만 지정한 경우
                    expected_height = int(orig_height * (test["width"] / orig_width))
                    if new_width == test["width"] and abs(new_height - expected_height) <= 1:
                        print(f"✅ 리사이즈 성공: {orig_width}x{orig_height} -> {new_width}x{new_height}")
                    else:
                        print(f"❌ 리사이즈 실패: 예상 크기 {test['width']}x{expected_height}, 실제 크기 {new_width}x{new_height}")
                elif test.get("height"):
                    # 높이만 지정한 경우
                    expected_width = int(orig_width * (test["height"] / orig_height))
                    if abs(new_width - expected_width) <= 1 and new_height == test["height"]:
                        print(f"✅ 리사이즈 성공: {orig_width}x{orig_height} -> {new_width}x{new_height}")
                    else:
                        print(f"❌ 리사이즈 실패: 예상 크기 {expected_width}x{test['height']}, 실제 크기 {new_width}x{new_height}")
        else:
            print("❌ 변환 실패")

if __name__ == "__main__":
    main() 