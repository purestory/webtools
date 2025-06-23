import { useState, useRef, useContext } from 'react';
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
import { LanguageContext } from '../contexts/LanguageContext';
import { t } from '../locales/translations';

const QRGenerator = () => {
  const { language } = useContext(LanguageContext);
  const [text, setText] = useState('');
  const [size, setSize] = useState('256');
  const [margin, setMargin] = useState('4');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const generateQR = async () => {
    if (!text.trim()) {
      setError(t(language, 'qrGenerator.errorEmpty'));
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
      setError(t(language, 'qrGenerator.errorGenerate').replace('{error}', error.message));
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
    { label: t(language, 'qrGenerator.website'), value: 'https://example.com', icon: Globe },
    { label: t(language, 'qrGenerator.wifi'), value: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;', icon: Wifi },
    { label: t(language, 'qrGenerator.location'), value: 'geo:37.7749,-122.4194', icon: MapPin },
    { label: t(language, 'qrGenerator.contact'), value: 'BEGIN:VCARD\nVERSION:3.0\nFN:홍길동\nTEL:010-1234-5678\nEND:VCARD', icon: User }
  ];

  return (
    <div className="container min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-foreground">{t(language, 'qrGenerator.title')}</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                {t(language, 'qrGenerator.settings')}
              </CardTitle>
              <CardDescription>
                {t(language, 'qrGenerator.settingsDescription')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Quick Fill Examples */}
              <div>
                <Label className="text-sm font-medium mb-3 block">{t(language, 'qrGenerator.quickExamples')}</Label>
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
                <Label htmlFor="qr-text">{t(language, 'qrGenerator.textInput')}</Label>
                <div className="relative">
                  <Textarea 
                    id="qr-text" 
                    placeholder={t(language, 'qrGenerator.textPlaceholder')}
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
                  {t(language, 'qrGenerator.quickGenerate')}
                </p>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-size">{t(language, 'qrGenerator.sizeLabel')}</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger id="qr-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="128">{t(language, 'qrGenerator.sizeSmall')}</SelectItem>
                      <SelectItem value="256">{t(language, 'qrGenerator.sizeMedium')}</SelectItem>
                      <SelectItem value="512">{t(language, 'qrGenerator.sizeLarge')}</SelectItem>
                      <SelectItem value="1024">{t(language, 'qrGenerator.sizeXLarge')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="qr-margin">{t(language, 'qrGenerator.marginLabel')}</Label>
                  <Select value={margin} onValueChange={setMargin}>
                    <SelectTrigger id="qr-margin">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t(language, 'qrGenerator.marginVerySmall')}</SelectItem>
                      <SelectItem value="2">{t(language, 'qrGenerator.marginSmall')}</SelectItem>
                      <SelectItem value="4">{t(language, 'qrGenerator.marginMedium')}</SelectItem>
                      <SelectItem value="6">{t(language, 'qrGenerator.marginLarge')}</SelectItem>
                      <SelectItem value="8">{t(language, 'qrGenerator.marginVeryLarge')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generateQR} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? t(language, 'common.loading') : t(language, 'qrGenerator.generate')}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <div className="space-y-6">
            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {/* Error Display */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* QR Code Display */}
            {qrCodeUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    {t(language, 'qrGenerator.generatedTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="Generated QR Code" 
                      className="border rounded-lg shadow-sm"
                    />
                  </div>
                  <Button 
                    onClick={downloadQR}
                    className="w-full flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {t(language, 'common.download')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  {t(language, 'qrGenerator.tips')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {t(language, 'qrGenerator.tip1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {t(language, 'qrGenerator.tip2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {t(language, 'qrGenerator.tip3')}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// 깔끔하고 실용적인 QR 코드 생성기
export default QRGenerator;