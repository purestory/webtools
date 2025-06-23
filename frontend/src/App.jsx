import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import AudioEditorPage from './pages/AudioEditorPage';
import ImageEditorPage from './pages/ImageEditorPage';
import ImageConverterPage from './pages/ImageConverterPage';
import QRGeneratorPage from './pages/QRGeneratorPage';
import Base64ConverterPage from './pages/Base64ConverterPage';
import IPInfoPage from './pages/IPInfoPage';
import PDFEditorPage from './pages/PDFEditorPage';
import URLEncoderPage from './pages/URLEncoderPage';
import TestPage from './pages/TestPage';
import JSONFormatterPage from './pages/JSONFormatterPage';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <Router basename="/webtools">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/json-formatter" element={<JSONFormatterPage />} />
            <Route path="/audio-editor" element={<AudioEditorPage />} />
            <Route path="/image-editor" element={<ImageEditorPage />} />
            <Route path="/image-converter" element={<ImageConverterPage />} />
            <Route path="/qr-generator" element={<QRGeneratorPage />} />
            <Route path="/base64-converter" element={<Base64ConverterPage />} />
            <Route path="/ip-info" element={<IPInfoPage />} />
            <Route path="/pdf-editor" element={<PDFEditorPage />} />
            <Route path="/url-encoder" element={<URLEncoderPage />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;