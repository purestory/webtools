# 이미지 변환 API 개발 노트

## 개요
이 문서는 이미지 변환 API 개발 과정에서 발생한 주요 문제점과 해결 방법을 기록합니다.

## 문제점 및 해결 방법

### 1. 대용량 파일 업로드 문제 (413 Request Entity Too Large)

#### 문제 상황
- 1MB 이상의 이미지 파일(예: angel-catwalk.png, 약 1.05MB) 업로드 시 "413 Request Entity Too Large" 오류 발생
- 클라이언트에서 서버로 큰 파일을 전송할 때 Nginx 및 Gunicorn에서 요청을 차단함

#### 원인 분석
- Nginx의 기본 요청 크기 제한(1MB)에 의해 차단됨
- Flask의 요청 크기 제한이 설정되지 않음
- Gunicorn의 요청 라인 및 필드 크기 제한이 작게 설정됨

#### 해결 방법
1. Nginx 설정 수정
   ```nginx
   # /etc/nginx/sites-available/purestory 파일에 추가
   client_max_body_size 100M;
   ```

2. Flask 애플리케이션 설정 수정
   ```python
   # app.py 파일에 추가
   app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB
   ```

3. Gunicorn 서비스 설정 수정
   ```
   # /etc/systemd/system/api-gunicorn.service 파일 수정
   ExecStart=/home/purestory/projects/convert/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 --limit-request-line 0 --limit-request-field_size 0 app:app
   ```

4. 시스템 서비스 재시작
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart api-gunicorn.service
   sudo systemctl restart nginx
   ```

### 2. API 오류 응답 형식 일관성 문제

#### 문제 상황
- API 응답 형식이 오류 유형에 따라 일관적이지 않음
- 일부 오류는 단순 문자열로 반환되고, 다른 오류는 JSON 객체로 반환됨

#### 해결 방법
- 모든 오류 응답에 일관된 JSON 형식 적용
  ```python
  # 변경 전
  return "파일을 선택해주세요.", 400
  
  # 변경 후
  return jsonify({'success': False, 'error': '파일을 선택해주세요.'}), 400
  ```

- 주요 오류 유형 처리:
  1. 파일 없음 오류
  2. 비이미지 파일 오류
  3. 지원되지 않는 형식 오류
  4. 품질/크기 파라미터 오류

### 3. 서비스 재시작 및 설정 적용 문제

#### 문제 상황
- 설정 파일을 수정한 후에도 변경 사항이 적용되지 않는 문제 발생
- Nginx 설정 파일이 한 줄로 압축되어 있어 편집이 어려움

#### 해결 방법
1. 설정 파일 포맷팅 및 재작성
   - 가독성 있게 들여쓰기 적용
   - 설정 지시어 구분

2. 서비스 재시작 순서 준수
   ```bash
   sudo systemctl daemon-reload  # 서비스 설정 변경 시 필수
   sudo systemctl restart api-gunicorn.service
   sudo systemctl restart nginx
   ```

3. 설정 적용 확인
   ```bash
   sudo nginx -t  # Nginx 설정 문법 검사
   sudo systemctl status api-gunicorn.service  # 서비스 상태 확인
   ```

## 성능 및 결과

### 이미지 변환 성능
- PNG → JPG 변환 예시:
  - angel-catwalk.png (1.05MB) → angel-catwalk.jpg (161KB)
  - 약 85% 용량 감소

### 대용량 파일 처리
- 최대 5MB 이상의 이미지 파일도 문제없이 처리 가능
- 다양한 이미지 형식(PNG, JPG, BMP, GIF 등) 간 변환 지원

## 향후 개선 사항
- 이미지 처리 중 진행 상태 표시
- 변환 히스토리 저장 및 조회 기능
- 배치 처리를 통한 다중 파일 변환 지원
- 이미지 처리 최적화로 변환 속도 개선 