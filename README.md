# WebTools - 웹 기반 도구 모음집

WebTools는 React + Vite 기반의 현대적인 웹 도구 모음집입니다. 사용자가 브라우저에서 직접 다양한 작업을 수행할 수 있는 클라이언트 사이드 애플리케이션입니다.

## 🌟 주요 특징

- **🔒 개인정보 보호**: 모든 데이터 처리가 브라우저에서 이루어져 서버로 전송되지 않음
- **📱 반응형 디자인**: 모든 기기에서 최적화된 사용자 경험
- **⚡ 빠른 성능**: React + Vite로 구현된 SPA
- **🎨 일관된 디자인**: shadcn/ui 스타일 시스템 적용

## 🛠️ 포함된 도구들

### 🎵 Audio Editor
- 오디오 파일 편집 및 변환
- 파형 시각화 및 실시간 재생
- 페이드 인/아웃 효과
- 20가지 이상의 오디오/비디오 파일 형식 지원
- MP3 인코딩 및 다운로드

### 🖼️ Image Editor  
- 마우스로 직접 조작하는 이미지 크기 조절
- 드래그 앤 드롭으로 자르기 영역 설정
- 실시간 자르기 미리보기 및 핸들 조작
- 다중 파일 형식 변환 (PNG, JPG, WebP)
- 프리셋 크기 지원 및 비율 유지 옵션

### 📄 PDF Editor
- PDF 파일 병합, 편집, 고급 편집
- 페이지별 미리보기
- 페이지 회전, 삭제, 복제 기능
- 누적 회전 각도 추적

### 📱 QR Generator
- QR 코드 생성 및 커스터마이징
- URL, 텍스트, 연락처 등 다양한 형식 지원
- 색상 및 크기 조절

### 🌐 IP Info
- IP 주소 정보 조회
- 지리적 위치, ISP, 타임존 정보
- OpenStreetMap 임베드로 위치 시각화

### 🔢 Base64 Converter
- 텍스트 ↔ Base64 변환
- 실시간 인코딩/디코딩
- 복사 기능 지원

### 🔗 URL Encoder
- URL 인코딩/디코딩
- 특수문자 처리
- 실시간 변환

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치 및 실행
```bash
# 프로젝트 클론
git clone [repository-url]
cd webtools

# 의존성 설치
cd frontend
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 📁 프로젝트 구조

```
webtools/
├── frontend/                 # React + Vite 애플리케이션
│   ├── src/
│   │   ├── components/       # 재사용 가능한 컴포넌트
│   │   │   ├── AudioEditor.jsx
│   │   │   ├── ImageEditor.jsx
│   │   │   ├── PDFEditor.jsx
│   │   │   ├── QRGenerator.jsx
│   │   │   ├── Base64Converter.jsx
│   │   │   ├── IPInfo.jsx
│   │   │   ├── URLEncoder.jsx
│   │   │   └── Layout/
│   │   ├── pages/            # 페이지 컴포넌트
│   │   ├── hooks/            # 커스텀 훅
│   │   └── utils/            # 유틸리티 함수
│   ├── public/               # 정적 파일
│   ├── package.json          # 의존성 관리
│   └── vite.config.js        # Vite 설정
└── tmp/                      # 임시 파일
```

## 🛡️ 보안 및 개인정보

- **클라이언트 사이드 처리**: 모든 파일 처리가 브라우저에서 이루어짐
- **데이터 전송 없음**: 사용자 파일이 서버로 전송되지 않음
- **HTTPS 지원**: 보안 연결을 통한 안전한 사용

## 🌐 배포

### 라이브 데모
- URL: https://ai-open.kr/webtools/
- 서버: Nginx + Ubuntu

### 배포 설정
- 빌드 결과물: `frontend/dist/`
- 서빙 경로: `/home/purestory/webtools/frontend/dist/`
- Base URL: `/webtools/`

## 🔧 기술 스택

### Frontend
- **React 19** - UI 라이브러리
- **Vite** - 빌드 도구 및 개발 서버
- **React Router** - 클라이언트 사이드 라우팅

### 주요 라이브러리
- **@breezystack/lamejs** - MP3 인코딩
- **pdf-lib** - PDF 조작
- **pdfjs-dist** - PDF 렌더링
- **qrcode** - QR 코드 생성
- **wasm-media-encoders** - 미디어 인코딩

### 개발 도구
- **ESLint** - 코드 품질 관리
- **CSS Modules** - 스타일링

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 이슈를 생성해 주세요.

---

**WebTools** - 브라우저에서 바로 사용하는 편리한 웹 도구들 🛠️
