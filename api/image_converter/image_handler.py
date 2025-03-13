#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import uuid
from PIL import Image
import io
import traceback
import sys
import cairosvg
import pillow_heif
import numpy as np
import svgwrite

# AVIF/HEIF 포맷 등록
pillow_heif.register_heif_opener()

# 지원하는 이미지 포맷
SUPPORTED_FORMATS = {
    'jpg': 'JPEG',
    'jpeg': 'JPEG',
    'png': 'PNG',
    'gif': 'GIF',
    'bmp': 'BMP',
    'tiff': 'TIFF',
    'webp': 'WEBP',
    'ico': 'ICO',
    'svg': 'SVG',
    'avif': 'AVIF',
    'heif': 'HEIF',
    'heic': 'HEIF'
}

# 파일 확장자 추출 함수
def get_file_extension(filename):
    return os.path.splitext(filename)[1][1:].lower()

# 새 파일명 생성 함수
def generate_filename(original_filename, format):
    unique_id = uuid.uuid4().hex[:8]
    name_without_ext = os.path.splitext(original_filename)[0]
    return f"{name_without_ext}_{unique_id}.{format}"

# 파일 크기 계산 함수
def calculate_file_size(file_obj):
    file_obj.seek(0, os.SEEK_END)
    size = file_obj.tell()
    file_obj.seek(0)
    return size

# 파일 크기 포맷팅 함수
def format_file_size(size_in_bytes):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_in_bytes < 1024.0:
            return f"{size_in_bytes:.2f} {unit}"
        size_in_bytes /= 1024.0
    return f"{size_in_bytes:.2f} TB"

# 이미지 처리 함수
def process_image(file_path, original_filename, output_format, width=None, height=None, quality=90):
    try:
        print(f"[DEBUG] 이미지 처리 시작: 파일={original_filename}, 형식={output_format}")
        print(f"[DEBUG] 전체 경로: {file_path}")
        
        # 파일 존재 확인
        if not os.path.exists(file_path):
            print(f"[ERROR] 파일이 존재하지 않음: {file_path}")
            return {
                'success': False,
                'error': f'파일이 존재하지 않습니다: {original_filename}'
            }
        
        input_ext = get_file_extension(original_filename)
        print(f"[DEBUG] 입력 확장자: {input_ext}")
        
        # 출력 형식이 지원되는지 확인
        if output_format not in SUPPORTED_FORMATS:
            print(f"[ERROR] 지원되지 않는 출력 형식: {output_format}")
            return {
                'success': False,
                'error': f'지원되지 않는 출력 형식입니다: {output_format}'
            }
        
        # 파일 크기 확인 (용량 제한 없음 - 정보용으로만 사용)
        file_size = os.path.getsize(file_path)
        file_size_mb = file_size / (1024 * 1024)
        print(f"[INFO] 이미지 처리: {original_filename}, 크기: {file_size_mb:.2f}MB")
        
        # 크기 제한 및 자동 조정 설정
        # 대용량 이미지(10MB 이상)는 자동으로 리사이즈
        need_resize = file_size_mb > 10
        if need_resize:
            print(f"[INFO] 대용량 이미지 감지: {file_size_mb:.2f}MB, 자동 리사이즈 적용")
        
        # 새 파일 이름 생성
        new_filename = generate_filename(original_filename, output_format)
        output_path = os.path.join(os.path.dirname(file_path), new_filename)
        print(f"[DEBUG] 출력 파일 경로: {output_path}")
        
        # SVG 변환 로직
        if input_ext == 'svg':
            print(f"[DEBUG] SVG 파일 변환 시작")
            try:
                print(f"[DEBUG] SVG->{output_format} 변환 시작")
                
                # SVG -> SVG 변환은 단순 복사
                if output_format == 'svg':
                    print(f"[DEBUG] SVG->SVG 변환 (파일 복사)")
                    with open(file_path, 'rb') as src, open(output_path, 'wb') as dst:
                        dst.write(src.read())
                else:
                    # SVG -> 다른 형식 변환
                    # 먼저 SVG를 PNG로 변환한 후 다른 형식으로 변환
                    print(f"[DEBUG] SVG 변환 크기 설정: 1024x1024")
                    
                    # 임시 PNG 파일 생성
                    import tempfile
                    temp_png = os.path.join(os.path.dirname(file_path), f"temp_{uuid.uuid4().hex}.png")
                    print(f"[DEBUG] 임시 PNG 파일 생성: {temp_png}")
                    
                    try:
                        # cairosvg를 사용하여 SVG를 PNG로 변환
                        print(f"[DEBUG] cairosvg를 사용하여 SVG->PNG 변환 시작")
                        cairosvg.svg2png(url=file_path, write_to=temp_png, output_width=1024, output_height=1024)
                        print(f"[DEBUG] cairosvg 변환 완료")
                        
                        # PNG를 다른 형식으로 변환
                        print(f"[DEBUG] PNG->{output_format} 변환 시작")
                        img = Image.open(temp_png)
                        print(f"[DEBUG] 이미지 로드됨: {img.format}, {img.size}, {img.mode}")
                        
                        # 알파 채널 처리
                        if img.mode == 'RGBA' and output_format in ['jpg', 'jpeg']:
                            print(f"[DEBUG] 알파 채널 처리 (RGBA -> RGB)")
                            # 알파 채널이 있는 이미지를 JPEG로 변환할 때 배경을 흰색으로 설정
                            background = Image.new('RGB', img.size, (255, 255, 255))
                            background.paste(img, mask=img.split()[3])
                            img = background
                        
                        # 출력 형식에 따라 이미지 저장
                        if output_format in ['avif', 'heif', 'heic']:
                            # pillow_heif를 통해 HEIF/AVIF 저장
                            print(f"[DEBUG] pillow_heif로 저장 시작")
                            heif_file = pillow_heif.from_pillow(img)
                            heif_file.save(output_path, quality=quality)
                            print(f"[DEBUG] HEIF/AVIF 저장 완료: {output_path}")
                        elif output_format in ['jpg', 'jpeg', 'webp']:
                            print(f"[DEBUG] 이미지 저장 (품질 옵션 적용): {quality}")
                            img.save(output_path, format=SUPPORTED_FORMATS[output_format], quality=quality)
                        else:
                            print(f"[DEBUG] 이미지 저장 (기본 옵션)")
                            img.save(output_path, format=SUPPORTED_FORMATS[output_format])
                        
                        print(f"[DEBUG] 이미지 저장 완료: {output_path}")
                    except Exception as e:
                        print(f"[ERROR] SVG 변환 오류: {str(e)}")
                        traceback.print_exc()
                        return {
                            'success': False,
                            'error': f'SVG 변환 중 오류가 발생했습니다: {str(e)}'
                        }
                    finally:
                        # 임시 파일 삭제
                        if os.path.exists(temp_png):
                            os.remove(temp_png)
                            print(f"[DEBUG] 임시 파일 삭제: {temp_png}")
                
                # 결과 반환
                original_size = os.path.getsize(file_path)
                converted_size = os.path.getsize(output_path)
                print(f"[DEBUG] 변환 완료: 원본={format_file_size(original_size)}, 변환={format_file_size(converted_size)}")
                
                return {
                    'success': True,
                    'converted_path': output_path,
                    'original_size': original_size,
                    'converted_size': converted_size
                }
            except Exception as e:
                print(f"[ERROR] SVG 처리 오류: {str(e)}")
                traceback.print_exc()
                return {
                    'success': False,
                    'error': f'SVG 처리 중 오류가 발생했습니다: {str(e)}'
                }
        
        # AVIF/HEIF 변환 로직
        elif input_ext in ['avif', 'heif', 'heic']:
            print(f"[DEBUG] AVIF/HEIF 파일 변환 시작")
            try:
                # AVIF/HEIF 파일 열기
                print(f"[DEBUG] 이미지 열기 시도: {file_path}")
                
                try:
                    # pillow_heif로 직접 파일 열기
                    print(f"[DEBUG] pillow_heif로 직접 파일 열기 시도")
                    heif_img = pillow_heif.read_heif(file_path)
                    img = Image.frombytes(
                        heif_img.mode, 
                        heif_img.size, 
                        heif_img.data,
                        "raw",
                        heif_img.mode,
                        0,
                        1
                    )
                    print(f"[DEBUG] pillow_heif로 이미지 로드됨: 크기={heif_img.size}, 모드={heif_img.mode}")
                except Exception as heif_error:
                    print(f"[WARNING] pillow_heif로 열기 실패, PIL로 시도: {str(heif_error)}")
                    # 실패 시 PIL로 시도
                    img = Image.open(file_path)
                    print(f"[DEBUG] PIL로 이미지 로드됨: {img.format}, {img.size}, {img.mode}")
                
                # 이미지 저장
                print(f"[DEBUG] 이미지 저장 시작: {output_format}")
                
                try:
                    if output_format == 'svg':
                        print(f"[DEBUG] AVIF/HEIF에서 SVG로 변환 시작")
                        try:
                            # 이미지를 단순화하여 SVG로 변환
                            img_array = np.array(img)
                            height, width = img_array.shape[:2]
                            
                            # SVG 파일 생성
                            dwg = svgwrite.Drawing(output_path, profile='tiny', size=(width, height))
                            
                            # 배경 추가
                            dwg.add(dwg.rect(insert=(0, 0), size=(width, height), fill='white'))
                            
                            # 이미지를 단순화하여 SVG로 변환 (픽셀 기반 접근)
                            # 이미지를 더 작은 크기로 리사이즈하여 SVG 파일 크기 줄이기
                            scale_factor = max(1, min(width, height) // 100)
                            small_width = max(10, width // scale_factor)
                            small_height = max(10, height // scale_factor)
                            
                            small_img = img.resize((small_width, small_height), Image.LANCZOS)
                            small_array = np.array(small_img)
                            
                            # 픽셀 그리기
                            pixel_size = scale_factor
                            for y in range(small_height):
                                for x in range(small_width):
                                    pixel = small_array[y, x]
                                    if len(pixel) == 3:
                                        r, g, b = pixel
                                        color = f'rgb({r},{g},{b})'
                                    else:
                                        r, g, b, a = pixel
                                        if a < 128:  # 투명도가 높으면 건너뛰기
                                            continue
                                        color = f'rgb({r},{g},{b})'
                                    
                                    dwg.add(dwg.rect(
                                        insert=(x * pixel_size, y * pixel_size),
                                        size=(pixel_size, pixel_size),
                                        fill=color
                                    ))
                            
                            # SVG 파일 저장
                            dwg.save()
                            print(f"[DEBUG] SVG 파일 저장 완료: {output_path}")
                            
                        except Exception as e:
                            print(f"[ERROR] AVIF/HEIF를 SVG로 변환 중 오류: {str(e)}")
                            traceback.print_exc()
                            return {
                                'success': False,
                                'error': f'AVIF/HEIF를 SVG로 변환 중 오류가 발생했습니다: {str(e)}'
                            }
                    elif output_format in ['avif', 'heif', 'heic']:
                        # pillow_heif를 통해 HEIF/AVIF 저장
                        print(f"[DEBUG] pillow_heif로 저장 시작")
                        heif_file = pillow_heif.from_pillow(img)
                        heif_file.save(output_path, quality=quality)
                        print(f"[DEBUG] HEIF/AVIF 저장 완료: {output_path}")
                    elif output_format in ['jpg', 'jpeg', 'webp']:
                        print(f"[DEBUG] 이미지 저장 (품질 옵션 적용): {quality}")
                        img.save(output_path, format=SUPPORTED_FORMATS[output_format], quality=quality)
                    else:
                        print(f"[DEBUG] 이미지 저장 (기본 옵션)")
                        img.save(output_path, format=SUPPORTED_FORMATS[output_format])
                    
                    print(f"[DEBUG] 이미지 저장 완료: {output_path}")
                except Exception as save_error:
                    print(f"[ERROR] AVIF/HEIF 변환 오류: {str(save_error)}")
                    traceback.print_exc()
                    return {
                        'success': False,
                        'error': f'AVIF/HEIF 변환 중 오류가 발생했습니다: {str(save_error)}'
                    }
                
                # 결과 반환
                original_size = os.path.getsize(file_path)
                converted_size = os.path.getsize(output_path)
                print(f"[DEBUG] 변환 완료: 원본={format_file_size(original_size)}, 변환={format_file_size(converted_size)}")
                
                return {
                    'success': True,
                    'converted_path': output_path,
                    'original_size': original_size,
                    'converted_size': converted_size
                }
            except Exception as e:
                print(f"[ERROR] AVIF/HEIF 처리 오류: {str(e)}")
                traceback.print_exc()
                return {
                    'success': False,
                    'error': f'AVIF/HEIF 처리 중 오류가 발생했습니다: {str(e)}'
                }
        
        # 일반 이미지 변환 로직
        else:
            print(f"[DEBUG] 일반 이미지 처리 시작: {input_ext} -> {output_format}")
            try:
                # 이미지 열기
                print(f"[DEBUG] 이미지 열기 시도: {file_path}")
                img = Image.open(file_path)
                print(f"[DEBUG] 이미지 로드됨: {img.format}, {img.size}, {img.mode}")
                
                # GIF에서 JPG로 변환 시 모드 변환 처리
                if img.mode == 'P' and output_format in ['jpg', 'jpeg']:
                    print(f"[DEBUG] 팔레트 모드(P) 이미지를 RGB로 변환")
                    img = img.convert('RGB')
                
                # 이미지 크기 조정
                if need_resize:
                    img = resize_image_with_aspect_ratio(img)
                
                # 사용자 지정 크기 조정
                if width or height:
                    if width and height:
                        print(f"[DEBUG] 이미지 크기 조정: {width}x{height}")
                        img = img.resize((width, height), Image.LANCZOS)
                    elif width:
                        ratio = width / img.width
                        new_height = int(img.height * ratio)
                        print(f"[DEBUG] 이미지 너비 기준 비율 조정: {width}x{new_height}")
                        img = img.resize((width, new_height), Image.LANCZOS)
                    elif height:
                        ratio = height / img.height
                        new_width = int(img.width * ratio)
                        print(f"[DEBUG] 이미지 높이 기준 비율 조정: {new_width}x{height}")
                        img = img.resize((new_width, height), Image.LANCZOS)
                
                # 알파 채널 처리
                if img.mode == 'RGBA' and output_format in ['jpg', 'jpeg']:
                    print(f"[DEBUG] 알파 채널 처리 (RGBA -> RGB)")
                    # 알파 채널이 있는 이미지를 JPEG로 변환할 때 배경을 흰색으로 설정
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[3])
                    img = background
                
                # 출력 형식에 따라 이미지 저장
                print(f"[DEBUG] 이미지 저장 시작: {output_format}")
                
                try:
                    if output_format == 'svg':
                        print(f"[DEBUG] 일반 이미지에서 SVG로 변환 시작")
                        try:
                            # 이미지를 단순화하여 SVG로 변환
                            img_array = np.array(img)
                            height, width = img_array.shape[:2]
                            
                            # SVG 파일 생성
                            dwg = svgwrite.Drawing(output_path, profile='tiny', size=(width, height))
                            
                            # 배경 추가
                            dwg.add(dwg.rect(insert=(0, 0), size=(width, height), fill='white'))
                            
                            # 이미지를 단순화하여 SVG로 변환 (픽셀 기반 접근)
                            # 이미지를 더 작은 크기로 리사이즈하여 SVG 파일 크기 줄이기
                            scale_factor = max(1, min(width, height) // 100)
                            small_width = max(10, width // scale_factor)
                            small_height = max(10, height // scale_factor)
                            
                            small_img = img.resize((small_width, small_height), Image.LANCZOS)
                            small_array = np.array(small_img)
                            
                            # 픽셀 그리기
                            pixel_size = scale_factor
                            for y in range(small_height):
                                for x in range(small_width):
                                    pixel = small_array[y, x]
                                    # GIF 이미지 처리 (팔레트 모드)
                                    if isinstance(pixel, np.uint8):  # 단일 값인 경우 (팔레트 모드)
                                        # 팔레트에서 실제 RGB 값 가져오기
                                        if hasattr(img, 'palette') and img.palette:
                                            palette = img.palette.getdata()[1]
                                            idx = pixel * 3
                                            if idx + 2 < len(palette):
                                                r, g, b = palette[idx:idx+3]
                                                color = f'rgb({r},{g},{b})'
                                            else:
                                                color = 'rgb(0,0,0)'  # 기본값
                                        else:
                                            # 팔레트가 없는 경우 회색조로 처리
                                            color = f'rgb({pixel},{pixel},{pixel})'
                                    elif len(pixel) == 3:
                                        r, g, b = pixel
                                        color = f'rgb({r},{g},{b})'
                                    else:
                                        r, g, b, a = pixel
                                        if a < 128:  # 투명도가 높으면 건너뛰기
                                            continue
                                        color = f'rgb({r},{g},{b})'
                                    
                                    dwg.add(dwg.rect(
                                        insert=(x * pixel_size, y * pixel_size),
                                        size=(pixel_size, pixel_size),
                                        fill=color
                                    ))
                            
                            # SVG 파일 저장
                            dwg.save()
                            print(f"[DEBUG] SVG 파일 저장 완료: {output_path}")
                            
                        except Exception as e:
                            print(f"[ERROR] 이미지를 SVG로 변환 중 오류: {str(e)}")
                            traceback.print_exc()
                            return {
                                'success': False,
                                'error': f'이미지를 SVG로 변환 중 오류가 발생했습니다: {str(e)}'
                            }
                    elif output_format in ['avif', 'heif', 'heic']:
                        # pillow_heif를 통해 HEIF/AVIF 저장
                        print(f"[DEBUG] pillow_heif로 저장 시작")
                        heif_file = pillow_heif.from_pillow(img)
                        heif_file.save(output_path, quality=quality)
                        print(f"[DEBUG] HEIF/AVIF 저장 완료: {output_path}")
                    elif output_format in ['jpg', 'jpeg', 'webp']:
                        print(f"[DEBUG] 이미지 저장 (품질 옵션 적용): {quality}")
                        img.save(output_path, format=SUPPORTED_FORMATS[output_format], quality=quality)
                    else:
                        print(f"[DEBUG] 이미지 저장 (기본 옵션)")
                        img.save(output_path, format=SUPPORTED_FORMATS[output_format])
                    
                    print(f"[DEBUG] 이미지 저장 완료: {output_path}")
                except Exception as save_error:
                    print(f"[ERROR] 이미지 저장 오류: {str(save_error)}")
                    traceback.print_exc()
                    return {
                        'success': False,
                        'error': f'이미지 저장 중 오류가 발생했습니다: {str(save_error)}'
                    }
                
                # 결과 반환
                original_size = os.path.getsize(file_path)
                converted_size = os.path.getsize(output_path)
                print(f"[DEBUG] 변환 완료: 원본={format_file_size(original_size)}, 변환={format_file_size(converted_size)}")
                
                return {
                    'success': True,
                    'converted_path': output_path,
                    'original_size': original_size,
                    'converted_size': converted_size
                }
            except Exception as e:
                print(f"[ERROR] 이미지 처리 오류: {str(e)}")
                traceback.print_exc()
                return {
                    'success': False,
                    'error': f'이미지 처리 중 오류가 발생했습니다: {str(e)}'
                }
    except Exception as e:
        print(f"[ERROR] 예상치 못한 오류: {str(e)}")
        traceback.print_exc()
        return {
            'success': False,
            'error': f'예상치 못한 오류가 발생했습니다: {str(e)}'
        }

# 이미지 크기 조정 함수 (최대 크기 제한)
def resize_image_with_aspect_ratio(img, max_size=1920):
    width, height = img.size
    
    # 이미 크기가 작으면 조정하지 않음
    if width <= max_size and height <= max_size:
        print(f"[DEBUG] 이미지 크기가 이미 적절함: {width}x{height}, 리사이즈 불필요")
        return img
    
    # 가로/세로 중 큰 쪽을 기준으로 비율 계산
    if width > height:
        new_width = max_size
        new_height = int(height * (max_size / width))
    else:
        new_height = max_size
        new_width = int(width * (max_size / height))
    
    print(f"[DEBUG] 이미지 크기 자동 조정: {width}x{height} -> {new_width}x{new_height}")
    return img.resize((new_width, new_height), Image.LANCZOS) 