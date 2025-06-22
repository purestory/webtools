import { useRef, useState, useCallback, useEffect } from 'react';

export const useAudioEditor = () => {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);
  const drawingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [waveformData, setWaveformData] = useState(null);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState(null);
  const [audioInfo, setAudioInfo] = useState({
    fileName: '',
    duration: '',
    fileSize: ''
  });

  // Initialize audio context with enhanced error handling
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext 생성됨:', {
          sampleRate: audioContextRef.current.sampleRate,
          state: audioContextRef.current.state,
          maxChannelCount: audioContextRef.current.destination.maxChannelCount
        });
      } catch (contextError) {
        console.error('AudioContext 생성 실패:', contextError);
        throw new Error('오디오 시스템을 초기화할 수 없습니다. 브라우저를 다시 시작해보세요.');
      }
    }
    
    // AudioContext가 suspended 상태면 활성화 시도
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        console.log('AudioContext가 활성화되었습니다.');
      }).catch((resumeError) => {
        console.warn('AudioContext resume 실패:', resumeError);
        // 새로운 AudioContext 생성 시도
        try {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          console.log('새 AudioContext 생성됨');
        } catch (newContextError) {
          console.error('새 AudioContext 생성 실패:', newContextError);
        }
      });
    }
    
    return audioContextRef.current;
  }, []);

  // Format time helper
  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds)) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Clone audio buffer for editing
  const cloneAudioBuffer = useCallback((buffer) => {
    const audioContext = initAudioContext();
    const newBuffer = audioContext.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );
    
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      const newChannelData = newBuffer.getChannelData(channel);
      newChannelData.set(channelData);
    }
    
    return newBuffer;
  }, [initAudioContext]);

  // Apply amplify effect
  const applyAmplify = useCallback((factor, startTime, endTime) => {
    if (!audioBuffer) return;
    
    const newBuffer = cloneAudioBuffer(audioBuffer);
    const sampleRate = newBuffer.sampleRate;
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor(endTime * sampleRate);
    
    for (let channel = 0; channel < newBuffer.numberOfChannels; channel++) {
      const channelData = newBuffer.getChannelData(channel);
      
      for (let i = startSample; i < endSample && i < channelData.length; i++) {
        channelData[i] *= factor;
        // Prevent clipping
        if (channelData[i] > 1) channelData[i] = 1;
        if (channelData[i] < -1) channelData[i] = -1;
      }
    }
    
    setAudioBuffer(newBuffer);
    requestAnimationFrame(() => drawWaveform());
  }, [audioBuffer, cloneAudioBuffer]);

  // Apply reduce effect
  const applyReduce = useCallback((factor, startTime, endTime) => {
    if (!audioBuffer) return;
    
    const newBuffer = cloneAudioBuffer(audioBuffer);
    const sampleRate = newBuffer.sampleRate;
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor(endTime * sampleRate);
    
    for (let channel = 0; channel < newBuffer.numberOfChannels; channel++) {
      const channelData = newBuffer.getChannelData(channel);
      
      for (let i = startSample; i < endSample && i < channelData.length; i++) {
        channelData[i] *= factor;
      }
    }
    
    setAudioBuffer(newBuffer);
    requestAnimationFrame(() => drawWaveform());
  }, [audioBuffer, cloneAudioBuffer]);

  // Apply normalize effect
  const applyNormalize = useCallback((startTime, endTime) => {
    if (!audioBuffer) return;
    
    const newBuffer = cloneAudioBuffer(audioBuffer);
    const sampleRate = newBuffer.sampleRate;
    const startSample = startTime ? Math.floor(startTime * sampleRate) : 0;
    const endSample = endTime ? Math.floor(endTime * sampleRate) : newBuffer.length;
    
    for (let channel = 0; channel < newBuffer.numberOfChannels; channel++) {
      const channelData = newBuffer.getChannelData(channel);
      
      // Find max amplitude in the selection
      let maxAmplitude = 0;
      for (let i = startSample; i < endSample && i < channelData.length; i++) {
        maxAmplitude = Math.max(maxAmplitude, Math.abs(channelData[i]));
      }
      
      // Normalize if max amplitude is greater than 0
      if (maxAmplitude > 0) {
        const normalizeFactor = 0.95 / maxAmplitude; // Leave some headroom
        for (let i = startSample; i < endSample && i < channelData.length; i++) {
          channelData[i] *= normalizeFactor;
        }
      }
    }
    
    setAudioBuffer(newBuffer);
    requestAnimationFrame(() => drawWaveform());
  }, [audioBuffer, cloneAudioBuffer]);

  // Apply reverse effect
  const applyReverse = useCallback((startTime, endTime) => {
    if (!audioBuffer) return;
    
    const newBuffer = cloneAudioBuffer(audioBuffer);
    const sampleRate = newBuffer.sampleRate;
    const startSample = startTime ? Math.floor(startTime * sampleRate) : 0;
    const endSample = endTime ? Math.floor(endTime * sampleRate) : newBuffer.length;
    
    for (let channel = 0; channel < newBuffer.numberOfChannels; channel++) {
      const channelData = newBuffer.getChannelData(channel);
      
      // Extract the selection
      const selectionData = channelData.slice(startSample, endSample);
      
      // Reverse the selection
      selectionData.reverse();
      
      // Put it back
      for (let i = 0; i < selectionData.length; i++) {
        channelData[startSample + i] = selectionData[i];
      }
    }
    
    setAudioBuffer(newBuffer);
    requestAnimationFrame(() => drawWaveform());
  }, [audioBuffer, cloneAudioBuffer]);

  // Apply fade in effect
  const applyFadeIn = useCallback(() => {
    if (!audioBuffer || selectionStart === null || selectionEnd === null) {
      return;
    }
    
    const newBuffer = cloneAudioBuffer(audioBuffer);
    const sampleRate = newBuffer.sampleRate;
    const startSample = Math.floor(selectionStart * sampleRate);
    const endSample = Math.floor(selectionEnd * sampleRate);
    const fadeLength = endSample - startSample;
    
    for (let channel = 0; channel < newBuffer.numberOfChannels; channel++) {
      const channelData = newBuffer.getChannelData(channel);
      
      for (let i = startSample; i < endSample && i < channelData.length; i++) {
        const fadeProgress = (i - startSample) / fadeLength;
        channelData[i] *= fadeProgress;
      }
    }
    
    setAudioBuffer(newBuffer);
    requestAnimationFrame(() => drawWaveform());
  }, [audioBuffer, selectionStart, selectionEnd, cloneAudioBuffer]);

  // Apply fade out effect
  const applyFadeOut = useCallback(() => {
    if (!audioBuffer || selectionStart === null || selectionEnd === null) {
      return;
    }
    
    const newBuffer = cloneAudioBuffer(audioBuffer);
    const sampleRate = newBuffer.sampleRate;
    const startSample = Math.floor(selectionStart * sampleRate);
    const endSample = Math.floor(selectionEnd * sampleRate);
    const fadeLength = endSample - startSample;
    
    for (let channel = 0; channel < newBuffer.numberOfChannels; channel++) {
      const channelData = newBuffer.getChannelData(channel);
      
      for (let i = startSample; i < endSample && i < channelData.length; i++) {
        const fadeProgress = 1 - (i - startSample) / fadeLength;
        channelData[i] *= fadeProgress;
      }
    }
    
    setAudioBuffer(newBuffer);
    requestAnimationFrame(() => drawWaveform());
  }, [audioBuffer, selectionStart, selectionEnd, cloneAudioBuffer]);

  // Convert AudioBuffer to WAV
  const audioBufferToWav = useCallback((buffer) => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert samples
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return arrayBuffer;
  }, []);

  // MP3 인코딩 함수
  const audioBufferToMp3 = useCallback(async (buffer) => {
    try {
      // Dynamically import @breezystack/lamejs
      const lamejs = await import('@breezystack/lamejs');
      
      const channels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      
      // LAME 인코더 초기화 (bitrate를 3번째 인자로)
      const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
      const mp3Data = [];
      
      // 청크 크기 설정 (1152는 MP3 프레임 크기)
      const chunkSize = 1152;
      
      // 스테레오인 경우 채널 분리
      if (channels === 2) {
        const left = new Int16Array(buffer.length);
        const right = new Int16Array(buffer.length);
        
        for (let i = 0; i < buffer.length; i++) {
          left[i] = Math.max(-32768, Math.min(32767, buffer.getChannelData(0)[i] * 32767));
          right[i] = Math.max(-32768, Math.min(32767, buffer.getChannelData(1)[i] * 32767));
        }
        
        // 청크 단위로 인코딩
        for (let i = 0; i < buffer.length; i += chunkSize) {
          const leftChunk = left.slice(i, i + chunkSize);
          const rightChunk = right.slice(i, i + chunkSize);
          const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
          if (mp3buf.length > 0) {
            mp3Data.push(new Int8Array(mp3buf));
          }
        }
      } else {
        // 모노
        const mono = new Int16Array(buffer.length);
        for (let i = 0; i < buffer.length; i++) {
          mono[i] = Math.max(-32768, Math.min(32767, buffer.getChannelData(0)[i] * 32767));
        }
        
        for (let i = 0; i < buffer.length; i += chunkSize) {
          const chunk = mono.slice(i, i + chunkSize);
          const mp3buf = mp3encoder.encodeBuffer(chunk);
          if (mp3buf.length > 0) {
            mp3Data.push(new Int8Array(mp3buf));
          }
        }
      }
      
      // 인코딩 완료
      const mp3buf = mp3encoder.flush();
      if (mp3buf.length > 0) {
        mp3Data.push(new Int8Array(mp3buf));
      }
      
      return new Blob(mp3Data, { type: 'audio/mp3' });
    } catch (error) {
      throw new Error(`MP3 인코딩 실패: ${error.message}`);
    }
  }, []);

  // OGG Vorbis 인코딩 함수
  const audioBufferToOgg = useCallback(async (buffer) => {
    try {
      // Dynamically import wasm-media-encoders
      const wasmMediaEncoders = await import('wasm-media-encoders');
      
      const channels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      
      // Create OGG encoder
      const encoder = await wasmMediaEncoders.createOggEncoder();
      
      // Configure encoder
      encoder.configure({
        channels: channels,
        sampleRate: sampleRate,
        vbrQuality: 3.0
      });
      
      // Convert AudioBuffer to Float32Array samples
      const samples = [];
      for (let channel = 0; channel < channels; channel++) {
        samples.push(buffer.getChannelData(channel));
      }
      
      // Encode
      const encodedData = encoder.encode(samples);
      const finalData = encoder.finalize();
      
      // Combine encoded data
      const allData = [];
      if (encodedData.length > 0) allData.push(encodedData);
      if (finalData.length > 0) allData.push(finalData);
      
      return new Blob(allData, { type: 'audio/ogg' });
    } catch (error) {
      throw new Error(`OGG 인코딩 실패: ${error.message}`);
    }
  }, []);



  // Download audio
  const downloadAudio = useCallback(async (format = 'wav') => {
    if (!audioBuffer) {
      alert('먼저 오디오 파일을 로드해주세요.');
      return;
    }
    
    try {
      let blob, filename;
      
      switch (format) {
        case 'mp3':
          blob = await audioBufferToMp3(audioBuffer);
          filename = `edited_${audioInfo.fileName || 'audio'}.mp3`;
          break;
        case 'ogg':
          blob = await audioBufferToOgg(audioBuffer);
          filename = `edited_${audioInfo.fileName || 'audio'}.ogg`;
          break;
        
        case 'wav':
        default:
          const wavArrayBuffer = audioBufferToWav(audioBuffer);
          blob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
          filename = `edited_${audioInfo.fileName || 'audio'}.wav`;
          break;
      }
      
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('다운로드 오류:', error);
      alert(`다운로드 중 오류가 발생했습니다: ${error.message}`);
    }
  }, [audioBuffer, audioBufferToWav, audioBufferToMp3, audioBufferToOgg, audioInfo.fileName]);

  // Canvas event handlers
  const handleCanvasMouseDown = useCallback((e) => {
    if (!audioBuffer) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Store mouse down position and time
    setMouseDownPos({ x, y: e.clientY - rect.top });
    setIsDragging(false);
    setIsSelecting(false);
    
    // Clear any existing selection first
    setSelectionStart(null);
    setSelectionEnd(null);
    
    // Single click to set playback position
    const progress = x / canvas.width;
    const time = progress * audioBuffer.duration;
    setCurrentTime(time);
    
    // Redraw to update timeline
    requestAnimationFrame(() => drawWaveform());
  }, [audioBuffer]);

  const handleCanvasMouseMove = useCallback((e) => {
    // Only handle if mouse is down and we have audioBuffer
    if (!audioBuffer || !mouseDownPos) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Check if we should start dragging (moved more than 5 pixels)
    const deltaX = Math.abs(x - mouseDownPos.x);
    
    if (!isDragging && !isSelecting && deltaX > 5) {
      setIsDragging(true);
      setIsSelecting(true);
      
      // Start selection from mouse down position
      const startProgress = mouseDownPos.x / canvas.width;
      setSelectionStart(startProgress * audioBuffer.duration);
      
      // Set current position as end
      const endProgress = Math.max(0, Math.min(1, x / canvas.width));
      setSelectionEnd(endProgress * audioBuffer.duration);
    } else if (isDragging && isSelecting) {
      // Update selection end position during drag
      const endProgress = Math.max(0, Math.min(1, x / canvas.width));
      setSelectionEnd(endProgress * audioBuffer.duration);
    }
  }, [audioBuffer, mouseDownPos, isDragging, isSelecting]);

  const handleCanvasMouseUp = useCallback(() => {
    // Reset mouse down position to stop tracking
    setMouseDownPos(null);
    
    // If we were just clicking (not dragging), don't keep selection
    if (!isDragging) {
      setSelectionStart(null);
      setSelectionEnd(null);
    } else {
      // 드래그가 끝났을 때 시작시간과 종료시간 순서 확인 및 교환
      if (selectionStart !== null && selectionEnd !== null && selectionStart > selectionEnd) {
        const temp = selectionStart;
        setSelectionStart(selectionEnd);
        setSelectionEnd(temp);
      }
    }
    
    setIsDragging(false);
    setIsSelecting(false);
  }, [isDragging, selectionStart, selectionEnd]);

  // 새로운 마우스 리브 핸들러 - 선택을 유지
  const handleCanvasMouseLeave = useCallback(() => {
    // 드래그 중이 아니라면 마우스 다운 위치만 초기화
    if (!isDragging) {
      setMouseDownPos(null);
    }
    // 선택은 유지
  }, [isDragging]);

  // Load audio file
  const loadAudioFile = useCallback(async (file) => {
    try {
      // 파일 검증
      if (!file) {
        throw new Error('파일이 선택되지 않았습니다.');
      }
      
      // 파일 헤더 검사를 통한 정확한 형식 감지
      const fileBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(fileBuffer);
      
      // 파일 시그니처 확인 (OGG 지원 강화)
      const checkFileSignature = (buffer) => {
        const signatures = {
          mp3: [0xFF, 0xFB], // MP3 frame header
          mp3Alt: [0x49, 0x44, 0x33], // ID3 tag
          wav: [0x52, 0x49, 0x46, 0x46], // RIFF
          ogg: [0x4F, 0x67, 0x67, 0x53], // OggS
          m4a: [0x66, 0x74, 0x79, 0x70], // ftyp (MP4 container)
          flac: [0x66, 0x4C, 0x61, 0x43] // fLaC
        };
        
        for (const [format, sig] of Object.entries(signatures)) {
          if (sig.every((byte, i) => buffer[i] === byte)) {
            // OGG 파일의 경우 추가 검증
            if (format === 'ogg') {
              // OGG 페이지 구조 확인 (최소 27바이트 헤더)
              if (buffer.length > 27) {
                const version = buffer[4];
                const headerType = buffer[5];
                // OGG 버전 0, 헤더 타입 확인
                if (version === 0 && (headerType & 0x02) === 0x02) {
                  console.log('OGG Vorbis 파일 감지됨');
                  return 'ogg';
                }
              }
            }
            return format;
          }
        }
        
        // MP4/M4A 추가 확인 (ftyp 이후 확인)
        if (buffer.length > 8) {
          const ftypIndex = buffer.findIndex((byte, i) => 
            i < buffer.length - 4 && 
            buffer[i] === 0x66 && buffer[i+1] === 0x74 && 
            buffer[i+2] === 0x79 && buffer[i+3] === 0x70
          );
          if (ftypIndex !== -1 && ftypIndex + 8 < buffer.length) {
            const brandBytes = buffer.slice(ftypIndex + 4, ftypIndex + 8);
            const brand = String.fromCharCode(...brandBytes);
            if (brand.includes('M4A') || brand.includes('mp4') || brand.includes('isom')) {
              return 'm4a';
            }
          }
        }
        
        return null;
      };
      
      const detectedFormat = checkFileSignature(uint8Array);
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const validExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma', 'webm', 'opus', 'oga', 'mp4', '3gp', 'amr', 'au', 'aiff', 'caf', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'f4v', 'asf', 'rm', 'rmvb', 'ts', 'm2ts', 'mts'];
      
      // 브라우저 오디오 형식 지원 확인
      const checkBrowserSupport = (format) => {
        const audio = new Audio();
        const mimeTypes = {
          mp3: 'audio/mpeg',
          wav: 'audio/wav',
          ogg: 'audio/ogg; codecs="vorbis"',
          oga: 'audio/ogg; codecs="vorbis"',
          m4a: 'audio/mp4',
          mp4: 'video/mp4',
          aac: 'audio/aac',
          flac: 'audio/flac',
          webm: 'video/webm',
          opus: 'audio/ogg; codecs="opus"',
          wma: 'audio/x-ms-wma',
          '3gp': 'video/3gpp',
          amr: 'audio/amr',
          au: 'audio/basic',
          aiff: 'audio/aiff',
          caf: 'audio/x-caf',
          mov: 'video/quicktime',
          avi: 'video/x-msvideo',
          mkv: 'video/x-matroska',
          wmv: 'video/x-ms-wmv',
          flv: 'video/x-flv',
          f4v: 'video/x-f4v',
          asf: 'video/x-ms-asf',
          rm: 'application/vnd.rn-realmedia',
          rmvb: 'application/vnd.rn-realmedia-vbr',
          ts: 'video/mp2t',
          m2ts: 'video/mp2t',
          mts: 'video/mp2t'
        };
        
        const mimeType = mimeTypes[format];
        if (!mimeType) return 'unknown';
        
        const support = audio.canPlayType(mimeType);
        return support; // 'probably', 'maybe', '' (empty string means not supported)
      };

      const browserSupport = detectedFormat ? checkBrowserSupport(detectedFormat) : 'unknown';
      
      console.log('파일 분석:', {
        fileName: file.name,
        mimeType: file.type,
        extension: fileExtension,
        detectedFormat: detectedFormat,
        browserSupport: browserSupport,
        fileSize: file.size,
        headerBytes: Array.from(uint8Array.slice(0, 16)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')
      });
      
      // 관대한 파일 형식 검증 - 가능한 한 많은 파일을 로드하도록 함 (오디오 + 비디오)
      const hasValidExtension = validExtensions.includes(fileExtension);
      const hasValidFormat = detectedFormat !== null;
      const hasValidMimeType = file.type.startsWith('audio/') || file.type.startsWith('video/') || file.type === '';
      
      // 최소한의 검증만 수행 - 확장자가 미디어 관련이거나 MIME 타입이 미디어면 시도
      const isLikelyMedia = hasValidExtension || hasValidMimeType || hasValidFormat;
      
      if (!isLikelyMedia) {
        // 더 관대한 검증 - 파일명이 미디어 관련 확장자를 포함하는지 확인
        const mediaExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma', 'webm', 'opus', 'mp4', 'mov', 'avi', 'mkv', 'wmv'];
        const hasMediaExtension = mediaExtensions.some(ext => 
          file.name.toLowerCase().includes('.' + ext)
        );
        
        if (!hasMediaExtension) {
          throw new Error('미디어 파일이 아닌 것 같습니다. MP3, WAV, OGG, MP4, MOV 등의 오디오/비디오 파일을 선택해주세요.');
        }
      }
      
      // OGG 파일은 경고만 표시하고 로드 시도
      if (detectedFormat === 'ogg' && browserSupport === '') {
        console.warn('이 브라우저는 OGG Vorbis 지원이 제한적일 수 있습니다. 로드를 시도합니다.');
      }
      
      // 형식 불일치 경고
      if (detectedFormat && fileExtension !== detectedFormat) {
        console.warn(`파일 확장자(${fileExtension})와 실제 형식(${detectedFormat})이 다릅니다.`);
      }
      
      console.log('로딩 중:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      const audioContext = initAudioContext();
      
      // AudioContext 상태 확인
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // fileBuffer를 재사용 (이미 로드됨)
      console.log('ArrayBuffer 크기:', fileBuffer.byteLength);
      
      // decodeAudioData에 강화된 에러 처리 및 fallback
      let audioBuffer;
      try {
        // Promise 방식으로 시도
        audioBuffer = await audioContext.decodeAudioData(fileBuffer);
      } catch (decodeError) {
        console.error('Promise 방식 디코딩 오류:', decodeError);
        
        // Callback 방식으로 재시도 (구형 브라우저 호환성)
        try {
          audioBuffer = await new Promise((resolve, reject) => {
            // ArrayBuffer를 복사 (일부 브라우저에서 필요)
            const copiedBuffer = fileBuffer.slice();
            
            audioContext.decodeAudioData(
              copiedBuffer,
              (buffer) => {
                console.log('Callback 방식으로 디코딩 성공');
                resolve(buffer);
              },
              (error) => {
                console.error('Callback 방식 디코딩 오류:', error);
                reject(error);
              }
            );
          });
        } catch (callbackError) {
          console.error('Callback 방식도 실패:', callbackError);
          
          // 비디오 파일인지 확인
          const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'webm', 'flv', 'f4v', '3gp'];
          const isVideoFile = videoExtensions.includes(fileExtension) || file.type.startsWith('video/');
          
          if (isVideoFile) {
            try {
              console.log('비디오 파일에서 오디오 추출 시도...');
              
              // HTML5 Video 엘리먼트를 사용하여 비디오 파일 로드
              const videoElement = document.createElement('video');
              const blob = new Blob([fileBuffer], { type: file.type || `video/${fileExtension}` });
              const url = URL.createObjectURL(blob);
              
              audioBuffer = await new Promise((resolve, reject) => {
                videoElement.crossOrigin = 'anonymous';
                videoElement.preload = 'metadata';
                
                videoElement.addEventListener('loadedmetadata', async () => {
                  try {
                    console.log('비디오 메타데이터 로드됨:', {
                      duration: videoElement.duration,
                      videoWidth: videoElement.videoWidth,
                      videoHeight: videoElement.videoHeight
                    });
                    
                    // AudioContext를 사용하여 비디오에서 오디오 추출
                    const source = audioContext.createMediaElementSource(videoElement);
                    
                    // OfflineAudioContext를 사용하여 전체 오디오 버퍼 생성
                    const offlineContext = new OfflineAudioContext(
                      2, // 스테레오
                      Math.ceil(videoElement.duration * audioContext.sampleRate), 
                      audioContext.sampleRate
                    );
                    
                    // 비디오 재생 및 오디오 캡처
                    videoElement.currentTime = 0;
                    await videoElement.play();
                    
                    // 실시간으로 오디오 데이터 캡처하는 대신 
                    // 비디오의 전체 길이에 대한 빈 버퍼를 생성하고
                    // MediaElementSource를 사용해 추출
                    const offlineSource = offlineContext.createBufferSource();
                    
                    // 비디오 파일의 경우 실제 재생을 통해 오디오 추출하는 방법으로 변경
                    videoElement.pause();
                    videoElement.currentTime = 0;
                    
                    // Web Audio API로 직접 처리하기 위해 다른 방법 시도
                    URL.revokeObjectURL(url);
                    
                    // fetch를 통해 비디오 데이터를 다시 가져와서 FFmpeg 없이 처리
                    // 임시로 에러를 발생시켜 다음 단계로 진행
                    throw new Error('비디오 파일 오디오 추출 - 다음 방법 시도');
                    
                  } catch (videoError) {
                    console.error('비디오 오디오 추출 실패:', videoError);
                    URL.revokeObjectURL(url);
                    reject(videoError);
                  }
                });
                
                videoElement.addEventListener('error', (error) => {
                  console.error('비디오 로드 실패:', error);
                  URL.revokeObjectURL(url);
                  reject(error);
                });
                
                videoElement.src = url;
                
                // 타임아웃 설정
                setTimeout(() => {
                  URL.revokeObjectURL(url);
                  reject(new Error('비디오 로드 타임아웃'));
                }, 10000);
              });
              
              console.log('비디오에서 오디오 추출 성공');
              
            } catch (videoError) {
              console.error('비디오 오디오 추출 실패:', videoError);
              // 일반 디코딩 재시도로 계속 진행
            }
          }
          
          // 일반 오디오 파일 또는 비디오 추출 실패 시 대체 방법
          if (!audioBuffer) {
            try {
              console.log('추가 디코딩 방식으로 재시도...');
              
              // 파일 형식에 따른 다른 MIME 타입으로 시도
              let alternativeMimeType = file.type;
              if (detectedFormat === 'ogg' || fileExtension === 'ogg') {
                alternativeMimeType = 'audio/ogg';
              } else if (detectedFormat === 'm4a' || fileExtension === 'm4a') {
                alternativeMimeType = 'audio/mp4';
              } else if (detectedFormat === 'mp3' || fileExtension === 'mp3') {
                alternativeMimeType = 'audio/mpeg';
              } else if (isVideoFile) {
                // 비디오 파일의 경우 대응하는 오디오 MIME 타입으로 시도
                if (fileExtension === 'mp4') alternativeMimeType = 'audio/mp4';
                else if (fileExtension === 'webm') alternativeMimeType = 'audio/webm';
                else alternativeMimeType = 'audio/mpeg';
              }
              
              // 다른 MIME 타입으로 Blob 생성하여 재시도
              const blob = new Blob([fileBuffer], { type: alternativeMimeType });
              const alternativeBuffer = await blob.arrayBuffer();
              
              audioBuffer = await audioContext.decodeAudioData(alternativeBuffer);
              console.log('대체 MIME 타입으로 디코딩 성공');
              
            } catch (alternativeError) {
              console.error('대체 방식도 실패:', alternativeError);
              // 최종 에러 처리로 진행
            }
          }
          
          // 최종 에러 처리 (HTML5 방식도 실패했거나 OGG가 아닌 경우)
          if (!audioBuffer) {
            // 브라우저별 구체적인 에러 메시지
            let errorMessage = '오디오 파일을 디코딩할 수 없습니다. ';
            
            if (decodeError.name === 'EncodingError' || callbackError.name === 'EncodingError') {
              errorMessage += '지원되지 않는 오디오 형식이거나 파일이 손상되었을 수 있습니다. ';
              
              // OGG 파일 특별 처리
              if (detectedFormat === 'ogg') {
                errorMessage += 'OGG 파일 디코딩에 실패했습니다. ';
                errorMessage += '다른 브라우저(Chrome, Firefox)를 시도하거나 MP3/WAV로 변환해보세요.';
              } else {
                errorMessage += 'WAV 또는 표준 MP3 파일을 시도해보세요.';
              }
            } else if (decodeError.name === 'DataError' || callbackError.name === 'DataError') {
              errorMessage += '파일 데이터가 유효하지 않습니다.';
            } else {
              errorMessage += `에러: ${decodeError.message || callbackError.message}`;
            }
            
            // 브라우저 정보 추가
            const userAgent = navigator.userAgent;
            if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
              errorMessage += ' (Safari에서는 OGG, 일부 MP3 파일이 지원되지 않을 수 있습니다)';
            } else if (userAgent.includes('Firefox')) {
              errorMessage += ' (Firefox에서는 일부 AAC/M4A 파일이 지원되지 않을 수 있습니다)';
            } else if (userAgent.includes('Edge')) {
              errorMessage += ' (Edge에서는 OGG 지원이 제한적일 수 있습니다)';
            }
            
            throw new Error(errorMessage);
          }
        }
      }
      
      console.log('디코딩 성공:', {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
        length: audioBuffer.length
      });
      
      setAudioBuffer(audioBuffer);
      setDuration(audioBuffer.duration);
      setCurrentTime(0);
      setSelectionStart(null);
      setSelectionEnd(null);
      
      // Set audio info
      setAudioInfo({
        fileName: file.name,
        duration: formatTime(audioBuffer.duration),
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });

      // Draw waveform immediately
      setTimeout(() => {
        requestAnimationFrame(() => drawWaveform());
      }, 100);
      
      return true;
    } catch (error) {
      console.error('오디오 로드 오류:', error);
      alert(`오디오 로드 오류: ${error.message}`);
      return false;
    }
  }, [initAudioContext, formatTime]);

  // Draw waveform - 최적화된 버전
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer || drawingRef.current) return;
    
    drawingRef.current = true;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // 캔버스 크기가 변경되었을 때만 리사이즈
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Get audio data
    const data = audioBuffer.getChannelData(0);
    const length = data.length;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Draw high-detail waveform with ultra-thin bars
    ctx.strokeStyle = '#2c5282';
    ctx.lineWidth = 0.3; // 매우 얇은 선
    
    // 매우 세밀한 파형을 위해 0.5픽셀 간격으로 그리기
    const pixelRatio = window.devicePixelRatio || 1;
    const detailLevel = Math.max(1, pixelRatio); // 고해상도 지원
    const barSpacing = 0.5; // 매우 조밀한 바 간격
    const effectiveWidth = Math.floor(width * 2); // 2배 해상도
    const samplesPerBar = Math.floor(length / effectiveWidth);
    
    ctx.beginPath();
    
    for (let i = 0; i < effectiveWidth; i++) {
      let min = 1.0;
      let max = -1.0;
      
      // 각 바에 대한 샘플 범위에서 최대/최소값 찾기
      const startSample = i * samplesPerBar;
      const endSample = Math.min((i + 1) * samplesPerBar, length);
      
      for (let j = startSample; j < endSample; j++) {
        const datum = data[j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      const yMin = (1 + min) * height / 2;
      const yMax = (1 + max) * height / 2;
      const x = i * barSpacing;
      
      // 연속된 선으로 그리기 (더 부드러운 파형)
      if (i === 0) {
        ctx.moveTo(x, yMin);
      } else {
        ctx.lineTo(x, yMin);
      }
      ctx.lineTo(x, yMax);
    }
    
    ctx.stroke();
    
    // 더 세밀한 파형을 위한 추가 렌더링 (고주파 성분)
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 0.2;
    ctx.globalAlpha = 0.7;
    
    ctx.beginPath();
    const highDetailSamples = Math.min(width * 4, length); // 4배 세밀도
    const highDetailStep = length / highDetailSamples;
    
    for (let i = 0; i < highDetailSamples; i++) {
      const sampleIndex = Math.floor(i * highDetailStep);
      const datum = data[sampleIndex];
      const x = (i / highDetailSamples) * width;
      const y = (1 + datum) * height / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    
    // Draw center line
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw selection if exists
    if (selectionStart !== null && selectionEnd !== null) {
      const startX = (selectionStart / audioBuffer.duration) * width;
      const endX = (selectionEnd / audioBuffer.duration) * width;
      const actualStartX = Math.min(startX, endX);
      const actualEndX = Math.max(startX, endX);
      
      ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
      ctx.fillRect(actualStartX, 0, actualEndX - actualStartX, height);
      
      ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(actualStartX, 0);
      ctx.lineTo(actualStartX, height);
      ctx.moveTo(actualEndX, 0);
      ctx.lineTo(actualEndX, height);
      ctx.stroke();
    }
    
    // Draw current time indicator
    if (audioBuffer && audioBuffer.duration > 0) {
      const currentX = (currentTime / audioBuffer.duration) * width;
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, height);
      ctx.stroke();
    }
    
    drawingRef.current = false;
  }, [audioBuffer, currentTime, selectionStart, selectionEnd]);

  // Play audio
  const play = useCallback(async () => {
    if (!audioBuffer) return;
    
    const audioContext = initAudioContext();
    
    // Resume context if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Stop current playback
    if (sourceRef.current) {
      sourceRef.current.stop();
    }
    
    // Create new source
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = audioBuffer;
    gainNode.gain.value = volume / 100;
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    sourceRef.current = source;
    gainNodeRef.current = gainNode;
    
    const startTime = audioContext.currentTime;
    const startOffset = currentTime;
    
    source.start(0, startOffset);
    setIsPlaying(true);
    
        // Update current time with more reliable tracking
    const updateTime = () => {
      if (sourceRef.current && audioContext.state === 'running') {
        const elapsed = audioContext.currentTime - startTime;
        const newTime = startOffset + elapsed;
        
        if (newTime >= audioBuffer.duration) {
          setCurrentTime(audioBuffer.duration);
          setIsPlaying(false);
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          return;
        }
        
        setCurrentTime(newTime);
        console.log('현재 시간 업데이트:', newTime.toFixed(2), '/', audioBuffer.duration.toFixed(2));
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    // 즉시 시작하고 지속적으로 업데이트
    animationFrameRef.current = requestAnimationFrame(updateTime);
    
    source.onended = () => {
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioBuffer, currentTime, duration, volume, isPlaying, initAudioContext]);

  // Pause audio
  const pause = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Stop audio
  const stop = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setCurrentTime(0);
  }, []);

  // Set volume
  const setVolumeValue = useCallback((value) => {
    console.log('setVolumeValue 호출됨:', value);
    setVolume(value);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = value / 100;
      console.log('GainNode 볼륨 설정됨:', value / 100);
    } else {
      console.log('GainNode가 없음');
    }
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectionStart(null);
    setSelectionEnd(null);
  }, []);

  // Trim to selection (선택 부분만 남기기)
  const trimSelection = useCallback(() => {
    if (!audioBuffer || selectionStart === null || selectionEnd === null) {
      alert('구간을 먼저 선택해주세요.');
      return;
    }

    try {
      // Stop playback
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
        setIsPlaying(false);
      }

      const actualStart = Math.min(selectionStart, selectionEnd);
      const actualEnd = Math.max(selectionStart, selectionEnd);
      
      const startSample = Math.floor(actualStart * audioBuffer.sampleRate);
      const endSample = Math.floor(actualEnd * audioBuffer.sampleRate);
      const newLength = endSample - startSample;

      const audioContext = initAudioContext();
      const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        audioBuffer.sampleRate
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const originalData = audioBuffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);
        
        for (let i = 0; i < newLength; i++) {
          newData[i] = originalData[startSample + i];
        }
      }

      setAudioBuffer(newBuffer);
      setCurrentTime(0);
      setSelectionStart(null);
      setSelectionEnd(null);
      
      // Update audio info
      setAudioInfo(prev => ({
        ...prev,
        duration: formatTime(newBuffer.duration)
      }));

      console.log('선택 부분만 남기기 완료');
    } catch (error) {
      console.error('선택 부분만 남기기 오류:', error);
      alert('선택 부분만 남기기 중 오류가 발생했습니다.');
    }
  }, [audioBuffer, selectionStart, selectionEnd, formatTime, initAudioContext]);

  // Delete selection (선택 부분 삭제)
  const deleteSelection = useCallback(() => {
    if (!audioBuffer || selectionStart === null || selectionEnd === null) {
      alert('삭제할 구간을 먼저 선택해주세요.');
      return;
    }

    try {
      // Stop playback
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
        setIsPlaying(false);
      }

      const actualStart = Math.min(selectionStart, selectionEnd);
      const actualEnd = Math.max(selectionStart, selectionEnd);
      
      const startSample = Math.floor(actualStart * audioBuffer.sampleRate);
      const endSample = Math.floor(actualEnd * audioBuffer.sampleRate);
      const originalLength = audioBuffer.length;
      const newLength = originalLength - (endSample - startSample);

      const audioContext = initAudioContext();
      const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        audioBuffer.sampleRate
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const originalData = audioBuffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);
        
        // 선택 영역 이전 부분 복사
        for (let i = 0; i < startSample; i++) {
          newData[i] = originalData[i];
        }
        
        // 선택 영역 이후 부분 복사
        for (let i = endSample; i < originalLength; i++) {
          newData[i - (endSample - startSample)] = originalData[i];
        }
      }

      setAudioBuffer(newBuffer);
      setCurrentTime(0);
      setSelectionStart(null);
      setSelectionEnd(null);
      
      // Update audio info
      setAudioInfo(prev => ({
        ...prev,
        duration: formatTime(newBuffer.duration)
      }));

      console.log('선택 부분 삭제 완료');
    } catch (error) {
      console.error('선택 부분 삭제 오류:', error);
      alert('선택 부분 삭제 중 오류가 발생했습니다.');
    }
  }, [audioBuffer, selectionStart, selectionEnd, formatTime, initAudioContext]);

  // Update waveform when selection changes
  useEffect(() => {
    if (audioBuffer && (selectionStart !== null || selectionEnd !== null)) {
      requestAnimationFrame(() => drawWaveform());
    }
  }, [audioBuffer, selectionStart, selectionEnd, drawWaveform]);

  // Update waveform when current time changes - 더 빈번한 업데이트를 위해 조건 제거
  useEffect(() => {
    if (audioBuffer) {
      requestAnimationFrame(() => drawWaveform());
    }
  }, [audioBuffer, currentTime, drawWaveform]);

  // Global mouse event handlers for drag selection
  useEffect(() => {
    const handleGlobalMouseUp = (e) => {
      // Always reset dragging state on any mouse up
      if (isDragging || isSelecting) {
        // Ensure selection start is before end if we have a valid selection
        if (selectionStart !== null && selectionEnd !== null && selectionStart > selectionEnd) {
          const temp = selectionStart;
          setSelectionStart(selectionEnd);
          setSelectionEnd(temp);
        }
      }
      
      setIsDragging(false);
      setIsSelecting(false);
      setMouseDownPos(null);
    };

    const handleGlobalMouseMove = (e) => {
      // Only process if we're actively dragging and selecting
      if (!audioBuffer || !isDragging || !isSelecting || !mouseDownPos) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      
      // Update selection end position
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const endProgress = x / canvas.width;
      setSelectionEnd(endProgress * audioBuffer.duration);
    };

    // Always add global mouseup listener to catch all mouse releases
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    // Only add global mousemove when actively dragging
    if (isDragging && isSelecting) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, isSelecting, audioBuffer, selectionStart, selectionEnd, mouseDownPos]);

  // Redraw waveform when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (audioBuffer) {
        requestAnimationFrame(() => drawWaveform());
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [audioBuffer]);

  return {
    canvasRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    selectionStart,
    selectionEnd,
    audioInfo,
    loadAudioFile,
    play,
    pause,
    stop,
    setVolumeValue,
    clearSelection,
    trimSelection,
    deleteSelection,
    applyFadeIn,
    applyFadeOut,
    downloadAudio,
    formatTime,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasMouseLeave,
    applyAmplify,
    applyReduce,
    applyNormalize,
    applyReverse
  };
};