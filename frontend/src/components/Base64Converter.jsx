import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ArrowLeftRight, Copy, RotateCcw, Hash, AlertCircle, FileText, Binary } from 'lucide-react';

const Base64Converter = () => {
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
      setError('인코딩 중 오류가 발생했습니다: ' + err.message);
    }
  };

  const handleDecode = () => {
    try {
      setError('');
      const decoded = decodeURIComponent(escape(atob(inputText)));
      setOutputText(decoded);
    } catch (err) {
      setError('디코딩 중 오류가 발생했습니다. 올바른 Base64 문자열인지 확인해주세요.');
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Base64 변환기</h1>
          <p className="text-muted-foreground">
            텍스트를 Base64로 인코딩하거나 Base64를 텍스트로 디코딩합니다.
          </p>
        </div>

        {/* Mode Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              변환 모드
            </CardTitle>
            <CardDescription>
              인코딩 또는 디코딩 모드를 선택하세요.
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
                  텍스트 → Base64 (인코딩)
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
                  Base64 → 텍스트 (디코딩)
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
              입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-text">
                {mode === 'encode' ? '변환할 텍스트' : 'Base64 문자열'}
              </Label>
              <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'encode' ? '여기에 텍스트를 입력하세요...' : 'Base64 문자열을 입력하세요...'}
                rows={6}
                className="resize-y min-h-[120px]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleConvert} className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                {mode === 'encode' ? '인코딩' : '디코딩'}
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
                <Binary className="h-5 w-5" />
                결과
              </CardTitle>
              <CardDescription>
                {outputText.length} 문자
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="output-text">
                  {mode === 'encode' ? 'Base64 결과' : '텍스트 결과'}
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
                결과 복사
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