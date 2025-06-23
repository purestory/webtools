import { useState, useContext } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeftRight, Copy, RotateCcw, Hash, AlertCircle, FileText, Binary } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { t } from '../locales/translations';

const Base64Converter = () => {
  const { language } = useContext(LanguageContext);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [error, setError] = useState('');

  const handleEncode = () => {
    try {
      setError('');
      const encoded = btoa(unescape(encodeURIComponent(inputText)));
      setOutputText(encoded);
    } catch (err) {
      setError(t(language, 'base64Converter.errorEncode').replace('{error}', err.message));
    }
  };

  const handleDecode = () => {
    try {
      setError('');
      const decoded = decodeURIComponent(escape(atob(inputText)));
      setOutputText(decoded);
    } catch (err) {
      setError(t(language, 'base64Converter.errorDecode'));
    }
  };

  const handleConvert = () => {
    if (!inputText.trim()) {
      setError(t(language, 'base64Converter.errorEmpty'));
      return;
    }

    if (mode === 'encode') {
      handleEncode();
    } else {
      handleDecode();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      // 복사 성공 피드백은 브라우저 기본 동작에 맡김
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  const handleSwap = () => {
    setInputText(outputText);
    setOutputText(inputText);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t(language, 'base64Converter.title')}</h1>
          <p className="text-muted-foreground">
            {t(language, 'base64Converter.description')}
          </p>
        </div>

        {/* Mode Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              {t(language, 'base64Converter.mode')}
            </CardTitle>
            <CardDescription>
              {t(language, 'base64Converter.modeDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="encode" 
                  value="encode" 
                  checked={mode === 'encode'} 
                  onChange={(e) => setMode(e.target.value)}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="encode" className="cursor-pointer">
                  {t(language, 'base64Converter.encodeMode')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="decode" 
                  value="decode" 
                  checked={mode === 'decode'} 
                  onChange={(e) => setMode(e.target.value)}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="decode" className="cursor-pointer">
                  {t(language, 'base64Converter.decodeMode')}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t(language, 'common.input')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-text">
                {mode === 'encode' ? t(language, 'base64Converter.inputLabel') : t(language, 'base64Converter.base64Label')}
              </Label>
              <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'encode' ? t(language, 'base64Converter.inputPlaceholder') : t(language, 'base64Converter.base64Placeholder')}
                rows={6}
                className="resize-y min-h-[120px]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleConvert} className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                {mode === 'encode' ? t(language, 'base64Converter.encode') : t(language, 'base64Converter.decode')}
              </Button>
              <Button variant="outline" onClick={handleSwap} disabled={!outputText} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                {t(language, 'base64Converter.swap')}
              </Button>
              <Button variant="outline" onClick={handleClear} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                {t(language, 'common.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>

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

        {/* Output Section */}
        {outputText && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Binary className="h-5 w-5" />
                {t(language, 'base64Converter.resultTitle')}
              </CardTitle>
              <CardDescription>
                {t(language, 'base64Converter.charactersCount').replace('{count}', outputText.length)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="output-text">
                  {mode === 'encode' ? t(language, 'base64Converter.resultBase64') : t(language, 'base64Converter.resultText')}
                </Label>
                <Textarea
                  id="output-text"
                  value={outputText}
                  readOnly
                  rows={6}
                  className="resize-y min-h-[120px] bg-muted/30"
                />
              </div>

              <Button variant="outline" onClick={handleCopy} className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                {t(language, 'common.copy')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Base64란?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Base64는 바이너리 데이터를 ASCII 문자열로 인코딩하는 방법입니다. 
              주로 이메일이나 웹에서 바이너리 데이터를 전송할 때 사용됩니다.
            </p>
            <div className="bg-muted/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">주요 사용 사례</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>웹 개발에서 이미지나 파일을 인라인으로 포함할 때</li>
                <li>API에서 바이너리 데이터를 JSON으로 전송할 때</li>
                <li>이메일 첨부파일 인코딩</li>
                <li>URL에 안전하게 데이터를 포함할 때</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Base64Converter; 