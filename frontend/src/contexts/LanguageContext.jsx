import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export { LanguageContext };

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // 브라우저 언어 감지
    const detectLanguage = () => {
      const browserLang = navigator.language || navigator.userLanguage;
      const isKorean = browserLang.startsWith('ko');
      return isKorean ? 'ko' : 'en';
    };

    // 저장된 언어 설정 확인, 없으면 브라우저 언어로 설정
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && ['ko', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      const detectedLang = detectLanguage();
      setLanguage(detectedLang);
      localStorage.setItem('language', detectedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'ko' ? 'en' : 'ko';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}; 