import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const TestPage = () => {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">shadcn/ui 컴포넌트 테스트</h1>
      
      {/* Button 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>Button 테스트</CardTitle>
          <CardDescription>다양한 버튼 variants를 테스트합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-x-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </CardContent>
      </Card>

      {/* Input 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>Input 테스트</CardTitle>
          <CardDescription>입력 컴포넌트들을 테스트합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-input">텍스트 입력</Label>
            <Input id="test-input" placeholder="여기에 입력하세요" />
          </div>
          <div>
            <Label htmlFor="test-textarea">텍스트 영역</Label>
            <Textarea id="test-textarea" placeholder="여러 줄 입력" />
          </div>
        </CardContent>
      </Card>

      {/* Select 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>Select 테스트</CardTitle>
          <CardDescription>드롭다운 선택 컴포넌트를 테스트합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>선택 옵션</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="옵션을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">옵션 1</SelectItem>
                <SelectItem value="option2">옵션 2</SelectItem>
                <SelectItem value="option3">옵션 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* CSS 변수 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>CSS 변수 테스트</CardTitle>
          <CardDescription>shadcn/ui CSS 변수가 제대로 작동하는지 확인합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary text-primary-foreground rounded">
            Primary 색상 테스트
          </div>
          <div className="p-4 bg-secondary text-secondary-foreground rounded">
            Secondary 색상 테스트
          </div>
          <div className="p-4 bg-muted text-muted-foreground rounded">
            Muted 색상 테스트
          </div>
          <div className="p-4 border border-border rounded">
            Border 테스트
          </div>
        </CardContent>
      </Card>

      {/* 디버그 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>디버그 정보</CardTitle>
          <CardDescription>CSS 변수들의 실제 값을 확인합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-sm space-y-2">
            <div>--primary: <span style={{color: 'hsl(var(--primary))'}}>■</span> hsl(var(--primary))</div>
            <div>--secondary: <span style={{color: 'hsl(var(--secondary))'}}>■</span> hsl(var(--secondary))</div>
            <div>--muted: <span style={{color: 'hsl(var(--muted))'}}>■</span> hsl(var(--muted))</div>
            <div>--foreground: <span style={{color: 'hsl(var(--foreground))'}}>■</span> hsl(var(--foreground))</div>
            <div>--background: <span style={{backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', padding: '2px 4px'}}>■</span> hsl(var(--background))</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage; 