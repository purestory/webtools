# 파일 변환 도구 프론트엔드

이 저장소는 파일 변환 도구의 프론트엔드 코드를 담고 있습니다. Netlify를 통해 배포됩니다.

## 특징

- 이미지 변환기: 다양한 이미지 형식 간 변환
- WebAssembly 이미지 변환기: 클라이언트측 이미지 처리
- 자막 변환기: 다양한 자막 형식 변환
- 반응형 디자인
- 다국어 지원 (한국어, 영어)

## 기술 스택

- HTML5
- CSS3
- JavaScript (ES6+)
- 모듈 시스템
- WebAssembly (이미지 처리용)

## 개발 환경 설정

로컬에서 개발 환경을 설정하려면:

1. 이 저장소를 복제합니다:
   ```
   git clone https://github.com/purestory/file-converters-frontend.git
   cd file-converters-frontend
   ```

2. 로컬 서버를 실행합니다 (예: VS Code의 Live Server 확장 사용):
   ```
   # VSCode에서 Live Server 확장을 설치하고
   # index.html을 열고 "Go Live" 버튼을 클릭합니다
   ```

3. 백엔드 연결:
   - 기본적으로 로컬 개발 환경에서는 `http://localhost:5000/api`를 API 서버로 사용합니다.
   - 필요한 경우 `js/api-config.js` 파일에서 API 엔드포인트를 변경할 수 있습니다.

## 배포

이 프로젝트는 Netlify를 통해 자동으로 배포됩니다:

1. GitHub 저장소에 변경 사항을 커밋하고 푸시합니다.
2. Netlify는 `main` 브랜치의 변경 사항을 감지하고 자동으로 배포합니다.

### Netlify 설정

`netlify.toml` 파일에는 다음 설정이 포함되어 있습니다:

- API 프록시: 백엔드 API로 요청을 전달합니다.
- 캐싱 전략: 정적 자산의 캐싱 시간을 설정합니다.

## 파일 구조

```
/
├── components/         # 재사용 가능한 HTML 컴포넌트
│   └── header.html    # 공통 헤더 컴포넌트
├── css/               # 스타일시트
│   ├── style.css      # 기본 스타일
│   └── header.css     # 헤더 전용 스타일
├── js/                # JavaScript 파일
│   ├── api-config.js  # API 구성 및 URL 생성
│   ├── header-loader.js  # 헤더 로딩 스크립트
│   └── image-converter.js # 이미지 변환 로직
├── images/            # 이미지 자원
├── *.html             # HTML 페이지들
└── netlify.toml       # Netlify 배포 설정
```

## API 연결

프론트엔드는 `https://itsmyzone.iptime.org/api/`를 통해 백엔드 API에 연결됩니다.
로컬 개발 환경에서는 `http://localhost:5000/api/`를 사용합니다.

## 라이선스

이 프로젝트는 개인 용도로 제작되었으며, 무단 복제 및 배포를 금지합니다. 