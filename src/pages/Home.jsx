import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import useIsMobile from '../useIsMobile';

function Home() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const { t, language, changeLanguage } = useLanguage();
  const isMobile = useIsMobile();

  const s = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: darkMode ? '#0f0f0f' : '#f0f4f8', padding: '16px' },
    card: { textAlign: 'center', background: darkMode ? '#1a1a1a' : 'white', padding: isMobile ? '40px 24px' : '60px 40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: '480px', width: '100%' },
    title: { fontSize: isMobile ? '56px' : '72px', fontWeight: '800', color: darkMode ? '#f0f0f0' : '#111', letterSpacing: '-2px', marginBottom: '16px', lineHeight: '1' },
    titleRed: { color: '#e53e3e' },
    subtitle: { color: darkMode ? '#aaa' : '#666', marginBottom: '32px', fontSize: isMobile ? '14px' : '16px', lineHeight: '1.6' },
    buttons: { display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px', flexDirection: isMobile ? 'column' : 'row' },
    primary: { padding: '12px 32px', borderRadius: '8px', border: 'none', background: '#e53e3e', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', fontFamily: 'InterTight, sans-serif' },
    secondary: { padding: '12px 32px', borderRadius: '8px', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, background: darkMode ? '#2a2a2a' : '#f0f4f8', color: darkMode ? '#f0f0f0' : '#333', fontSize: '16px', fontWeight: '600', cursor: 'pointer', fontFamily: 'InterTight, sans-serif' },
    bottomRow: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' },
    darkToggle: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: darkMode ? '#aaa' : '#999', fontFamily: 'InterTight, sans-serif' },
    langSelect: { background: 'none', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, borderRadius: '6px', padding: '4px 8px', fontSize: '13px', color: darkMode ? '#aaa' : '#999', cursor: 'pointer', fontFamily: 'InterTight, sans-serif' }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.title}>RESCUE<span style={s.titleRed}>ID</span></h1>
        <p style={s.subtitle}>{t.home.subtitle}</p>
        <div style={s.buttons}>
          <button style={s.primary} onClick={() => navigate('/register')}>{t.home.getStarted}</button>
          <button style={s.secondary} onClick={() => navigate('/login')}>{t.home.login}</button>
        </div>
        <div style={s.bottomRow}>
          <button style={s.darkToggle} onClick={toggleDarkMode}>{darkMode ? t.home.lightMode : t.home.darkMode}</button>
          <select style={s.langSelect} value={language} onChange={(e) => changeLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Home;