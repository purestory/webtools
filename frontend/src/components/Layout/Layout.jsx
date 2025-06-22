import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      {/* Main Content */}
      <main className="main">
        {children}
      </main>
    </div>
  );
};

export default Layout;