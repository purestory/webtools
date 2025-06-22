import { useState, useRef, useCallback } from 'react';
import QRCode from 'qrcode';

export const useQRGenerator = () => {
  const canvasRef = useRef(null);
  const [text, setText] = useState('');
  const [qrSize, setQrSize] = useState(200);
  const [errorLevel, setErrorLevel] = useState('M');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateQR = useCallback(async () => {
    if (!text.trim()) {
      alert('텍스트를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const options = {
        errorCorrectionLevel: errorLevel,
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        width: qrSize,
      };

      // Canvas에 QR 코드 그리기
      await QRCode.toCanvas(canvas, text, options);
      
      // Data URL 생성
      const dataUrl = canvas.toDataURL('image/png');
      setQrCodeUrl(dataUrl);
      
    } catch (error) {
      console.error('QR 코드 생성 오류:', error);
      alert('QR 코드 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [text, qrSize, errorLevel, foregroundColor, backgroundColor]);

  const downloadQR = useCallback(() => {
    if (!qrCodeUrl) {
      alert('먼저 QR 코드를 생성해주세요.');
      return;
    }

    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
  }, [qrCodeUrl]);

  const copyToClipboard = useCallback(async () => {
    if (!qrCodeUrl) {
      alert('먼저 QR 코드를 생성해주세요.');
      return;
    }

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        alert('QR 코드가 클립보드에 복사되었습니다.');
      } else {
        // Fallback: 텍스트로 복사
        await navigator.clipboard.writeText(text);
        alert('QR 코드 텍스트가 클립보드에 복사되었습니다.');
      }
    } catch (error) {
      console.error('클립보드 복사 오류:', error);
      alert('클립보드 복사 중 오류가 발생했습니다.');
    }
  }, [qrCodeUrl, text]);

  const clearQR = useCallback(() => {
    setText('');
    setQrCodeUrl('');
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const generateRandomText = useCallback(() => {
    const randomTexts = [
      'https://github.com',
      'https://google.com',
      'Hello, World!',
      '안녕하세요! QR 코드 테스트입니다.',
      'QR Code Generator Test',
      `Generated at ${new Date().toLocaleString()}`,
      'https://ai-open.kr',
      'Contact: example@email.com',
      'Tel: +82-10-1234-5678',
      'WiFi:T:WPA;S:MyNetwork;P:password123;;'
    ];
    
    const randomText = randomTexts[Math.floor(Math.random() * randomTexts.length)];
    setText(randomText);
  }, []);

  const presetTexts = [
    { label: 'URL', value: 'https://example.com' },
    { label: '이메일', value: 'mailto:example@email.com' },
    { label: '전화번호', value: 'tel:+82-10-1234-5678' },
    { label: 'WiFi', value: 'WiFi:T:WPA;S:NetworkName;P:password;;' },
    { label: 'SMS', value: 'sms:+82-10-1234-5678?body=Hello' },
    { label: 'vCard', value: 'BEGIN:VCARD\nVERSION:3.0\nFN:홍길동\nTEL:+82-10-1234-5678\nEMAIL:hong@example.com\nEND:VCARD' }
  ];

  return {
    canvasRef,
    text,
    setText,
    qrSize,
    setQrSize,
    errorLevel,
    setErrorLevel,
    foregroundColor,
    setForegroundColor,
    backgroundColor,
    setBackgroundColor,
    qrCodeUrl,
    isLoading,
    generateQR,
    downloadQR,
    copyToClipboard,
    clearQR,
    generateRandomText,
    presetTexts
  };
};