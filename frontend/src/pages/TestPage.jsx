import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ChevronRight, Code, Palette, Settings, Terminal, Type } from 'lucide-react';

const TestPage = () => {
  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            shadcn/ui 컴포넌트 테스트
          </h1>
          <p className="text-muted-foreground text-lg">
            다양한 컴포넌트와 스타일링을 테스트하고 확인하는 페이지입니다
          </p>
          <Separator className="my-4" />
        </div>

        <Tabs defaultValue="buttons" className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="buttons" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span>Button</span>
            </TabsTrigger>
            <TabsTrigger value="inputs" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span>Input</span>
            </TabsTrigger>
            <TabsTrigger value="selects" className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span>Select</span>
            </TabsTrigger>
            <TabsTrigger value="css" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>CSS 변수</span>
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>디버그</span>
            </TabsTrigger>
          </TabsList>

          {/* Button 테스트 */}
          <TabsContent value="buttons" className="space-y-6">
            <Card className="overflow-hidden border-2 shadow-md">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  Button 테스트
                </CardTitle>
                <CardDescription>다양한 버튼 variants를 테스트합니다</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <span className="text-xs text-muted-foreground mb-2">Default</span>
                    <Button>Default</Button>
                  </div>
                  <div className="flex flex-col items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <span className="text-xs text-muted-foreground mb-2">Secondary</span>
                    <Button variant="secondary">Secondary</Button>
                  </div>
                  <div className="flex flex-col items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <span className="text-xs text-muted-foreground mb-2">Outline</span>
                    <Button variant="outline">Outline</Button>
                  </div>
                  <div className="flex flex-col items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <span className="text-xs text-muted-foreground mb-2">Destructive</span>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                  <div className="flex flex-col items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <span className="text-xs text-muted-foreground mb-2">Ghost</span>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                  <div className="flex flex-col items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <span className="text-xs text-muted-foreground mb-2">Link</span>
                    <Button variant="link">Link</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Input 테스트 */}
          <TabsContent value="inputs" className="space-y-6">
            <Card className="overflow-hidden border-2 shadow-md">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  Input 테스트
                </CardTitle>
                <CardDescription>입력 컴포넌트들을 테스트합니다</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="test-input" className="text-base">텍스트 입력</Label>
                      <span className="text-xs text-muted-foreground">Input</span>
                    </div>
                    <Input 
                      id="test-input" 
                      placeholder="여기에 입력하세요" 
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-xs text-muted-foreground">기본 텍스트 입력 필드입니다</p>
                  </div>
                  <div className="space-y-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="test-textarea" className="text-base">텍스트 영역</Label>
                      <span className="text-xs text-muted-foreground">Textarea</span>
                    </div>
                    <Textarea 
                      id="test-textarea" 
                      placeholder="여러 줄 입력" 
                      className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-xs text-muted-foreground">여러 줄 텍스트를 입력할 수 있는 영역입니다</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Select 테스트 */}
          <TabsContent value="selects" className="space-y-6">
            <Card className="overflow-hidden border-2 shadow-md">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-primary" />
                  Select 테스트
                </CardTitle>
                <CardDescription>드롭다운 선택 컴포넌트를 테스트합니다</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="max-w-md mx-auto p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">선택 옵션</Label>
                      <span className="text-xs text-muted-foreground">Select</span>
                    </div>
                    <Select>
                      <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="옵션을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">옵션 1</SelectItem>
                        <SelectItem value="option2">옵션 2</SelectItem>
                        <SelectItem value="option3">옵션 3</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">드롭다운 메뉴에서 옵션을 선택할 수 있습니다</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CSS 변수 테스트 */}
          <TabsContent value="css" className="space-y-6">
            <Card className="overflow-hidden border-2 shadow-md">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  CSS 변수 테스트
                </CardTitle>
                <CardDescription>shadcn/ui CSS 변수가 제대로 작동하는지 확인합니다</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-primary text-primary-foreground rounded-lg shadow-sm transition-transform hover:scale-[1.02] duration-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Primary 색상</h3>
                      <code className="text-xs bg-primary-foreground/20 px-2 py-1 rounded">bg-primary</code>
                    </div>
                    <p className="text-sm opacity-90">Primary 배경과 텍스트 색상 테스트</p>
                  </div>
                  
                  <div className="p-6 bg-secondary text-secondary-foreground rounded-lg shadow-sm transition-transform hover:scale-[1.02] duration-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Secondary 색상</h3>
                      <code className="text-xs bg-secondary-foreground/20 px-2 py-1 rounded">bg-secondary</code>
                    </div>
                    <p className="text-sm opacity-90">Secondary 배경과 텍스트 색상 테스트</p>
                  </div>
                  
                  <div className="p-6 bg-muted text-muted-foreground rounded-lg shadow-sm transition-transform hover:scale-[1.02] duration-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Muted 색상</h3>
                      <code className="text-xs bg-background px-2 py-1 rounded">bg-muted</code>
                    </div>
                    <p className="text-sm">Muted 배경과 텍스트 색상 테스트</p>
                  </div>
                  
                  <div className="p-6 border-2 border-border rounded-lg shadow-sm transition-transform hover:scale-[1.02] duration-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Border 테스트</h3>
                      <code className="text-xs bg-muted px-2 py-1 rounded">border-border</code>
                    </div>
                    <p className="text-sm text-muted-foreground">테두리 색상 테스트</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 디버그 정보 */}
          <TabsContent value="debug" className="space-y-6">
            <Card className="overflow-hidden border-2 shadow-md">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  디버그 정보
                </CardTitle>
                <CardDescription>CSS 변수들의 실제 값을 확인합니다</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      색상 변수
                    </h3>
                    <div className="font-mono text-sm space-y-3">
                      <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span>--primary:</span>
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-6 h-6 rounded-full border" style={{backgroundColor: 'hsl(var(--primary))'}}></span>
                          <code className="text-xs">hsl(var(--primary))</code>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span>--secondary:</span>
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-6 h-6 rounded-full border" style={{backgroundColor: 'hsl(var(--secondary))'}}></span>
                          <code className="text-xs">hsl(var(--secondary))</code>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span>--muted:</span>
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-6 h-6 rounded-full border" style={{backgroundColor: 'hsl(var(--muted))'}}></span>
                          <code className="text-xs">hsl(var(--muted))</code>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      배경 및 텍스트 변수
                    </h3>
                    <div className="font-mono text-sm space-y-3">
                      <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span>--foreground:</span>
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-6 h-6 rounded-full border" style={{backgroundColor: 'hsl(var(--foreground))'}}></span>
                          <code className="text-xs">hsl(var(--foreground))</code>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span>--background:</span>
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-6 h-6 rounded-full border" style={{backgroundColor: 'hsl(var(--background))'}}></span>
                          <code className="text-xs">hsl(var(--background))</code>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span>--border:</span>
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-6 h-6 rounded-full border" style={{backgroundColor: 'hsl(var(--border))'}}></span>
                          <code className="text-xs">hsl(var(--border))</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TestPage; 