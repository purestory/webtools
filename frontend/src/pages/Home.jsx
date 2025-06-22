import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';

const Home = () => {
  const tools = [
    {
      id: 'audio-editor',
      name: 'Audio Editor',
      description: '오디오 파일을 편집하고 효과를 적용하세요. 파형 시각화와 구간 선택 기능을 제공합니다.',
      icon: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4',
      href: '/audio-editor',
      features: ['파형 시각화', '구간 선택', '페이드 효과', '실시간 재생'],
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'image-editor',
      name: 'Image Editor',
      description: '이미지를 편집하고 다양한 필터와 변형을 적용하세요. 윈도우 그림판과 유사한 인터페이스를 제공합니다.',
      icon: 'M21 12a9 9 0 11-6.219-8.56',
      href: '/image-editor',
      features: ['그리기 도구', '이미지 필터', '변형 기능', '다중 포맷 지원'],
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      id: 'qr-generator',
      name: 'QR Generator',
      description: 'URL, 텍스트, 연락처 정보 등을 QR 코드로 변환하세요. 다양한 설정과 스타일을 지원합니다.',
      icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
      href: '/qr-generator',
      features: ['다양한 형식', '색상 커스터마이징', '크기 조절', '고화질 다운로드'],
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      id: 'base64-converter',
      name: 'Base64 변환기',
      description: '텍스트를 Base64로 인코딩하거나 Base64를 텍스트로 디코딩합니다. 개발자를 위한 필수 도구입니다.',
      icon: 'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3',
      href: '/base64-converter',
      features: ['텍스트 인코딩', 'Base64 디코딩', '복사 기능', '오류 처리'],
      bgColor: 'from-orange-500/10 to-red-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      id: 'ip-info',
      name: 'IP 정보 조회',
      description: 'IP 주소의 위치, ISP, 타임존 등 상세 정보를 조회합니다. 네트워크 분석에 유용합니다.',
      icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
      href: '/ip-info',
      features: ['지리적 위치', 'ISP 정보', '타임존', '지도 연동'],
      bgColor: 'from-teal-500/10 to-cyan-500/10',
      borderColor: 'border-teal-500/20'
    },
    {
      id: 'pdf-editor',
      name: 'PDF 에디터',
      description: 'PDF를 미리보면서 페이지 회전, 삭제, 복제 등의 고급 편집을 할 수 있습니다. 브라우저에서 안전하게 처리됩니다.',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
      href: '/pdf-editor',
      features: ['PDF 미리보기', '페이지 회전', '페이지 삭제/복제', '실시간 편집'],
      bgColor: 'from-rose-500/10 to-pink-500/10',
      borderColor: 'border-rose-500/20'
    },
    {
      id: 'url-encoder',
      name: 'URL 인코더',
      description: 'URL에 안전하게 사용할 수 있도록 텍스트를 인코딩하거나 디코딩합니다.',
      icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
      href: '/url-encoder',
      features: ['URL 인코딩', 'URL 디코딩', '다양한 타입', '예시 제공'],
      bgColor: 'from-indigo-500/10 to-purple-500/10',
      borderColor: 'border-indigo-500/20'
    }
  ];

  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          WebTools
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          현대적인 웹 도구 모음집입니다. 오디오 편집, 이미지 편집, QR 코드 생성 등 다양한 기능을 제공합니다.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            React + Vite
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            반응형 디자인
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            오픈소스
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Link key={tool.id} to={tool.href} className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-primary/50">
              <CardContent className="p-8">
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={tool.icon}></path>
                  </svg>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {tool.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {tool.features.map((feature, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full border"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Footer Section */}
      <div className="text-center mt-16 pt-12 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-foreground">모든 도구가 한 곳에</h2>
          <p className="text-lg text-muted-foreground mb-8">
            웹브라우저에서 바로 사용할 수 있는 다양한 유틸리티 도구들을 제공합니다. 
            설치가 필요 없고, 개인정보는 안전하게 보호됩니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">안전한 처리</h3>
              <p className="text-sm text-muted-foreground">모든 데이터는 브라우저에서만 처리되어 외부로 전송되지 않습니다.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">빠른 실행</h3>
              <p className="text-sm text-muted-foreground">설치 없이 웹브라우저에서 바로 실행할 수 있습니다.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">오픈소스</h3>
              <p className="text-sm text-muted-foreground">모든 코드가 공개되어 투명하고 신뢰할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;