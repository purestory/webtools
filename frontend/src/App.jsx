import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import AudioEditorPage from './pages/AudioEditorPage';
import ImageEditorPage from './pages/ImageEditorPage';
import QRGeneratorPage from './pages/QRGeneratorPage';
import Base64ConverterPage from './pages/Base64ConverterPage';
import IPInfoPage from './pages/IPInfoPage';
import PDFEditorPage from './pages/PDFEditorPage';
import URLEncoderPage from './pages/URLEncoderPage';
import './App.css';

function App() {
  return (
    <Router basename="/webtools">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/audio-editor" element={<AudioEditorPage />} />
          <Route path="/image-editor" element={<ImageEditorPage />} />
          <Route path="/qr-generator" element={<QRGeneratorPage />} />
          <Route path="/base64-converter" element={<Base64ConverterPage />} />
          <Route path="/ip-info" element={<IPInfoPage />} />
          <Route path="/pdf-editor" element={<PDFEditorPage />} />
          <Route path="/url-encoder" element={<URLEncoderPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;