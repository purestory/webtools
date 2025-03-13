#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
import traceback
from werkzeug.utils import secure_filename
import sys
import logging

# 로깅 설정
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# 이미지/자막 처리 모듈 임포트
from image_converter import image_handler
from subtitle_converter import subtitle_handler

app = Flask(__name__)
CORS(app)
app.debug = True  # 디버그 모드 활성화

# 최대 업로드 크기 설정 (100MB)
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024

# 업로드 폴더 설정
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
IMAGE_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, 'images')
SUBTITLE_UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, 'subtitles')

# 업로드 폴더 생성
os.makedirs(IMAGE_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SUBTITLE_UPLOAD_FOLDER, exist_ok=True)

# 파일 크기 계산 함수
def format_file_size(size_bytes):
    if size_bytes == 0:
        return "0B"
    size_names = ("B", "KB", "MB", "GB", "TB")
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024
        i += 1
    return f"{size_bytes:.2f} {size_names[i]}"

# 이미지 변환 API
@app.route('/api/convert-image', methods=['POST'])
def convert_image():
    try:
        logger.info("이미지 변환 API 호출됨")
        logger.info(f"요청 폼 데이터: {request.form}")
        
        # 요청 크기 정보 로깅
        content_length = request.headers.get('Content-Length')
        logger.info(f"요청 크기: {content_length} bytes")
        if content_length:
            logger.info(f"요청 크기(MB): {float(content_length) / (1024 * 1024):.2f} MB")
        
        # 요청 헤더 상세 로깅
        logger.debug("===== 요청 헤더 시작 =====")
        for header, value in request.headers:
            logger.debug(f"  {header}: {value}")
        logger.debug("===== 요청 헤더 끝 =====")
        
        # 요청 파일 세부 정보 로깅
        logger.debug(f"요청 파일 목록: {list(request.files.keys())}")
        
        # 파일 확인
        if 'file' not in request.files:
            logger.error("파일이 누락됨")
            return jsonify({'success': False, 'error': '파일이 누락되었습니다.'}), 400
        
        file = request.files['file']
        
        # 파일 객체 정보 로깅
        logger.debug(f"파일 객체 정보: {file}")
        logger.debug(f"파일 객체 타입: {type(file)}")
        
        if file.filename == '':
            logger.error("빈 파일명")
            return jsonify({'success': False, 'error': '파일을 선택해주세요.'}), 400
        
        # 파일 확장자 확인
        filename = secure_filename(file.filename)
        logger.info(f"원본 파일명: {file.filename}")
        logger.info(f"정리된 파일명: {filename}")
        
        # 원본 파일명과 정리된 파일명이 다르면 로그
        if file.filename != filename:
            logger.warning(f"파일명 변경됨: {file.filename} -> {filename}")
        
        # 파일 크기 측정 시도
        try:
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)  # 파일 포인터 초기화
            logger.info(f"파일 크기 (seek/tell): {file_size} bytes ({format_file_size(file_size)})")
        except Exception as e:
            logger.warning(f"파일 크기 측정 실패: {str(e)}")
        
        file_ext = os.path.splitext(filename)[1][1:].lower()
        
        logger.info(f"파일 형식 확인: {filename}, 확장자: {file_ext}")
        
        # 파일 MIME 타입 확인
        if file.content_type:
            logger.info(f"파일 MIME 타입: {file.content_type}")
            
            # 이미지가 아닌 경우 체크 (HEIF, AVIF 파일은 application/octet-stream으로 인식될 수 있음)
            # SVG 파일은 image/svg+xml 또는 application/xml, text/xml 등으로 인식될 수 있음
            if (not file.content_type.startswith('image/') and 
                not file_ext in ['heif', 'heic', 'avif', 'svg'] and
                not (file_ext == 'svg' and (file.content_type.startswith('application/') or 
                                           file.content_type.startswith('text/')))):
                logger.error(f"이미지 파일이 아님: {file.content_type}")
                return jsonify({'success': False, 'error': f'이미지 파일이 아닙니다: {file.content_type}'}), 400
        
        # 지원되는 입력 포맷 확인
        supported_input_formats = list(image_handler.SUPPORTED_FORMATS.keys())
        if file_ext not in supported_input_formats:
            logger.error(f"지원되지 않는 입력 형식: {file_ext}")
            return jsonify({
                'success': False,
                'error': f'지원되지 않는 입력 파일 형식입니다: {file_ext}. 지원되는 형식: {", ".join(supported_input_formats)}'
            }), 400
            
        # 업로드된 파일 저장 시도
        logger.debug(f"파일 저장 시도: {filename}")
        try:
            file_path = os.path.join(IMAGE_UPLOAD_FOLDER, filename)
            file.save(file_path)
            logger.debug(f"파일 저장 성공: {file_path}")
        except Exception as save_error:
            logger.error(f"파일 저장 실패: {str(save_error)}")
            logger.error(traceback.format_exc())
            return jsonify({'success': False, 'error': f'파일 저장 중 오류: {str(save_error)}'}), 500
        
        # 파일 크기 확인
        if os.path.exists(file_path):
            original_size = os.path.getsize(file_path)
            logger.info(f"저장된 파일 크기: {original_size} bytes ({format_file_size(original_size)})")
        else:
            logger.error(f"저장된 파일이 존재하지 않음: {file_path}")
            return jsonify({'success': False, 'error': '파일 저장 후 확인 실패'}), 500
        
        if original_size == 0:
            logger.error(f"빈 파일: {filename}")
            os.remove(file_path)  # 빈 파일 삭제
            return jsonify({'success': False, 'error': '빈 파일입니다.'}), 400
            
        # 이미지 파일인지 확인
        try:
            # SVG 파일은 PIL로 열 수 없으므로 별도 처리
            if file_ext == 'svg':
                logger.info(f"SVG 파일 확인: {filename}")
                # SVG 파일 유효성 간단 검사 (첫 줄에 svg 태그가 있는지 확인)
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read(1000)  # 처음 1000자만 읽음
                    if '<svg' not in content.lower():
                        logger.error(f"유효하지 않은 SVG 파일: {filename}")
                        os.remove(file_path)  # 잘못된 파일 삭제
                        return jsonify({'success': False, 'error': '유효한 SVG 파일이 아닙니다.'}), 400
            else:
                # 일반 이미지 파일 확인
                from PIL import Image
                logger.debug(f"PIL로 이미지 열기 시도: {file_path}")
                with Image.open(file_path) as img:
                    img_format = img.format
                    img_size = img.size
                    img_mode = img.mode
                    logger.info(f"이미지 확인: {filename}, 형식: {img_format}, 크기: {img_size}, 모드: {img_mode}")
                    
                    # 이미지 형식과 확장자가 일치하는지 확인
                    if img_format and img_format.lower() != file_ext.upper():
                        logger.warning(f"이미지 형식과 확장자 불일치: {img_format} != {file_ext}")
        except Exception as e:
            logger.error(f"이미지 열기 실패: {filename}, 오류: {str(e)}")
            logger.error(traceback.format_exc())
            os.remove(file_path)  # 잘못된 파일 삭제
            return jsonify({'success': False, 'error': f'유효한 이미지 파일이 아닙니다: {str(e)}'}), 400
        
        logger.info(f"파일 저장됨: {file_path}, 크기: {original_size}")
        
        # 변환 파라미터 가져오기
        output_format = request.form.get('format', '').lower()
        
        # 출력 형식 유효성 검사
        if not output_format:
            logger.error("형식 미지정")
            return jsonify({'success': False, 'error': '변환할 형식을 지정해주세요.'}), 400
        
        # 지원되는 형식 확인
        if output_format not in image_handler.SUPPORTED_FORMATS:
            logger.error(f"지원되지 않는 형식: {output_format}")
            return jsonify({
                'success': False,
                'error': f'지원되지 않는 출력 형식입니다: {output_format}. 지원되는 형식: {", ".join(image_handler.SUPPORTED_FORMATS.keys())}'
            }), 400
        
        # 선택적 파라미터
        width = height = quality = None
        try:
            width_str = request.form.get('width')
            height_str = request.form.get('height')
            quality_str = request.form.get('quality', '90')
            
            # 파라미터 로깅
            logger.debug(f"리사이즈 파라미터: width={width_str}, height={height_str}, quality={quality_str}")
            
            # 파라미터 변환
            width = int(width_str) if width_str and width_str.strip() else None
            height = int(height_str) if height_str and height_str.strip() else None
            quality = int(quality_str) if quality_str and quality_str.strip() else 90
            
            # 품질 범위 확인
            if quality < 1 or quality > 100:
                logger.error(f"잘못된 품질 값: {quality}")
                return jsonify({'success': False, 'error': '품질은 1에서 100 사이여야 합니다.'}), 400
                
            # 크기 범위 확인
            if width and width <= 0:
                logger.error(f"잘못된 너비 값: {width}")
                return jsonify({'success': False, 'error': '너비는 양수여야 합니다.'}), 400
                
            if height and height <= 0:
                logger.error(f"잘못된 높이 값: {height}")
                return jsonify({'success': False, 'error': '높이는 양수여야 합니다.'}), 400
                
        except ValueError as e:
            logger.error(f"파라미터 변환 오류: {str(e)}")
            return jsonify({'success': False, 'error': f'파라미터 값이 올바르지 않습니다: {str(e)}'}), 400
        
        # 디버깅 정보 출력
        logger.info(f"이미지 변환 요청: 파일={filename}, 형식={output_format}, 너비={width}, 높이={height}, 품질={quality}")
        
        # 이미지 처리 및 변환
        logger.debug(f"이미지 처리 시작: file_path={file_path}, filename={filename}, format={output_format}")
        try:
            result = image_handler.process_image(
                file_path, 
                filename, 
                output_format, 
                width=width, 
                height=height, 
                quality=quality
            )
            logger.debug(f"이미지 처리 완료: {result}")
        except Exception as process_error:
            logger.error(f"이미지 처리 중 예외 발생: {str(process_error)}")
            logger.error(traceback.format_exc())
            return jsonify({'success': False, 'error': f'이미지 처리 중 오류: {str(process_error)}'}), 500
        
        # 변환 결과 디버깅
        logger.info(f"이미지 변환 결과: {result}")
        
        # 변환 실패
        if not result.get('success'):
            logger.error(f"변환 실패: {result.get('error')}")
            return jsonify({
                'success': False,
                'error': result.get('error', '알 수 없는 오류가 발생했습니다.')
            }), 500
            
        # 변환 성공
        converted_path = result.get('converted_path')
        converted_name = os.path.basename(converted_path)
        
        response_data = {
            'success': True,
            'original_name': filename,
            'original_size': format_file_size(original_size),
            'converted_name': converted_name,
            'converted_size': format_file_size(result.get('converted_size')),
            'format': output_format.upper(),
            'download_url': f'/api/download/images/{converted_name}'
        }
        
        logger.info(f"응답 데이터: {response_data}")
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"이미지 변환 API 오류: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': f'서버 오류: {str(e)}'}), 500

# 자막 변환 API
@app.route('/api/convert-subtitle', methods=['POST'])
def convert_subtitle():
    try:
        # 파일 확인
        if 'file' not in request.files:
            return jsonify({'error': '파일이 누락되었습니다.'}), 400
    
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '파일을 선택해주세요.'}), 400
        
        # 업로드된 파일 저장
        filename = secure_filename(file.filename)
        file_path = os.path.join(SUBTITLE_UPLOAD_FOLDER, filename)
        file.save(file_path)
        original_size = os.path.getsize(file_path)
        
        # 변환 파라미터 가져오기
        output_format = request.form.get('format', '').lower()
        if not output_format:
            return jsonify({'error': '변환할 형식을 지정해주세요.'}), 400
        
        # 인코딩 파라미터 (선택적)
        encoding = request.form.get('encoding', 'auto')
        
        # 자막 처리 및 변환
        result = subtitle_handler.process_subtitle(file_path, filename, output_format, encoding)
        
        # 변환 실패
        if not result.get('success'):
            return jsonify({
                'success': False,
                'error': result.get('error', '알 수 없는 오류가 발생했습니다.')
            }), 500
            
        # 변환 성공
        converted_path = result.get('converted_path')
        converted_name = os.path.basename(converted_path)
        
        return jsonify({
            'success': True,
            'original_name': filename,
            'original_size': format_file_size(original_size),
            'converted_name': converted_name,
            'converted_size': format_file_size(result.get('converted_size')),
            'format': output_format.upper(),
            'download_url': f'/api/download/subtitles/{converted_name}'
        })
    
    except Exception as e:
        print(f"자막 변환 API 오류: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# 파일 다운로드 API
@app.route('/api/download/<folder>/<filename>', methods=['GET'])
def download_file(folder, filename):
    try:
        if folder not in ['images', 'subtitles']:
            return jsonify({'error': '잘못된 폴더 접근입니다.'}), 400
            
        upload_folder = IMAGE_UPLOAD_FOLDER if folder == 'images' else SUBTITLE_UPLOAD_FOLDER
        return send_from_directory(upload_folder, filename, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 서버 상태 확인 API
@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'online',
        'message': '이미지/자막 변환 서비스가 정상 작동 중입니다.'
    })

# Flask 개발 서버 실행 코드 제거
# WSGI 서버(Gunicorn)를 통해서만 실행되도록 함
# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True) 