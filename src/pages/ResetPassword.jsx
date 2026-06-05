import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [form, setForm] = useState({ code: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.code.trim()) newErrors.code = 'Reset code is required';
    if (!form.newPassword) newErrors.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.newPassword !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      await axios.post('http://10.1.11.43:8080/api/reset/reset', {
        email,
        code: form.code,
        newPassword: form.newPassword
      });
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>RESCUE<span style={styles.titleRed}>ID</span></h1>
        <h2 style={styles.subtitle}>Reset password</h2>
        <p style={styles.description}>Enter the code sent to <strong>{email}</strong> and your new password.</p>

        {errors.api && <div style={styles.errorBox}>{errors.api}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <input style={{...styles.input, ...(errors.code ? styles.inputError : {})}} name="code" placeholder="6-digit reset code" onChange={handleChange} />
            {errors.code && <span style={styles.fieldError}>{errors.code}</span>}
          </div>
          <div style={styles.field}>
            <input style={{...styles.input, ...(errors.newPassword ? styles.inputError : {})}} name="newPassword" type="password" placeholder="New Password" onChange={handleChange} />
            {errors.newPassword && <span style={styles.fieldError}>{errors.newPassword}</span>}
          </div>
          <div style={styles.field}>
            <input style={{...styles.input, ...(errors.confirmPassword ? styles.inputError : {})}} name="confirmPassword" type="password" placeholder="Confirm New Password" onChange={handleChange} />
            {errors.confirmPassword && <span style={styles.fieldError}>{errors.confirmPassword}</span>}
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
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
  field: { marginBottom: '4px' },
  input: { width: '100%', padding: '12px', marginBottom: '4px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', outline: 'none', display: 'block', fontFamily: 'InterTight, sans-serif', boxSizing: 'border-box' },
  inputError: { border: '1px solid #e53e3e', background: '#fff5f5' },
  fieldError: { color: '#e53e3e', fontSize: '12px', marginBottom: '8px', display: 'block' },
  button: { width: '100%', padding: '13px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', fontFamily: 'InterTight, sans-serif' },
  errorBox: { background: '#fff5f5', color: '#e53e3e', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  successBox: { background: '#f0fff4', color: '#276749', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  link: { textAlign: 'center', marginTop: '16px', color: '#666', fontSize: '14px' },
  linkText: { color: '#e53e3e', cursor: 'pointer', fontWeight: '600' }
};

export default ResetPassword;