# 프로젝트 개요

## 1. 시스템 아키텍처

### 1.1 서버 구성
- **웹 서버**: Nginx (포트 80)
- **애플리케이션 서버**: Gunicorn (Unix 소켓 통신)
- **백엔드**: Flask Python 애플리케이션
- **프론트엔드**: HTML, JavaScript, CSS (Netlify 배포)

### 1.2 프로세스 구조
1. **Nginx**
   - 정적 파일 서빙 (`/home/purestory/public_html/`)
   - API 요청 프록시 (엔드포인트 → Unix 소켓)
   - 클라이언트 최대 요청 크기: 100MB

2. **Gunicorn**
   - 워커 프로세스: 3개
   - Unix 소켓: `/home/purestory/public_html/backend/api/api.sock`
   - 설정:
     - 타임아웃: 300초
     - 로그 레벨: debug
     - 에러 로그: `/home/purestory/public_html/backend/api/gunicorn_error.log`

3. **Netlify**
   - 프론트엔드 호스팅
   - API 프록시 설정 (Netlify → 서버 API)
   - GitHub 저장소와 연동 자동 배포

## 2. 디렉토리 구조

```
/home/purestory/public_html/
├── backend/                # 백엔드 코드
│   └── api/                # 백엔드 API 서버
│       ├── app.py          # 메인 Flask 애플리케이션
│       ├── wsgi.py         # WSGI 진입점
│       ├── counter.py      # 방문자/변환 카운터 모듈
│       ├── image_converter/ # 이미지 변환 모듈
│       └── subtitle_converter/ # 자막 변환 모듈
├── frontend/               # 프론트엔드 코드 (Netlify 배포)
│   ├── js/                 # 프론트엔드 JavaScript
│   │   ├── api-config.js   # API 설정
│   │   ├── image-converter.js # 이미지 변환 UI 로직
│   │   ├── image-converter-wasm.js # 웹어셈블리 기반 이미지 변환 로직
│   │   └── subtitle-converter.js # 자막 변환 UI 로직
│   ├── css/                # 스타일시트
│   ├── images/             # 정적 이미지
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── netlify.toml        # Netlify 배포 설정
│   ├── index.html          # 메인 페이지
│   ├── image-converter.html # 서버 기반 이미지 변환 페이지
│   ├── image-converter-wasm.html # 클라이언트 기반 이미지 변환 페이지 (WebAssembly)
│   └── subtitle-converter.html # 자막 변환 페이지
├── old_files/              # 백업된 이전 파일들
├── venv/                   # Python 가상환경
├── start_server.sh         # 서버 시작 스크립트
└── stop_server.sh          # 서버 중지 스크립트
```

## 3. 주요 파일 기능

### 3.1 백엔드 (API)
- **app.py**
  - Flask 애플리케이션 메인
  - API 엔드포인트 정의
  - 파일 업로드/변환 처리
  - 에러 핸들링
  - CORS 설정

- **wsgi.py**
  - Gunicorn WSGI 진입점
  - 프로덕션 서버 설정

- **counter.py**
  - 방문자 수 카운터
  - 파일 변환 카운터
  - SQLite 데이터베이스 사용

### 3.2 프론트엔드
- **api-config.js**
  - API 환경 설정 (개발/배포)
  - API URL 생성 함수
  - Netlify 프록시 연동

- **image-converter.js**
  - 이미지 파일 업로드 처리
  - 이미지 변환 옵션 UI
  - API 통신
  - 결과 다운로드

- **image-converter-wasm.js**
  - 웹어셈블리 기반 클라이언트 사이드 이미지 변환
  - 이미지 압축 및 포맷 변환
  - 브라우저 이미지 압축 라이브러리 활용
  - 서버 통신 없이 로컬에서 처리

- **subtitle-converter.js**
  - 자막 파일 업로드
  - 자막 변환 옵션
  - API 통신
  - 결과 다운로드

- **netlify.toml**
  - Netlify 배포 설정
  - API 프록시 규칙
  - 캐싱 정책
  - SPA 라우팅 설정

### 3.3 서버 관리
- **start_server.sh**
  - 가상환경 활성화
  - Gunicorn 프로세스 시작
  - 로그 설정

- **stop_server.sh**
  - Gunicorn 프로세스 종료
  - 소켓 파일 정리

## 4. API 엔드포인트

### 4.1 이미지 변환
- **POST /convert-image**
  - 이미지 파일 업로드 및 변환
  - 지원 형식: jpg, jpeg, png, gif, bmp, tiff, webp, ico, svg, avif, heif, heic
  - 최대 파일 크기: 100MB

### 4.2 자막 변환
- **POST /convert-subtitle**
  - 자막 파일 업로드 및 변환
  - 지원 형식: srt, ass, ssa, vtt

### 4.3 파일 다운로드
- **GET /download/<folder>/<filename>**
  - 변환된 파일 다운로드

### 4.4 서버 상태 확인
- **GET /status**
  - 서버 상태 및 버전 정보 확인

## 5. 보안 및 제한사항
- 파일 업로드 크기 제한: 100MB
- 이미지 변환 시 BMP 형식은 3MB로 제한
- 허용된 파일 형식만 처리
- 업로드 파일명 보안 처리 (secure_filename)
- CORS 설정으로 허용된 도메인만 API 접근 가능
- Netlify 프록시를 통한 API 호출 지원

## 6. 로깅
- Gunicorn 에러 로그: `/backend/api/gunicorn_error.log`
- Gunicorn 액세스 로그: `/backend/api/gunicorn_access.log`
- 애플리케이션 로그 레벨: DEBUG

## 7. 시작/종료 방법
```bash
# 서버 시작
./start_server.sh

# 서버 종료
./stop_server.sh

# 로그 모니터링
tail -f backend/api/gunicorn_error.log
```

## 8. 프론트엔드 배포 방법

### 8.1 GitHub에 코드 푸시
```bash
# frontend 디렉토리로 이동
cd frontend

# 변경사항 커밋 및 푸시
git add .
git commit -m "변경 내용 설명"
git push origin master
```

### 8.2 Netlify 배포
- GitHub 저장소(purestory/webtools)에 푸시하면 자동으로 배포됨
- 배포 URL: https://webtoolss.netlify.app/
- 배포 상태는 Netlify 대시보드에서 확인 가능

## 9. 개발 환경 설정

### 9.1 백엔드 개발
```bash
# 가상환경 활성화
source venv/bin/activate

# 필요한 패키지 설치
pip install -r backend/requirements.txt

# 개발 모드로 실행
cd backend/api
python app.py
```

### 9.2 프론트엔드 개발
```bash
# API 설정 확인 (api-config.js)
cd frontend/js
# 개발 환경에서는 localhost:5000 사용

# 정적 파일 서버로 테스트
# VSCode에서 Live Server 확장 프로그램 사용 권장
``` 