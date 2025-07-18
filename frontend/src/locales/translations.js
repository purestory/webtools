export const translations = {
  ko: {
    // 공통
    common: {
      appName: "WebTools", // 앱 이름은 영어로 고정
      language: "언어",
      korean: "한국어",
      english: "English",
      back: "뒤로",
      home: "홈",
      upload: "업로드",
      download: "다운로드",
      convert: "변환",
      edit: "편집",
      save: "저장",
      cancel: "취소",
      delete: "삭제",
      clear: "초기화",
      apply: "적용",
      loading: "로딩중...",
      error: "오류",
      success: "성공",
      warning: "경고",
      info: "정보",
      copy: "복사",
      paste: "붙여넣기",
      select: "선택",
      deselect: "선택 해제",
      duplicate: "복제",
      move: "이동",
      rotate: "회전",
      resize: "크기 조절",
      close: "닫기",
      open: "열기",
      settings: "설정",
      examples: "예시",
      help: "도움말",
      format: "포맷",
      quality: "품질",
      size: "크기",
      filename: "파일명",
      width: "너비",
      height: "높이",
      encoding: "인코딩",
      decoding: "디코딩",
      validation: "검증",
      preview: "미리보기",
      input: "입력",
      output: "출력",
      result: "결과",
      options: "옵션",
      advanced: "고급",
      basic: "기본",
      text: "텍스트",
      file: "파일",
      url: "URL",
      image: "이미지",
      audio: "오디오",
      video: "비디오",
      pdf: "PDF",
      json: "JSON",
      base64: "Base64",
      qrcode: "QR 코드",
      location: "위치",
      information: "정보",
      pages: "페이지",
      page: "페이지",
      multipleFilesSupported: "여러 파일 선택 가능",
    },

    // 홈페이지
    home: {
      title: "현대적인 웹 도구 모음집",
      subtitle: "브라우저에서 바로 사용할 수 있는 다양한 편집 도구들을 제공합니다",
      features: {
        title: "주요 기능",
        secure: {
          title: "안전한 처리",
          description: "모든 파일은 브라우저에서만 처리되어 서버로 전송되지 않습니다"
        },
        fast: {
          title: "빠른 처리",
          description: "로컬에서 직접 처리하여 업로드/다운로드 시간이 없습니다"
        },
        easy: {
          title: "간편한 사용",
          description: "복잡한 설치 없이 브라우저에서 바로 사용할 수 있습니다"
        },
        allInOne: {
          title: "모든 도구가 한 곳에",
          description: "다양한 편집 도구를 하나의 플랫폼에서 제공합니다"
        }
      },
      tools: {
        audioEditor: {
          name: "Audio Editor",
          description: "오디오 파일을 자르고 편집할 수 있습니다",
          features: ["파형 시각화", "구간 선택 및 편집", "볼륨 조절", "페이드 효과"]
        },
        imageEditor: {
          name: "Image Editor", 
          description: "이미지 크기 조절 및 자르기 기능을 제공합니다",
          features: ["크기 조절", "자르기", "회전", "필터"]
        },
        imageConverter: {
          name: "Image Converter",
          description: "이미지 포맷을 변환하고 Windows 아이콘을 생성합니다",
          features: ["포맷 변환", "Windows 아이콘 생성", "품질 조절", "배치 처리"]
        },
        qrGenerator: {
          name: "QR Code Generator",
          description: "텍스트나 URL을 QR 코드로 변환합니다",
          features: ["텍스트 QR", "URL QR", "크기 조절", "색상 변경"]
        },
        base64Converter: {
          name: "Base64 Converter", 
          description: "텍스트를 Base64로 인코딩/디코딩합니다",
          features: ["인코딩", "디코딩", "파일 변환", "URL 안전"]
        },
        ipInfo: {
          name: "IP Information",
          description: "IP 주소의 위치 및 정보를 조회합니다",
          features: ["위치 정보", "ISP 정보", "시간대", "보안 정보"]
        },
        pdfEditor: {
          name: "PDF Editor",
          description: "PDF 파일을 편집하고 페이지를 관리합니다",
          features: ["페이지 분할", "병합", "회전", "텍스트 추출"]
        },
        urlEncoder: {
          name: "URL Encoder",
          description: "URL을 인코딩/디코딩합니다",
          features: ["URL 인코딩", "디코딩", "컴포넌트 분석", "안전 변환"]
        },
        jsonFormatter: {
          name: "JSON Formatter",
          description: "JSON 데이터를 포맷팅하고 검증합니다",
          features: ["포맷팅", "압축", "검증", "트리 뷰"]
        },
        textRepairer: {
          name: "Text Repairer",
          description: "Fix broken text and encoding issues",
          features: ["이스케이프 문자 변환", "인코딩 문제 수정", "줄바꿈 정규화", "유니코드 변환"]
        }
      }
    },

    // 오디오 편집기
    audioEditor: {
      title: "Audio Editor",
      description: "오디오 파일을 업로드하고 편집해보세요. 드래그 앤 드롭으로 쉽게 시작할 수 있습니다.",
      upload: {
        title: "파일을 여기에 드롭하세요",
        subtitle: "오디오나 비디오 파일을 클릭하여 선택하거나 드래그해서 올려주세요",
        fileInfo: "업로드된 파일 정보",
        fileName: "파일 이름",
        duration: "재생 시간",
        fileSize: "파일 크기"
      },
      controls: {
        playbackControls: "재생 컨트롤",
        selection: "구간 선택",
        startTime: "시작 시간",
        endTime: "종료 시간",
        clearSelection: "선택 해제",
        selectionEdit: "선택 영역 편집",
        keepSelection: "선택 구간만 유지",
        deleteSelection: "선택 구간 삭제",
        usage: "사용법:",
        usageDescription: "마우스로 드래그하거나 시간을 입력하여 구간을 선택한 후 버튼을 클릭하세요.",
        volumeControl: "볼륨 조절",
        amplify: "소리 증폭",
        reduce: "소리 감소",
        applyAmplify: "증폭 적용",
        applyReduce: "감소 적용",
        normalize: "정규화",
        reverse: "역재생",
        fadeIn: "페이드 인",
        fadeOut: "페이드 아웃",
        usage: "사용법:",
        usageText: "마우스로 드래그하거나 시간을 입력하여 구간을 선택한 후 버튼을 클릭하세요.",
        volumeControlTitle: "볼륨 조절",
        amplifyTitle: "증폭",
        reduceTitle: "감소",
        applyAmplifyButton: "증폭 적용",
        applyReduceButton: "감소 적용",
        fadeInButton: "페이드 인",
        fadeOutButton: "페이드 아웃",
        normalizeButton: "정규화",
        reverseButton: "역재생",
        fileFormat: "파일 형식:",
        downloadButton: "편집된 오디오 다운로드"
      },
      errors: {
        invalidFileType: "오디오 또는 비디오 파일만 업로드할 수 있습니다. (MP3, WAV, OGG, MP4, MOV, AVI 등)"
      }
    },

    // QR 코드 생성기
    qrGenerator: {
      title: "QR Code Generator",
      description: "텍스트나 URL을 QR 코드로 변환하여 다운로드하세요.",
      settings: "QR 코드 설정",
      settingsDescription: "변환할 내용과 QR 코드 옵션을 설정하세요.",
      quickExamples: "빠른 입력 예시",
      website: "웹사이트",
      wifi: "Wi-Fi",
      location: "위치",
      contact: "연락처",
      textInput: "텍스트 또는 URL",
      textPlaceholder: "QR 코드로 변환할 텍스트나 URL을 입력하세요...",
      quickGenerate: "Ctrl + Enter로 빠르게 생성할 수 있습니다.",
      sizeLabel: "QR 코드 크기",
      marginLabel: "여백 크기",
      sizeSmall: "작게 (128px)",
      sizeMedium: "보통 (256px)",
      sizeLarge: "크게 (512px)",
      sizeXLarge: "매우 크게 (1024px)",
      marginVerySmall: "매우 적게",
      marginSmall: "적게",
      marginMedium: "보통",
      marginLarge: "많게",
      marginVeryLarge: "매우 많게",
      generate: "QR 코드 생성",
      generatedTitle: "생성된 QR 코드",
      tips: "사용 팁",
      tip1: "QR 코드는 URL, 텍스트, 연락처 정보 등 다양한 데이터를 저장할 수 있습니다.",
      tip2: "크기가 클수록 더 많은 데이터를 저장할 수 있으며, 인식률도 높아집니다.",
      tip3: "Wi-Fi 정보는 'WIFI:T:WPA;S:네트워크명;P:비밀번호;;' 형식으로 입력하세요.",
      errorEmpty: "텍스트나 URL을 입력해주세요.",
      errorGenerate: "QR 코드 생성 중 오류가 발생했습니다: {error}"
    },

    // Base64 변환기
    base64Converter: {
      title: "Base64 Converter",
      description: "텍스트를 Base64로 인코딩하거나 Base64를 텍스트로 디코딩합니다.",
      mode: "변환 모드",
      modeDescription: "인코딩 또는 디코딩 모드를 선택하세요.",
      encodeMode: "텍스트 → Base64 (인코딩)",
      decodeMode: "Base64 → 텍스트 (디코딩)",
      inputLabel: "변환할 텍스트",
      base64Label: "Base64 문자열",
      inputPlaceholder: "여기에 텍스트를 입력하세요...",
      base64Placeholder: "Base64 문자열을 입력하세요...",
      encode: "인코딩",
      decode: "디코딩",
      swap: "입력/출력 바꾸기",
      resultTitle: "결과",
      resultBase64: "Base64 결과",
      resultText: "텍스트 결과",
      charactersCount: "{count} 문자",
      errorEmpty: "변환할 텍스트를 입력해주세요.",
      errorEncode: "인코딩 중 오류가 발생했습니다: {error}",
      errorDecode: "디코딩 중 오류가 발생했습니다. 올바른 Base64 문자열인지 확인해주세요."
    },

    // IP 정보 조회
    ipInfo: {
      title: "IP Information",
      description: "IP 주소의 위치, ISP, 타임존 등 상세 정보를 조회합니다.",
      inputTitle: "IP 주소 입력",
      inputDescription: "조회할 IP 주소를 입력하거나 현재 IP를 확인하세요.",
      ipLabel: "IP 주소",
      ipPlaceholder: "예: 8.8.8.8 또는 2001:4860:4860::8888",
      lookup: "IP 정보 조회",
      lookupInProgress: "조회 중...",
      myIp: "내 IP 조회",
      resultTitle: "IP 정보: {ip}",
      locationInfo: "위치 정보",
      country: "국가",
      region: "지역",
      city: "도시",
      zipCode: "우편번호",
      coordinates: "좌표",
      timezone: "시간대",
      networkInfo: "네트워크 정보",
      isp: "인터넷 서비스 제공업체",
      organization: "조직",
      asNumber: "AS 번호",
      securityInfo: "보안 정보",
      proxy: "프록시",
      vpn: "VPN",
      tor: "Tor",
      hosting: "호스팅",
      yes: "예",
      no: "아니오",
      unknown: "알 수 없음",
      mapView: "지도에서 보기",
      moreInfo: "더 많은 정보",
      errorEmpty: "IP 주소를 입력해주세요.",
      errorInvalid: "올바른 IP 주소 형식이 아닙니다.",
      errorFetch: "IP 정보를 가져오는 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.",
      errorMyIp: "내 IP 주소를 가져오는 중 오류가 발생했습니다.",
      errorReason: "IP 정보를 가져올 수 없습니다."
    },

    // PDF 편집기
    pdfEditor: {
      title: "PDF Editor",
      description: "PDF 파일을 편집하고 페이지를 관리하세요.",
      modeSelection: "편집 모드 선택",
      mergeMode: "PDF 병합",
      mergeModeDescription: "여러 PDF 파일을 하나로 합치기",
      mergeFeatures: ["여러 파일 선택", "페이지 범위 지정", "파일 순서 변경"],
      editMode: "PDF 편집",
      editModeDescription: "페이지 범위를 지정하여 편집",
      editFeatures: ["페이지 범위 지정", "페이지 삭제", "페이지 회전"],
      advancedMode: "고급 편집",
      advancedModeDescription: "페이지별 미리보기와 세부 편집",
      advancedFeatures: ["페이지 미리보기", "개별 페이지 조작", "실시간 편집"],
      fileSelect: "PDF 파일 선택",
      fileSelectDescription: "편집할 PDF 파일을 선택하세요.",
      filesSelected: "선택된 파일",
      fileName: "파일명",
      fileSize: "파일 크기",
      pageCount: "페이지 수",
      pageRange: "페이지 범위",
      allPages: "전체 페이지",
      customRange: "사용자 지정 범위",
      rangeExample: "예: 1-5, 7, 9-12",
      moveUp: "위로 이동",
      moveDown: "아래로 이동",
      remove: "제거",
      merge: "병합",
      extract: "추출",
      rotate90: "90° 회전",
      rotate180: "180° 회전",
      rotate270: "270° 회전",
      deletePages: "페이지 삭제",
      duplicatePage: "페이지 복제",
      previewTitle: "미리보기",
      selectedPages: "{count}개 페이지 선택됨",
      selectAll: "전체 선택",
      deselectAll: "선택 해제",
      processing: "처리 중...",
      errorMinFiles: "최소 2개의 PDF 파일이 필요합니다.",
      errorFileFormat: "PDF 파일만 선택해주세요.",
      errorProcessing: "PDF 처리 중 오류가 발생했습니다.",
      errorPageRange: "올바른 페이지 범위를 입력해주세요.",
      errorNoSelection: "선택된 페이지가 없습니다.",
      rotatedPages: "회전된 페이지",
      deletedPages: "삭제된 페이지",
      finalPages: "최종 페이지",
      rotateLeft: "왼쪽 회전 (-90°)",
      rotateRight: "오른쪽 회전 (+90°)",
      extractSelected: "선택 페이지 추출",
      deleted: "삭제됨",
      restore: "복원"
    },

    // URL 인코더
    urlEncoder: {
      title: "URL Encoder",
      description: "URL에 안전하게 사용할 수 있도록 텍스트를 인코딩하거나 인코딩된 URL을 디코딩합니다.",
      settings: "변환 설정",
      settingsDescription: "변환 모드와 인코딩 타입을 선택하세요.",
      mode: "변환 모드",
      encodeMode: "텍스트 → URL 인코딩",
      decodeMode: "URL 디코딩 → 텍스트",
      encodingType: "인코딩 타입",
      componentType: "Component (완전 인코딩)",
      uriType: "URI (기본 인코딩)",
      examples: "변환 예시",
      examplesDescription: "클릭하여 예시를 입력 필드에 로드할 수 있습니다.",
      inputLabel: "텍스트 또는 URL",
      inputPlaceholder: "인코딩하거나 디코딩할 텍스트를 입력하세요...",
      quickTips: "사용 팁",
      tip1: "Component 인코딩은 모든 특수문자를 인코딩하여 URL 매개변수에 안전합니다.",
      tip2: "URI 인코딩은 URL 구조를 유지하면서 안전하지 않은 문자만 인코딩합니다.",
      tip3: "한글과 같은 유니코드 문자는 UTF-8로 인코딩됩니다.",
      errorEmpty: "변환할 텍스트를 입력해주세요.",
      errorEncode: "인코딩 중 오류가 발생했습니다: {error}",
      errorDecode: "디코딩 중 오류가 발생했습니다. 올바른 URL 인코딩 문자열인지 확인해주세요."
    },

    // JSON 포맷터
    jsonFormatter: {
      title: "JSON Formatter",
      description: "JSON 데이터를 포맷팅하고 검증하여 가독성을 높입니다.",
      settingsTitle: "설정",
      settingsDescription: "JSON 포맷팅 옵션을 설정하세요",
      indentSize: "들여쓰기 크기:",
      loadSample: "샘플 데이터 로드",
      clearAll: "전체 지우기",
      inputTitle: "JSON 입력",
      inputDescription: "포맷팅하거나 검증할 JSON을 입력하세요",
      inputPlaceholder: '{"name": "example", "value": 123}',
      format: "포맷팅",
      minify: "압축",
      validate: "검증",
      outputTitle: "포맷팅된 JSON",
      outputDescription: "포맷팅된 결과입니다",
      validJson: "유효한 JSON입니다",
      invalidJson: "유효하지 않은 JSON입니다",
      copied: "클립보드에 복사되었습니다!",
      errorEmpty: "입력할 JSON 텍스트를 입력해주세요.",
      errorValidateEmpty: "검증할 JSON 텍스트를 입력해주세요.",
      errorCopyEmpty: "복사할 내용이 없습니다.",
      errorCopyFailed: "클립보드 복사에 실패했습니다.",
      errorParse: "JSON 파싱 오류: {error}",
      errorValidate: "JSON 유효성 검사 실패: {error}"
    },

    // 이미지 편집기
    imageEditor: {
      title: "Image Editor",
      description: "이미지 크기 조절, 자르기, 회전 등 다양한 편집 기능을 제공합니다.",
      upload: {
        title: "이미지를 여기에 드롭하세요",
        subtitle: "이미지 파일을 클릭하여 선택하거나 드래그해서 올려주세요",
        supportedFormats: "지원 형식: JPG, PNG, GIF, BMP, WEBP 등"
      },
      resize: "크기 조절",
      resizeDescription: "이미지 크기를 변경하고 비율을 조정하세요.",
      mode: "모드",
      manualMode: "수동 조절",
      presetMode: "프리셋 크기",
      cropMode: "자르기",
      dimensions: "크기",
      newDimensions: "새로운 크기",
      maintainRatio: "비율 유지",
      presetSizes: "프리셋 크기",
      scaleResize: "비율로 크기 변경",
      scale25: "25%",
      scale50: "50%",
      scale75: "75%",
      scale150: "150%",
      scale200: "200%",
      applyResize: "크기 조절 적용",
      cropSettings: "자르기 설정", 
      crop: "자르기",
      cropDescription: "마우스로 드래그하여 자를 영역을 선택하세요.",
      startCrop: "자르기 시작",
      exitCrop: "자르기 완료",
      applyCrop: "자르기 적용",
      cropArea: "자르기 영역",
      cropPosition: "자르기 위치",
      cropSize: "자르기 크기",
      resetOriginal: "원본으로 되돌리기",
      export: "내보내기",
      exportDescription: "편집된 이미지를 다운로드하세요.",
      exportFormat: "내보내기 형식",
      jpegQuality: "JPEG 품질",
      downloadImage: "이미지 다운로드",
      errorImageOnly: "이미지 파일만 업로드할 수 있습니다.",
      errorImageLoad: "이미지를 불러올 수 없습니다.",
      uploadTitle: "이미지 업로드",
      uploadDescription: "이미지를 드래그하거나 클릭해서 선택하세요",
      selectImage: "이미지 선택",
      selectNewFile: "새 파일 선택",
      undo: "수정 취소",
      errorInvalidDimensions: "올바른 크기를 입력해주세요.",
      errorApplyResize: "크기 조절을 적용할 수 없습니다.",
      currentSize: "현재 크기: {width} x {height}"
    },

    // 이미지 변환기
    imageConverter: {
      title: "Image Converter",
      description: "이미지 포맷 변환 및 Windows 아이콘 생성을 지원합니다.",
      upload: {
        title: "이미지 업로드",
        subtitle: "변환할 이미지 파일을 드래그하거나 클릭해서 선택하세요",
        supportedFormats: "지원 형식: JPG, PNG, GIF, BMP, WEBP, SVG, ICO, HEIC, TIFF 등",
        rawWarning: "RAW 파일은 브라우저에서 직접 처리할 수 없습니다. JPG/PNG로 먼저 변환해주세요.",
        heicWarning: "HEIC/HEIF 파일은 일부 브라우저에서 지원되지 않을 수 있습니다."
      },
      original: "원본",
      newImage: "새 이미지 선택",
      conversion: "변환 설정",
      conversionDescription: "변환할 형식과 품질을 선택하세요.",
      filename: "파일명",
      filenamePlaceholder: "파일명 입력",
      singleConversion: "단일 형식 변환",
      outputFormat: "출력 형식",
      pngLossless: "PNG (무손실)",
      jpgCompressed: "JPG (압축)",
      webpModern: "WebP (최신)",
      qualityLabel: "품질",
      formatConvert: "형식 변환",
      iconGeneration: "윈도우 아이콘 생성",
      iconDescription: "윈도우 아이콘에서 사용하는 표준 사이즈로 일괄 변환합니다.",
      pngFilesGenerate: "PNG 파일 생성",
      icoFileGenerate: "ICO 파일 생성 (통합)",
      results: "변환 결과",
      allDownload: "전체 다운로드",
      filesGenerated: "{count}개 파일 생성됨",
      noResults: "변환된 이미지가 여기에 표시됩니다",
      converting: "변환 중...",
      errorUnsupported: "지원되지 않는 이미지 형식입니다: {format}",
      errorImageLoad: "이미지를 불러올 수 없습니다. {format} 형식이 지원되지 않을 수 있습니다.",
      errorSupportedOnly: "지원되는 이미지 파일만 업로드할 수 있습니다.",
      iconSizes: "아이콘 크기",
      selectSizes: "생성할 아이콘 크기를 선택하세요",
      standardSizes: "표준 크기",
      customSize: "사용자 정의 크기",
      addCustomSize: "사용자 정의 크기 추가"
    },

    // 텍스트 복구 도구 페이지
    textRepairer: {
      title: "Text Repairer",
      description: "Fix broken text with escape characters, encoding issues, and line break problems.",
      input: {
        title: "입력 텍스트",
        placeholder: "복구할 텍스트를 입력하거나 붙여넣으세요...\n\n예시:\n\"\"\"\\n제목: 샘플 텍스트\\n작성자: 홍길동\\n\"\"\""
      },
      output: {
        title: "복구된 텍스트",
        placeholder: "복구된 텍스트가 여기에 표시됩니다..."
      },
      mode: {
        label: "복구 모드",
        escapeChars: "이스케이프 문자 (\\n, \\t 등)",
        unicodeEscape: "유니코드 이스케이프 (\\u0000, \\x00)",
        jsonString: "JSON 문자열 형식",
        encodingFix: "인코딩 문제",
        lineBreaks: "줄바꿈 정규화",
        all: "모든 복구 (권장)"
      },
      encoding: {
        label: "파일 인코딩"
      },
      upload: {
        button: "텍스트 파일 업로드"
      },
      process: {
        button: "텍스트 복구"
      },
      examples: {
        title: "예시",
        before: "복구 전 (깨진 텍스트)",
        after: "복구 후 (정상 텍스트)"
      },
      errors: {
        invalidFileType: "텍스트 파일만 지원됩니다 (txt, js, json, html, css, md, log, conf, ini, yml, yaml)."
      }
    }
  },

  en: {
    // Common
    common: {
      appName: "WebTools", // App name fixed in English
      language: "Language",
      korean: "한국어",
      english: "English",
      back: "Back",
      home: "Home",
      upload: "Upload",
      download: "Download",
      convert: "Convert",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      clear: "Clear",
      apply: "Apply",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Info",
      copy: "Copy",
      paste: "Paste",
      select: "Select",
      deselect: "Deselect",
      duplicate: "Duplicate",
      move: "Move",
      rotate: "Rotate",
      resize: "Resize",
      close: "Close",
      open: "Open",
      settings: "Settings",
      examples: "Examples",
      help: "Help",
      format: "Format",
      quality: "Quality",
      size: "Size",
      filename: "Filename",
      width: "Width",
      height: "Height",
      encoding: "Encoding",
      decoding: "Decoding",
      validation: "Validation",
      preview: "Preview",
      input: "Input",
      output: "Output",
      result: "Result",
      options: "Options",
      advanced: "Advanced",
      basic: "Basic",
      text: "Text",
      file: "File",
      url: "URL",
      image: "Image",
      audio: "Audio",
      video: "Video",
      pdf: "PDF",
      json: "JSON",
      base64: "Base64",
      qrcode: "QR Code",
      location: "Location",
      information: "Information",
      pages: "pages",
      page: "Page",
      multipleFilesSupported: "Multiple files supported",
    },

    // Home Page
    home: {
      title: "Modern Web Tools Collection",
      subtitle: "Powerful editing tools available directly in your browser",
      features: {
        title: "Key Features",
        secure: {
          title: "Secure Processing",
          description: "All files are processed locally in your browser, never uploaded to servers"
        },
        fast: {
          title: "Fast Processing",
          description: "Direct local processing eliminates upload/download time"
        },
        easy: {
          title: "Easy to Use",
          description: "No complex installation required - use directly in your browser"
        },
        allInOne: {
          title: "All Tools in One Place",
          description: "Various editing tools provided in a single platform"
        }
      },
      tools: {
        audioEditor: {
          name: "Audio Editor",
          description: "Cut and edit audio files with ease",
          features: ["Waveform visualization", "Section selection & editing", "Volume control", "Fade effects"]
        },
        imageEditor: {
          name: "Image Editor",
          description: "Resize and crop images with powerful tools",
          features: ["Resize", "Crop", "Rotate", "Filters"]
        },
        imageConverter: {
          name: "Image Converter",
          description: "Convert image formats and generate Windows icons",
          features: ["Format conversion", "Windows icon generation", "Quality adjustment", "Batch processing"]
        },
        qrGenerator: {
          name: "QR Code Generator",
          description: "Generate QR codes from text or URLs",
          features: ["Text QR", "URL QR", "Size adjustment", "Color customization"]
        },
        base64Converter: {
          name: "Base64 Converter",
          description: "Encode and decode text to/from Base64 format",
          features: ["Encoding", "Decoding", "File conversion", "URL safe"]
        },
        ipInfo: {
          name: "IP Information",
          description: "Look up detailed information about IP addresses",
          features: ["Location info", "ISP details", "Timezone", "Security info"]
        },
        pdfEditor: {
          name: "PDF Editor",
          description: "Edit PDF files and manage pages",
          features: ["Page splitting", "Merging", "Rotation", "Text extraction"]
        },
        urlEncoder: {
          name: "URL Encoder",
          description: "Encode and decode URLs safely",
          features: ["URL encoding", "Decoding", "Component analysis", "Safe conversion"]
        },
        jsonFormatter: {
          name: "JSON Formatter",
          description: "Format and validate JSON data",
          features: ["Formatting", "Minification", "Validation", "Tree view"]
        }
      }
    },

    // Audio Editor
    audioEditor: {
      title: "Audio Editor",
      description: "Upload and edit audio files. Get started easily with drag and drop.",
      upload: {
        title: "Drop files here",
        subtitle: "Click to select or drag audio/video files here",
        fileInfo: "Uploaded File Information",
        fileName: "File Name",
        duration: "Duration",
        fileSize: "File Size"
      },
      controls: {
        playbackControls: "Playback Controls",
        selection: "Selection",
        startTime: "Start Time",
        endTime: "End Time",
        clearSelection: "Clear Selection",
        selectionEdit: "Selection Edit",
        keepSelection: "Keep Selection",
        deleteSelection: "Delete Selection",
        usage: "Usage:",
        usageDescription: "Drag with mouse or enter time values to select a section, then click buttons.",
        volumeControl: "Volume Control",
        amplify: "Amplify",
        reduce: "Reduce",
        applyAmplify: "Apply Amplify",
        applyReduce: "Apply Reduce",
        normalize: "Normalize",
        reverse: "Reverse",
        fadeIn: "Fade In",
        fadeOut: "Fade Out",
        usage: "Usage:",
        usageText: "Drag with mouse or input time to select section, then click button.",
        volumeControlTitle: "Volume Control",
        amplifyTitle: "Amplify",
        reduceTitle: "Reduce",
        applyAmplifyButton: "Apply Amplify",
        applyReduceButton: "Apply Reduce",
        fadeInButton: "Fade In",
        fadeOutButton: "Fade Out",
        normalizeButton: "Normalize",
        reverseButton: "Reverse",
        fileFormat: "File Format:",
        downloadButton: "Download Edited Audio"
      },
      errors: {
        invalidFileType: "Only audio or video files can be uploaded. (MP3, WAV, OGG, MP4, MOV, AVI, etc.)"
      }
    },

    // QR Code Generator
    qrGenerator: {
      title: "QR Code Generator",
      description: "Convert text or URLs to QR codes and download them.",
      settings: "QR Code Settings",
      settingsDescription: "Set the content and options for your QR code.",
      quickExamples: "Quick Examples",
      website: "Website",
      wifi: "Wi-Fi",
      location: "Location",
      contact: "Contact",
      textInput: "Text or URL",
      textPlaceholder: "Enter text or URL to convert to QR code...",
      quickGenerate: "Press Ctrl + Enter to generate quickly.",
      sizeLabel: "QR Code Size",
      marginLabel: "Margin Size",
      sizeSmall: "Small (128px)",
      sizeMedium: "Medium (256px)",
      sizeLarge: "Large (512px)",
      sizeXLarge: "Extra Large (1024px)",
      marginVerySmall: "Very Small",
      marginSmall: "Small",
      marginMedium: "Medium",
      marginLarge: "Large",
      marginVeryLarge: "Very Large",
      generate: "Generate QR Code",
      generatedTitle: "Generated QR Code",
      tips: "Usage Tips",
      tip1: "QR codes can store various data including URLs, text, and contact information.",
      tip2: "Larger sizes can store more data and have better recognition rates.",
      tip3: "For Wi-Fi info, use format: 'WIFI:T:WPA;S:NetworkName;P:Password;;'",
      errorEmpty: "Please enter text or URL.",
      errorGenerate: "Error generating QR code: {error}"
    },

    // Base64 Converter
    base64Converter: {
      title: "Base64 Converter",
      description: "Encode text to Base64 or decode Base64 to text.",
      mode: "Conversion Mode",
      modeDescription: "Select encoding or decoding mode.",
      encodeMode: "Text → Base64 (Encoding)",
      decodeMode: "Base64 → Text (Decoding)",
      inputLabel: "Text to Convert",
      base64Label: "Base64 String",
      inputPlaceholder: "Enter text here...",
      base64Placeholder: "Enter Base64 string here...",
      encode: "Encode",
      decode: "Decode",
      swap: "Swap Input/Output",
      resultTitle: "Result",
      resultBase64: "Base64 Result",
      resultText: "Text Result",
      charactersCount: "{count} characters",
      errorEmpty: "Please enter text to convert.",
      errorEncode: "Error during encoding: {error}",
      errorDecode: "Error during decoding. Please check if it's a valid Base64 string."
    },

    // IP Information
    ipInfo: {
      title: "IP Information",
      description: "Look up detailed information about IP addresses including location, ISP, and timezone.",
      inputTitle: "IP Address Input",
      inputDescription: "Enter an IP address to look up or check your current IP.",
      ipLabel: "IP Address",
      ipPlaceholder: "e.g. 8.8.8.8 or 2001:4860:4860::8888",
      lookup: "Look up IP Info",
      lookupInProgress: "Looking up...",
      myIp: "Check My IP",
      resultTitle: "IP Information: {ip}",
      locationInfo: "Location Information",
      country: "Country",
      region: "Region",
      city: "City",
      zipCode: "ZIP Code",
      coordinates: "Coordinates",
      timezone: "Timezone",
      networkInfo: "Network Information",
      isp: "Internet Service Provider",
      organization: "Organization",
      asNumber: "AS Number",
      securityInfo: "Security Information",
      proxy: "Proxy",
      vpn: "VPN",
      tor: "Tor",
      hosting: "Hosting",
      yes: "Yes",
      no: "No",
      unknown: "Unknown",
      mapView: "View on Map",
      moreInfo: "More Information",
      errorEmpty: "Please enter an IP address.",
      errorInvalid: "Invalid IP address format.",
      errorFetch: "Error fetching IP information. Please check your network connection.",
      errorMyIp: "Error fetching your IP address.",
      errorReason: "Unable to fetch IP information."
    },

    // PDF Editor
    pdfEditor: {
      title: "PDF Editor",
      description: "Edit PDF files and manage pages.",
      modeSelection: "Select Editing Mode",
      mergeMode: "PDF Merge",
      mergeModeDescription: "Combine multiple PDF files into one",
      mergeFeatures: ["Select multiple files", "Specify page ranges", "Reorder files"],
      editMode: "PDF Edit",
      editModeDescription: "Edit by specifying page ranges",
      editFeatures: ["Specify page ranges", "Delete pages", "Rotate pages"],
      advancedMode: "Advanced Edit",
      advancedModeDescription: "Page-by-page preview and detailed editing",
      advancedFeatures: ["Page preview", "Individual page manipulation", "Real-time editing"],
      fileSelect: "Select PDF Files",
      fileSelectDescription: "Choose PDF files to edit.",
      filesSelected: "Selected Files",
      fileName: "File Name",
      fileSize: "File Size",
      pageCount: "Page Count",
      pageRange: "Page Range",
      allPages: "All Pages",
      customRange: "Custom Range",
      rangeExample: "e.g. 1-5, 7, 9-12",
      moveUp: "Move Up",
      moveDown: "Move Down",
      remove: "Remove",
      merge: "Merge",
      extract: "Extract",
      rotate90: "Rotate 90°",
      rotate180: "Rotate 180°",
      rotate270: "Rotate 270°",
      deletePages: "Delete Pages",
      duplicatePage: "Duplicate Page",
      previewTitle: "Preview",
      selectedPages: "{count} pages selected",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      processing: "Processing...",
      errorMinFiles: "At least 2 PDF files are required.",
      errorFileFormat: "Please select PDF files only.",
      errorProcessing: "Error processing PDF.",
      errorPageRange: "Please enter a valid page range.",
      errorNoSelection: "No pages selected.",
      rotatedPages: "Rotated pages",
      deletedPages: "Deleted pages",
      finalPages: "Final pages",
      rotateLeft: "Rotate Left (-90°)",
      rotateRight: "Rotate Right (+90°)",
      extractSelected: "Extract Selected Pages",
      deleted: "Deleted",
      restore: "Restore"
    },

    // URL Encoder
    urlEncoder: {
      title: "URL Encoder",
      description: "Encode text safely for URLs or decode URL-encoded text.",
      settings: "Conversion Settings",
      settingsDescription: "Select conversion mode and encoding type.",
      mode: "Conversion Mode",
      encodeMode: "Text → URL Encoding",
      decodeMode: "URL Decoding → Text",
      encodingType: "Encoding Type",
      componentType: "Component (Full Encoding)",
      uriType: "URI (Basic Encoding)",
      examples: "Conversion Examples",
      examplesDescription: "Click to load examples into the input field.",
      inputLabel: "Text or URL",
      inputPlaceholder: "Enter text to encode or decode...",
      quickTips: "Usage Tips",
      tip1: "Component encoding encodes all special characters, safe for URL parameters.",
      tip2: "URI encoding preserves URL structure while encoding only unsafe characters.",
      tip3: "Unicode characters like Korean are encoded in UTF-8.",
      errorEmpty: "Please enter text to convert.",
      errorEncode: "Error during encoding: {error}",
      errorDecode: "Error during decoding. Please check if it's a valid URL-encoded string."
    },

    // JSON Formatter
    jsonFormatter: {
      title: "JSON Formatter",
      description: "Format and validate JSON data for better readability.",
      settingsTitle: "Settings",
      settingsDescription: "Configure JSON formatting options",
      indentSize: "Indent Size:",
      loadSample: "Load Sample Data",
      clearAll: "Clear All",
      inputTitle: "JSON Input",
      inputDescription: "Enter JSON to format or validate",
      inputPlaceholder: '{"name": "example", "value": 123}',
      format: "Format",
      minify: "Minify",
      validate: "Validate",
      outputTitle: "Formatted JSON",
      outputDescription: "This is the formatted result",
      validJson: "Valid JSON",
      invalidJson: "Invalid JSON",
      copied: "Copied to clipboard!",
      errorEmpty: "Please enter JSON text to process.",
      errorValidateEmpty: "Please enter JSON text to validate.",
      errorCopyEmpty: "No content to copy.",
      errorCopyFailed: "Failed to copy to clipboard.",
      errorParse: "JSON parsing error: {error}",
      errorValidate: "JSON validation failed: {error}"
    },

    // Image Editor
    imageEditor: {
      title: "Image Editor",
      description: "Comprehensive image editing with resize, crop, rotate and more features.",
      upload: {
        title: "Drop images here",
        subtitle: "Click to select or drag image files here",
        supportedFormats: "Supported formats: JPG, PNG, GIF, BMP, WEBP, etc."
      },
      resize: "Resize",
      resizeDescription: "Change image size and adjust aspect ratio.",
      mode: "Mode",
      manualMode: "Manual Resize",
      presetMode: "Preset Sizes",
      cropMode: "Crop",
      dimensions: "Dimensions",
      newDimensions: "New Dimensions",
      maintainRatio: "Maintain Aspect Ratio",
      presetSizes: "Preset Sizes",
      scaleResize: "Scale Resize",
      scale25: "25%",
      scale50: "50%",
      scale75: "75%",
      scale150: "150%",
      scale200: "200%",
      applyResize: "Apply Resize",
      cropSettings: "Crop Settings",
      crop: "Crop",
      cropDescription: "Drag with mouse to select the area to crop.",
      startCrop: "Start Crop",
      exitCrop: "Exit Crop",
      applyCrop: "Apply Crop",
      cropArea: "Crop Area",
      cropPosition: "Crop Position",
      cropSize: "Crop Size",
      resetOriginal: "Reset to Original",
      export: "Export",
      exportDescription: "Download your edited image.",
      exportFormat: "Export Format",
      jpegQuality: "JPEG Quality",
      downloadImage: "Download Image",
      errorImageOnly: "Only image files can be uploaded.",
      errorImageLoad: "Unable to load image.",
      uploadTitle: "Upload Image",
      uploadDescription: "Drag and drop or click to select image",
      selectImage: "Select Image",
      selectNewFile: "Select New File",
      undo: "Undo",
      errorInvalidDimensions: "Please enter valid dimensions.",
      errorApplyResize: "Cannot apply resize.",
      currentSize: "Current size: {width} x {height}"
    },

    // Image Converter
    imageConverter: {
      title: "Image Converter",
      description: "Convert image formats and generate Windows icons.",
      upload: {
        title: "Upload Image",
        subtitle: "Select or drag image files to convert",
        supportedFormats: "Supported formats: JPG, PNG, GIF, BMP, WEBP, SVG, ICO, HEIC, TIFF, etc.",
        rawWarning: "RAW files cannot be processed directly in browser. Please convert to JPG/PNG first.",
        heicWarning: "HEIC/HEIF files may not be supported in some browsers."
      },
      original: "Original",
      newImage: "Select New Image",
      conversion: "Conversion Settings",
      conversionDescription: "Select output format and quality.",
      filename: "Filename",
      filenamePlaceholder: "Enter filename",
      singleConversion: "Single Format Conversion",
      outputFormat: "Output Format",
      pngLossless: "PNG (Lossless)",
      jpgCompressed: "JPG (Compressed)",
      webpModern: "WebP (Modern)",
      qualityLabel: "Quality",
      formatConvert: "Format Convert",
      iconGeneration: "Windows Icon Generation",
      iconDescription: "Batch convert to standard sizes used in Windows icons.",
      pngFilesGenerate: "Generate PNG Files",
      icoFileGenerate: "Generate ICO File (Integrated)",
      results: "Conversion Results",
      allDownload: "Download All",
      filesGenerated: "{count} files generated",
      noResults: "Converted images will appear here",
      converting: "Converting...",
      errorUnsupported: "Unsupported image format: {format}",
      errorImageLoad: "Unable to load image. {format} format may not be supported.",
      errorSupportedOnly: "Only supported image files can be uploaded.",
      iconSizes: "Icon Sizes",
      selectSizes: "Select icon sizes to generate",
      standardSizes: "Standard Sizes",
      customSize: "Custom Size",
      addCustomSize: "Add Custom Size"
    }
  },

  en: {
    // 공통
    common: {
      appName: "WebTools",
      language: "Language",
      korean: "한국어",
      english: "English",
      back: "Back",
      home: "Home",
      upload: "Upload",
      download: "Download",
      convert: "Convert",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      clear: "Clear",
      apply: "Apply",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Info",
      copy: "Copy",
      paste: "Paste",
      select: "Select",
      deselect: "Deselect",
      duplicate: "Duplicate",
      move: "Move",
      rotate: "Rotate",
      resize: "Resize",
      close: "Close",
      open: "Open",
      settings: "Settings",
      examples: "Examples",
      help: "Help",
      format: "Format",
      quality: "Quality",
      size: "Size",
      filename: "Filename",
      width: "Width",
      height: "Height",
      encoding: "Encoding",
      decoding: "Decoding",
      validation: "Validation",
      preview: "Preview",
      input: "Input",
      output: "Output",
      result: "Result",
      options: "Options",
      advanced: "Advanced",
      basic: "Basic",
      text: "Text",
      file: "File",
      url: "URL",
      image: "Image",
      audio: "Audio",
      video: "Video",
      pdf: "PDF",
      json: "JSON",
      base64: "Base64",
      qrcode: "QR Code",
      location: "Location",
      information: "Information",
      pages: "Pages",
      page: "Page",
      multipleFilesSupported: "Multiple files supported",
    },

    // Home page
    home: {
      title: "Modern Web Tools Collection",
      subtitle: "Powerful editing tools available directly in your browser",
      features: {
        title: "Key Features",
        secure: {
          title: "Secure Processing",
          description: "All files are processed locally in your browser and never sent to servers"
        },
        fast: {
          title: "Fast Processing",
          description: "Direct local processing eliminates upload/download time"
        },
        easy: {
          title: "Easy to Use",
          description: "No complex installation required - use directly in your browser"
        },
        allInOne: {
          title: "All Tools in One Place",
          description: "Various editing tools provided on a single platform"
        }
      },
      tools: {
        audioEditor: {
          name: "Audio Editor",
          description: "Cut and edit audio files with advanced features",
          features: ["Waveform Visualization", "Selection & Editing", "Volume Control", "Fade Effects"]
        },
        imageEditor: {
          name: "Image Editor", 
          description: "Resize and crop images with professional tools",
          features: ["Resize", "Crop", "Rotate", "Filters"]
        },
        imageConverter: {
          name: "Image Converter",
          description: "Convert image formats and generate Windows icons",
          features: ["Format Conversion", "Windows Icon Generation", "Quality Control", "Batch Processing"]
        },
        qrGenerator: {
          name: "QR Code Generator",
          description: "Convert text or URLs into QR codes",
          features: ["Text QR", "URL QR", "Size Control", "Color Customization"]
        },
        base64Converter: {
          name: "Base64 Converter", 
          description: "Encode/decode text to Base64 format",
          features: ["Encoding", "Decoding", "File Conversion", "URL Safe"]
        },
        ipInfo: {
          name: "IP Information",
          description: "Look up location and information for IP addresses",
          features: ["Location Info", "ISP Info", "Timezone", "Security Info"]
        },
        pdfEditor: {
          name: "PDF Editor",
          description: "Edit PDF files and manage pages",
          features: ["Page Split", "Merge", "Rotate", "Text Extract"]
        },
        urlEncoder: {
          name: "URL Encoder",
          description: "Encode/decode URLs safely",
          features: ["URL Encoding", "Decoding", "Component Analysis", "Safe Conversion"]
        },
        jsonFormatter: {
          name: "JSON Formatter",
          description: "Format and validate JSON data",
          features: ["Formatting", "Compression", "Validation", "Tree View"]
        },
        textRepairer: {
          name: "Text Repairer",
          description: "Fix broken text and encoding issues",
          features: ["Escape Character Conversion", "Encoding Issue Fix", "Line Break Normalization", "Unicode Conversion"]
        }
      }
    },

    // Text Repairer Page
    textRepairer: {
      title: "Text Repairer",
      description: "Fix broken text with escape characters, encoding issues, and line break problems.",
      input: {
        title: "Input Text",
        placeholder: "Enter or paste broken text here...\n\nExample:\n\"\"\"\\ntitle: Sample Text\\nauthors: John Doe\\n\"\"\""
      },
      output: {
        title: "Fixed Text",
        placeholder: "Fixed text will appear here..."
      },
      mode: {
        label: "Repair Mode",
        escapeChars: "Escape Characters (\\n, \\t, etc.)",
        unicodeEscape: "Unicode Escape (\\u0000, \\x00)",
        jsonString: "JSON String Format",
        encodingFix: "Encoding Issues",
        lineBreaks: "Line Break Normalization",
        all: "All Repairs (Recommended)"
      },
      encoding: {
        label: "File Encoding"
      },
      upload: {
        button: "Upload Text File"
      },
      process: {
        button: "Fix Text"
      },
      examples: {
        title: "Examples",
        before: "Before (Broken)",
        after: "After (Fixed)"
      },
      errors: {
        invalidFileType: "Only text files are supported (txt, js, json, html, css, md, log, conf, ini, yml, yaml)."
      }
    }
  }
};

// 번역 헬퍼 함수
export const t = (language, key) => {
  const keys = key.split('.');
  let value = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}; 