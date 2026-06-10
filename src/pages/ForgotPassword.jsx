import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import axios from 'axios';

function ForgotPassword() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid email address'); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post('http://10.1.11.43:8080/api/reset/forgot', { email });
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: darkMode ? '#0f0f0f' : '#f0f4f8', padding: '20px' },
    card: { background: darkMode ? '#1a1a1a' : 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: '440px', width: '100%' },
    title: { fontSize: '48px', fontWeight: '800', color: darkMode ? '#f0f0f0' : '#111', letterSpacing: '-2px', marginBottom: '4px', lineHeight: '1' },
    titleRed: { color: '#e53e3e' },
    subtitle: { fontSize: '18px', color: darkMode ? '#aaa' : '#333', marginBottom: '8px', fontWeight: '400' },
    description: { color: darkMode ? '#aaa' : '#666', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' },
    input: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, fontSize: '15px', outline: 'none', display: 'block', fontFamily: 'InterTight, sans-serif', boxSizing: 'border-box', background: darkMode ? '#2a2a2a' : 'white', color: darkMode ? '#f0f0f0' : '#111' },
    button: { width: '100%', padding: '13px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '4px', fontFamily: 'InterTight, sans-serif' },
    errorBox: { background: darkMode ? '#2a1a1a' : '#fff5f5', color: '#e53e3e', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
    link: { textAlign: 'center', marginTop: '16px', color: darkMode ? '#aaa' : '#666', fontSize: '14px' },
    linkText: { color: '#e53e3e', cursor: 'pointer', fontWeight: '600' },
    darkToggle: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: darkMode ? '#aaa' : '#999', fontFamily: 'InterTight, sans-serif', marginTop: '8px', display: 'block', width: '100%', textAlign: 'center' }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.title}>RESCUE<span style={s.titleRed}>ID</span></h1>
        <h2 style={s.subtitle}>Forgot password</h2>
        <p style={s.description}>Enter your email and we'll send you a reset code.</p>
        {error && <div style={s.errorBox}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={s.input} type="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} />
          <button style={s.button} type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Code'}</button>
        </form>
        <p style={s.link}><span style={s.linkText} onClick={() => navigate('/login')}>Back to Login</span></p>
        <button style={s.darkToggle} onClick={toggleDarkMode}>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</button>
      </div>
    </div>
  );
}

export default ForgotPassword;