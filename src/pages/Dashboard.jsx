import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    medications: '',
    medicalConditions: '',
    emergencyContacts: [{ name: '', relationship: '', phone: '' }]
  });
  const [emergencyAccessId, setEmergencyAccessId] = useState('');
  const qrRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    if (emergencyAccessId && qrRef.current) {
      const QRCode = require('qrcode');
      QRCode.toCanvas(qrRef.current, emergencyUrl, { width: 160 });
    }
  }, [emergencyAccessId]);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      const data = res.data;
      setEmergencyAccessId(data.emergencyAccessId);
      setPhoto(data.photo || '');
      setForm({
        fullName: data.fullName || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        bloodGroup: data.bloodGroup || '',
        allergies: data.allergies || '',
        medications: data.medications || '',
        medicalConditions: data.medicalConditions || '',
        emergencyContacts: data.EmergencyContacts?.length > 0
          ? data.EmergencyContacts
          : [{ name: '', relationship: '', phone: '' }]
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContactChange = (index, e) => {
    const updated = [...form.emergencyContacts];
    updated[index][e.target.name] = e.target.value;
    setForm({ ...form, emergencyContacts: updated });
  };

  const addContact = () => {
    setForm({
      ...form,
      emergencyContacts: [...form.emergencyContacts, { name: '', relationship: '', phone: '' }]
    });
  };

  const removeContact = (index) => {
    const updated = form.emergencyContacts.filter((_, i) => i !== index);
    setForm({ ...form, emergencyContacts: updated });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await axios.post('http://10.1.11.43:8080/api/upload/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPhoto(res.data.photoUrl);
    } catch (err) {
      setError('Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(form);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const emergencyUrl = `http://10.1.11.43:3000/emergency/${emergencyAccessId}`;

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>🚨 RescueID</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.content}>
        {/* Emergency Access Card */}
        <div style={styles.emergencyCard}>
          <h3 style={styles.emergencyTitle}>🔗 Your Emergency Access Link</h3>
          <p style={styles.emergencySubtitle}>Share this link or QR code with your wallet/phone case. Paramedics can access your info without logging in.</p>

          {/* Photo Upload */}
          <div style={styles.photoSection}>
            {photo ? (
              <img src={`http://10.1.11.43:8080${photo}`} alt="Profile" style={styles.photo} />
            ) : (
              <div style={styles.photoPlaceholder}>👤</div>
            )}
            <label style={styles.uploadBtn}>
              {photoUploading ? 'Uploading...' : 'Upload Photo'}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={styles.linkBox}>
            <span style={styles.linkText}>{emergencyUrl}</span>
            <button style={styles.copyBtn} onClick={() => navigator.clipboard.writeText(emergencyUrl)}>
              Copy
            </button>
          </div>
          <div style={styles.qrContainer}>
            <canvas ref={qrRef} />
            <p style={styles.qrText}>Paramedics can scan this to access your profile instantly</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.successMsg}>{success}</div>}

          {/* Personal Details */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Personal Details</h2>
            <input style={styles.input} name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
            <input style={styles.input} name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required />
            <select style={styles.input} name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select style={styles.input} name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
              <option value="">Select Blood Group</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          {/* Medical Details */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Medical Details</h2>
            <textarea style={styles.textarea} name="allergies" placeholder="Allergies (e.g. Peanuts, Penicillin)" value={form.allergies} onChange={handleChange} />
            <textarea style={styles.textarea} name="medications" placeholder="Current Medications (e.g. Metformin 500mg)" value={form.medications} onChange={handleChange} />
            <textarea style={styles.textarea} name="medicalConditions" placeholder="Medical Conditions (e.g. Type 2 Diabetes)" value={form.medicalConditions} onChange={handleChange} />
          </div>

          {/* Emergency Contacts */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Emergency Contacts</h2>
            {form.emergencyContacts.map((contact, index) => (
              <div key={index} style={styles.contactCard}>
                <div style={styles.contactHeader}>
                  <span style={styles.contactLabel}>Contact {index + 1}</span>
                  {index > 0 && (
                    <button type="button" style={styles.removeBtn} onClick={() => removeContact(index)}>Remove</button>
                  )}
                </div>
                <input style={styles.input} name="name" placeholder="Full Name" value={contact.name} onChange={(e) => handleContactChange(index, e)} />
                <input style={styles.input} name="relationship" placeholder="Relationship (e.g. Father, Spouse)" value={contact.relationship} onChange={(e) => handleContactChange(index, e)} />
                <input style={styles.input} name="phone" placeholder="Phone Number" value={contact.phone} onChange={(e) => handleContactChange(index, e)} />
              </div>
            ))}
            {form.emergencyContacts.length < 3 && (
              <button type="button" style={styles.addBtn} onClick={addContact}>+ Add Another Contact</button>
            )}
          </div>

          <button type="submit" style={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8' },
  header: {
    background: 'white',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  logo: { fontSize: '20px', color: '#e53e3e' },
  logoutBtn: {
    padding: '8px 20px',
    background: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#666'
  },
  content: { maxWidth: '640px', margin: '0 auto', padding: '24px 16px' },
  emergencyCard: {
    background: '#fff5f5',
    border: '1px solid #feb2b2',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
  },
  emergencyTitle: { color: '#e53e3e', marginBottom: '8px', fontSize: '16px' },
  emergencySubtitle: { color: '#666', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' },
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '10px'
  },
  photo: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #e53e3e'
  },
  photoPlaceholder: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px'
  },
  uploadBtn: {
    padding: '8px 20px',
    background: '#e53e3e',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  linkBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px 12px',
    gap: '8px'
  },
  linkText: { flex: 1, fontSize: '13px', color: '#333', wordBreak: 'break-all' },
  copyBtn: {
    padding: '6px 14px',
    background: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  qrContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '16px',
    gap: '8px'
  },
  qrText: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  section: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },
  sectionTitle: { fontSize: '16px', color: '#333', marginBottom: '16px', fontWeight: '600' },
  input: {
    width: '100%',
    padding: '11px 12px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    display: 'block',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '11px 12px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    display: 'block',
    boxSizing: 'border-box',
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  contactCard: {
    background: '#f9f9f9',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px'
  },
  contactHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  contactLabel: { fontSize: '14px', fontWeight: '600', color: '#555' },
  removeBtn: {
    padding: '4px 12px',
    background: 'transparent',
    border: '1px solid #e53e3e',
    color: '#e53e3e',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  addBtn: {
    width: '100%',
    padding: '10px',
    background: 'transparent',
    border: '1px dashed #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#666'
  },
  saveBtn: {
    width: '100%',
    padding: '14px',
    background: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '32px'
  },
  error: {
    background: '#fff5f5',
    color: '#e53e3e',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '14px'
  },
  successMsg: {
    background: '#f0fff4',
    color: '#276749',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '14px'
  },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#666' }
};

export default Dashboard;