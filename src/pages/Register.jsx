import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';

function Register() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!form.gender) newErrors.gender = 'Please select a gender';
    if (!form.bloodGroup) newErrors.bloodGroup = 'Please select a blood group';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await register(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
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
        <h2 style={styles.subtitle}>Create your account</h2>

        {errors.api && <div style={styles.errorBox}>{errors.api}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <input style={{...styles.input, ...(errors.fullName ? styles.inputError : {})}} name="fullName" placeholder="Full Name" onChange={handleChange} />
            {errors.fullName && <span style={styles.fieldError}>{errors.fullName}</span>}
          </div>

          <div style={styles.field}>
            <input style={{...styles.input, ...(errors.dateOfBirth ? styles.inputError : {})}} name="dateOfBirth" type="date" onChange={handleChange} />
            {errors.dateOfBirth && <span style={styles.fieldError}>{errors.dateOfBirth}</span>}
          </div>

          <div style={styles.field}>
            <select style={{...styles.input, ...(errors.gender ? styles.inputError : {})}} name="gender" onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <span style={styles.fieldError}>{errors.gender}</span>}
          </div>

          <div style={styles.field}>
            <select style={{...styles.input, ...(errors.bloodGroup ? styles.inputError : {})}} name="bloodGroup" onChange={handleChange}>
              <option value="">Select Blood Group</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
            {errors.bloodGroup && <span style={styles.fieldError}>{errors.bloodGroup}</span>}
          </div>

          <div style={styles.field}>
            <input style={{...styles.input, ...(errors.email ? styles.inputError : {})}} name="email" type="email" placeholder="Email" onChange={handleChange} />
            {errors.email && <span style={styles.fieldError}>{errors.email}</span>}
          </div>

          <div style={styles.field}>
            <input style={{...styles.input, ...(errors.password ? styles.inputError : {})}} name="password" type="password" placeholder="Password" onChange={handleChange} />
            {errors.password && <span style={styles.fieldError}>{errors.password}</span>}
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account?{' '}
          <span style={styles.linkText} onClick={() => navigate('/login')}>Login</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f0f4f8',
    padding: '20px'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    maxWidth: '440px',
    width: '100%'
  },
  title: { fontSize: '48px', fontWeight: '800', color: '#111', letterSpacing: '-2px', marginBottom: '4px', lineHeight: '1' },
  titleRed: { color: '#e53e3e' },
  subtitle: { fontSize: '18px', color: '#333', marginBottom: '24px', fontWeight: '400' },
  field: { marginBottom: '4px' },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '4px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    display: 'block',
    fontFamily: 'InterTight, sans-serif',
    boxSizing: 'border-box'
  },
  inputError: { border: '1px solid #e53e3e', background: '#fff5f5' },
  fieldError: { color: '#e53e3e', fontSize: '12px', marginBottom: '8px', display: 'block' },
  button: {
    width: '100%',
    padding: '13px',
    background: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    fontFamily: 'InterTight, sans-serif'
  },
  errorBox: {
    background: '#fff5f5',
    color: '#e53e3e',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px'
  },
  link: { textAlign: 'center', marginTop: '16px', color: '#666', fontSize: '14px' },
  linkText: { color: '#e53e3e', cursor: 'pointer', fontWeight: '600' }
};

export default Register;