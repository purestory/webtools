import { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  QrCode, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  Copy, 
  Scan,
  Globe,
  Wifi,
  MapPin,
  User
} from 'lucide-react';

const QRGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState('256');
  const [margin, setMargin] = useState('4');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const generateQR = async () => {
    if (!text.trim()) {
      setError('텍스트나 URL을 입력해주세요.');
      setQrCodeUrl('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const options = {
        width: parseInt(size),
        margin: parseInt(margin),
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };

      await QRCode.toCanvas(canvasRef.current, text, options);
      const dataUrl = canvasRef.current.toDataURL();
      setQrCodeUrl(dataUrl);
    } catch (error) {
      setError(`QR 코드 생성 중 오류가 발생했습니다: ${error.message}`);
      setQrCodeUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      generateQR();
    }
  };

  const copyToClipboard = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  const quickFillExamples = [
    { label: '웹사이트', value: 'https://example.com', icon: Globe },
    { label: 'Wi-Fi', value: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;', icon: Wifi },
    { label: '위치', value: 'geo:37.7749,-122.4194', icon: MapPin },
    { label: '연락처', value: 'BEGIN:VCARD\nVERSION:3.0\nFN:홍길동\nTEL:010-1234-5678\nEND:VCARD', icon: User }
  ];

  return (
    <div className="container min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
            <QrCode className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">QR 코드 생성기</h1>
          <p className="text-lg text-muted-foreground">
            텍스트나 URL을 QR 코드로 변환하여 다운로드하세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                QR 코드 설정
              </CardTitle>
              <CardDescription>
                변환할 내용과 QR 코드 옵션을 설정하세요.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Quick Fill Examples */}
              <div>
                <Label className="text-sm font-medium mb-3 block">빠른 입력 예시</Label>
                <div className="grid grid-cols-2 gap-2">
                  {quickFillExamples.map((example, index) => {
                    const IconComponent = example.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => setText(example.value)}
                        className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left"
                      >
                        <IconComponent className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{example.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <Label htmlFor="qr-text">텍스트 또는 URL</Label>
                <div className="relative">
                  <Textarea 
                    id="qr-text" 
                    placeholder="QR 코드로 변환할 텍스트나 URL을 입력하세요..." 
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="resize-none"
                  />
                  {text && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-2"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Scan className="h-3 w-3" />
                  Ctrl + Enter로 빠르게 생성할 수 있습니다.
                </p>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-size">QR 코드 크기</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger id="qr-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="128">작게 (128px)</SelectItem>
                      <SelectItem value="256">보통 (256px)</SelectItem>
                      <SelectItem value="512">크게 (512px)</SelectItem>
                      <SelectItem value="1024">매우 크게 (1024px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="qr-margin">여백 크기</Label>
                  <Select value={margin} onValueChange={setMargin}>
                    <SelectTrigger id="qr-margin">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">매우 적게</SelectItem>
                      <SelectItem value="2">적게</SelectItem>
                      <SelectItem value="4">보통</SelectItem>
                      <SelectItem value="6">많게</SelectItem>
                      <SelectItem value="8">매우 많게</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generateQR} 
                disabled={!text.trim() || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    생성 중...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    QR 코드 생성
                  </div>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Tips */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium mb-1">사용 팁</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• URL, 텍스트, 연락처, Wi-Fi 정보 등을 입력할 수 있습니다</li>
                      <li>• 크기가 클수록 스캔이 더 잘됩니다</li>
                      <li>• 여백이 있어야 QR 코드가 제대로 인식됩니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-primary" />
                미리보기
              </CardTitle>
              <CardDescription>
                생성된 QR 코드를 확인하고 다운로드하세요.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div className="bg-muted/50 p-6 rounded-lg border-2 border-dashed border-border">
                    {qrCodeUrl ? (
                      <div className="text-center">
                        <img 
                          src={qrCodeUrl} 
                          alt="Generated QR Code" 
                          className="mx-auto rounded-lg shadow-lg"
                          style={{ maxWidth: '100%' }}
                        />
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          QR 코드가 생성되었습니다!
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          텍스트를 입력하고 생성 버튼을 눌러주세요
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hidden Canvas */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Download Button */}
                {qrCodeUrl && (
                  <Button 
                    onClick={downloadQR}
                    className="w-full"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PNG로 다운로드
                  </Button>
                )}

                {/* QR Code Info */}
                {qrCodeUrl && text && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">QR 코드 정보</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>크기:</span>
                        <span>{size}x{size}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span>여백:</span>
                        <span>{margin}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span>내용 길이:</span>
                        <span>{text.length}자</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 깔끔하고 실용적인 QR 코드 생성기
export default QRGenerator;