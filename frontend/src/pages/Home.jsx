import { Link } from 'react-router-dom';

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
    <div className="container">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          WebTools
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'hsl(var(--muted-foreground))', 
          maxWidth: '600px', 
          margin: '0 auto 2rem',
          lineHeight: '1.6'
        }}>
          현대적인 웹 도구 모음집입니다. 오디오 편집, 이미지 편집, QR 코드 생성 등 다양한 기능을 제공합니다.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'hsl(var(--muted))',
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
            color: 'hsl(var(--muted-foreground))'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            React + Vite
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'hsl(var(--muted))',
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
            color: 'hsl(var(--muted-foreground))'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            반응형 디자인
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'hsl(var(--muted))',
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
            color: 'hsl(var(--muted-foreground))'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            오픈소스
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {tools.map((tool) => (
          <Link key={tool.id} to={tool.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ 
              height: '100%',
              background: `linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted) / 0.3))`,
              border: '1px solid hsl(var(--border))',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
            }}>
              <div className="card-content" style={{ padding: '2rem' }}>
                {/* Icon */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '4rem', 
                  height: '4rem', 
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  borderRadius: '1rem',
                  marginBottom: '1.5rem',
                  border: '1px solid hsl(var(--primary) / 0.2)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={tool.icon}></path>
                  </svg>
                </div>

                {/* Content */}
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  marginBottom: '0.75rem',
                  color: 'hsl(var(--foreground))'
                }}>
                  {tool.name}
                </h3>
                
                <p style={{ 
                  color: 'hsl(var(--muted-foreground))', 
                  marginBottom: '1.5rem',
                  lineHeight: '1.6'
                }}>
                  {tool.description}
                </p>

                {/* Features */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {tool.features.map((feature, index) => (
                    <span key={index} style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: 'hsl(var(--muted))',
                      color: 'hsl(var(--muted-foreground))',
                      borderRadius: 'calc(var(--radius) - 2px)',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {feature}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: 'hsl(var(--primary))',
                  fontWeight: '500'
                }}>
                  시작하기
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Features Section */}
      <div className="card" style={{ marginBottom: '3rem' }}>
        <div className="card-content" style={{ padding: '2rem' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            textAlign: 'center',
            color: 'hsl(var(--foreground))'
          }}>
            주요 특징
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '3rem', 
                height: '3rem', 
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                borderRadius: '0.75rem',
                margin: '0 auto 1rem',
                border: '1px solid hsl(var(--primary) / 0.2)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>빠른 성능</h3>
              <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                React와 Vite 기반으로 빠른 로딩과 원활한 사용자 경험을 제공합니다.
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '3rem', 
                height: '3rem', 
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                borderRadius: '0.75rem',
                margin: '0 auto 1rem',
                border: '1px solid hsl(var(--primary) / 0.2)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" x2="16" y1="21" y2="21"></line>
                  <line x1="12" x2="12" y1="17" y2="21"></line>
                </svg>
              </div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>반응형 디자인</h3>
              <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                모든 기기에서 최적화된 사용자 인터페이스를 제공합니다.
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '3rem', 
                height: '3rem', 
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                borderRadius: '0.75rem',
                margin: '0 auto 1rem',
                border: '1px solid hsl(var(--primary) / 0.2)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>클라이언트 사이드</h3>
              <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                모든 처리가 브라우저에서 이루어져 개인정보가 안전하게 보호됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Home;