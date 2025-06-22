import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeftRight, Copy, RotateCcw, Zap, AlertCircle, Code, Globe } from 'lucide-react';

const URLEncoder = () => {
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
      setError('인코딩 중 오류가 발생했습니다: ' + err.message);
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
      setError('디코딩 중 오류가 발생했습니다. 올바른 URL 인코딩 문자열인지 확인해주세요.');
    }
  };

  const handleConvert = () => {
    if (!inputText.trim()) {
      setError('변환할 텍스트를 입력해주세요.');
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">URL 인코더/디코더</h1>
          <p className="text-muted-foreground">
            URL에 안전하게 사용할 수 있도록 텍스트를 인코딩하거나 인코딩된 URL을 디코딩합니다.
          </p>
        </div>

        {/* Mode and Type Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              변환 설정
            </CardTitle>
            <CardDescription>
              변환 모드와 인코딩 타입을 선택하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 변환 모드 */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">변환 모드</Label>
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
                      텍스트 → URL 인코딩
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
                      URL 디코딩 → 텍스트
                    </Label>
                  </div>
                </div>
              </div>

              {/* 인코딩 타입 */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">인코딩 타입</Label>
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
                      Component (완전 인코딩)
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
                      URI (기본 인코딩)
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
            <CardTitle>예시 (클릭하여 적용)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {presetExamples[mode].map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample(example)}
                  className="text-xs"
                  title={example}
                >
                  {example.length > 30 ? example.substring(0, 30) + '...' : example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-text">
                {mode === 'encode' ? '인코딩할 텍스트 또는 URL' : '디코딩할 URL 인코딩 문자열'}
              </Label>
              <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'encode' ? 
                  '예: https://example.com/search?q=안녕하세요' : 
                  '예: https%3A//example.com/search%3Fq%3D%EC%95%88%EB%85%95%ED%95%98%EC%84%B8%EC%9A%94'
                }
                rows={4}
                className="resize-y min-h-[100px]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleConvert} className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                {mode === 'encode' ? 'URL 인코딩' : 'URL 디코딩'}
              </Button>
              <Button variant="outline" onClick={handleSwap} disabled={!outputText} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                입력/출력 바꾸기
              </Button>
              <Button variant="outline" onClick={handleClear} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                초기화
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
                <Globe className="h-5 w-5" />
                결과
              </CardTitle>
              <CardDescription>
                {outputText.length} 문자
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="output-text">
                  {mode === 'encode' ? 'URL 인코딩 결과' : '디코딩 결과'}
                </Label>
                <Textarea
                  id="output-text"
                  value={outputText}
                  readOnly
                  rows={4}
                  className="resize-y min-h-[100px] bg-muted/30"
                />
              </div>

              <Button variant="outline" onClick={handleCopy} className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                결과 복사
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>URL 인코딩이란?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              URL 인코딩(퍼센트 인코딩)은 URL에서 특별한 의미를 갖는 문자들을 안전하게 전송하기 위해 변환하는 방법입니다.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">encodeURIComponent</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>모든 특수 문자를 인코딩</li>
                  <li>URL 매개변수 값에 적합</li>
                  <li>: / ? # [ ] @ 등도 인코딩</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">encodeURI</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>URL 구조 문자는 유지</li>
                  <li>완전한 URL 인코딩에 적합</li>
                  <li>: / ? # [ ] @ 등은 그대로 유지</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/10 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold">언제 사용하나요?</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>웹 개발:</strong> URL 매개변수에 특수문자나 한글 포함</li>
                <li><strong>API 호출:</strong> 검색어나 사용자 입력을 URL에 포함</li>
                <li><strong>폼 데이터:</strong> GET 방식으로 데이터 전송</li>
                <li><strong>브라우저 호환성:</strong> 모든 브라우저에서 안전한 URL 보장</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default URLEncoder; 