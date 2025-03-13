#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import requests
import json

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
    # 문제가 있는 HEIF 파일 경로
    heif_path = "../api/uploads/images/ComfyUI_00684__8e5b9060.heif"
    
    if not os.path.exists(heif_path):
        print(f"파일이 존재하지 않습니다: {heif_path}")
        return
    
    print(f"파일 크기: {os.path.getsize(heif_path)} bytes")
    
    # HEIF -> JPG 변환 테스트
    print("\n=== 문제의 HEIF -> JPG 변환 테스트 ===")
    convert_image(heif_path, "jpg")
    
    print("\n테스트 완료!")

if __name__ == "__main__":
    main() 