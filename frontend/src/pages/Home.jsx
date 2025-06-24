import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../locales/translations';

const Home = () => {
  const { language } = useLanguage();
  
  const tools = [
    {
      id: 'audio-editor',
      name: t(language, 'home.tools.audioEditor.name'),
      description: t(language, 'home.tools.audioEditor.description'),
      icon: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4',
      href: '/audio-editor',
      features: t(language, 'home.tools.audioEditor.features'),
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'image-editor',
      name: t(language, 'home.tools.imageEditor.name'),
      description: t(language, 'home.tools.imageEditor.description'),
      icon: 'M21 12a9 9 0 11-6.219-8.56',
      href: '/image-editor',
      features: t(language, 'home.tools.imageEditor.features'),
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      id: 'image-converter',
      name: t(language, 'home.tools.imageConverter.name'),
      description: t(language, 'home.tools.imageConverter.description'),
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-6 M9 15l3-3 3 3',
      href: '/image-converter',
      features: t(language, 'home.tools.imageConverter.features'),
      bgColor: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      id: 'pdf-editor',
      name: t(language, 'home.tools.pdfEditor.name'),
      description: t(language, 'home.tools.pdfEditor.description'),
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
      href: '/pdf-editor',
      features: t(language, 'home.tools.pdfEditor.features'),
      bgColor: 'from-rose-500/10 to-pink-500/10',
      borderColor: 'border-rose-500/20'
    },
    {
      id: 'qr-generator',
      name: t(language, 'home.tools.qrGenerator.name'),
      description: t(language, 'home.tools.qrGenerator.description'),
      icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
      href: '/qr-generator',
      features: t(language, 'home.tools.qrGenerator.features'),
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      id: 'base64-converter',
      name: t(language, 'home.tools.base64Converter.name'),
      description: t(language, 'home.tools.base64Converter.description'),
      icon: 'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3',
      href: '/base64-converter',
      features: t(language, 'home.tools.base64Converter.features'),
      bgColor: 'from-orange-500/10 to-red-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      id: 'ip-info',
      name: t(language, 'home.tools.ipInfo.name'),
      description: t(language, 'home.tools.ipInfo.description'),
      icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
      href: '/ip-info',
      features: t(language, 'home.tools.ipInfo.features'),
      bgColor: 'from-teal-500/10 to-cyan-500/10',
      borderColor: 'border-teal-500/20'
    },
    {
      id: 'url-encoder',
      name: t(language, 'home.tools.urlEncoder.name'),
      description: t(language, 'home.tools.urlEncoder.description'),
      icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
      href: '/url-encoder',
      features: t(language, 'home.tools.urlEncoder.features'),
      bgColor: 'from-indigo-500/10 to-purple-500/10',
      borderColor: 'border-indigo-500/20'
    },
    {
      id: 'json-formatter',
      name: t(language, 'home.tools.jsonFormatter.name'),
      description: t(language, 'home.tools.jsonFormatter.description'),
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 9l2 2 4-4',
      href: '/json-formatter',
      features: t(language, 'home.tools.jsonFormatter.features'),
      bgColor: 'from-violet-500/10 to-purple-500/10',
      borderColor: 'border-violet-500/20'
    },
    {
      id: 'text-repairer',
      name: t(language, 'home.tools.textRepairer.name'),
      description: t(language, 'home.tools.textRepairer.description'),
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M12 9h-2 M10 21V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14',
      href: '/text-repairer',
      features: t(language, 'home.tools.textRepairer.features'),
      bgColor: 'from-slate-500/10 to-gray-500/10',
      borderColor: 'border-slate-500/20'
    }
  ];

  return (
    <div className="container py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-extrabold mb-6 text-black">
          {t(language, 'common.appName')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          {t(language, 'home.title')}. {t(language, 'home.subtitle')}
        </p>
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
          <h2 className="text-3xl font-bold mb-4 text-foreground">{t(language, 'home.features.allInOne.title')}</h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t(language, 'home.subtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t(language, 'home.features.secure.title')}</h3>
              <p className="text-sm text-muted-foreground">{t(language, 'home.features.secure.description')}</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t(language, 'home.features.fast.title')}</h3>
              <p className="text-sm text-muted-foreground">{t(language, 'home.features.fast.description')}</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t(language, 'home.features.easy.title')}</h3>
              <p className="text-sm text-muted-foreground">{t(language, 'home.features.easy.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;