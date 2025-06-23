import { useState, useRef, useCallback, useEffect, useContext } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, Image as ImageIcon, Crop, RotateCcw, Download, Scissors, Move, Undo, FolderOpen } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { t } from '../locales/translations';
import './ImageEditor.css';

const ImageEditor = () => {
  const { language } = useContext(LanguageContext);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [trueOriginalImage, setTrueOriginalImage] = useState(null); // 진짜 원본 보관
  const [exportFormat, setExportFormat] = useState('png');
  const [exportQuality, setExportQuality] = useState(0.9);
  
  // 크기 조절 상태
  const [resizeMode, setResizeMode] = useState('manual');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [newDimensions, setNewDimensions] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  
  // 자르기 상태
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);

  // 히스토리 관리
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 캔버스에 이미지 그리기
  const drawImageOnCanvas = useCallback((img, width, height, cropX = 0, cropY = 0, cropWidth = null, cropHeight = null) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    
    const maxDisplayWidth = 800;
    const maxDisplayHeight = 600;
    let displayWidth = width;
    let displayHeight = height;
    
    if (width > maxDisplayWidth || height > maxDisplayHeight) {
      const scale = Math.min(maxDisplayWidth / width, maxDisplayHeight / height);
      displayWidth = width * scale;
      displayHeight = height * scale;
    }
    
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    ctx.clearRect(0, 0, width, height);
    
    if (cropWidth && cropHeight) {
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
    } else {
      ctx.drawImage(img, 0, 0, width, height);
    }
  }, []);

  // 히스토리에 상태 저장
  const saveToHistory = useCallback((img, dims) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = dims.width;
    canvas.height = dims.height;
    ctx.drawImage(img, 0, 0, dims.width, dims.height);
    
    const historyItem = {
      image: img,
      dimensions: dims,
      dataUrl: canvas.toDataURL()
    };
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(historyItem);
      return newHistory.slice(-10); // 최대 10개 히스토리 유지
    });
    setHistoryIndex(prev => Math.min(prev + 1, 9));
  }, [historyIndex]);

  // 파일 업로드 처리
  const handleFileSelect = useCallback(async (file) => {
    if (file && file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setOriginalImage(img);
        setTrueOriginalImage(img); // 진짜 원본 저장
        setDimensions({ width: img.width, height: img.height });
        setNewDimensions({ width: img.width, height: img.height });
        setAspectRatio(img.width / img.height);
        setCropArea({ x: 0, y: 0, width: img.width, height: img.height });
        setCropMode(false);
        
        // 히스토리 초기화
        setHistory([]);
        setHistoryIndex(-1);
        
        setTimeout(() => {
          drawImageOnCanvas(img, img.width, img.height);
          saveToHistory(img, { width: img.width, height: img.height });
        }, 100);
      };
      img.onerror = () => {
        alert(t(language, 'imageEditor.errorImageLoad'));
      };
      img.src = URL.createObjectURL(file);
    } else {
      alert(t(language, 'imageEditor.errorImageOnly'));
    }
  }, [drawImageOnCanvas, language, saveToHistory]);

  // 새 파일 업로드
  const selectNewFile = () => {
    fileInputRef.current?.click();
  };

  // 수정 취소 (Undo)
  const undoLastChange = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setImage(prevState.image);
      setDimensions(prevState.dimensions);
      setNewDimensions(prevState.dimensions);
      setCropMode(false);
      drawImageOnCanvas(prevState.image, prevState.dimensions.width, prevState.dimensions.height);
      setHistoryIndex(prev => prev - 1);
    }
  };

  // 드래그 앤 드롭 처리
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

  // 크기 조절 처리
  const handleDimensionChange = (key, value) => {
    const numValue = parseInt(value) || 0;
    
    if (maintainAspectRatio && aspectRatio > 0) {
      if (key === 'width') {
        setNewDimensions({
          width: numValue,
          height: Math.round(numValue / aspectRatio)
        });
      } else {
        setNewDimensions({
          width: Math.round(numValue * aspectRatio),
          height: numValue
        });
      }
    } else {
      setNewDimensions(prev => ({ ...prev, [key]: numValue }));
    }
  };

  // 프리셋 크기 적용
  const applyPresetSize = (preset) => {
    if (!image) return;
    
    const presets = {
      '1920x1080': { width: 1920, height: 1080 },
      '1280x720': { width: 1280, height: 720 },
      '800x600': { width: 800, height: 600 },
      '640x480': { width: 640, height: 480 },
      '400x400': { width: 400, height: 400 },
      '300x300': { width: 300, height: 300 }
    };
    
    if (presets[preset]) {
      const newDims = presets[preset];
      setNewDimensions(newDims);
      drawImageOnCanvas(image, newDims.width, newDims.height);
      setDimensions(newDims);
      saveToHistory(image, newDims);
    }
  };

  // 비율로 크기 변경
  const applyScaleResize = (scale) => {
    if (!image) return;
    
    const newWidth = Math.round(dimensions.width * scale);
    const newHeight = Math.round(dimensions.height * scale);
    
    const newDims = { width: newWidth, height: newHeight };
    setNewDimensions(newDims);
    drawImageOnCanvas(image, newWidth, newHeight);
    setDimensions(newDims);
    saveToHistory(image, newDims);
  };

  // 크기 조절 적용
  const applyResize = () => {
    if (!image || newDimensions.width <= 0 || newDimensions.height <= 0) return;
    
    drawImageOnCanvas(image, newDimensions.width, newDimensions.height);
    setDimensions(newDimensions);
    saveToHistory(image, newDimensions);
  };

  // 자르기 모드 토글
  const toggleCropMode = () => {
    setCropMode(!cropMode);
    if (!cropMode && image) {
      const defaultSize = Math.min(dimensions.width, dimensions.height) * 0.6;
      setCropArea({
        x: 0,
        y: 0,
        width: defaultSize,
        height: defaultSize
      });
    }
  };

  // 리사이즈 핸들 감지
  const getResizeHandle = (mouseX, mouseY, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (mouseX - rect.left) * scaleX;
    const y = (mouseY - rect.top) * scaleY;
    
    const handleSize = 8;
    const tolerance = handleSize;
    
    // 핸들 위치들
    const handles = {
      'nw': { x: cropArea.x, y: cropArea.y },
      'ne': { x: cropArea.x + cropArea.width, y: cropArea.y },
      'sw': { x: cropArea.x, y: cropArea.y + cropArea.height },
      'se': { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
      'n': { x: cropArea.x + cropArea.width/2, y: cropArea.y },
      's': { x: cropArea.x + cropArea.width/2, y: cropArea.y + cropArea.height },
      'w': { x: cropArea.x, y: cropArea.y + cropArea.height/2 },
      'e': { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height/2 }
    };
    
    for (const [handle, pos] of Object.entries(handles)) {
      if (Math.abs(x - pos.x) <= tolerance && Math.abs(y - pos.y) <= tolerance) {
        return handle;
      }
    }
    
    // 자르기 영역 내부인지 확인
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      return 'move';
    }
    
    return null;
  };

  // 마우스 커서 변경
  const getCursorStyle = (handle) => {
    const cursors = {
      'nw': 'nw-resize',
      'ne': 'ne-resize',
      'sw': 'sw-resize',
      'se': 'se-resize',
      'n': 'n-resize',
      's': 's-resize',
      'w': 'w-resize',
      'e': 'e-resize',
      'move': 'move'
    };
    return cursors[handle] || 'crosshair';
  };

  // 자르기 마우스 이벤트
  const handleCropMouseDown = (e) => {
    if (!cropMode) return;
    
    const canvas = canvasRef.current;
    const handle = getResizeHandle(e.clientX, e.clientY, canvas);
    
    setResizeHandle(handle);
    setIsDraggingCrop(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCropMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (!isDraggingCrop) {
      // 마우스 커서 변경
      const handle = getResizeHandle(e.clientX, e.clientY, canvas);
      canvas.style.cursor = getCursorStyle(handle);
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const deltaX = (e.clientX - dragStart.x) * scaleX;
    const deltaY = (e.clientY - dragStart.y) * scaleY;
    
    let newCropArea = { ...cropArea };
    
    if (resizeHandle === 'move') {
      newCropArea.x = Math.max(0, Math.min(dimensions.width - cropArea.width, cropArea.x + deltaX));
      newCropArea.y = Math.max(0, Math.min(dimensions.height - cropArea.height, cropArea.y + deltaY));
    } else if (resizeHandle) {
      // 리사이즈 핸들 처리
      if (resizeHandle.includes('n')) {
        const newY = Math.max(0, cropArea.y + deltaY);
        newCropArea.height = cropArea.height + (cropArea.y - newY);
        newCropArea.y = newY;
      }
      if (resizeHandle.includes('s')) {
        newCropArea.height = Math.min(dimensions.height - cropArea.y, cropArea.height + deltaY);
      }
      if (resizeHandle.includes('w')) {
        const newX = Math.max(0, cropArea.x + deltaX);
        newCropArea.width = cropArea.width + (cropArea.x - newX);
        newCropArea.x = newX;
      }
      if (resizeHandle.includes('e')) {
        newCropArea.width = Math.min(dimensions.width - cropArea.x, cropArea.width + deltaX);
      }
      
      // 최소 크기 제한
      newCropArea.width = Math.max(20, newCropArea.width);
      newCropArea.height = Math.max(20, newCropArea.height);
    }
    
    setCropArea(newCropArea);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCropMouseUp = () => {
    setIsDraggingCrop(false);
    setResizeHandle(null);
  };

  // 자르기 적용
  const applyCrop = () => {
    if (!image || !cropMode) return;
    
    const { x, y, width, height } = cropArea;
    // 현재 이미지에서 자르기 (originalImage 대신 image 사용)
    drawImageOnCanvas(image, width, height, x, y, width, height);
    setDimensions({ width, height });
    setNewDimensions({ width, height });
    setCropMode(false);
    
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // originalImage는 업데이트하지 않음 (편집 전 상태 유지)
        saveToHistory(img, { width, height });
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  // 원본으로 되돌리기
  const resetToOriginal = () => {
    if (trueOriginalImage) {
      setImage(trueOriginalImage);
      setOriginalImage(trueOriginalImage);
      setDimensions({ width: trueOriginalImage.width, height: trueOriginalImage.height });
      setNewDimensions({ width: trueOriginalImage.width, height: trueOriginalImage.height });
      setCropMode(false);
      drawImageOnCanvas(trueOriginalImage, trueOriginalImage.width, trueOriginalImage.height);
      saveToHistory(trueOriginalImage, { width: trueOriginalImage.width, height: trueOriginalImage.height });
    }
  };

  // 이미지 다운로드
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL(`image/${exportFormat}`, exportQuality);
    const link = document.createElement('a');
    link.download = `edited-image.${exportFormat}`;
    link.href = dataUrl;
    link.click();
  };

  // 자르기 영역 시각화
  useEffect(() => {
    if (!image || !cropMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 원본 이미지 다시 그리기
    drawImageOnCanvas(image, dimensions.width, dimensions.height);
    
    // 자르기 오버레이 그리기
    ctx.save();
    
    // 어둡게 할 영역 (자르기 영역 외부)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // 자르기 영역 클리어 (원본 이미지 보이게)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    
    // 자르기 영역 테두리
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    
    // 리사이즈 핸들 그리기
    const handleSize = 8;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    
    const handles = [
      { x: cropArea.x, y: cropArea.y }, // nw
      { x: cropArea.x + cropArea.width, y: cropArea.y }, // ne
      { x: cropArea.x, y: cropArea.y + cropArea.height }, // sw
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height }, // se
      { x: cropArea.x + cropArea.width/2, y: cropArea.y }, // n
      { x: cropArea.x + cropArea.width/2, y: cropArea.y + cropArea.height }, // s
      { x: cropArea.x, y: cropArea.y + cropArea.height/2 }, // w
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height/2 }, // e
    ];
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
    });
    
    ctx.restore();
  }, [cropMode, cropArea, image, dimensions, drawImageOnCanvas]);

  // 이미지 로드 후 캔버스 표시
  useEffect(() => {
    if (image && dimensions.width > 0 && dimensions.height > 0 && !cropMode) {
      drawImageOnCanvas(image, dimensions.width, dimensions.height);
    }
  }, [image, dimensions, drawImageOnCanvas, cropMode]);

  if (!image) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
              <ImageIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{t(language, 'imageEditor.title')}</h1>
            <p className="text-lg text-muted-foreground">
              {t(language, 'imageEditor.description')}
            </p>
          </div>

          <Card 
            className={`border-2 border-dashed transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t(language, 'imageEditor.uploadTitle')}</h3>
              <p className="text-muted-foreground mb-6">
                {t(language, 'imageEditor.uploadDescription')}
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                {t(language, 'imageEditor.selectImage')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{t(language, 'imageEditor.title')}</h1>
          <p className="text-lg text-muted-foreground">
            {t(language, 'imageEditor.currentSize').replace('{width}', dimensions.width).replace('{height}', dimensions.height)}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex justify-center gap-4 mb-6">
          <Button onClick={selectNewFile} variant="outline">
            <FolderOpen className="w-4 h-4 mr-2" />
            {t(language, 'imageEditor.selectNewFile')}
          </Button>
          <Button 
            onClick={undoLastChange} 
            variant="outline"
            disabled={historyIndex <= 0}
          >
            <Undo className="w-4 h-4 mr-2" />
            {t(language, 'imageEditor.undo')}
          </Button>
          <Button onClick={resetToOriginal} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t(language, 'imageEditor.resetOriginal')}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Canvas Area - 왼쪽 */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      className="border border-border rounded-lg shadow-sm max-w-full"
                      onMouseDown={cropMode ? handleCropMouseDown : undefined}
                      onMouseMove={cropMode ? handleCropMouseMove : undefined}
                      onMouseUp={cropMode ? handleCropMouseUp : undefined}
                      style={{ cursor: cropMode ? 'crosshair' : 'default' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls - 오른쪽 */}
          <div className="space-y-6">
            {/* Resize Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Move className="h-5 w-5" />
                  {t(language, 'imageEditor.resize')}
                </CardTitle>
                <CardDescription>
                  {t(language, 'imageEditor.resizeDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t(language, 'imageEditor.mode')}</Label>
                  <Select value={resizeMode} onValueChange={setResizeMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">{t(language, 'imageEditor.manualMode')}</SelectItem>
                      <SelectItem value="preset">{t(language, 'imageEditor.presetMode')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">{t(language, 'imageEditor.dimensions')}</h4>
                  <p className="text-sm text-muted-foreground">{dimensions.width} × {dimensions.height}</p>
                </div>

                {resizeMode === 'manual' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t(language, 'imageEditor.newDimensions')}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">{t(language, 'common.width')}</Label>
                          <Input
                            type="number"
                            value={newDimensions.width}
                            onChange={(e) => handleDimensionChange('width', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t(language, 'common.height')}</Label>
                          <Input
                            type="number"
                            value={newDimensions.height}
                            onChange={(e) => handleDimensionChange('height', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="aspect-ratio"
                        checked={maintainAspectRatio}
                        onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      />
                      <Label htmlFor="aspect-ratio" className="text-sm">
                        {t(language, 'imageEditor.maintainRatio')}
                      </Label>
                    </div>

                    <Button onClick={applyResize} className="w-full">
                      {t(language, 'imageEditor.applyResize')}
                    </Button>
                  </div>
                )}

                {resizeMode === 'preset' && (
                  <div className="space-y-2">
                    <Label>{t(language, 'imageEditor.presetSizes')}</Label>
                    <div className="grid gap-2">
                      {['1920x1080', '1280x720', '800x600', '640x480', '400x400', '300x300'].map(preset => (
                        <Button
                          key={preset}
                          variant="outline"
                          size="sm"
                          onClick={() => applyPresetSize(preset)}
                        >
                          {preset}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{t(language, 'imageEditor.scaleResize')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[0.25, 0.5, 0.75, 1.5, 2].map(scale => (
                      <Button
                        key={scale}
                        variant="outline"
                        size="sm"
                        onClick={() => applyScaleResize(scale)}
                      >
                        {t(language, `imageEditor.scale${Math.round(scale * 100)}`)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crop Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  {t(language, 'imageEditor.crop')}
                </CardTitle>
                <CardDescription>
                  {t(language, 'imageEditor.cropDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={toggleCropMode}
                  variant={cropMode ? "default" : "outline"}
                  className="w-full"
                >
                  <Crop className="w-4 h-4 mr-2" />
                  {cropMode ? t(language, 'imageEditor.exitCrop') : t(language, 'imageEditor.startCrop')}
                </Button>

                {cropMode && (
                  <div className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">{t(language, 'imageEditor.cropArea')}</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>X: {Math.round(cropArea.x)}</div>
                        <div>Y: {Math.round(cropArea.y)}</div>
                        <div>W: {Math.round(cropArea.width)}</div>
                        <div>H: {Math.round(cropArea.height)}</div>
                      </div>
                    </div>

                    <Button onClick={applyCrop} className="w-full">
                      {t(language, 'imageEditor.applyCrop')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {t(language, 'imageEditor.export')}
                </CardTitle>
                <CardDescription>
                  {t(language, 'imageEditor.exportDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t(language, 'imageEditor.exportFormat')}</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(exportFormat === 'jpeg' || exportFormat === 'webp') && (
                  <div className="space-y-2">
                    <Label>{t(language, 'imageEditor.jpegQuality')}: {Math.round(exportQuality * 100)}%</Label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={exportQuality}
                      onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}

                <Button onClick={downloadImage} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  {t(language, 'imageEditor.downloadImage')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageEditor;