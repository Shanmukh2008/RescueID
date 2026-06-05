import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const navigate = useNavigate();
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>RESCUE<span style={styles.titleRed}>ID</span></h1>
        <h2 style={styles.subtitle}>Forgot password</h2>
        <p style={styles.description}>Enter your email and we'll send you a reset code.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>

        <p style={styles.link}>
          <span style={styles.linkText} onClick={() => navigate('/login')}>Back to Login</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f4f8', padding: '20px' },
  card: { background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: '440px', width: '100%' },
  title: { fontSize: '48px', fontWeight: '800', color: '#111', letterSpacing: '-2px', marginBottom: '4px', lineHeight: '1' },
  titleRed: { color: '#e53e3e' },
  subtitle: { fontSize: '18px', color: '#333', marginBottom: '8px', fontWeight: '400' },
  description: { color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' },
  input: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', outline: 'none', display: 'block', fontFamily: 'InterTight, sans-serif', boxSizing: 'border-box' },
  button: { width: '100%', padding: '13px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '4px', fontFamily: 'InterTight, sans-serif' },
  errorBox: { background: '#fff5f5', color: '#e53e3e', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  link: { textAlign: 'center', marginTop: '16px', color: '#666', fontSize: '14px' },
  linkText: { color: '#e53e3e', cursor: 'pointer', fontWeight: '600' }
};

export default ForgotPassword;
