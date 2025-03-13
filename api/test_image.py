#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
from image_converter import image_handler

def test_process_image():
    # 테스트할 이미지 파일 경로
    image_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'images')
    
    # 디렉토리 내 파일 목록 출력
    print("이미지 업로드 디렉토리 파일:")
    files = os.listdir(image_dir)
    
    if not files:
        print("디렉토리에 파일이 없습니다.")
        return
    
    for i, file in enumerate(files):
        print(f"{i+1}. {file}")
    
    # 사용자가 테스트할 파일 선택
    try:
        idx = int(input("\n테스트할 파일 번호를 입력하세요: ")) - 1
        if idx < 0 or idx >= len(files):
            print("잘못된 번호입니다.")
            return
        
        test_file = files[idx]
        file_path = os.path.join(image_dir, test_file)
        
        # 출력 형식 선택
        output_format = input("변환할 형식을 입력하세요 (jpg, png, webp 등): ").lower()
        
        # 이미지 변환 테스트
        print(f"\n{test_file} 파일을 {output_format} 형식으로 변환 중...")
        result = image_handler.process_image(
            file_path,
            test_file,
            output_format,
            width=None,
            height=None,
            quality=90
        )
        
        # 결과 출력
        print("\n결과:")
        for key, value in result.items():
            print(f"{key}: {value}")
            
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_process_image() 