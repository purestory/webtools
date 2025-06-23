import { useState, useContext } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeftRight, Copy, RotateCcw, Zap, AlertCircle, Code, Globe } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { t } from '../locales/translations';

const URLEncoder = () => {
  const { language } = useContext(LanguageContext);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [encodingType, setEncodingType] = useState('component'); // 'component' or 'uri'
  const [error, setError] = useState('');

  const handleEncode = () => {
    try {
      setError('');
      let encoded;
      
      if (encodingType === 'component') {
        encoded = encodeURIComponent(inputText);
      } else {
        encoded = encodeURI(inputText);
      }
      
      setOutputText(encoded);
    } catch (err) {
      setError(t(language, 'urlEncoder.errorEncode').replace('{error}', err.message));
    }
  };

  const handleDecode = () => {
    try {
      setError('');
      let decoded;
      
      if (encodingType === 'component') {
        decoded = decodeURIComponent(inputText);
      } else {
        decoded = decodeURI(inputText);
      }
      
      setOutputText(decoded);
    } catch (err) {
      setError(t(language, 'urlEncoder.errorDecode'));
    }
  };

  const handleConvert = () => {
    if (!inputText.trim()) {
      setError(t(language, 'urlEncoder.errorEmpty'));
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

  const presetExamples = {
    encode: [
      'https://example.com/search?q=안녕하세요',
      'Hello World!',
      'user@email.com',
      'path/with spaces/file.txt',
      '한글 & 특수문자 #@$%'
    ],
    decode: [
      'https%3A//example.com/search%3Fq%3D%EC%95%88%EB%85%95%ED%95%98%EC%84%B8%EC%9A%94',
      'Hello%20World!',
      'user%40email.com',
      'path/with%20spaces/file.txt',
      '%ED%95%9C%EA%B8%80%20%26%20%ED%8A%B9%EC%88%98%EB%AC%B8%EC%9E%90%20%23%40%24%25'
    ]
  };

  const loadExample = (example) => {
    setInputText(example);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Page Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">{t(language, 'urlEncoder.title')}</h1>
        </div>

        {/* Mode and Type Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t(language, 'urlEncoder.settings')}
            </CardTitle>
            <CardDescription>
              {t(language, 'urlEncoder.settingsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 변환 모드 */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t(language, 'urlEncoder.mode')}</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="encode" 
                      value="encode" 
                      checked={mode === 'encode'} 
                      onChange={(e) => setMode(e.target.value)}
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="encode" className="text-sm font-normal cursor-pointer">
                      {t(language, 'urlEncoder.encodeMode')}
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
                    <Label htmlFor="decode" className="text-sm font-normal cursor-pointer">
                      {t(language, 'urlEncoder.decodeMode')}
                    </Label>
                  </div>
                </div>
              </div>

              {/* 인코딩 타입 */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t(language, 'urlEncoder.encodingType')}</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="component" 
                      value="component" 
                      checked={encodingType === 'component'} 
                      onChange={(e) => setEncodingType(e.target.value)}
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="component" className="text-sm font-normal cursor-pointer">
                      {t(language, 'urlEncoder.componentType')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="uri" 
                      value="uri" 
                      checked={encodingType === 'uri'} 
                      onChange={(e) => setEncodingType(e.target.value)}
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="uri" className="text-sm font-normal cursor-pointer">
                      {t(language, 'urlEncoder.uriType')}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              {t(language, 'urlEncoder.examples')}
            </CardTitle>
            <CardDescription>
              {t(language, 'urlEncoder.examplesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {presetExamples[mode].map((example, index) => (
                <button
                  key={index}
                  onClick={() => loadExample(example)}
                  className="text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-sm font-mono"
                >
                  {example}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t(language, 'common.input')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-text">{t(language, 'urlEncoder.inputLabel')}</Label>
              <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t(language, 'urlEncoder.inputPlaceholder')}
                rows={6}
                className="resize-y min-h-[120px]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleConvert} className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                {mode === 'encode' ? t(language, 'common.encoding') : t(language, 'common.decoding')}
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
                <Code className="h-5 w-5" />
                {t(language, 'common.result')}
              </CardTitle>
              <CardDescription>
                {t(language, 'base64Converter.charactersCount').replace('{count}', outputText.length)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="output-text">{t(language, 'common.output')}</Label>
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

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t(language, 'urlEncoder.quickTips')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {t(language, 'urlEncoder.tip1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {t(language, 'urlEncoder.tip2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {t(language, 'urlEncoder.tip3')}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default URLEncoder; 