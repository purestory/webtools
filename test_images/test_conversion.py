#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import requests
import json
from PIL import Image

# 테스트 이미지 생성
def create_test_image(filename, width=300, height=200):
    img = Image.new('RGB', (width, height), color=(255, 0, 0))
    img.save(filename)
    print(f"테스트 이미지 생성: {filename}")
    return filename

# API 호출 함수
def convert_image(file_path, output_format, quality=90):
    url = "http://127.0.0.1:5000/api/convert-image"
    
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f)}
        data = {
            'format': output_format,
            'quality': quality
        }
        
        print(f"API 호출: {file_path} -> {output_format}")
        response = requests.post(url, files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"변환 결과: {json.dumps(result, indent=2)}")
            return result
        else:
            print(f"오류 발생: {response.status_code}")
            print(response.text)
            return None

def main():
    # 테스트 이미지 생성
    test_png = create_test_image("test_red.png")
    
    # PNG -> HEIF 변환 테스트
    print("\n=== PNG -> HEIF 변환 테스트 ===")
    heif_result = convert_image(test_png, "heif")
    
    if heif_result and heif_result.get('success'):
        heif_file = heif_result.get('download_url').split('/')[-1]
        heif_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'api', 'uploads', 'images', heif_file)
        
        # HEIF -> JPG 변환 테스트
        print("\n=== HEIF -> JPG 변환 테스트 ===")
        convert_image(heif_path, "jpg")
    
    # PNG -> AVIF 변환 테스트
    print("\n=== PNG -> AVIF 변환 테스트 ===")
    avif_result = convert_image(test_png, "avif")
    
    if avif_result and avif_result.get('success'):
        avif_file = avif_result.get('download_url').split('/')[-1]
        avif_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'api', 'uploads', 'images', avif_file)
        
        # AVIF -> JPG 변환 테스트
        print("\n=== AVIF -> JPG 변환 테스트 ===")
        convert_image(avif_path, "jpg")
    
    print("\n테스트 완료!")

if __name__ == "__main__":
    main() 