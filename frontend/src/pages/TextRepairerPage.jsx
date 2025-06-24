import TextRepairer from '../components/TextRepairer';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../locales/translations';

const TextRepairerPage = () => {
  const { language } = useLanguage();

  return (
    <div className="container py-8">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          {t(language, 'textRepairer.title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t(language, 'textRepairer.description')}
        </p>
      </div>

      {/* 텍스트 복구 도구 */}
      <TextRepairer />
    </div>
  );
};

export default TextRepairerPage; 