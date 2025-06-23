import './Layout.css';
import LanguageToggle from '../LanguageToggle';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../locales/translations';

const Layout = ({ children }) => {
  const { language } = useLanguage();

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-right">
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {children}
      </main>
    </div>
  );
};

export default Layout;