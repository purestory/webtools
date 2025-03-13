#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import sys
import os
import json

def test_image_conversion_api():
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
        
        # API 요청 준비
        url = 'http://localhost:5000/api/convert-image'
        
        # 폼 데이터 준비
        files = {'file': (test_file, open(file_path, 'rb'))}
        data = {'format': output_format}
        
        # 선택적 파라미터
        width = input("너비 (선택사항, 빈칸으로 두면 원본 크기): ")
        if width:
            data['width'] = int(width)
            
        height = input("높이 (선택사항, 빈칸으로 두면 원본 크기): ")
        if height:
            data['height'] = int(height)
            
        quality = input("품질 (1-100, 선택사항, 빈칸으로 두면 기본값 90): ")
        if quality:
            data['quality'] = int(quality)
        
        # API 요청
        print(f"\n{test_file} 파일을 {output_format} 형식으로 변환 요청 중...")
        print(f"요청 데이터: {data}")
        
        response = requests.post(url, files=files, data=data)
        
        # 응답 확인
        print(f"\n상태 코드: {response.status_code}")
        print(f"응답 헤더: {response.headers}")
        
        try:
            # JSON 응답 파싱 시도
            result = response.json()
            print("\nJSON 응답:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        except json.JSONDecodeError:
            # JSON이 아닌 경우 텍스트 응답 출력
            print("\n텍스트 응답:")
            print(response.text[:500])  # 너무 길면 잘라서 출력
            
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_image_conversion_api() 