import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import useIsMobile from '../useIsMobile';

function Login() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const { t, language, changeLanguage } = useLanguage();
  const isMobile = useIsMobile();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = t.login.errors.email;
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = t.login.errors.invalidEmail;
    if (!form.password) newErrors.password = t.login.errors.password;
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      const res = await login(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const s = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: darkMode ? '#0f0f0f' : '#f0f4f8', padding: '20px' },
    card: { background: darkMode ? '#1a1a1a' : 'white', padding: isMobile ? '32px 24px' : '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: '440px', width: '100%' },
    title: { fontSize: isMobile ? '40px' : '48px', fontWeight: '800', color: darkMode ? '#f0f0f0' : '#111', letterSpacing: '-2px', marginBottom: '4px', lineHeight: '1' },
    titleRed: { color: '#e53e3e' },
    subtitle: { fontSize: '18px', color: darkMode ? '#aaa' : '#333', marginBottom: '24px', fontWeight: '400' },
    field: { marginBottom: '4px' },
    input: { width: '100%', padding: '12px', marginBottom: '4px', borderRadius: '8px', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, fontSize: '15px', outline: 'none', display: 'block', fontFamily: 'InterTight, sans-serif', boxSizing: 'border-box', background: darkMode ? '#2a2a2a' : 'white', color: darkMode ? '#f0f0f0' : '#111' },
    inputError: { border: '1px solid #e53e3e', background: darkMode ? '#2a1a1a' : '#fff5f5' },
    fieldError: { color: '#e53e3e', fontSize: '12px', marginBottom: '8px', display: 'block' },
    button: { width: '100%', padding: '13px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', fontFamily: 'InterTight, sans-serif' },
    errorBox: { background: darkMode ? '#2a1a1a' : '#fff5f5', color: '#e53e3e', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
    link: { textAlign: 'center', marginTop: '16px', color: darkMode ? '#aaa' : '#666', fontSize: '14px' },
    linkText: { color: '#e53e3e', cursor: 'pointer', fontWeight: '600' },
    bottomRow: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '8px' },
    darkToggle: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: darkMode ? '#aaa' : '#999', fontFamily: 'InterTight, sans-serif' },
    langSelect: { background: 'none', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, borderRadius: '6px', padding: '4px 8px', fontSize: '13px', color: darkMode ? '#aaa' : '#999', cursor: 'pointer', fontFamily: 'InterTight, sans-serif' }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.title}>RESCUE<span style={s.titleRed}>ID</span></h1>
        <h2 style={s.subtitle}>{t.login.title}</h2>
        {errors.api && <div style={s.errorBox}>{errors.api}</div>}
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <input style={{...s.input, ...(errors.email ? s.inputError : {})}} name="email" type="email" placeholder={t.login.email} onChange={handleChange} />
            {errors.email && <span style={s.fieldError}>{errors.email}</span>}
          </div>
          <div style={s.field}>
            <input style={{...s.input, ...(errors.password ? s.inputError : {})}} name="password" type="password" placeholder={t.login.password} onChange={handleChange} />
            {errors.password && <span style={s.fieldError}>{errors.password}</span>}
          </div>
          <button style={s.button} type="submit" disabled={loading}>{loading ? t.login.loading : t.login.submit}</button>
        </form>
        <p style={s.link}><span style={s.linkText} onClick={() => navigate('/forgot-password')}>{t.login.forgotPassword}</span></p>
        <p style={s.link}>{t.login.noAccount}{' '}<span style={s.linkText} onClick={() => navigate('/register')}>{t.login.register}</span></p>
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

export default Login;