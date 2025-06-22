import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import './JSONFormatter.css';

const JSONFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState('2');
  const [isValid, setIsValid] = useState(null);

  const formatJSON = () => {
    if (!input.trim()) {
      setError('입력할 JSON 텍스트를 입력해주세요.');
      setOutput('');
      setIsValid(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, parseInt(indentSize));
      setOutput(formatted);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(`JSON 파싱 오류: ${err.message}`);
      setOutput('');
      setIsValid(false);
    }
  };

  const minifyJSON = () => {
    if (!input.trim()) {
      setError('입력할 JSON 텍스트를 입력해주세요.');
      setOutput('');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(`JSON 파싱 오류: ${err.message}`);
      setOutput('');
      setIsValid(false);
    }
  };

  const validateJSON = () => {
    if (!input.trim()) {
      setError('검증할 JSON 텍스트를 입력해주세요.');
      setIsValid(null);
      return;
    }

    try {
      JSON.parse(input);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(`JSON 유효성 검사 실패: ${err.message}`);
      setIsValid(false);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setIsValid(null);
  };

  const copyOutput = async () => {
    if (!output) {
      setError('복사할 내용이 없습니다.');
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      // 간단한 피드백 (실제로는 toast나 notification 라이브러리 사용 권장)
      const originalText = error;
      setError('클립보드에 복사되었습니다!');
      setTimeout(() => setError(originalText), 2000);
    } catch (err) {
      setError('클립보드 복사에 실패했습니다.');
    }
  };

  const loadSampleData = () => {
    const sampleJSON = {
      "name": "WebTools JSON Formatter",
      "version": "1.0.0",
      "features": [
        "JSON 포맷팅",
        "JSON 압축",
        "유효성 검사",
        "구문 강조"
      ],
      "settings": {
        "indentSize": 2,
        "validateOnType": false
      },
      "data": {
        "users": [
          {
            "id": 1,
            "name": "홍길동",
            "email": "hong@example.com",
            "active": true
          },
          {
            "id": 2,
            "name": "김철수",
            "email": "kim@example.com",
            "active": false
          }
        ]
      }
    };
    setInput(JSON.stringify(sampleJSON));
    setError('');
    setIsValid(null);
  };

  return (
    <div className="json-formatter">
      <div className="space-y-6">
        {/* 설정 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>설정</CardTitle>
            <CardDescription>JSON 포맷팅 옵션을 설정하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="indent-size">들여쓰기 크기:</Label>
              <Select value={indentSize} onValueChange={setIndentSize}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={loadSampleData} variant="outline" size="sm">
                샘플 데이터 로드
              </Button>
              <Button onClick={clearAll} variant="outline" size="sm">
                전체 지우기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 입력 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>JSON 입력</CardTitle>
            <CardDescription>포맷팅하거나 검증할 JSON을 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"name": "example", "value": 123}'
              className="min-h-[200px] font-mono text-sm"
            />
            
            <div className="flex space-x-2 mt-4">
              <Button onClick={formatJSON} className="flex-1">
                포맷팅
              </Button>
              <Button onClick={minifyJSON} variant="outline" className="flex-1">
                압축
              </Button>
              <Button onClick={validateJSON} variant="outline" className="flex-1">
                검증
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 상태 표시 */}
        {(error || isValid !== null) && (
          <Card>
            <CardContent className="pt-6">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                  {error}
                </div>
              )}
              {isValid === true && !error && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-700 text-sm">
                  ✅ 유효한 JSON입니다
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 출력 섹션 */}
        {output && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>출력 결과</CardTitle>
                  <CardDescription>포맷팅된 JSON 결과</CardDescription>
                </div>
                <Button onClick={copyOutput} variant="outline" size="sm">
                  복사
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-sm font-mono whitespace-pre-wrap">
                {output}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* 도움말 */}
        <Card>
          <CardHeader>
            <CardTitle>사용법</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>포맷팅:</strong> JSON을 읽기 쉽게 들여쓰기와 줄바꿈을 추가합니다</p>
            <p>• <strong>압축:</strong> JSON에서 불필요한 공백과 줄바꿈을 제거합니다</p>
            <p>• <strong>검증:</strong> JSON 구문이 올바른지 확인합니다</p>
            <p>• <strong>샘플 데이터:</strong> 테스트용 JSON 데이터를 불러옵니다</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JSONFormatter; 