# PureStory 웹 애플리케이션 프로젝트

이 프로젝트는 이미지 변환, 자막 변환, PDF 편집 등 다양한 웹 기반 도구를 제공하는 웹 애플리케이션입니다.

## 프로젝트 구조

```
public_html/
├── api/                      # 백엔드 API 서버
│   ├── app.py                # Flask 애플리케이션 메인 파일
│   ├── wsgi.py               # WSGI 설정 파일
│   ├── image_converter/      # 이미지 변환 관련 모듈
│   ├── subtitle_converter/   # 자막 변환 관련 모듈
│   ├── uploads/              # 업로드된 파일 저장 디렉토리
│   ├── DEVELOPMENT_NOTES.md  # 개발 노트
│   └── test_*.py             # 테스트 파일들
├── css/                      # CSS 스타일시트
│   └── style.css             # 메인 스타일시트
├── js/                       # JavaScript 파일
│   ├── image-converter.js    # 이미지 변환 관련 스크립트
│   ├── image-converter-wasm.js # WebAssembly 기반 이미지 변환 스크립트
│   ├── image-resize.js       # 이미지 리사이징 스크립트
│   ├── subtitle-converter.js # 자막 변환 스크립트
│   └── main.js               # 공통 스크립트
├── images/                   # 이미지 리소스
│   ├── favicon/              # 파비콘 이미지
│   └── file-icon.png         # 파일 아이콘
├── uploads/                  # 업로드 파일 저장 디렉토리
├── venv/                     # Python 가상 환경
├── .git/                     # Git 저장소
├── .gitignore                # Git 무시 파일 목록
├── HTML 파일들:
│   ├── index.html            # 메인 페이지
│   ├── image-converter.html  # 서버 기반 이미지 변환 도구
│   ├── image-converter2.html # WebAssembly 기반 이미지 변환 도구
│   ├── image-resize.html     # 이미지 리사이징 도구
│   ├── image-editor.html     # 이미지 편집 도구
│   ├── pdf-editor.html       # PDF 편집 도구
│   ├── subtitle-converter.html # 자막 변환 도구
│   ├── subtitle-translator.html # 자막 번역 도구
│   └── programs.html         # 프로그램 목록 페이지
└── 유틸리티 스크립트:
    ├── start_server.sh       # 서버 시작 스크립트
    ├── stop_server.sh        # 서버 중지 스크립트
    ├── update_all_pages.py   # 모든 페이지 업데이트 스크립트
    ├── fix_nav.py            # 네비게이션 수정 스크립트
    └── create_favicon.py     # 파비콘 생성 스크립트
```

## 주요 기능

### 1. 이미지 변환 도구
- 다양한 이미지 포맷(JPG, PNG, WebP, GIF, BMP, TIFF, ICO, SVG, AVIF, HEIF/HEIC) 간 변환
- 이미지 최적화 및 리사이징
- 서버 기반 변환과 WebAssembly 기반 클라이언트 측 변환 두 가지 방식 제공

### 2. 자막 변환 도구
- 다양한 자막 포맷 간 변환
- 자막 번역 기능

### 3. PDF 편집 도구
- PDF 파일 편집 기능

## 기술 스택

- **프론트엔드**: HTML5, CSS3, JavaScript
- **백엔드**: Python Flask
- **이미지 처리**: 
  - 서버: Pillow/PIL
  - 클라이언트: Canvas API, WebAssembly
- **서버 배포**: Gunicorn WSGI 서버

## 설치 및 실행

### 필요 조건
- Python 3.6 이상
- 가상 환경 (venv)

### 설치 방법
```bash
# 가상 환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 필요한 패키지 설치
pip install flask pillow flask-cors gunicorn
```

### 서버 실행
```bash
# 서버 시작
./start_server.sh

# 서버 중지
./stop_server.sh
```

## 개발자

- GitHub: [purestory](https://github.com/purestory)

## 라이선스

이 프로젝트는 MIT 라이선스에 따라 배포됩니다. 