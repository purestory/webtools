#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import uuid
import chardet
import traceback
import pysrt
import webvtt

# 지원하는 자막 포맷
SUPPORTED_FORMATS = {
    'srt': 'SubRip',
    'vtt': 'WebVTT',
    'ass': 'Advanced SubStation Alpha',
    'ssa': 'SubStation Alpha'
}

def get_file_extension(filename):
    """파일 확장자를 추출합니다."""
    return os.path.splitext(filename)[1][1:].lower()

def generate_filename(original_filename, format):
    """변환된 파일의 이름을 생성합니다."""
    unique_id = uuid.uuid4().hex[:8]
    name_without_ext = os.path.splitext(original_filename)[0]
    return f"{name_without_ext}_{unique_id}.{format}"

def detect_encoding(file_path):
    """파일의 인코딩을 감지합니다."""
    with open(file_path, 'rb') as file:
        result = chardet.detect(file.read())
    return result['encoding']

def process_subtitle(file_path, original_filename, output_format, encoding='auto'):
    """자막 파일을 처리하고 변환합니다."""
    
    try:
        input_ext = get_file_extension(original_filename)
        
        # 출력 형식이 지원되는지 확인
        if output_format not in SUPPORTED_FORMATS:
            return {
                'success': False,
                'error': f'지원되지 않는 출력 형식입니다: {output_format}'
            }
        
        # 새 파일 이름 생성
        new_filename = generate_filename(original_filename, output_format)
        output_path = os.path.join(os.path.dirname(file_path), new_filename)
        
        # 파일 인코딩 감지 (auto 모드)
        if encoding == 'auto':
            detected_encoding = detect_encoding(file_path)
            encoding = detected_encoding if detected_encoding else 'utf-8'
        
        # SRT -> 다른 형식
        if input_ext == 'srt':
            try:
                subs = pysrt.open(file_path, encoding=encoding)
                
                # SRT -> SRT (그대로 저장 또는 인코딩 변환)
                if output_format == 'srt':
                    subs.save(output_path, encoding='utf-8')
                
                # SRT -> VTT
                elif output_format == 'vtt':
                    with open(output_path, 'w', encoding='utf-8') as vtt_file:
                        vtt_file.write('WEBVTT\n\n')
                        for sub in subs:
                            start = sub.start.to_time().strftime('%H:%M:%S.%f')[:-3]
                            end = sub.end.to_time().strftime('%H:%M:%S.%f')[:-3]
                            vtt_file.write(f"{start} --> {end}\n")
                            vtt_file.write(f"{sub.text}\n\n")
                
                # SRT -> ASS/SSA (기본 변환)
                elif output_format in ['ass', 'ssa']:
                    with open(output_path, 'w', encoding='utf-8') as ass_file:
                        ass_file.write('[Script Info]\n')
                        ass_file.write('Title: Converted Subtitle\n')
                        ass_file.write('ScriptType: v4.00+\n')
                        ass_file.write('PlayResX: 1280\n')
                        ass_file.write('PlayResY: 720\n\n')
                        ass_file.write('[V4+ Styles]\n')
                        ass_file.write('Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n')
                        ass_file.write('Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1\n\n')
                        ass_file.write('[Events]\n')
                        ass_file.write('Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n')
                        
                        for sub in subs:
                            start = sub.start.to_time().strftime('%H:%M:%S.%f')[:-4]
                            end = sub.end.to_time().strftime('%H:%M:%S.%f')[:-4]
                            text = sub.text.replace('\n', '\\N')
                            ass_file.write(f"Dialogue: 0,{start},{end},Default,,0,0,0,,{text}\n")
            
            except Exception as e:
                print(f"SRT 변환 오류: {str(e)}")
                traceback.print_exc()
                return {
                    'success': False,
                    'error': f'SRT 변환 중 오류가 발생했습니다: {str(e)}'
                }
                
        # VTT -> 다른 형식
        elif input_ext == 'vtt':
            try:
                # VTT 파일 로드
                vtt_subs = webvtt.read(file_path)
                
                # VTT -> VTT (그대로 저장 또는 인코딩 변환)
                if output_format == 'vtt':
                    with open(file_path, 'r', encoding=encoding) as src_file:
                        with open(output_path, 'w', encoding='utf-8') as dst_file:
                            dst_file.write(src_file.read())
                
                # VTT -> SRT
                elif output_format == 'srt':
                    with open(output_path, 'w', encoding='utf-8') as srt_file:
                        for i, caption in enumerate(vtt_subs, 1):
                            start = caption.start.replace('.', ',')
                            end = caption.end.replace('.', ',')
                            
                            srt_file.write(f"{i}\n")
                            srt_file.write(f"{start} --> {end}\n")
                            srt_file.write(f"{caption.text}\n\n")
                
                # VTT -> ASS/SSA (기본 변환)
                elif output_format in ['ass', 'ssa']:
                    with open(output_path, 'w', encoding='utf-8') as ass_file:
                        ass_file.write('[Script Info]\n')
                        ass_file.write('Title: Converted Subtitle\n')
                        ass_file.write('ScriptType: v4.00+\n')
                        ass_file.write('PlayResX: 1280\n')
                        ass_file.write('PlayResY: 720\n\n')
                        ass_file.write('[V4+ Styles]\n')
                        ass_file.write('Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n')
                        ass_file.write('Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1\n\n')
                        ass_file.write('[Events]\n')
                        ass_file.write('Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n')
                        
                        for caption in vtt_subs:
                            text = caption.text.replace('\n', '\\N')
                            ass_file.write(f"Dialogue: 0,{caption.start},{caption.end},Default,,0,0,0,,{text}\n")
            
            except Exception as e:
                print(f"VTT 변환 오류: {str(e)}")
                traceback.print_exc()
                return {
                    'success': False,
                    'error': f'VTT 변환 중 오류가 발생했습니다: {str(e)}'
                }
        
        # ASS/SSA -> 다른 형식 (기본 텍스트 변환)
        elif input_ext in ['ass', 'ssa']:
            try:
                # ASS/SSA 파일 로드 및 파싱
                with open(file_path, 'r', encoding=encoding) as ass_file:
                    lines = ass_file.readlines()
                
                # 자막 이벤트 행 추출
                events = []
                event_section = False
                format_line = None
                
                for line in lines:
                    line = line.strip()
                    if line.startswith('[Events]'):
                        event_section = True
                        continue
                    
                    if event_section:
                        if line.startswith('Format:'):
                            format_line = line[7:].strip()
                            format_fields = [field.strip() for field in format_line.split(',')]
                            text_index = format_fields.index('Text')
                            start_index = format_fields.index('Start')
                            end_index = format_fields.index('End')
                        
                        elif line.startswith('Dialogue:'):
                            parts = line[9:].split(',', len(format_fields) - 1)
                            if len(parts) >= text_index + 1:
                                start_time = parts[start_index]
                                end_time = parts[end_index]
                                text = parts[text_index].replace('\\N', '\n')
                                events.append((start_time, end_time, text))
                
                # ASS/SSA -> ASS/SSA (그대로 저장 또는 인코딩 변환)
                if output_format in ['ass', 'ssa']:
                    with open(file_path, 'r', encoding=encoding) as src_file:
                        with open(output_path, 'w', encoding='utf-8') as dst_file:
                            dst_file.write(src_file.read())
                
                # ASS/SSA -> SRT
                elif output_format == 'srt':
                    with open(output_path, 'w', encoding='utf-8') as srt_file:
                        for i, (start, end, text) in enumerate(events, 1):
                            # 시간 포맷 조정 (ASS -> SRT)
                            start = start.replace('.', ',')
                            end = end.replace('.', ',')
                            
                            srt_file.write(f"{i}\n")
                            srt_file.write(f"{start} --> {end}\n")
                            srt_file.write(f"{text}\n\n")
                
                # ASS/SSA -> VTT
                elif output_format == 'vtt':
                    with open(output_path, 'w', encoding='utf-8') as vtt_file:
                        vtt_file.write('WEBVTT\n\n')
                        
                        for start, end, text in events:
                            vtt_file.write(f"{start} --> {end}\n")
                            vtt_file.write(f"{text}\n\n")
            
            except Exception as e:
                print(f"ASS/SSA 변환 오류: {str(e)}")
                traceback.print_exc()
                return {
                    'success': False,
                    'error': f'ASS/SSA 변환 중 오류가 발생했습니다: {str(e)}'
                }
        
        # 지원되지 않는 형식
        else:
            return {
                'success': False,
                'error': f'지원되지 않는 입력 형식입니다: {input_ext}'
            }
        
        # 변환 결과 확인
        if os.path.exists(output_path):
            return {
                'success': True,
                'converted_path': output_path,
                'original_size': os.path.getsize(file_path),
                'converted_size': os.path.getsize(output_path)
            }
        else:
            return {
                'success': False,
                'error': '변환 후 파일을 찾을 수 없습니다.'
            }
    
    except Exception as e:
        print(f"자막 처리 오류: {str(e)}")
        traceback.print_exc()
        return {
            'success': False,
            'error': f'자막 처리 중 오류가 발생했습니다: {str(e)}'
        } 