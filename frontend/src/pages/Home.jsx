import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';

const Home = () => {
  const tools = [
    {
      id: 'audio-editor',
      name: 'Audio Editor',
      description: 'Edit audio files and apply effects. Provides waveform visualization and section selection features.',
      icon: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4',
      href: '/audio-editor',
      features: ['Waveform Visualization', 'Section Selection', 'Fade Effects', 'Real-time Playback'],
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'image-editor',
      name: 'Image Editor',
      description: 'Edit images and apply various filters and transformations. Provides a Windows Paint-like interface.',
      icon: 'M21 12a9 9 0 11-6.219-8.56',
      href: '/image-editor',
      features: ['Drawing Tools', 'Image Filters', 'Transform Functions', 'Multi-format Support'],
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      id: 'image-converter',
      name: 'Image Converter',
      description: 'Convert image file formats and batch generate multiple sizes for Windows icons. Optimized for ICO file creation.',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v-6 M9 15l3-3 3 3',
      href: '/image-converter',
      features: ['Format Conversion', 'Windows Icons', 'Batch Processing', 'Multiple Sizes'],
      bgColor: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      id: 'qr-generator',
      name: 'QR Generator',
      description: 'Convert URLs, text, contact information, etc. to QR codes. Supports various settings and styles.',
      icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
      href: '/qr-generator',
      features: ['Various Formats', 'Color Customization', 'Size Adjustment', 'High-quality Download'],
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      id: 'base64-converter',
      name: 'Base64 Converter',
      description: 'Encode text to Base64 or decode Base64 to text. Essential tool for developers.',
      icon: 'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3',
      href: '/base64-converter',
      features: ['Text Encoding', 'Base64 Decoding', 'Copy Function', 'Error Handling'],
      bgColor: 'from-orange-500/10 to-red-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      id: 'ip-info',
      name: 'IP Information',
      description: 'Look up detailed information about IP addresses including location, ISP, timezone, etc. Useful for network analysis.',
      icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
      href: '/ip-info',
      features: ['Geographic Location', 'ISP Information', 'Timezone', 'Map Integration'],
      bgColor: 'from-teal-500/10 to-cyan-500/10',
      borderColor: 'border-teal-500/20'
    },
    {
      id: 'pdf-editor',
      name: 'PDF Editor',
      description: 'Advanced PDF editing with page preview including rotation, deletion, duplication, etc. Processed safely in browser.',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
      href: '/pdf-editor',
      features: ['PDF Preview', 'Page Rotation', 'Page Delete/Duplicate', 'Real-time Editing'],
      bgColor: 'from-rose-500/10 to-pink-500/10',
      borderColor: 'border-rose-500/20'
    },
    {
      id: 'url-encoder',
      name: 'URL Encoder',
      description: 'Encode or decode text for safe use in URLs.',
      icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
      href: '/url-encoder',
      features: ['URL Encoding', 'URL Decoding', 'Various Types', 'Example Provided'],
      bgColor: 'from-indigo-500/10 to-purple-500/10',
      borderColor: 'border-indigo-500/20'
    },
    {
      id: 'json-formatter',
      name: 'JSON Formatter',
      description: 'Tool for formatting, compressing, and validating JSON data. Essential JSON processing utility for developers.',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 9l2 2 4-4',
      href: '/json-formatter',
      features: ['JSON Formatting', 'JSON Compression', 'Validation', 'Syntax Highlighting'],
      bgColor: 'from-violet-500/10 to-purple-500/10',
      borderColor: 'border-violet-500/20'
    },
    {
      id: 'test-components',
      name: 'UI Component Test',
      description: 'Test page for shadcn/ui components. UI component behavior verification tool for developers.',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      href: '/test',
      features: ['Button Test', 'Input Test', 'Select Test', 'CSS Variable Check'],
      bgColor: 'from-yellow-500/10 to-amber-500/10',
      borderColor: 'border-yellow-500/20'
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
          Modern web tools collection. Provides various functions including audio editing, image editing, QR code generation, and more.
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
            Responsive Design
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            Open Source
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
          <h2 className="text-3xl font-bold mb-4 text-foreground">All Tools in One Place</h2>
                      <p className="text-lg text-muted-foreground mb-8">
              Provides various utility tools that can be used directly in web browsers. 
              No installation required, and personal information is safely protected.
            </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Processing</h3>
              <p className="text-sm text-muted-foreground">All data is processed only in the browser and not transmitted externally.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Execution</h3>
              <p className="text-sm text-muted-foreground">Can be executed directly in web browser without installation.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Open Source</h3>
              <p className="text-sm text-muted-foreground">All code is public, making it transparent and trustworthy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;