#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
from PIL import Image
import pillow_heif

# HEIF 등록
pillow_heif.register_heif_opener()

def create_test_image(filename, width=300, height=200):
    img = Image.new('RGB', (width, height), color=(255, 0, 0))
    img.save(filename)
    print(f"테스트 이미지 생성: {filename}")
    return filename

def convert_to_heif(input_path, output_path, quality=90):
    print(f"HEIF 변환 시작: {input_path} -> {output_path}")
    
    # 이미지 열기
    with Image.open(input_path) as img:
        print(f"이미지 로드됨: {img.format}, {img.size}, {img.mode}")
        
        # pillow_heif를 통해 HEIF 저장
        print(f"pillow_heif로 저장 시작")
        heif_file = pillow_heif.from_pillow(img)
        heif_file.save(output_path, quality=quality)
        print(f"HEIF 저장 완료: {output_path}")
    
    # 결과 확인
    if os.path.exists(output_path):
        print(f"변환 성공: {output_path}, 크기: {os.path.getsize(output_path)} bytes")
        return True
    else:
        print(f"변환 실패: {output_path}")
        return False

def convert_to_avif(input_path, output_path, quality=90):
    print(f"AVIF 변환 시작: {input_path} -> {output_path}")
    
    # 이미지 열기
    with Image.open(input_path) as img:
        print(f"이미지 로드됨: {img.format}, {img.size}, {img.mode}")
        
        # pillow_heif를 통해 AVIF 저장
        print(f"pillow_heif로 저장 시작")
        heif_file = pillow_heif.from_pillow(img)
        heif_file.save(output_path, quality=quality)
        print(f"AVIF 저장 완료: {output_path}")
    
    # 결과 확인
    if os.path.exists(output_path):
        print(f"변환 성공: {output_path}, 크기: {os.path.getsize(output_path)} bytes")
        return True
    else:
        print(f"변환 실패: {output_path}")
        return False

def main():
    # 테스트 이미지 생성
    test_png = create_test_image("test_red.png")
    
    # PNG -> HEIF 변환 테스트
    print("\n=== PNG -> HEIF 변환 테스트 ===")
    convert_to_heif(test_png, "test_red.heif")
    
    # PNG -> AVIF 변환 테스트
    print("\n=== PNG -> AVIF 변환 테스트 ===")
    convert_to_avif(test_png, "test_red.avif")
    
    print("\n테스트 완료!")

if __name__ == "__main__":
    main() 