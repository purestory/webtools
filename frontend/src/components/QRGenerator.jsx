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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">QR 코드 생성기</h1>
          <p className="text-lg text-gray-600">
            텍스트나 URL을 QR 코드로 변환하여 다운로드하세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
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
                        className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                      >
                        <IconComponent className="w-4 h-4 text-blue-600" />
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
                disabled={isLoading || !text.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    QR 코드 생성 중...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    QR 코드 생성하기
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Section */}
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* QR Code Result */}
            {qrCodeUrl ? (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    QR 코드 생성 완료
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="inline-block bg-white p-4 rounded-lg shadow-md border">
                    <img 
                      src={qrCodeUrl} 
                      alt="Generated QR Code" 
                      className="max-w-full h-auto" 
                    />
                  </div>
                  
                  <Button onClick={downloadQR} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    QR 코드 다운로드
                  </Button>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-blue-700">
                          스캔 방법
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          스마트폰 카메라를 QR 코드에 향하게 하면 자동으로 인식됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Guide Card */
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    QR 코드 활용 가이드
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    QR(Quick Response) 코드는 스마트폰으로 쉽게 스캔하여 정보를 빠르게 접근할 수 있는 2차원 바코드입니다.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { icon: Globe, title: "웹사이트 공유", desc: "URL을 QR 코드로 변환하여 쉽게 공유" },
                      { icon: Wifi, title: "Wi-Fi 설정", desc: "비밀번호를 자동으로 입력" },
                      { icon: MapPin, title: "위치 정보", desc: "지도 앱에서 바로 열기" },
                      { icon: User, title: "연락처 정보", desc: "명함 대신 간편하게 활용" }
                    ].map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                          <IconComponent className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-sm">{item.title}</h3>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Hidden Canvas for QR generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

// 깔끔하고 실용적인 QR 코드 생성기
export default QRGenerator;