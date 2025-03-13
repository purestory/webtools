#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import requests
import json
from PIL import Image
import numpy as np
import copy

# 지원하는 이미지 포맷
FORMATS = ['jpg', 'png', 'gif', 'bmp', 'webp', 'svg', 'avif', 'heif']

# 테스트 이미지 생성 함수
def create_test_images():
    images = {}
    
    # 테스트 PNG 이미지 생성
    png_path = "test_red.png"
    img = Image.new('RGB', (300, 200), color=(255, 0, 0))
    img.save(png_path)
    print(f"테스트 PNG 이미지 생성: {png_path}")
    images['png'] = png_path
    
    # 테스트 JPG 이미지 생성
    jpg_path = "test_green.jpg"
    img = Image.new('RGB', (300, 200), color=(0, 255, 0))
    img.save(jpg_path)
    print(f"테스트 JPG 이미지 생성: {jpg_path}")
    images['jpg'] = jpg_path
    
    # 테스트 GIF 이미지 생성
    gif_path = "test_blue.gif"
    img = Image.new('RGB', (300, 200), color=(0, 0, 255))
    img.save(gif_path)
    print(f"테스트 GIF 이미지 생성: {gif_path}")
    images['gif'] = gif_path
    
    # 테스트 BMP 이미지 생성
    bmp_path = "test_yellow.bmp"
    img = Image.new('RGB', (300, 200), color=(255, 255, 0))
    img.save(bmp_path)
    print(f"테스트 BMP 이미지 생성: {bmp_path}")
    images['bmp'] = bmp_path
    
    # 테스트 WEBP 이미지 생성
    webp_path = "test_purple.webp"
    img = Image.new('RGB', (300, 200), color=(128, 0, 128))
    img.save(webp_path)
    print(f"테스트 WEBP 이미지 생성: {webp_path}")
    images['webp'] = webp_path
    
    # 테스트 SVG 이미지 생성
    svg_path = "test_svg.svg"
    svg_content = '''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="200" fill="#ffffff" />
  <circle cx="150" cy="100" r="50" fill="#ff00ff" />
  <text x="150" y="100" font-family="Arial" font-size="24" text-anchor="middle" fill="#000000">SVG Test</text>
</svg>
'''
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"테스트 SVG 이미지 생성: {svg_path}")
    images['svg'] = svg_path
    
    # 테스트 AVIF 이미지는 변환을 통해 생성
    # 테스트 HEIF 이미지는 변환을 통해 생성
    
    return images

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
        try:
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                print(f"변환 성공: {os.path.basename(file_path)} -> {result['converted_name']}, 크기: {result['converted_size']}")
                return result
            else:
                print(f"변환 실패: {response.status_code}")
                print(response.text)
                return None
        except Exception as e:
            print(f"API 호출 오류: {str(e)}")
            return None

def main():
    # 테스트 이미지 생성
    print("=== 테스트 이미지 생성 ===")
    test_images = create_test_images()
    
    # 모든 형식 간의 상호 변환 테스트
    results = {fmt: {target_fmt: None for target_fmt in FORMATS} for fmt in FORMATS}
    
    print("\n=== 변환 테스트 시작 ===")
    
    # 기본 이미지 형식에서 다른 형식으로 변환
    initial_formats = list(test_images.keys())
    new_formats = {}
    
    for src_format in initial_formats:
        src_file = test_images[src_format]
        for target_format in FORMATS:
            if src_format == target_format:
                print(f"건너뛰기: {src_format} -> {target_format} (동일 형식)")
                continue
                
            print(f"\n=== {src_format.upper()} -> {target_format.upper()} 변환 테스트 ===")
            result = convert_image(src_file, target_format)
            results[src_format][target_format] = result
            
            # AVIF와 HEIF 형식의 테스트 이미지 생성 (첫 번째 변환 결과 사용)
            if target_format in ['avif', 'heif'] and target_format not in test_images and target_format not in new_formats:
                if result and result.get('success'):
                    # 다운로드 URL에서 파일 경로 추출
                    converted_file = result['download_url'].split('/')[-1]
                    converted_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'api', 'uploads', 'images', converted_file)
                    if os.path.exists(converted_path):
                        new_formats[target_format] = converted_path
                        print(f"테스트 {target_format.upper()} 이미지 추가: {converted_path}")
    
    # 새로 생성된 형식 추가
    test_images.update(new_formats)
    
    # 생성된 AVIF와 HEIF 이미지에서 다른 형식으로 변환
    for src_format in ['avif', 'heif']:
        if src_format in test_images:
            for target_format in FORMATS:
                if src_format == target_format:
                    continue
                    
                if results[src_format][target_format] is None:  # 아직 테스트하지 않은 경우만
                    print(f"\n=== {src_format.upper()} -> {target_format.upper()} 변환 테스트 ===")
                    result = convert_image(test_images[src_format], target_format)
                    results[src_format][target_format] = result
    
    # 결과 요약
    print("\n=== 변환 테스트 결과 요약 ===")
    for src_format in FORMATS:
        for target_format in FORMATS:
            if src_format == target_format:
                continue
                
            result = results[src_format][target_format]
            status = "성공" if result and result.get('success') else "실패"
            print(f"{src_format.upper()} -> {target_format.upper()}: {status}")
    
    print("\n테스트 완료!")

if __name__ == "__main__":
    main() 