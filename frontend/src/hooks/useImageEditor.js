import { useRef, useState, useCallback } from 'react';

export const useImageEditor = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(3);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setHistoryStep(prevStep => {
      const newStep = prevStep + 1;
      setHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, newStep);
        newHistory.push(canvas.toDataURL());
        return newHistory;
      });
      return newStep;
    });
  }, []);

  const loadImage = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setupCanvasWithImage(img);
          resolve(true);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const setupCanvasWithImage = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const maxWidth = 1000;
    const maxHeight = 600;
    let { width, height } = img;
    
    // 비율 유지하면서 최대 크기 제한
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // 이미지 그리기
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    
    // 히스토리에 저장
    saveToHistory();
  }, [saveToHistory]);

  const createNewCanvas = useCallback((width = 800, height = 600) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // 흰색 배경으로 채우기
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    saveToHistory();
  }, [saveToHistory]);

  const startDrawing = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);
    
    setIsDrawing(true);
    setStartX(pos.x);
    setStartY(pos.y);
    
    if (currentTool === 'pen' || currentTool === 'brush') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (currentTool === 'eraser') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, currentSize, 0, 2 * Math.PI);
      ctx.fill();
    } else if (currentTool === 'fill') {
      floodFill(pos.x, pos.y, currentColor);
      saveToHistory();
    } else if (currentTool === 'text') {
      addText(pos.x, pos.y);
    }
  }, [currentTool, currentSize, currentColor, getMousePos, saveToHistory]);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);
    
    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = currentSize;
      ctx.lineCap = 'round';
      ctx.strokeStyle = currentColor;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (currentTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = currentSize * 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = currentColor;
      ctx.globalAlpha = 0.7;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, currentSize, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [isDrawing, currentTool, currentSize, currentColor, getMousePos]);

  const stopDrawing = useCallback((e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);
    
    setIsDrawing(false);
    
    if (currentTool === 'line') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(pos.x, pos.y);
      ctx.lineWidth = currentSize;
      ctx.strokeStyle = currentColor;
      ctx.stroke();
    } else if (currentTool === 'rectangle') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentSize;
      ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY);
    } else if (currentTool === 'circle') {
      ctx.globalCompositeOperation = 'source-over';
      const radius = Math.sqrt(Math.pow(pos.x - startX, 2) + Math.pow(pos.y - startY, 2));
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentSize;
      ctx.stroke();
    }
    
    if (currentTool === 'eraser') {
      ctx.restore();
    }
    
    saveToHistory();
  }, [isDrawing, currentTool, currentSize, currentColor, startX, startY, getMousePos, saveToHistory]);

  const floodFill = useCallback((startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert color to RGBA
    const fillColorRGB = hexToRgb(fillColor);
    const targetColor = getPixelColor(data, startX, startY, canvas.width);
    
    if (colorsMatch(targetColor, fillColorRGB)) return;
    
    const pixelStack = [[startX, startY]];
    const width = canvas.width;
    const height = canvas.height;
    
    while (pixelStack.length) {
      const [x, y] = pixelStack.pop();
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const currentColor = getPixelColor(data, x, y, width);
      if (!colorsMatch(currentColor, targetColor)) continue;
      
      setPixelColor(data, x, y, width, fillColorRGB);
      
      pixelStack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, []);

  const hexToRgb = useCallback((hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 255
    } : null;
  }, []);

  const getPixelColor = useCallback((data, x, y, width) => {
    const index = (y * width + x) * 4;
    return {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
      a: data[index + 3]
    };
  }, []);

  const setPixelColor = useCallback((data, x, y, width, color) => {
    const index = (y * width + x) * 4;
    data[index] = color.r;
    data[index + 1] = color.g;
    data[index + 2] = color.b;
    data[index + 3] = color.a;
  }, []);

  const colorsMatch = useCallback((color1, color2) => {
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b && color1.a === color2.a;
  }, []);

  const addText = useCallback((x, y) => {
    const text = prompt('입력할 텍스트를 입력하세요:');
    if (!text) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.font = `${currentSize * 6}px Arial`;
    ctx.fillStyle = currentColor;
    ctx.fillText(text, x, y);
    saveToHistory();
  }, [currentSize, currentColor, saveToHistory]);

  const undo = useCallback(() => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      restoreFromHistory(newStep);
    }
  }, [historyStep]);

  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      restoreFromHistory(newStep);
    }
  }, [historyStep, history.length]);

  const restoreFromHistory = useCallback((step) => {
    const canvas = canvasRef.current;
    if (!canvas || !history[step]) return;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[step];
  }, [history]);

  const clearCanvas = useCallback(() => {
    if (!confirm('캔버스를 모두 지우시겠습니까?')) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, [saveToHistory]);

  const applyFilter = useCallback((filterType) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      
      switch (filterType) {
        case 'grayscale':
          const gray = r * 0.299 + g * 0.587 + b * 0.114;
          data[i] = data[i + 1] = data[i + 2] = gray;
          break;
        case 'sepia':
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
          break;
        case 'invert':
          data[i] = 255 - r;
          data[i + 1] = 255 - g;
          data[i + 2] = 255 - b;
          break;
        case 'brighten':
          data[i] = Math.min(255, r + 30);
          data[i + 1] = Math.min(255, g + 30);
          data[i + 2] = Math.min(255, b + 30);
          break;
        case 'darken':
          data[i] = Math.max(0, r - 30);
          data[i + 1] = Math.max(0, g - 30);
          data[i + 2] = Math.max(0, b - 30);
          break;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  }, [saveToHistory]);

  const flipHorizontal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.putImageData(imageData, -canvas.width, 0);
    ctx.restore();
    saveToHistory();
  }, [saveToHistory]);

  const flipVertical = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(1, -1);
    ctx.putImageData(imageData, 0, -canvas.height);
    ctx.restore();
    saveToHistory();
  }, [saveToHistory]);

  const downloadImage = useCallback((format = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    
    if (format === 'jpg') {
      // JPG는 배경을 흰색으로 설정
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);
      
      link.download = `image-editor-${Date.now()}.jpg`;
      link.href = tempCanvas.toDataURL('image/jpeg', 0.9);
    } else {
      link.download = `image-editor-${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
    }
    
    link.click();
  }, []);

  return {
    canvasRef,
    fileInputRef,
    isDrawing,
    currentTool,
    currentColor,
    currentSize,
    history,
    historyStep,
    setCurrentTool,
    setCurrentColor,
    setCurrentSize,
    loadImage,
    createNewCanvas,
    startDrawing,
    draw,
    stopDrawing,
    undo,
    redo,
    clearCanvas,
    applyFilter,
    flipHorizontal,
    flipVertical,
    downloadImage
  };
};