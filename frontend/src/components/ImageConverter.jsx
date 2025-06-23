import { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, RefreshCw, Download, Image as ImageIcon, FileImage, Package, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../locales/translations';
import './ImageConverter.css';

const ImageConverter = () => {
  const { language } = useLanguage();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [convertedImages, setConvertedImages] = useState([]);
  const [outputFormat, setOutputFormat] = useState('png');
  const [quality, setQuality] = useState(0.9);
  const [isConverting, setIsConverting] = useState(false);
  const [fileName, setFileName] = useState('');

  // 윈도우 아이콘 표준 사이즈
  const iconSizes = [16, 24, 32, 48, 64, 96, 128, 256];

  // ICO 파일 생성을 위한 헬퍼 함수
  const createICOFile = (images) => {
    const imageCount = images.length;
    
    // ICO 헤더 (6바이트)
    const header = new Uint8Array(6);
    header[0] = 0; // Reserved
    header[1] = 0; // Reserved
    header[2] = 1; // ICO type
    header[3] = 0; // ICO type
    header[4] = imageCount & 0xFF; // Image count
    header[5] = (imageCount >> 8) & 0xFF; // Image count
    
    // 디렉토리 엔트리 (각 이미지당 16바이트)
    const directorySize = imageCount * 16;
    const directory = new Uint8Array(directorySize);
    
    let offset = 6 + directorySize;
    let directoryIndex = 0;
    
    const imageDataArray = [];
    
    for (let i = 0; i < imageCount; i++) {
      const canvas = images[i];
      const size = canvas.width;
      
      // PNG 데이터 생성
      const pngData = canvas.toDataURL('image/png');
      const pngBytes = atob(pngData.split(',')[1]);
      const pngArray = new Uint8Array(pngBytes.length);
      for (let j = 0; j < pngBytes.length; j++) {
        pngArray[j] = pngBytes.charCodeAt(j);
      }
      
      imageDataArray.push(pngArray);
      
      // 디렉토리 엔트리 작성
      directory[directoryIndex++] = size === 256 ? 0 : size; // Width (0 = 256)
      directory[directoryIndex++] = size === 256 ? 0 : size; // Height (0 = 256)
      directory[directoryIndex++] = 0; // Color count
      directory[directoryIndex++] = 0; // Reserved
      directory[directoryIndex++] = 1; // Color planes
      directory[directoryIndex++] = 0; // Color planes
      directory[directoryIndex++] = 32; // Bits per pixel
      directory[directoryIndex++] = 0; // Bits per pixel
      
      // 이미지 데이터 크기
      const dataSize = pngArray.length;
      directory[directoryIndex++] = dataSize & 0xFF;
      directory[directoryIndex++] = (dataSize >> 8) & 0xFF;
      directory[directoryIndex++] = (dataSize >> 16) & 0xFF;
      directory[directoryIndex++] = (dataSize >> 24) & 0xFF;
      
      // 이미지 데이터 오프셋
      directory[directoryIndex++] = offset & 0xFF;
      directory[directoryIndex++] = (offset >> 8) & 0xFF;
      directory[directoryIndex++] = (offset >> 16) & 0xFF;
      directory[directoryIndex++] = (offset >> 24) & 0xFF;
      
      offset += dataSize;
    }
    
    // 전체 ICO 파일 생성
    const totalSize = 6 + directorySize + imageDataArray.reduce((sum, data) => sum + data.length, 0);
    const icoFile = new Uint8Array(totalSize);
    
    // 헤더 복사
    icoFile.set(header, 0);
    
    // 디렉토리 복사
    icoFile.set(directory, 6);
    
    // 이미지 데이터 복사
    let currentOffset = 6 + directorySize;
    for (const imageData of imageDataArray) {
      icoFile.set(imageData, currentOffset);
      currentOffset += imageData.length;
    }
    
    return icoFile;
  };

  // 파일 업로드 처리
  const handleFileSelect = useCallback(async (file) => {
    const supportedExtensions = [
      'jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'tiff', 'tif', 
      'svg', 'ico', 'heic', 'heif', 'avif', 'cr2', 'nef', 'arw', 
      'dng', 'raf', 'orf', 'rw2', 'pef', 'srw'
    ];
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (file && (file.type.startsWith('image/') || supportedExtensions.includes(fileExtension))) {
      // RAW 파일이나 특수 형식의 경우 경고 메시지
      if (['cr2', 'nef', 'arw', 'dng', 'raf', 'orf', 'rw2', 'pef', 'srw'].includes(fileExtension)) {
        alert(t(language, 'imageConverter.upload.rawWarning'));
      }
      
      if (['heic', 'heif'].includes(fileExtension)) {
        alert(t(language, 'imageConverter.upload.heicWarning'));
      }
      
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setFileName(file.name.split('.')[0]);
        setConvertedImages([]);
      };
      img.onerror = (error) => {
        console.error('Image load error:', error);
        alert(t(language, 'imageConverter.errorImageLoad').replace('{format}', fileExtension.toUpperCase()));
      };
      img.src = URL.createObjectURL(file);
    } else {
      alert(t(language, 'imageConverter.errorSupportedOnly'));
    }
  }, []);

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

  // 이미지를 특정 크기로 리사이즈
  const resizeImage = useCallback((img, width, height) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    // 고품질 리사이징을 위한 설정
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 이미지를 정사각형으로 크롭하여 리사이즈
    const size = Math.min(img.width, img.height);
    const sx = (img.width - size) / 2;
    const sy = (img.height - size) / 2;
    
    ctx.drawImage(img, sx, sy, size, size, 0, 0, width, height);
    
    return canvas;
  }, []);

  // 단일 형식 변환
  const convertSingle = useCallback(async () => {
    if (!originalImage) return;

    setIsConverting(true);
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      
      ctx.drawImage(originalImage, 0, 0);
      
      let dataUrl;
      let finalFormat = outputFormat;
      
      if (outputFormat === 'jpeg' || outputFormat === 'jpg') {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        finalFormat = 'jpg';
      } else if (outputFormat === 'webp') {
        dataUrl = canvas.toDataURL('image/webp', quality);
      } else {
        dataUrl = canvas.toDataURL(`image/${outputFormat}`);
      }
      
      const converted = {
        name: `${fileName}.${finalFormat}`,
        dataUrl,
        size: `${originalImage.width}×${originalImage.height}`,
        format: finalFormat.toUpperCase()
      };
      
      setConvertedImages([converted]);
    } catch (error) {
      console.error('Conversion error:', error);
      alert('변환 중 오류가 발생했습니다.');
    } finally {
      setIsConverting(false);
    }
  }, [originalImage, outputFormat, quality, fileName]);

  // ICO 일괄 변환 (윈도우 아이콘 표준 사이즈)
  const convertToIcons = useCallback(async () => {
    if (!originalImage) return;

    setIsConverting(true);
    
    try {
      const converted = [];
      
      for (const size of iconSizes) {
        const canvas = resizeImage(originalImage, size, size);
        const dataUrl = canvas.toDataURL('image/png');
        
        converted.push({
          name: `${fileName}_${size}x${size}.png`,
          dataUrl,
          size: `${size}×${size}`,
          format: 'PNG',
          iconSize: size
        });
      }
      
      setConvertedImages(converted);
    } catch (error) {
      console.error('Icon conversion error:', error);
      alert('아이콘 변환 중 오류가 발생했습니다.');
    } finally {
      setIsConverting(false);
    }
  }, [originalImage, fileName, resizeImage]);

  // ICO 파일 생성 (여러 사이즈를 하나의 ICO 파일로)
  const convertToICO = useCallback(async () => {
    if (!originalImage) return;

    setIsConverting(true);
    
    try {
      const canvases = [];
      
      // 각 사이즈별로 캔버스 생성
      for (const size of iconSizes) {
        const canvas = resizeImage(originalImage, size, size);
        canvases.push(canvas);
      }
      
      // ICO 파일 생성
      const icoBuffer = createICOFile(canvases);
      
      // ICO 파일을 Data URL로 변환
      const icoBlob = new Blob([icoBuffer], { type: 'image/x-icon' });
      const icoDataUrl = URL.createObjectURL(icoBlob);
      
      const converted = [{
        name: `${fileName}.ico`,
        dataUrl: icoDataUrl,
        size: `${iconSizes.length}개 사이즈`,
        format: 'ICO',
        isIco: true
      }];
      
      setConvertedImages(converted);
    } catch (error) {
      console.error('ICO conversion error:', error);
      alert('ICO 변환 중 오류가 발생했습니다.');
    } finally {
      setIsConverting(false);
    }
  }, [originalImage, fileName, resizeImage, createICOFile]);

  // 개별 파일 다운로드
  const downloadFile = (item) => {
    const link = document.createElement('a');
    link.download = item.name;
    link.href = item.dataUrl;
    link.click();
  };

  // 전체 파일 일괄 다운로드 (ZIP으로 묶어서)
  const downloadAll = async () => {
    if (convertedImages.length === 0) return;

    // 간단한 일괄 다운로드 (각각 개별적으로)
    for (let i = 0; i < convertedImages.length; i++) {
      setTimeout(() => {
        downloadFile(convertedImages[i]);
      }, i * 500); // 500ms 간격으로 다운로드
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* 헤더 */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">{t(language, 'imageConverter.title')}</h1>
        </div>

        {/* 업로드 영역 */}
        {!originalImage && (
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
                <h3 className="text-lg font-semibold mb-2">{t(language, 'imageConverter.upload.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t(language, 'imageConverter.upload.subtitle')}
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <span className="px-2 py-1 bg-muted rounded text-xs">JPG</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">PNG</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">WebP</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">BMP</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">GIF</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">TIFF</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">SVG</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">ICO</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">HEIC</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">AVIF</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">RAW</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">CR2</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">NEF</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">ARW</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif,.tiff,.tif,.ico,.svg,.avif,.cr2,.nef,.arw,.dng,.raf,.orf,.rw2,.pef,.srw"
                className="hidden"
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
              />
            </CardContent>
          </Card>
        )}

        {/* 변환 영역 */}
        {originalImage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 원본 이미지 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  {t(language, 'common.image')} ({t(language, 'imageConverter.original')})
                </CardTitle>
                <CardDescription>
                  {originalImage.width} × {originalImage.height}px
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img
                    src={originalImage.src}
                    alt="원본 이미지"
                    className="max-w-full max-h-48 object-contain border rounded"
                  />
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOriginalImage(null);
                    setConvertedImages([]);
                  }}
                  className="w-full mt-4"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t(language, 'imageConverter.newImage')}
                </Button>
              </CardContent>
            </Card>

            {/* 변환 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  {t(language, 'imageConverter.conversion')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 파일명 설정 */}
                <div className="space-y-2">
                  <Label className="text-sm">{t(language, 'imageConverter.filename')}</Label>
                  <Input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder={t(language, 'imageConverter.filenamePlaceholder')}
                  />
                </div>

                {/* 단일 형식 변환 */}
                <div className="space-y-3 p-3 border rounded-lg">
                  <h4 className="font-medium">{t(language, 'imageConverter.singleConversion')}</h4>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">{t(language, 'imageConverter.outputFormat')}</Label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">{t(language, 'imageConverter.pngLossless')}</SelectItem>
                        <SelectItem value="jpeg">{t(language, 'imageConverter.jpgCompressed')}</SelectItem>
                        <SelectItem value="webp">{t(language, 'imageConverter.webpModern')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
                    <div className="space-y-2">
                      <Label className="text-sm">{t(language, 'imageConverter.qualityLabel')}: {Math.round(quality * 100)}%</Label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={convertSingle}
                    disabled={isConverting}
                    className="w-full"
                  >
                    {isConverting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {t(language, 'imageConverter.converting')}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t(language, 'imageConverter.formatConvert')}
                      </>
                    )}
                  </Button>
                </div>

                {/* ICO 아이콘 일괄 변환 */}
                <div className="space-y-3 p-3 border rounded-lg bg-blue-50/50">
                  <h4 className="font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {t(language, 'imageConverter.iconGeneration')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t(language, 'imageConverter.iconDescription')}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {iconSizes.map(size => (
                      <span key={size} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {size}×{size}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      onClick={convertToIcons}
                      disabled={isConverting}
                      className="w-full"
                      variant="secondary"
                    >
                      {isConverting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          {t(language, 'imageConverter.converting')}
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4 mr-2" />
                          {t(language, 'imageConverter.pngFilesGenerate')} ({iconSizes.length}개)
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={convertToICO}
                      disabled={isConverting}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isConverting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          {t(language, 'imageConverter.converting')}
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" />
                          {t(language, 'imageConverter.icoFileGenerate')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 변환 결과 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    {t(language, 'imageConverter.results')}
                  </CardTitle>
                  {convertedImages.length > 1 && (
                    <Button 
                      onClick={downloadAll}
                      size="sm"
                      variant="outline"
                    >
                      {t(language, 'imageConverter.allDownload')}
                    </Button>
                  )}
                </div>
                {convertedImages.length > 0 && (
                  <CardDescription>
                    {t(language, 'imageConverter.filesGenerated').replace('{count}', convertedImages.length)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {convertedImages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileImage className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t(language, 'imageConverter.noResults')}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {convertedImages.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <img
                          src={item.dataUrl}
                          alt={item.name}
                          className="w-12 h-12 object-contain border rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.size} • {item.format}
                          </p>
                        </div>
                        <Button
                          onClick={() => downloadFile(item)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageConverter;