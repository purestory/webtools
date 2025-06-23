import { useRef, useState, useMemo, useEffect } from 'react';
import { useAudioEditor } from '../hooks/useAudioEditor';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../locales/translations';
import './AudioEditor.css';

const AudioEditor = () => {
  const fileInputRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const amplifySliderRef = useRef(null);
  const reduceSliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [amplifyValue, setAmplifyValue] = useState(150);
  const [reduceValue, setReduceValue] = useState(50);
  const [exportFormat, setExportFormat] = useState('wav');

  const {
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
  } = useAudioEditor();

  const { language } = useLanguage();

  // 선택된 구간의 시간을 시:분:초로 분해하는 함수
  const parseTime = (seconds) => {
    if (seconds === null || isNaN(seconds)) return { hours: 0, minutes: 0, seconds: 0 };
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return { hours, minutes, seconds: secs };
  };

  // 메모이제이션으로 성능 최적화
  const startTime = useMemo(() => parseTime(selectionStart), [selectionStart]);
  const endTime = useMemo(() => parseTime(selectionEnd), [selectionEnd]);

  const handleFileSelect = async (file) => {
    if (file && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
      const success = await loadAudioFile(file);
      if (success) {
        // 성공적으로 로드됨
      }
    } else {
      // 파일 확장자로도 체크
      const validExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'mp4', 'mov', 'avi', 'mkv', 'webm'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      
      if (validExtensions.includes(fileExtension)) {
        const success = await loadAudioFile(file);
        if (success) {
          // 성공적으로 로드됨
        }
      } else {
        alert(t(language, 'audioEditor.errors.invalidFileType'));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 슬라이더 스타일 업데이트 함수
  const updateSliderStyle = (slider, value, min, max) => {
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--muted)) ${percentage}%, hsl(var(--muted)) 100%)`;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    console.log('Volume changed:', newVolume);
    setVolumeValue(newVolume);
    
    // 슬라이더 스타일 업데이트
    updateSliderStyle(e.target, newVolume, 0, 100);
  };

  // 개별 슬라이더 스타일 업데이트 함수들
  const updateVolumeSliderStyle = () => {
    if (volumeSliderRef.current) {
      updateSliderStyle(volumeSliderRef.current, volume, 0, 100);
    }
  };

  const updateAmplifySliderStyle = () => {
    if (amplifySliderRef.current) {
      updateSliderStyle(amplifySliderRef.current, amplifyValue, 100, 300);
    }
  };

  const updateReduceSliderStyle = () => {
    if (reduceSliderRef.current) {
      updateSliderStyle(reduceSliderRef.current, reduceValue, 10, 100);
    }
  };

  const handleAmplifyChange = (e) => {
    const value = parseInt(e.target.value);
    setAmplifyValue(value);
    
    // 슬라이더 스타일 업데이트
    updateSliderStyle(e.target, value, 100, 300);
  };

  const handleReduceChange = (e) => {
    const value = parseInt(e.target.value);
    setReduceValue(value);
    
    // 슬라이더 스타일 업데이트
    updateSliderStyle(e.target, value, 10, 100);
  };

  const handleApplyAmplify = () => {
    if (selectionStart !== null && selectionEnd !== null) {
      applyAmplify(amplifyValue / 100, selectionStart, selectionEnd);
    }
  };

  const handleApplyReduce = () => {
    if (selectionStart !== null && selectionEnd !== null) {
      applyReduce(reduceValue / 100, selectionStart, selectionEnd);
    }
  };

  const handleApplyNormalize = () => {
    applyNormalize();
  };

  const handleApplyReverse = () => {
    applyReverse();
  };

  // 각 슬라이더별 개별 useEffect로 확실하게 처리
  useEffect(() => {
    const timer1 = setTimeout(updateVolumeSliderStyle, 0);
    const timer2 = setTimeout(updateVolumeSliderStyle, 100);
    const timer3 = setTimeout(updateVolumeSliderStyle, 300);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [volume]);

  useEffect(() => {
    const timer1 = setTimeout(updateAmplifySliderStyle, 0);
    const timer2 = setTimeout(updateAmplifySliderStyle, 100);
    const timer3 = setTimeout(updateAmplifySliderStyle, 300);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [amplifyValue]);

  useEffect(() => {
    const timer1 = setTimeout(updateReduceSliderStyle, 0);
    const timer2 = setTimeout(updateReduceSliderStyle, 100);
    const timer3 = setTimeout(updateReduceSliderStyle, 300);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [reduceValue]);

  return (
    <div className="audio-editor-page">
      <div className="container">
        {/* Page Header */}
                  <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{t(language, 'audioEditor.title')}</h1>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1rem' }}>
              {t(language, 'audioEditor.description')}
            </p>
          </div>

        {/* Upload Section */}
        <div className="card">
          <div className="card-content" style={{ padding: '1rem' }}>
            <div
              className={`upload-area ${isDragging ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" x2="12" y1="15" y2="3"></line>
                </svg>
              </div>
                              <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{t(language, 'audioEditor.upload.title')}</h4>
                <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>{t(language, 'audioEditor.upload.subtitle')}</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span className="badge badge-outline">MP3</span>
                <span className="badge badge-outline">WAV</span>
                <span className="badge badge-outline">OGG</span>
                <span className="badge badge-outline">MP4</span>
                <span className="badge badge-outline">MOV</span>
                <span className="badge badge-outline">AVI</span>
                <span className="badge badge-outline">WebM</span>
              </div>
              
              {/* Audio Info inside upload area */}
              {audioInfo.fileName && (
                <div style={{ display: 'block', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border))' }}>
                  <div style={{ textAlign: 'left' }}>
                                          <div className="label" style={{ marginBottom: '0.5rem', color: 'hsl(var(--primary))' }}>{t(language, 'audioEditor.upload.fileInfo')}</div>
                      <div style={{ marginBottom: '1rem' }}>
                                              <div className="label" style={{ fontSize: '0.875rem' }}>{t(language, 'audioEditor.upload.fileName')}</div>
                        <div style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem', fontWeight: '500' }}>{audioInfo.fileName}</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                        <div>
                          <div className="label" style={{ fontSize: '0.875rem' }}>{t(language, 'audioEditor.upload.duration')}</div>
                          <div style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>{audioInfo.duration}</div>
                        </div>
                        <div>
                          <div className="label" style={{ fontSize: '0.875rem' }}>{t(language, 'audioEditor.upload.fileSize')}</div>
                          <div style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>{audioInfo.fileSize}</div>
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
          </div>
        </div>

        {/* Combined Waveform and Controls */}
        {audioInfo.fileName && (
          <div className="card" style={{ display: 'block', marginTop: '0.5rem' }}>
            <div className="card-content" style={{ padding: '1rem' }}>
              {/* Combined Playback and Volume Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '0.5rem' }}>
                {/* Playback Controls */}
                                  <div className="control-group">
                    <div className="label">{t(language, 'audioEditor.controls.playbackControls')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="playback-controls">
                      <button 
                        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 w-10" 
                        onClick={play} 
                        disabled={!audioInfo.fileName || isPlaying}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5,3 19,12 5,21"></polygon>
                        </svg>
                      </button>
                      <button 
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background h-10 w-10" 
                        onClick={pause} 
                        disabled={!audioInfo.fileName || !isPlaying}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="6" y="4" width="4" height="16"></rect>
                          <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                      </button>
                      <button 
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background h-10 w-10" 
                        onClick={stop} 
                        disabled={!audioInfo.fileName}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        </svg>
                      </button>
                      
                      {/* Volume Control next to playback buttons */}
                      <div className="volume-slider-container" style={{ marginLeft: '1rem', flex: '1', maxWidth: '200px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                        <input 
                          ref={volumeSliderRef}
                          type="range" 
                          className="volume-slider" 
                          min="0" 
                          max="100" 
                          value={volume || 50} 
                          onChange={handleVolumeChange} 
                          disabled={!audioInfo.fileName}
                          style={{ 
                            flex: 1, 
                            margin: '0 0.5rem',
                            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${volume || 50}%, hsl(var(--muted)) ${volume || 50}%, hsl(var(--muted)) 100%)`
                          }}
                        />
                        <span className="badge badge-default" style={{ minWidth: '50px', textAlign: 'center', flexShrink: 0, fontWeight: '600' }}>
                          {volume || 50}%
                        </span>
                      </div>
                    </div>
                    <div className="time-display">
                      <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Selection Controls */}
                                  <div className="control-group">
                    <div className="label" style={{ marginBottom: '1rem' }}>{t(language, 'audioEditor.controls.selection')}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      {/* 시작 시간 */}
                      <div>
                        <div className="label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'hsl(var(--primary))' }}>{t(language, 'audioEditor.controls.startTime')}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="number" className="input" placeholder="Hr" min="0" max="23" value={startTime.hours || ''} disabled={!audioInfo.fileName} style={{ width: '60px', height: '40px', fontSize: '0.9rem', textAlign: 'center' }} readOnly />
                        <span style={{ fontSize: '1rem', fontWeight: '500' }}>:</span>
                        <input type="number" className="input" placeholder="Min" min="0" max="59" value={startTime.minutes || ''} disabled={!audioInfo.fileName} style={{ width: '60px', height: '40px', fontSize: '0.9rem', textAlign: 'center' }} readOnly />
                        <span style={{ fontSize: '1rem', fontWeight: '500' }}>:</span>
                        <input type="number" className="input" placeholder="Sec" min="0" max="59" step="0.1" value={startTime.seconds || ''} disabled={!audioInfo.fileName} style={{ width: '80px', height: '40px', fontSize: '0.9rem', textAlign: 'center' }} readOnly />
                      </div>
                    </div>
                                          {/* 종료 시간 */}
                      <div>
                        <div className="label" style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'hsl(var(--primary))' }}>{t(language, 'audioEditor.controls.endTime')}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="number" className="input" placeholder="Hr" min="0" max="23" value={endTime.hours || ''} disabled={!audioInfo.fileName} style={{ width: '60px', height: '40px', fontSize: '0.9rem', textAlign: 'center' }} readOnly />
                        <span style={{ fontSize: '1rem', fontWeight: '500' }}>:</span>
                        <input type="number" className="input" placeholder="Min" min="0" max="59" value={endTime.minutes || ''} disabled={!audioInfo.fileName} style={{ width: '60px', height: '40px', fontSize: '0.9rem', textAlign: 'center' }} readOnly />
                        <span style={{ fontSize: '1rem', fontWeight: '500' }}>:</span>
                        <input type="number" className="input" placeholder="Sec" min="0" max="59" step="0.1" value={endTime.seconds || ''} disabled={!audioInfo.fileName} style={{ width: '80px', height: '40px', fontSize: '0.9rem', textAlign: 'center' }} readOnly />
                      </div>
                    </div>
                  </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <button className="button button-outline button-sm" onClick={clearSelection} disabled={!audioInfo.fileName}>{t(language, 'audioEditor.controls.clearSelection')}</button>
                    </div>
                </div>
              </div>

              {/* Waveform */}
              <div className="waveform-container">
                <canvas 
                  ref={canvasRef} 
                  className="waveform-canvas"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseLeave}
                ></canvas>
                <div className="timeline" style={{ left: '0' }}></div>
                <div className="selection-area" style={{ display: 'none' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Effects */}
        {audioInfo.fileName && (
          <div className="card" id="effectsCard" style={{ display: 'block', marginTop: '0.5rem' }}>
            <div className="card-content" style={{ padding: '1rem' }}>
              {/* Selection Edit Section - 먼저 배치 */}
              <div className="selection-edit-section" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--secondary) / 0.3)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'hsl(var(--primary))' }}>{t(language, 'audioEditor.controls.selectionEdit')}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <button className="button button-primary" onClick={() => trimSelection()} disabled={!audioInfo.fileName}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4"></path>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3Z"></path>
                      <path d="M3 5v6h6"></path>
                      <path d="M21 19v-6h-6"></path>
                    </svg>
                    {t(language, 'audioEditor.controls.keepSelection')}
                  </button>
                  <button className="button button-destructive" onClick={() => deleteSelection()} disabled={!audioInfo.fileName}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      <line x1="10" x2="10" y1="11" y2="17"></line>
                      <line x1="14" x2="14" y1="11" y2="17"></line>
                    </svg>
                    {t(language, 'audioEditor.controls.deleteSelection')}
                  </button>
                </div>
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'hsl(var(--muted) / 0.3)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 6v6l4 2"></path>
                    </svg>
                    <span style={{ fontWeight: '500' }}>{t(language, 'audioEditor.controls.usage')}</span>
                  </div>
                  <div style={{ marginLeft: '1.25rem' }}>
                    {t(language, 'audioEditor.controls.usageText')}
                  </div>
                </div>
              </div>

              {/* Volume Controls Section - 두 번째로 배치 */}
              <div className="volume-effects-section" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'hsl(var(--primary))' }}>{t(language, 'audioEditor.controls.volumeControlTitle')}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {/* 증폭 컨트롤 */}
                  <div className="volume-control-group">
                    <div className="label" style={{ marginBottom: '0.5rem' }}>{t(language, 'audioEditor.controls.amplifyTitle')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input 
                        ref={amplifySliderRef} 
                        type="range" 
                        className="volume-slider" 
                        min="100" 
                        max="300" 
                        value={amplifyValue} 
                        onChange={handleAmplifyChange} 
                        disabled={!audioInfo.fileName} 
                        style={{ 
                          flex: '1',
                          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((amplifyValue - 100) / (300 - 100)) * 100}%, hsl(var(--muted)) ${((amplifyValue - 100) / (300 - 100)) * 100}%, hsl(var(--muted)) 100%)`
                        }} 
                      />
                      <span className="badge badge-default" style={{ minWidth: '60px' }}>{amplifyValue}%</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      <button className="button button-sm button-outline" onClick={() => setAmplifyValue(110)} disabled={!audioInfo.fileName}>110%</button>
                      <button className="button button-sm button-outline" onClick={() => setAmplifyValue(125)} disabled={!audioInfo.fileName}>125%</button>
                      <button className="button button-sm button-outline" onClick={() => setAmplifyValue(150)} disabled={!audioInfo.fileName}>150%</button>
                      <button className="button button-sm button-outline" onClick={() => setAmplifyValue(200)} disabled={!audioInfo.fileName}>200%</button>
                    </div>
                    <button className="button button-primary button-sm" onClick={handleApplyAmplify} disabled={!audioInfo.fileName} style={{ marginTop: '0.5rem', width: '100%' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        <line x1="22" x2="22" y1="9" y2="15"></line>
                        <line x1="19" x2="25" y1="12" y2="12"></line>
                      </svg>
                      {t(language, 'audioEditor.controls.applyAmplifyButton')}
                    </button>
                  </div>
                  
                  {/* 감소 컨트롤 */}
                  <div className="volume-control-group">
                    <div className="label" style={{ marginBottom: '0.5rem' }}>{t(language, 'audioEditor.controls.reduceTitle')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input 
                        ref={reduceSliderRef} 
                        type="range" 
                        className="volume-slider" 
                        min="10" 
                        max="100" 
                        value={reduceValue} 
                        onChange={handleReduceChange} 
                        disabled={!audioInfo.fileName} 
                        style={{ 
                          flex: '1',
                          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((reduceValue - 10) / (100 - 10)) * 100}%, hsl(var(--muted)) ${((reduceValue - 10) / (100 - 10)) * 100}%, hsl(var(--muted)) 100%)`
                        }} 
                      />
                      <span className="badge badge-secondary" style={{ minWidth: '60px' }}>{reduceValue}%</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      <button className="button button-sm button-outline" onClick={() => setReduceValue(75)} disabled={!audioInfo.fileName}>75%</button>
                      <button className="button button-sm button-outline" onClick={() => setReduceValue(50)} disabled={!audioInfo.fileName}>50%</button>
                      <button className="button button-sm button-outline" onClick={() => setReduceValue(25)} disabled={!audioInfo.fileName}>25%</button>
                      <button className="button button-sm button-outline" onClick={() => setReduceValue(10)} disabled={!audioInfo.fileName}>10%</button>
                    </div>
                    <button className="button button-primary button-sm" onClick={handleApplyReduce} disabled={!audioInfo.fileName} style={{ marginTop: '0.5rem', width: '100%' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
                        <line x1="23" x2="17" y1="9" y2="15"></line>
                        <line x1="17" x2="23" y1="9" y2="15"></line>
                      </svg>
                      {t(language, 'audioEditor.controls.applyReduceButton')}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Other Effects */}

              <div className="effects-grid">
                <button className="effect-button" disabled={!audioInfo.fileName} onClick={applyFadeIn}>
                  <div className="effect-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12h18l-3-3m0 6l3-3"></path>
                    </svg>
                  </div>
                  <span>{t(language, 'audioEditor.controls.fadeInButton')}</span>
                </button>
                <button className="effect-button" disabled={!audioInfo.fileName} onClick={applyFadeOut}>
                  <div className="effect-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12H3l3-3m0 6l-3-3"></path>
                    </svg>
                  </div>
                  <span>{t(language, 'audioEditor.controls.fadeOutButton')}</span>
                </button>
                <button className="effect-button" disabled={!audioInfo.fileName} onClick={handleApplyNormalize}>
                  <div className="effect-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M2 7l10-5 10 5-10 5z"></path>
                    </svg>
                  </div>
                  <span>{t(language, 'audioEditor.controls.normalizeButton')}</span>
                </button>
                <button className="effect-button" disabled={!audioInfo.fileName} onClick={handleApplyReverse}>
                  <div className="effect-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"></path>
                      <path d="M8 21l4-7 4 7"></path>
                    </svg>
                  </div>
                  <span>{t(language, 'audioEditor.controls.reverseButton')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export */}
        {audioInfo.fileName && (
          <div className="card" id="exportCard" style={{ display: 'block', marginTop: '0.5rem' }}>
            <div className="card-content" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', padding: '1rem', background: 'linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--primary) / 0.1))', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--primary) / 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--primary))' }}>
                    <path d="M3 17v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"></path>
                    <polyline points="8,12 12,16 16,12"></polyline>
                    <line x1="12" x2="12" y1="2" y2="16"></line>
                  </svg>
                  <span style={{ fontWeight: '500', color: 'hsl(var(--primary))' }}>{t(language, 'audioEditor.controls.fileFormat')}</span>
                  <select className="input" style={{ width: 'auto', minWidth: '80px' }} value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                    <option value="wav">WAV</option>
                    <option value="mp3">MP3</option>
                    <option value="ogg">OGG Vorbis</option>
                  </select>
                </div>
                <button className="button button-primary button-lg" disabled={!audioInfo.fileName} onClick={() => downloadAudio(exportFormat)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 17v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"></path>
                    <polyline points="8,12 12,16 16,12"></polyline>
                    <line x1="12" x2="12" y1="2" y2="16"></line>
                  </svg>
                  {t(language, 'audioEditor.controls.downloadButton')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AudioEditor;