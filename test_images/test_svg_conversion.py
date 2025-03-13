#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import requests
import json

# 테스트 SVG 파일 생성
def create_test_svg(filename, width=300, height=200):
    # 간단한 SVG 파일 내용 생성
    svg_content = f'''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="{width}" height="{height}" fill="#ffffff" />
  <circle cx="{width//2}" cy="{height//2}" r="{min(width, height)//4}" fill="#ff0000" />
  <text x="{width//2}" y="{height//2}" font-family="Arial" font-size="24" text-anchor="middle" fill="#000000">SVG Test</text>
</svg>
'''
    
    # 파일에 저장
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"테스트 SVG 이미지 생성: {filename}")
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
    # 테스트 SVG 이미지 생성
    test_svg = create_test_svg("test_svg.svg")
    
    # 테스트 PNG 이미지 생성 (SVG로 변환 테스트용)
    from PIL import Image
    test_png = "test_png_for_svg.png"
    img = Image.new('RGB', (300, 200), color=(0, 0, 255))
    img.save(test_png)
    print(f"테스트 PNG 이미지 생성: {test_png}")
    
    # SVG -> PNG 변환 테스트
    print("\n=== SVG -> PNG 변환 테스트 ===")
    convert_image(test_svg, "png")
    
    # SVG -> JPG 변환 테스트
    print("\n=== SVG -> JPG 변환 테스트 ===")
    convert_image(test_svg, "jpg")
    
    # SVG -> WEBP 변환 테스트
    print("\n=== SVG -> WEBP 변환 테스트 ===")
    convert_image(test_svg, "webp")
    
    # PNG -> SVG 변환 테스트 (이제 성공해야 함)
    print("\n=== PNG -> SVG 변환 테스트 ===")
    convert_image(test_png, "svg")
    
    print("\n테스트 완료!")

if __name__ == "__main__":
    main() 