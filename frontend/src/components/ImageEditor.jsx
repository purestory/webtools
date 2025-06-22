import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, Image as ImageIcon, Crop, RotateCcw, Download, Scissors, Move } from 'lucide-react';
import './ImageEditor.css';

const ImageEditor = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [exportFormat, setExportFormat] = useState('png');
  const [exportQuality, setExportQuality] = useState(0.9);
  
  // 크기 조절 상태
  const [resizeMode, setResizeMode] = useState('manual'); // 'manual', 'preset', 'crop'
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

  // 캔버스에 이미지 그리기
  const drawImageOnCanvas = useCallback((img, width, height, cropX = 0, cropY = 0, cropWidth = null, cropHeight = null) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) {
      console.log('Canvas or image not available:', { canvas: !!canvas, img: !!img });
      return;
    }

    try {
      const ctx = canvas.getContext('2d');
      
      // 캔버스 크기 설정
      canvas.width = width;
      canvas.height = height;
      
      // 표시용 크기 제한 (너무 큰 이미지는 화면에 맞게 축소)
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
      
      // 캔버스 초기화
      ctx.clearRect(0, 0, width, height);
      
      if (cropWidth && cropHeight) {
        // 자르기 모드
        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
      } else {
        // 일반 크기 조절
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      console.log('Image drawn on canvas:', { width, height, displayWidth, displayHeight });
    } catch (error) {
      console.error('Error drawing image on canvas:', error);
    }
  }, []);

  // 파일 업로드 처리
  const handleFileSelect = useCallback(async (file) => {
    if (file && file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded:', img.width, 'x', img.height);
        setImage(img);
        setOriginalImage(img);
        setDimensions({ width: img.width, height: img.height });
        setNewDimensions({ width: img.width, height: img.height });
        setAspectRatio(img.width / img.height);
        setCropArea({ x: 0, y: 0, width: img.width, height: img.height });
        
        // 약간의 지연 후 캔버스에 그리기
        setTimeout(() => {
          drawImageOnCanvas(img, img.width, img.height);
        }, 100);
      };
      img.onerror = (error) => {
        console.error('Image load error:', error);
        alert('이미지를 로드할 수 없습니다.');
      };
      img.src = URL.createObjectURL(file);
    } else {
      alert('이미지 파일만 업로드할 수 있습니다.');
    }
  }, [drawImageOnCanvas]);

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
    const presets = {
      '1920x1080': { width: 1920, height: 1080 },
      '1280x720': { width: 1280, height: 720 },
      '800x600': { width: 800, height: 600 },
      '640x480': { width: 640, height: 480 },
      '400x400': { width: 400, height: 400 },
      '300x300': { width: 300, height: 300 }
    };
    
    if (presets[preset]) {
      setNewDimensions(presets[preset]);
    }
  };

  // 비율로 크기 변경
  const applyScaleResize = (scale) => {
    if (!image) return;
    
    const newWidth = Math.round(dimensions.width * scale);
    const newHeight = Math.round(dimensions.height * scale);
    
    setNewDimensions({ width: newWidth, height: newHeight });
  };

  // 크기 조절 적용
  const applyResize = () => {
    if (!image || newDimensions.width <= 0 || newDimensions.height <= 0) return;
    
    drawImageOnCanvas(image, newDimensions.width, newDimensions.height);
    setDimensions(newDimensions);
  };

  // 자르기 모드 토글
  const toggleCropMode = () => {
    setCropMode(!cropMode);
    if (!cropMode && image) {
      // 자르기 모드 시작 - 좌측 상부에 기본 자르기 영역 설정
      const defaultSize = Math.min(dimensions.width, dimensions.height) * 0.6;
      setCropArea({
        x: 0, // 좌측 상부로 변경
        y: 0, // 좌측 상부로 변경
        width: defaultSize,
        height: defaultSize
      });
    }
  };

  // 마우스 좌표 계산 헬퍼 함수
  const getCanvasCoordinates = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = dimensions.width / rect.width;
    const scaleY = dimensions.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, [dimensions]);

  // 리사이즈 핸들 위치 확인
  const getResizeHandle = useCallback((x, y) => {
    const handleSize = 10;
    const { x: cropX, y: cropY, width, height } = cropArea;
    
    // 모서리 핸들들
    if (Math.abs(x - cropX) < handleSize && Math.abs(y - cropY) < handleSize) return 'nw';
    if (Math.abs(x - (cropX + width)) < handleSize && Math.abs(y - cropY) < handleSize) return 'ne';
    if (Math.abs(x - cropX) < handleSize && Math.abs(y - (cropY + height)) < handleSize) return 'sw';
    if (Math.abs(x - (cropX + width)) < handleSize && Math.abs(y - (cropY + height)) < handleSize) return 'se';
    
    // 변 핸들들
    if (Math.abs(x - (cropX + width/2)) < handleSize && Math.abs(y - cropY) < handleSize) return 'n';
    if (Math.abs(x - (cropX + width/2)) < handleSize && Math.abs(y - (cropY + height)) < handleSize) return 's';
    if (Math.abs(x - cropX) < handleSize && Math.abs(y - (cropY + height/2)) < handleSize) return 'w';
    if (Math.abs(x - (cropX + width)) < handleSize && Math.abs(y - (cropY + height/2)) < handleSize) return 'e';
    
    return null;
  }, [cropArea]);

  // 커서 스타일 가져오기
  const getCursorStyle = useCallback((handle) => {
    switch (handle) {
      case 'nw': return 'nw-resize';
      case 'ne': return 'ne-resize';
      case 'sw': return 'sw-resize';
      case 'se': return 'se-resize';
      case 'n': return 'n-resize';
      case 's': return 's-resize';
      case 'w': return 'w-resize';
      case 'e': return 'e-resize';
      default: return 'default';
    }
  }, []);

  // 캔버스 마우스 호버 이벤트
  const handleCanvasMouseMove = useCallback((e) => {
    if (!cropMode) return;
    
    const { x, y } = getCanvasCoordinates(e);
    const handle = getResizeHandle(x, y);
    const canvas = canvasRef.current;
    
    if (handle) {
      canvas.style.cursor = getCursorStyle(handle);
    } else if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
               y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      canvas.style.cursor = 'move';
    } else {
      canvas.style.cursor = 'default';
    }
  }, [cropMode, getCanvasCoordinates, getResizeHandle, getCursorStyle, cropArea]);

  // 핸들에 따른 자르기 영역 업데이트
  const updateCropAreaWithHandle = useCallback((x, y) => {
    const { x: cropX, y: cropY, width, height } = cropArea;
    let newCropArea = { ...cropArea };
    
    switch (resizeHandle) {
      case 'nw':
        newCropArea.x = Math.max(0, x);
        newCropArea.y = Math.max(0, y);
        newCropArea.width = Math.max(10, cropX + width - newCropArea.x);
        newCropArea.height = Math.max(10, cropY + height - newCropArea.y);
        break;
      case 'ne':
        newCropArea.y = Math.max(0, y);
        newCropArea.width = Math.max(10, x - cropX);
        newCropArea.height = Math.max(10, cropY + height - newCropArea.y);
        break;
      case 'sw':
        newCropArea.x = Math.max(0, x);
        newCropArea.width = Math.max(10, cropX + width - newCropArea.x);
        newCropArea.height = Math.max(10, y - cropY);
        break;
      case 'se':
        newCropArea.width = Math.max(10, x - cropX);
        newCropArea.height = Math.max(10, y - cropY);
        break;
      case 'n':
        newCropArea.y = Math.max(0, y);
        newCropArea.height = Math.max(10, cropY + height - newCropArea.y);
        break;
      case 's':
        newCropArea.height = Math.max(10, y - cropY);
        break;
      case 'w':
        newCropArea.x = Math.max(0, x);
        newCropArea.width = Math.max(10, cropX + width - newCropArea.x);
        break;
      case 'e':
        newCropArea.width = Math.max(10, x - cropX);
        break;
    }
    
    // 경계 체크
    if (newCropArea.x + newCropArea.width > dimensions.width) {
      newCropArea.width = dimensions.width - newCropArea.x;
    }
    if (newCropArea.y + newCropArea.height > dimensions.height) {
      newCropArea.height = dimensions.height - newCropArea.y;
    }
    
    setCropArea(newCropArea);
  }, [cropArea, resizeHandle, dimensions]);

  // 자르기 영역 마우스 이벤트
  const handleCropMouseDown = (e) => {
    if (!cropMode) return;
    
    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e);
    
    // 리사이즈 핸들 체크
    const handle = getResizeHandle(x, y);
    if (handle) {
      setResizeHandle(handle);
      setIsDraggingCrop(true);
      setDragStart({ x, y });
      return;
    }
    
    // 자르기 영역 내부 클릭 체크
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setIsDraggingCrop(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleCropMouseMove = useCallback((e) => {
    if (!cropMode || !isDraggingCrop) return;
    
    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e);
    
    if (resizeHandle) {
      // 리사이즈 핸들 드래그
      updateCropAreaWithHandle(x, y);
    } else {
      // 자르기 영역 이동
      const newX = Math.max(0, Math.min(x - dragStart.x, dimensions.width - cropArea.width));
      const newY = Math.max(0, Math.min(y - dragStart.y, dimensions.height - cropArea.height));
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    }
  }, [cropMode, isDraggingCrop, getCanvasCoordinates, resizeHandle, dragStart, cropArea, dimensions, updateCropAreaWithHandle]);

  const handleCropMouseUp = useCallback(() => {
    setIsDraggingCrop(false);
    setResizeHandle(null);
  }, []);

  // 전역 마우스 이벤트 등록 (드래그 중에 마우스가 캔버스를 벗어나도 계속 추적)
  useEffect(() => {
    if (isDraggingCrop) {
      document.addEventListener('mousemove', handleCropMouseMove);
      document.addEventListener('mouseup', handleCropMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleCropMouseMove);
        document.removeEventListener('mouseup', handleCropMouseUp);
      };
    }
  }, [isDraggingCrop, handleCropMouseMove, handleCropMouseUp]);

  // 자르기 모드 변경 시 캔버스 커서 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !cropMode) {
      canvas.style.cursor = 'default';
    }
  }, [cropMode]);

  // 자르기 적용
  const applyCrop = () => {
    if (!image || !cropMode) return;
    
    const { x, y, width, height } = cropArea;
    drawImageOnCanvas(originalImage, width, height, x, y, width, height);
    setDimensions({ width, height });
    setNewDimensions({ width, height });
    setCropMode(false);
    
    // 새로운 이미지 객체 생성
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setOriginalImage(img);
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  // 원본으로 되돌리기
  const resetToOriginal = () => {
    if (!originalImage) return;
    
    setImage(originalImage);
    setDimensions({ width: originalImage.width, height: originalImage.height });
    setNewDimensions({ width: originalImage.width, height: originalImage.height });
    drawImageOnCanvas(originalImage, originalImage.width, originalImage.height);
    setCropMode(false);
  };

  // 이미지 다운로드
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    
    if (exportFormat === 'jpg' || exportFormat === 'jpeg') {
      link.download = `edited-image.${exportFormat}`;
      link.href = canvas.toDataURL('image/jpeg', exportQuality);
    } else {
      link.download = `edited-image.${exportFormat}`;
      link.href = canvas.toDataURL(`image/${exportFormat}`);
    }
    
    link.click();
  };

  // 이미지 로드 후 캔버스 표시 확인
  useEffect(() => {
    if (image && dimensions.width > 0 && dimensions.height > 0) {
      console.log('Image state updated, redrawing canvas');
      drawImageOnCanvas(image, dimensions.width, dimensions.height);
    }
  }, [image, dimensions, drawImageOnCanvas]);

  // 자르기 영역 그리기
  useEffect(() => {
    if (!cropMode || !image) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 이미지 다시 그리기
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
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    
    // 리사이즈 핸들 그리기
    const handleSize = 8;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <ImageIcon className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">이미지 편집기</h1>
          <p className="text-muted-foreground">
            이미지 크기 조절과 파일 형식 변환을 위한 간단한 이미지 편집기입니다.
          </p>
        </div>

        {/* 업로드 영역 */}
        {!image && (
          <Card>
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:bg-muted/50 ${
                  isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">이미지 업로드</h3>
                <p className="text-muted-foreground mb-4">
                  이미지 파일을 드래그하거나 클릭해서 선택하세요
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <span className="px-2 py-1 bg-muted rounded text-xs">JPG</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">PNG</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">WebP</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">GIF</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
              />
            </CardContent>
          </Card>
        )}

        {/* 편집 영역 */}
        {image && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 캔버스 영역 */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      편집 영역
                    </CardTitle>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImage(null);
                        setOriginalImage(null);
                        setCropMode(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      새 이미지
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full border rounded-lg"
                      style={{ 
                        maxHeight: '500px',
                        cursor: cropMode ? 'crosshair' : 'default'
                      }}
                      onMouseDown={handleCropMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                    />
                  </div>
                  
                  {/* 이미지 정보 */}
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm">
                    <strong>현재 크기:</strong> {dimensions.width} × {dimensions.height}px
                    {cropMode && (
                      <span className="ml-4">
                        <strong>자르기 영역:</strong> {Math.round(cropArea.width)} × {Math.round(cropArea.height)}px
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 컨트롤 패널 */}
            <div className="space-y-4">
              {/* 크기 조절 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">크기 조절</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id="maintain-ratio"
                      type="checkbox"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="maintain-ratio" className="text-sm">비율 유지</Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">가로 (px)</Label>
                      <Input
                        type="number"
                        value={newDimensions.width}
                        onChange={(e) => handleDimensionChange('width', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">세로 (px)</Label>
                      <Input
                        type="number"
                        value={newDimensions.height}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">프리셋 크기</Label>
                    <Select onValueChange={(value) => value && applyPresetSize(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="크기 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1920x1080">Full HD (1920×1080)</SelectItem>
                        <SelectItem value="1280x720">HD (1280×720)</SelectItem>
                        <SelectItem value="800x600">SVGA (800×600)</SelectItem>
                        <SelectItem value="640x480">VGA (640×480)</SelectItem>
                        <SelectItem value="400x400">정사각형 (400×400)</SelectItem>
                        <SelectItem value="300x300">작은 정사각형 (300×300)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">비율 변경</Label>
                    <div className="grid grid-cols-3 gap-1">
                      <Button variant="outline" size="sm" onClick={() => applyScaleResize(0.25)}>25%</Button>
                      <Button variant="outline" size="sm" onClick={() => applyScaleResize(0.5)}>50%</Button>
                      <Button variant="outline" size="sm" onClick={() => applyScaleResize(0.75)}>75%</Button>
                      <Button variant="outline" size="sm" onClick={() => applyScaleResize(2)}>2배</Button>
                      <Button variant="outline" size="sm" onClick={() => applyScaleResize(3)}>3배</Button>
                    </div>
                  </div>
                  
                  <Button onClick={applyResize} className="w-full">
                    크기 적용
                  </Button>
                </CardContent>
              </Card>

              {/* 자르기 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Crop className="h-4 w-4" />
                    자르기
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant={cropMode ? "default" : "outline"}
                    onClick={toggleCropMode}
                    className="w-full flex items-center gap-2"
                  >
                    <Scissors className="h-4 w-4" />
                    {cropMode ? '자르기 모드 해제' : '자르기 모드'}
                  </Button>
                  
                  {cropMode && (
                    <Button onClick={applyCrop} className="w-full">
                      자르기 적용
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* 파일 형식 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">파일 형식</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">형식</Label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG (무손실)</SelectItem>
                        <SelectItem value="jpeg">JPG (압축)</SelectItem>
                        <SelectItem value="webp">WebP (최신)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(exportFormat === 'jpeg' || exportFormat === 'webp') && (
                    <div className="space-y-2">
                      <Label className="text-xs">품질: {Math.round(exportQuality * 100)}%</Label>
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
                </CardContent>
              </Card>

              {/* 액션 버튼 */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <Button 
                    onClick={resetToOriginal}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    원본으로 되돌리기
                  </Button>
                  <Button 
                    onClick={downloadImage}
                    className="w-full flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    다운로드
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageEditor;