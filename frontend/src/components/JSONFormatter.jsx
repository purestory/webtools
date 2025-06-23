import { useState, useContext } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CheckCircle, AlertCircle, Copy, Settings, FileText, Code } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { t } from '../locales/translations';
import './JSONFormatter.css';

const JSONFormatter = () => {
  const { language } = useContext(LanguageContext);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState('2');
  const [isValid, setIsValid] = useState(null);

  const formatJSON = () => {
    if (!input.trim()) {
      setError(t(language, 'jsonFormatter.errorEmpty'));
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
      setError(t(language, 'jsonFormatter.errorParse').replace('{error}', err.message));
      setOutput('');
      setIsValid(false);
    }
  };

  const minifyJSON = () => {
    if (!input.trim()) {
      setError(t(language, 'jsonFormatter.errorEmpty'));
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
      setError(t(language, 'jsonFormatter.errorParse').replace('{error}', err.message));
      setOutput('');
      setIsValid(false);
    }
  };

  const validateJSON = () => {
    if (!input.trim()) {
      setError(t(language, 'jsonFormatter.errorValidateEmpty'));
      setIsValid(null);
      return;
    }

    try {
      JSON.parse(input);
      setError('');
      setIsValid(true);
    } catch (err) {
      setError(t(language, 'jsonFormatter.errorValidate').replace('{error}', err.message));
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
      setError(t(language, 'jsonFormatter.errorCopyEmpty'));
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      // 간단한 피드백 (실제로는 toast나 notification 라이브러리 사용 권장)
      const originalText = error;
      setError(t(language, 'jsonFormatter.copied'));
      setTimeout(() => setError(originalText), 2000);
    } catch (err) {
      setError(t(language, 'jsonFormatter.errorCopyFailed'));
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Page Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold tracking-tight">{t(language, 'jsonFormatter.title')}</h1>
        </div>

        {/* Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t(language, 'jsonFormatter.settingsTitle')}
            </CardTitle>
            <CardDescription>{t(language, 'jsonFormatter.settingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="indent-size">{t(language, 'jsonFormatter.indentSize')}</Label>
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
                {t(language, 'jsonFormatter.loadSample')}
              </Button>
              <Button onClick={clearAll} variant="outline" size="sm">
                {t(language, 'jsonFormatter.clearAll')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t(language, 'jsonFormatter.inputTitle')}
              </CardTitle>
              <CardDescription>{t(language, 'jsonFormatter.inputDescription')}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t(language, 'jsonFormatter.inputPlaceholder')}
                className="min-h-[300px] font-mono text-sm"
              />
              
              <div className="flex space-x-2 mt-4">
                <Button onClick={formatJSON} className="flex-1">
                  {t(language, 'jsonFormatter.format')}
                </Button>
                <Button onClick={minifyJSON} variant="outline" className="flex-1">
                  {t(language, 'jsonFormatter.minify')}
                </Button>
                <Button onClick={validateJSON} variant="outline" className="flex-1">
                  {t(language, 'jsonFormatter.validate')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {t(language, 'jsonFormatter.outputTitle')}
              </CardTitle>
              <CardDescription>{t(language, 'jsonFormatter.outputDescription')}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <Textarea
                value={output}
                readOnly
                placeholder={t(language, 'jsonFormatter.outputDescription')}
                className="min-h-[300px] font-mono text-sm bg-muted/30"
              />
              
              <div className="flex items-center justify-between mt-4">
                <Button onClick={copyOutput} variant="outline" disabled={!output}>
                  <Copy className="h-4 w-4 mr-2" />
                  {t(language, 'common.copy')}
                </Button>
                
                {/* Validation Status */}
                {isValid !== null && (
                  <div className="flex items-center gap-2">
                    {isValid ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">{t(language, 'jsonFormatter.validJson')}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-500">{t(language, 'jsonFormatter.invalidJson')}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Display */}
        {error && (
          <Card className={`${error === t(language, 'jsonFormatter.copied') ? 'border-green-500' : 'border-destructive'}`}>
            <CardContent className="pt-6">
              <div className={`flex items-center gap-2 ${error === t(language, 'jsonFormatter.copied') ? 'text-green-500' : 'text-destructive'}`}>
                {error === t(language, 'jsonFormatter.copied') ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JSONFormatter; 