import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🚨</div>
        <h1 style={styles.title}>RescueID</h1>
        <p style={styles.subtitle}>
          Your emergency medical profile, accessible instantly when it matters most.
        </p>
        <div style={styles.buttons}>
          <button style={styles.primary} onClick={() => navigate('/register')}>
            Get Started
          </button>
          <button style={styles.secondary} onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f0f4f8'
  },
  card: {
    textAlign: 'center',
    background: 'white',
    padding: '60px 40px',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    maxWidth: '480px',
    width: '90%'
  },
  logo: { fontSize: '48px', marginBottom: '16px' },
  title: { fontSize: '32px', color: '#e53e3e', marginBottom: '8px' },
  subtitle: { color: '#666', marginBottom: '32px', fontSize: '16px', lineHeight: '1.6' },
  buttons: { display: 'flex', gap: '12px', justifyContent: 'center' },
  primary: {
    padding: '12px 32px',
    borderRadius: '8px',
    border: 'none',
    background: '#e53e3e',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  secondary: {
    padding: '12px 32px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    background: '#f0f4f8',
    color: '#333',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default Home;