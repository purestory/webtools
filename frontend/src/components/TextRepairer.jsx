import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../locales/translations';
import './TextRepairer.css';

const TextRepairer = () => {
  const { language } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMode, setSelectedMode] = useState('escape-chars');
  const [encoding, setEncoding] = useState('utf-8');
  const fileInputRef = useRef(null);

  // 이스케이프 문자 변환
  const processEscapeChars = (text) => {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\r\\n/g, '\r\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\0/g, '\0')
      .replace(/\\b/g, '\b')
      .replace(/\\f/g, '\f')
      .replace(/\\v/g, '\v');
  };

  // 유니코드 이스케이프 변환
  const processUnicodeEscape = (text) => {
    return text.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    }).replace(/\\x([0-9a-fA-F]{2})/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });
  };

  // JSON 문자열 변환
  const processJsonString = (text) => {
    try {
      // JSON 문자열로 파싱 시도
      return JSON.parse(`"${text}"`);
    } catch (e) {
      // 실패하면 기본 이스케이프 처리
      return processEscapeChars(text);
    }
  };

  // 인코딩 문제 수정
  const fixEncodingIssues = (text) => {
    // 일반적인 인코딩 문제들 수정
    let fixed = text
      // UTF-8 BOM 제거
      .replace(/^\uFEFF/, '')
      // 흔한 인코딩 오류들
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€/g, '"')
      .replace(/â€¢/g, '•')
      .replace(/â€¦/g, '…')
      .replace(/â€"/g, '–')
      .replace(/â€"/g, '—')
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã¼/g, 'ü');

    return fixed;
  };

  // 줄바꿈 정규화
  const normalizeLineBreaks = (text) => {
    return text
      .replace(/\r\n/g, '\n')  // Windows 스타일
      .replace(/\r/g, '\n')    // Mac 스타일
      .replace(/\n+/g, '\n');  // 중복 줄바꿈 제거
  };

  // 텍스트 처리 함수
  const processText = () => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      let result = inputText;

      switch (selectedMode) {
        case 'escape-chars':
          result = processEscapeChars(result);
          break;
        case 'unicode-escape':
          result = processUnicodeEscape(result);
          break;
        case 'json-string':
          result = processJsonString(result);
          break;
        case 'encoding-fix':
          result = fixEncodingIssues(result);
          break;
        case 'line-breaks':
          result = normalizeLineBreaks(result);
          break;
        case 'all':
          result = processEscapeChars(result);
          result = processUnicodeEscape(result);
          result = fixEncodingIssues(result);
          result = normalizeLineBreaks(result);
          break;
        default:
          break;
      }

      setOutputText(result);
      setIsProcessing(false);
    }, 100);
  };

  // 파일 업로드 처리
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type && !file.type.startsWith('text/') && !file.name.match(/\.(txt|js|json|html|css|md|log|conf|ini|yml|yaml)$/i)) {
      alert(t(language, 'textRepairer.errors.invalidFileType'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      let content = e.target.result;
      
      // 선택된 인코딩에 따라 처리
      if (encoding !== 'utf-8') {
        try {
          const decoder = new TextDecoder(encoding);
          const encoder = new TextEncoder();
          const bytes = encoder.encode(content);
          content = decoder.decode(bytes);
        } catch (err) {
          console.warn('인코딩 변환 실패:', err);
        }
      }
      
      setInputText(content);
    };

    reader.onerror = () => {
      alert('파일 읽기 중 오류가 발생했습니다.');
    };

    reader.readAsText(file, encoding);
  };

  // 파일 다운로드
  const downloadText = () => {
    if (!outputText) return;

    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repaired-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 텍스트 복사
  const copyToClipboard = async () => {
    if (!outputText) return;
    
    try {
      await navigator.clipboard.writeText(outputText);
      alert('텍스트가 클립보드에 복사되었습니다.');
    } catch (err) {
      console.error('복사 실패:', err);
      alert('복사에 실패했습니다.');
    }
  };

  // 초기화
  const clearAll = () => {
    setInputText('');
    setOutputText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="text-repairer">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>{t(language, 'textRepairer.input.title')}</CardTitle>
            <div className="space-y-4">
              {/* 모드 선택 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t(language, 'textRepairer.mode.label')}
                </label>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="escape-chars">{t(language, 'textRepairer.mode.escapeChars')}</SelectItem>
                    <SelectItem value="unicode-escape">{t(language, 'textRepairer.mode.unicodeEscape')}</SelectItem>
                    <SelectItem value="json-string">{t(language, 'textRepairer.mode.jsonString')}</SelectItem>
                    <SelectItem value="encoding-fix">{t(language, 'textRepairer.mode.encodingFix')}</SelectItem>
                    <SelectItem value="line-breaks">{t(language, 'textRepairer.mode.lineBreaks')}</SelectItem>
                    <SelectItem value="all">{t(language, 'textRepairer.mode.all')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 인코딩 선택 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t(language, 'textRepairer.encoding.label')}
                </label>
                <Select value={encoding} onValueChange={setEncoding}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utf-8">UTF-8</SelectItem>
                    <SelectItem value="euc-kr">EUC-KR</SelectItem>
                    <SelectItem value="iso-8859-1">ISO-8859-1</SelectItem>
                    <SelectItem value="windows-1252">Windows-1252</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 파일 업로드 */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.js,.json,.html,.css,.md,.log,.conf,.ini,.yml,.yaml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  📁 {t(language, 'textRepairer.upload.button')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t(language, 'textRepairer.input.placeholder')}
              className="min-h-[300px] font-mono text-sm"
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={processText} disabled={isProcessing}>
                {isProcessing ? t(language, 'common.loading') : t(language, 'textRepairer.process.button')}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                {t(language, 'common.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 출력 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>{t(language, 'textRepairer.output.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={outputText}
              readOnly
              placeholder={t(language, 'textRepairer.output.placeholder')}
              className="min-h-[300px] font-mono text-sm bg-muted"
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={downloadText} disabled={!outputText}>
                💾 {t(language, 'common.download')}
              </Button>
              <Button variant="outline" onClick={copyToClipboard} disabled={!outputText}>
                📋 {t(language, 'common.copy')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 예시 섹션 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t(language, 'textRepairer.examples.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">{t(language, 'textRepairer.examples.before')}</h4>
              <div className="bg-muted p-3 rounded text-sm font-mono">
                {'"""\ntitle: Anthropic Manifold Pipe\nauthors: justinh-rahb and christian-taillon\n"""'}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t(language, 'textRepairer.examples.after')}</h4>
              <div className="bg-muted p-3 rounded text-sm font-mono whitespace-pre">
                {`"""\ntitle: Anthropic Manifold Pipe\nauthors: justinh-rahb and christian-taillon\n"""`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextRepairer; 