import { useState, useRef } from 'react';
import './PDFEditor.css';

const PDFEditor = () => {
  // 기본 상태
  const [mode, setMode] = useState('select'); // 'select', 'merge', 'edit', 'advanced'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 병합 모드 상태
  const [mergeFiles, setMergeFiles] = useState([]);
  const [mergeSettings, setMergeSettings] = useState({
    selectedFiles: new Set(),
    pageRanges: {},
    includeAll: true
  });

  // 편집 모드 상태
  const [editFile, setEditFile] = useState(null);
  const [editPdfDoc, setEditPdfDoc] = useState(null);
  const [editPages, setEditPages] = useState([]);
  const [editSettings, setEditSettings] = useState({
    selectedPages: new Set(),
    pageRanges: '',
    includeAll: true
  });

  // 고급 편집 모드 상태
  const [advancedFile, setAdvancedFile] = useState(null);
  const [advancedPdfDoc, setAdvancedPdfDoc] = useState(null);
  const [advancedPages, setAdvancedPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [previewUrls, setPreviewUrls] = useState({});
  const [pageRotations, setPageRotations] = useState({}); // 누적 회전 각도 추적

  const fileInputRef = useRef(null);

  // 에러 설정
  const setErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  // PDF.js 설정
  const setupPdfJs = async () => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs';
    return pdfjsLib;
  };

  // 모드 선택 화면
  const renderModeSelection = () => (
    <div className="mode-selection">
      <div className="mode-cards">
        <div 
          className="mode-card"
          onClick={() => setMode('merge')}
        >
          <div className="mode-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
          </div>
          <h3>PDF 병합</h3>
          <p>여러 PDF 파일을 하나로 합치기</p>
          <ul>
            <li>여러 파일 선택</li>
            <li>페이지 범위 지정</li>
            <li>파일 순서 변경</li>
          </ul>
        </div>

        <div 
          className="mode-card"
          onClick={() => setMode('edit')}
        >
          <div className="mode-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <h3>PDF 편집</h3>
          <p>페이지 범위를 지정하여 편집</p>
          <ul>
            <li>페이지 범위 지정</li>
            <li>페이지 삭제</li>
            <li>페이지 회전</li>
          </ul>
        </div>

        <div 
          className="mode-card"
          onClick={() => setMode('advanced')}
        >
          <div className="mode-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
          <h3>고급 편집</h3>
          <p>페이지별 미리보기와 세부 편집</p>
          <ul>
            <li>페이지 미리보기</li>
            <li>개별 페이지 조작</li>
            <li>실시간 편집</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // 병합 모드 파일 선택
  const handleMergeFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      setErrorMessage('PDF 파일만 선택해주세요.');
      return;
    }

    // 각 파일의 페이지 수를 확인하고 저장
    const loadFilesWithPageCount = async () => {
      const { PDFDocument } = await import('pdf-lib');
      const filesWithPageCount = [];
      
      for (const file of pdfFiles) {
        try {
          const fileBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(fileBuffer);
          const pageCount = pdf.getPageCount();
          
          filesWithPageCount.push({
            file,
            pageCount,
            name: file.name,
            size: file.size
          });
        } catch (err) {
          console.error('파일 로드 오류:', err);
          filesWithPageCount.push({
            file,
            pageCount: 0,
            name: file.name,
            size: file.size
          });
        }
      }
      
      setMergeFiles(prev => [...prev, ...filesWithPageCount]);
      
      // 기본 페이지 범위 설정 (전체)
      const newRanges = {};
      filesWithPageCount.forEach((fileData, index) => {
        const fileIndex = mergeFiles.length + index;
        newRanges[fileIndex] = 'all';
      });
      
      setMergeSettings(prev => ({
        ...prev,
        pageRanges: { ...prev.pageRanges, ...newRanges }
      }));
    };
    
    loadFilesWithPageCount();
  };

  // 파일 순서 변경
  const moveMergeFile = (fromIndex, toIndex) => {
    const newFiles = [...mergeFiles];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setMergeFiles(newFiles);
  };

  // 페이지 범위 설정
  const setPageRange = (fileIndex, range) => {
    setMergeSettings(prev => ({
      ...prev,
      pageRanges: {
        ...prev.pageRanges,
        [fileIndex]: range
      }
    }));
  };

  // PDF 병합 실행
  const executeMerge = async () => {
    if (mergeFiles.length < 2) {
      setErrorMessage('최소 2개의 PDF 파일이 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < mergeFiles.length; i++) {
        const fileData = mergeFiles[i];
        const file = fileData.file || fileData; // 호환성을 위해
        const range = mergeSettings.pageRanges[i] || 'all';
        
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        
        let pageIndices;
        if (range === 'all') {
          pageIndices = pdf.getPageIndices();
        } else {
          // 페이지 범위 파싱 (예: "1-3,5,7-9")
          pageIndices = parsePageRange(range, pdf.getPageCount());
        }
        
        if (pageIndices.length > 0) {
          const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
          copiedPages.forEach(page => mergedPdf.addPage(page));
        }
      }

      const pdfBytes = await mergedPdf.save();
      downloadPDF(pdfBytes, 'merged-document.pdf');
      
    } catch (err) {
      setErrorMessage('PDF 병합 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 범위 파싱
  const parsePageRange = (range, totalPages) => {
    const indices = [];
    const parts = range.split(',');
    
    parts.forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
          indices.push(i - 1); // 0-based index
        }
      } else {
        const pageNum = parseInt(part);
        if (pageNum >= 1 && pageNum <= totalPages) {
          indices.push(pageNum - 1);
        }
      }
    });
    
    return [...new Set(indices)].sort((a, b) => a - b);
  };

  // PDF 다운로드
  const downloadPDF = (pdfBytes, filename) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 병합 모드 렌더링
  const renderMergeMode = () => (
    <div className="merge-mode">
      <div className="mode-header">
        <button className="back-button" onClick={() => setMode('select')}>
          ← 뒤로가기
        </button>
        <h2>PDF 병합</h2>
      </div>

      {/* 파일 업로드 */}
      <div className="card">
        <div className="card-content">
          <h3>파일 선택</h3>
          <div 
            className="file-drop-zone"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files);
              const pdfFiles = files.filter(file => file.type === 'application/pdf');
              if (pdfFiles.length > 0) {
                const event = { target: { files: pdfFiles } };
                handleMergeFileSelect(event);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <p>PDF 파일을 선택하거나 드래그하세요</p>
            <p className="text-sm">여러 파일 선택 가능</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleMergeFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* 선택된 파일 목록 */}
      {mergeFiles.length > 0 && (
        <div className="card">
          <div className="card-content">
            <h3>선택된 파일 ({mergeFiles.length}개)</h3>
            <div className="file-list">
              {mergeFiles.map((fileData, index) => {
                const file = fileData.file || fileData;
                const pageCount = fileData.pageCount || 0;
                const fileName = fileData.name || file.name;
                const fileSize = fileData.size || file.size;
                
                return (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <div className="file-name">{fileName}</div>
                      <div className="file-details">
                        <span className="file-size">{formatFileSize(fileSize)}</span>
                        {pageCount > 0 && (
                          <span className="page-count">{pageCount} 페이지</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="page-range-input">
                      <label>페이지 범위:</label>
                      <select 
                        value={mergeSettings.pageRanges[index] === 'all' || !mergeSettings.pageRanges[index] ? 'all' : 'custom'}
                        onChange={(e) => {
                          if (e.target.value === 'all') {
                            setPageRange(index, 'all');
                          } else {
                            setPageRange(index, '');
                          }
                        }}
                      >
                        <option value="all">전체 ({pageCount} 페이지)</option>
                        <option value="custom">직접 입력</option>
                      </select>
                      
                      {mergeSettings.pageRanges[index] !== 'all' && mergeSettings.pageRanges[index] !== undefined && (
                        <input
                          type="text"
                          placeholder="예: 1-3,5,7-9"
                          value={mergeSettings.pageRanges[index] === 'all' ? '' : mergeSettings.pageRanges[index] || ''}
                          onChange={(e) => setPageRange(index, e.target.value)}
                        />
                      )}
                    </div>

                    <div className="file-controls">
                      {index > 0 && (
                        <button onClick={() => moveMergeFile(index, index - 1)}>↑</button>
                      )}
                      {index < mergeFiles.length - 1 && (
                        <button onClick={() => moveMergeFile(index, index + 1)}>↓</button>
                      )}
                      <button 
                        onClick={() => setMergeFiles(prev => prev.filter((_, i) => i !== index))}
                        className="delete-btn"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="merge-actions">
              <button 
                className="button button-primary"
                onClick={executeMerge}
                disabled={loading || mergeFiles.length < 2}
              >
                {loading ? '병합 중...' : 'PDF 병합하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 파일 크기 포맷
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 편집 모드 파일 로드
  const loadEditFile = async (file) => {
    setLoading(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      
      setEditFile(file);
      setEditPdfDoc(pdf);
      
      const pageCount = pdf.getPageCount();
      const pages = [];
      for (let i = 0; i < pageCount; i++) {
        pages.push({
          index: i,
          rotation: 0,
          deleted: false
        });
      }
      setEditPages(pages);
      
    } catch (err) {
      setErrorMessage('PDF 로드 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 편집 모드 렌더링
  const renderEditMode = () => (
    <div className="edit-mode">
      <div className="mode-header">
        <button className="back-button" onClick={() => setMode('select')}>
          ← 뒤로가기
        </button>
        <h2>PDF 편집</h2>
      </div>

      {!editFile ? (
        <div className="card">
          <div className="card-content">
            <h3>편집할 PDF 파일 선택</h3>
            <div 
              className="file-drop-zone"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <p>편집할 PDF 파일을 선택하세요</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) loadEditFile(file);
              }}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      ) : (
        <div className="edit-controls">
          <div className="card">
            <div className="card-content">
              <div className="edit-file-header">
                <div className="file-info-section">
                  <h3>{editFile.name}</h3>
                  <p>총 {editPages.length} 페이지</p>
                </div>
                <button 
                  className="button button-outline"
                  onClick={() => {
                    setEditFile(null);
                    setEditPdfDoc(null);
                    setEditPages([]);
                    setEditSettings({
                      selectedPages: new Set(),
                      pageRanges: '',
                      includeAll: true
                    });
                  }}
                >
                  새 파일 선택
                </button>
              </div>
              
              {/* 편집 상태 표시 */}
              <div className="edit-status">
                {editPages.some(p => p.rotation !== 0) && (
                  <div className="status-item">
                    <span className="status-icon">🔄</span>
                    <span>회전된 페이지: {editPages.filter(p => p.rotation !== 0).length}개</span>
                  </div>
                )}
                {editPages.some(p => p.deleted) && (
                  <div className="status-item">
                    <span className="status-icon">🗑️</span>
                    <span>삭제된 페이지: {editPages.filter(p => p.deleted).length}개</span>
                  </div>
                )}
                {editPages.filter(p => !p.deleted).length !== editPages.length && (
                  <div className="status-item">
                    <span className="status-icon">📄</span>
                    <span>최종 페이지: {editPages.filter(p => !p.deleted).length}개</span>
                  </div>
                )}
              </div>
              
              <div className="range-selector">
                <div className="range-option">
                  <label>
                    <input
                      type="radio"
                      name="editRange"
                      value="all"
                      checked={editSettings.includeAll}
                      onChange={() => setEditSettings(prev => ({ ...prev, includeAll: true }))}
                    />
                    <span className="range-label">전체 페이지 ({editPages.length} 페이지)</span>
                  </label>
                </div>
                
                <div className="range-option">
                  <label>
                    <input
                      type="radio"
                      name="editRange"
                      value="range"
                      checked={!editSettings.includeAll}
                      onChange={() => setEditSettings(prev => ({ ...prev, includeAll: false }))}
                    />
                    <span className="range-label">페이지 범위 지정</span>
                  </label>
                  
                  {!editSettings.includeAll && (
                    <input
                      type="text"
                      className="range-input"
                      placeholder="예: 1-3,5,7-9"
                      value={editSettings.pageRanges}
                      onChange={(e) => setEditSettings(prev => ({ ...prev, pageRanges: e.target.value }))}
                    />
                  )}
                </div>
              </div>

              <div className="edit-actions">
                <button 
                  className="button button-outline"
                  onClick={() => rotatePages(-90)}
                >
                  ← 왼쪽 회전 (-90°)
                </button>
                
                <button 
                  className="button button-outline"
                  onClick={() => rotatePages(90)}
                >
                  오른쪽 회전 (+90°) →
                </button>
                
                <button 
                  className="button button-outline"
                  onClick={deletePages}
                  style={{ color: 'var(--destructive)' }}
                >
                  페이지 삭제
                </button>
                
                <button 
                  className="button button-outline"
                  onClick={extractPages}
                  disabled={loading}
                  style={{ color: 'var(--primary)' }}
                >
                  페이지 추출
                </button>
                
                <button 
                  className="button button-primary"
                  onClick={saveEditedPDF}
                  disabled={loading}
                >
                  {loading ? '저장 중...' : 'PDF 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 페이지 회전
  const rotatePages = async (degrees) => {
    if (!editPdfDoc) return;
    
    setLoading(true);
    try {
      const pageIndices = editSettings.includeAll 
        ? editPages.map((_, i) => i)
        : parsePageRange(editSettings.pageRanges, editPages.length);
      
      const pdfPages = editPdfDoc.getPages();
      pageIndices.forEach(index => {
        const page = pdfPages[index];
        const currentRotation = page.getRotation().angle;
        const newRotation = (currentRotation + degrees + 360) % 360;
        page.setRotation({ type: 'degrees', angle: newRotation });
        
        // 상태 업데이트
        setEditPages(prev => {
          const newPages = [...prev];
          newPages[index].rotation = newRotation;
          return newPages;
        });
      });
      
    } catch (err) {
      setErrorMessage('페이지 회전 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 삭제
  const deletePages = () => {
    const pageIndices = editSettings.includeAll 
      ? editPages.map((_, i) => i)
      : parsePageRange(editSettings.pageRanges, editPages.length);
    
    setEditPages(prev => {
      const newPages = [...prev];
      pageIndices.forEach(index => {
        newPages[index].deleted = true;
      });
      return newPages;
    });
  };

  // 페이지 추출 (선택된 페이지만 저장)
  const extractPages = async () => {
    if (!editPdfDoc) return;
    
    setLoading(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const newPdf = await PDFDocument.create();
      
      const pageIndices = editSettings.includeAll 
        ? editPages.map((_, i) => i)
        : parsePageRange(editSettings.pageRanges, editPages.length);
      
      // 선택된 페이지만 추출
      for (const index of pageIndices) {
        const [copiedPage] = await newPdf.copyPages(editPdfDoc, [index]);
        newPdf.addPage(copiedPage);
      }
      
      const pdfBytes = await newPdf.save();
      const pageRangeText = editSettings.includeAll 
        ? 'all-pages'
        : editSettings.pageRanges.replace(/[,\s]/g, '-');
      downloadPDF(pdfBytes, `extracted-${pageRangeText}-${editFile.name}`);
      
    } catch (err) {
      setErrorMessage('페이지 추출 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 편집된 PDF 저장
  const saveEditedPDF = async () => {
    if (!editPdfDoc) return;
    
    setLoading(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const newPdf = await PDFDocument.create();
      
      const validPages = editPages.filter(page => !page.deleted);
      
      for (const pageData of validPages) {
        const [copiedPage] = await newPdf.copyPages(editPdfDoc, [pageData.index]);
        newPdf.addPage(copiedPage);
      }
      
      const pdfBytes = await newPdf.save();
      downloadPDF(pdfBytes, `edited-${editFile.name}`);
      
    } catch (err) {
      setErrorMessage('PDF 저장 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 고급 편집 모드 파일 로드
  const loadAdvancedFile = async (file) => {
    setLoading(true);
    try {
      const pdfjsLib = await setupPdfJs();
      const { PDFDocument } = await import('pdf-lib');
      
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      
      // PDF.js로 미리보기 생성
      const pdfDoc = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
      
      setAdvancedFile(file);
      setAdvancedPdfDoc(pdf);
      
      const pageCount = pdf.getPageCount();
      const pages = [];
      const newPreviewUrls = {};
      
      for (let i = 0; i < pageCount; i++) {
        pages.push({
          index: i,
          rotation: 0,
          deleted: false
        });
        
        // 미리보기 생성
        const page = await pdfDoc.getPage(i + 1);
        const scale = 0.3;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        newPreviewUrls[i] = canvas.toDataURL();
      }
      
      setAdvancedPages(pages);
      setPreviewUrls(newPreviewUrls);
      
    } catch (err) {
      setErrorMessage('PDF 로드 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 고급 편집 페이지 회전
  const rotateAdvancedPage = (pageIndex, degrees) => {
    setAdvancedPages(prev => {
      const newPages = [...prev];
      const currentRotation = newPages[pageIndex].rotation;
      
      // 회전 방향을 올바르게 계산
      let newRotation = currentRotation + degrees;
      
      // 360도 범위 내로 정규화
      while (newRotation < 0) newRotation += 360;
      while (newRotation >= 360) newRotation -= 360;
      
      newPages[pageIndex].rotation = newRotation;
      return newPages;
    });

    // 누적 회전 각도 업데이트 (연속적인 애니메이션을 위해)
    setPageRotations(prev => {
      const currentCumulativeRotation = prev[pageIndex] || 0;
      const newCumulativeRotation = currentCumulativeRotation + degrees;
      return {
        ...prev,
        [pageIndex]: newCumulativeRotation
      };
    });
  };

  // 페이지 선택 토글
  const togglePageSelection = (pageIndex) => {
    setSelectedPages(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(pageIndex)) {
        newSelected.delete(pageIndex);
      } else {
        newSelected.add(pageIndex);
      }
      return newSelected;
    });
  };

  // 고급 편집 페이지 삭제
  const deleteAdvancedPage = (pageIndex) => {
    setAdvancedPages(prev => {
      const newPages = [...prev];
      newPages[pageIndex].deleted = !newPages[pageIndex].deleted;
      return newPages;
    });
  };

  // 고급 편집 페이지 복제
  const duplicateAdvancedPage = (pageIndex) => {
    setAdvancedPages(prev => {
      const newPages = [...prev];
      const pageToClone = { ...newPages[pageIndex] };
      newPages.splice(pageIndex + 1, 0, pageToClone);
      return newPages;
    });
  };

  // 고급 편집 PDF 저장
  const saveAdvancedPDF = async () => {
    if (!advancedPdfDoc) return;
    
    setLoading(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const newPdf = await PDFDocument.create();
      
      const validPages = advancedPages.filter(page => !page.deleted);
      
      for (const pageData of validPages) {
        const [copiedPage] = await newPdf.copyPages(advancedPdfDoc, [pageData.index]);
        
        // 회전 적용
        if (pageData.rotation !== 0) {
          copiedPage.setRotation({ type: 'degrees', angle: pageData.rotation });
        }
        
        newPdf.addPage(copiedPage);
      }
      
      const pdfBytes = await newPdf.save();
      downloadPDF(pdfBytes, `advanced-edited-${advancedFile.name}`);
      
    } catch (err) {
      setErrorMessage('PDF 저장 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 고급 편집 모드 렌더링
  const renderAdvancedMode = () => (
    <div className="advanced-mode">
      <div className="mode-header">
        <button className="back-button" onClick={() => setMode('select')}>
          ← 뒤로가기
        </button>
        <h2>고급 편집</h2>
      </div>

      {!advancedFile ? (
        <div className="card">
          <div className="card-content">
            <h3>편집할 PDF 파일 선택</h3>
            <div 
              className="file-drop-zone"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <p>고급 편집할 PDF 파일을 선택하세요</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) loadAdvancedFile(file);
              }}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      ) : (
        <div className="advanced-edit-controls">
          <div className="card">
            <div className="card-content">
              <div className="advanced-header">
                <div className="file-info-section">
                  <h3>{advancedFile.name}</h3>
                  <p>총 {advancedPages.filter(p => !p.deleted).length} / {advancedPages.length} 페이지</p>
                </div>
                <div className="header-actions">
                  <button 
                    className="button button-outline"
                    onClick={() => {
                      setAdvancedFile(null);
                      setAdvancedPdfDoc(null);
                      setAdvancedPages([]);
                      setSelectedPages(new Set());
                      setPreviewUrls({});
                      setPageRotations({});
                    }}
                  >
                    새 파일 선택
                  </button>
                  <button 
                    className="button button-primary"
                    onClick={saveAdvancedPDF}
                    disabled={loading}
                  >
                    {loading ? '저장 중...' : 'PDF 저장'}
                  </button>
                </div>
              </div>
              
              {/* 다중 선택 컨트롤 */}
              <div className="multi-select-controls">
                <button 
                  className="button button-outline"
                  onClick={() => {
                    if (selectedPages.size === advancedPages.length) {
                      setSelectedPages(new Set());
                    } else {
                      setSelectedPages(new Set(advancedPages.map((_, i) => i)));
                    }
                  }}
                >
                  {selectedPages.size === advancedPages.length ? '전체 해제' : '전체 선택'}
                </button>
                
                {selectedPages.size > 0 && (
                  <>
                    <div className="selected-info">
                      선택된 페이지: {selectedPages.size}개
                    </div>
                    
                    <div className="batch-actions">
                      <button 
                        className="button button-outline"
                        onClick={() => {
                          selectedPages.forEach(pageIndex => {
                            rotateAdvancedPage(pageIndex, -90);
                          });
                        }}
                      >
                        ← 좌회전
                      </button>
                      
                      <button 
                        className="button button-outline"
                        onClick={() => {
                          selectedPages.forEach(pageIndex => {
                            rotateAdvancedPage(pageIndex, 90);
                          });
                        }}
                      >
                        우회전 →
                      </button>
                      
                      <button 
                        className="button button-outline"
                        onClick={() => {
                          selectedPages.forEach(pageIndex => {
                            duplicateAdvancedPage(pageIndex);
                          });
                          setSelectedPages(new Set()); // 복제 후 선택 해제
                        }}
                      >
                        복제
                      </button>
                      
                      <button 
                        className="button button-outline"
                        onClick={() => {
                          selectedPages.forEach(pageIndex => {
                            deleteAdvancedPage(pageIndex);
                          });
                          setSelectedPages(new Set());
                        }}
                        style={{ color: 'var(--destructive)' }}
                      >
                        삭제
                      </button>
                      
                      <button 
                        className="button button-primary"
                        onClick={() => extractSelectedPages()}
                        disabled={loading}
                      >
                        선택 페이지 추출
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {/* 페이지 미리보기 그리드 */}
              <div className="page-grid">
                {advancedPages.map((page, index) => (
                  <div 
                    key={index} 
                    className={`page-preview ${page.deleted ? 'deleted' : ''} ${selectedPages.has(index) ? 'selected' : ''}`}
                    onClick={() => togglePageSelection(index)}
                    data-page-index={index}
                  >
                    <div className="page-header">
                      <input
                        type="checkbox"
                        checked={selectedPages.has(index)}
                        onChange={() => togglePageSelection(index)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="page-number">페이지 {index + 1}</span>
                      {page.rotation !== 0 && (
                        <span className="rotation-indicator">{page.rotation}°</span>
                      )}
                    </div>
                    
                    <div className="preview-container">
                      {previewUrls[page.index] && (
                        <img 
                          src={previewUrls[page.index]} 
                          alt={`페이지 ${index + 1}`}
                          className="preview-image"
                          style={{ 
                            transform: `rotate(${pageRotations[index] || 0}deg)`,
                            transition: 'transform 0.3s ease',
                            opacity: page.deleted ? 0.3 : 1
                          }}
                        />
                      )}
                      {page.deleted && (
                        <div className="deleted-overlay">
                          <span>삭제됨</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="page-controls" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="control-btn"
                        onClick={() => rotateAdvancedPage(index, -90)}
                        title="왼쪽 회전"
                      >
                        ↶
                      </button>
                      
                      <button 
                        className="control-btn"
                        onClick={() => rotateAdvancedPage(index, 90)}
                        title="오른쪽 회전"
                      >
                        ↷
                      </button>
                      
                      <button 
                        className="control-btn"
                        onClick={() => duplicateAdvancedPage(index)}
                        title="복제"
                      >
                        📋
                      </button>
                      
                      <button 
                        className="control-btn delete"
                        onClick={() => deleteAdvancedPage(index)}
                        title={page.deleted ? "복원" : "삭제"}
                      >
                        {page.deleted ? '↶' : '🗑'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 선택된 페이지 추출 (고급편집)
  const extractSelectedPages = async () => {
    if (!advancedPdfDoc || selectedPages.size === 0) return;
    
    setLoading(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const newPdf = await PDFDocument.create();
      
      // 선택된 페이지들을 순서대로 정렬
      const sortedSelectedPages = Array.from(selectedPages).sort((a, b) => a - b);
      
      for (const pageIndex of sortedSelectedPages) {
        const pageData = advancedPages[pageIndex];
        if (!pageData.deleted) {
          const [copiedPage] = await newPdf.copyPages(advancedPdfDoc, [pageData.index]);
          
          // 회전 적용
          if (pageData.rotation !== 0) {
            copiedPage.setRotation({ type: 'degrees', angle: pageData.rotation });
          }
          
          newPdf.addPage(copiedPage);
        }
      }
      
      const pdfBytes = await newPdf.save();
      const pageNumbers = sortedSelectedPages.map(i => i + 1).join('-');
      downloadPDF(pdfBytes, `selected-pages-${pageNumbers}-${advancedFile.name}`);
      
    } catch (err) {
      setErrorMessage('선택된 페이지 추출 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-editor-page">
      <div className="container">
        <div className="header">
          <h1>PDF 에디터</h1>
          <p>PDF 파일을 병합하거나 편집할 수 있습니다</p>
        </div>

        {/* 에러 표시 */}
        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        {/* 로딩 표시 */}
        {loading && (
          <div className="loading-message">
            <div className="loading-spinner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
            </div>
            처리 중입니다...
          </div>
        )}

        {/* 모드별 렌더링 */}
        {mode === 'select' && renderModeSelection()}
        {mode === 'merge' && renderMergeMode()}
        {mode === 'edit' && renderEditMode()}
        {mode === 'advanced' && renderAdvancedMode()}
      </div>
    </div>
  );
};

export default PDFEditor; 