import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../services/api';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function Dashboard() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const { t, language, changeLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    fullName: '', dateOfBirth: '', gender: '', bloodGroup: '',
    allergies: '', medications: '', medicalConditions: '',
    emergencyContacts: [{ name: '', relationship: '', phone: '' }]
  });
  const [emergencyAccessId, setEmergencyAccessId] = useState('');
  const qrRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
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
        fullName: data.fullName || '', dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '', bloodGroup: data.bloodGroup || '',
        allergies: data.allergies || '', medications: data.medications || '',
        medicalConditions: data.medicalConditions || '',
        emergencyContacts: data.EmergencyContacts?.length > 0 ? data.EmergencyContacts : [{ name: '', relationship: '', phone: '' }]
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleContactChange = (index, e) => {
    const updated = [...form.emergencyContacts];
    updated[index][e.target.name] = e.target.value;
    setForm({ ...form, emergencyContacts: updated });
  };

  const addContact = () => setForm({ ...form, emergencyContacts: [...form.emergencyContacts, { name: '', relationship: '', phone: '' }] });
  const removeContact = (index) => setForm({ ...form, emergencyContacts: form.emergencyContacts.filter((_, i) => i !== index) });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await axios.post('http://10.1.11.43:8080/api/upload/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPhoto(res.data.photoUrl);
    } catch (err) {
      setError('Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const downloadQR = () => {
    const { jsPDF } = require('jspdf');
    const canvas = qrRef.current;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 80] });
    pdf.addImage(imgData, 'PNG', 5, 5, 70, 70);
    pdf.save('RescueID-QRCode.pdf');
  };

  const printEmergencyCard = () => {
    const { jsPDF } = require('jspdf');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85, 54] });
    pdf.setFillColor(229, 62, 62);
    pdf.rect(0, 0, 85, 18, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RESCUEID', 5, 8);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text('EMERGENCY MEDICAL CARD', 5, 13);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(form.fullName, 5, 25);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Blood Group: ${form.bloodGroup}`, 5, 31);
    pdf.text(`DOB: ${form.dateOfBirth}`, 5, 36);
    if (form.allergies) pdf.text(`Allergies: ${form.allergies.substring(0, 40)}`, 5, 41);
    if (form.medicalConditions) pdf.text(`Conditions: ${form.medicalConditions.substring(0, 40)}`, 5, 46);
    if (form.emergencyContacts[0]?.name) {
      pdf.text(`Emergency: ${form.emergencyContacts[0].name} - ${form.emergencyContacts[0].phone}`, 5, 51);
    }
    const canvas = qrRef.current;
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 68, 20, 15, 15);
    }
    pdf.save('RescueID-EmergencyCard.pdf');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(form);
      setSuccess(t.dashboard.saveSuccess);
    } catch (err) {
      setError(t.dashboard.saveFail);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!passwordForm.currentPassword) { setPasswordError('Current password is required'); return; }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) { setPasswordError('New password must be at least 6 characters'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError('Passwords do not match'); return; }
    setPasswordUpdating(true);
    try {
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordSuccess(t.dashboard.passwordSuccess);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      setError('Failed to delete account');
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const emergencyUrl = `http://10.1.11.43:3000/emergency/${emergencyAccessId}`;

  const s = {
    container: { minHeight: '100vh', background: darkMode ? '#0f0f0f' : '#f0f4f8' },
    header: { background: darkMode ? '#1a1a1a' : 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    logo: { fontSize: '24px', fontWeight: '800', color: darkMode ? '#f0f0f0' : '#111', letterSpacing: '-1px' },
    logoRed: { color: '#e53e3e' },
    headerRight: { display: 'flex', gap: '12px', alignItems: 'center' },
    darkToggle: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: darkMode ? '#aaa' : '#999', fontFamily: 'InterTight, sans-serif' },
    langSelect: { background: 'none', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, borderRadius: '6px', padding: '4px 8px', fontSize: '13px', color: darkMode ? '#aaa' : '#999', cursor: 'pointer', fontFamily: 'InterTight, sans-serif' },
    logoutBtn: { padding: '8px 20px', background: 'transparent', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: darkMode ? '#aaa' : '#666', fontFamily: 'InterTight, sans-serif' },
    content: { maxWidth: '640px', margin: '0 auto', padding: '24px 16px' },
    emergencyCard: { background: darkMode ? '#1a1a1a' : '#fff5f5', border: `1px solid ${darkMode ? '#333' : '#feb2b2'}`, borderRadius: '12px', padding: '20px', marginBottom: '24px' },
    emergencyTitle: { color: '#e53e3e', marginBottom: '8px', fontSize: '16px', fontWeight: '600' },
    emergencySubtitle: { color: darkMode ? '#aaa' : '#666', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' },
    photoSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px', gap: '10px' },
    photo: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e53e3e' },
    photoPlaceholder: { width: '100px', height: '100px', borderRadius: '50%', background: darkMode ? '#2a2a2a' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#aaa' },
    uploadBtn: { padding: '8px 20px', background: '#e53e3e', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    linkBox: { display: 'flex', alignItems: 'center', background: darkMode ? '#2a2a2a' : 'white', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, borderRadius: '8px', padding: '10px 12px', gap: '8px' },
    linkText: { flex: 1, fontSize: '13px', color: darkMode ? '#aaa' : '#333', wordBreak: 'break-all' },
    copyBtn: { padding: '6px 14px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', fontFamily: 'InterTight, sans-serif' },
    qrContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px', gap: '8px' },
    qrText: { fontSize: '12px', color: darkMode ? '#aaa' : '#999', textAlign: 'center' },
    qrButtons: { display: 'flex', gap: '8px' },
    downloadBtn: { padding: '8px 16px', background: 'transparent', color: '#e53e3e', border: '1px solid #e53e3e', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'InterTight, sans-serif' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    section: { background: darkMode ? '#1a1a1a' : 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
    sectionTitle: { fontSize: '16px', color: darkMode ? '#f0f0f0' : '#333', marginBottom: '16px', fontWeight: '600' },
    input: { width: '100%', padding: '11px 12px', marginBottom: '12px', borderRadius: '8px', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, fontSize: '15px', outline: 'none', display: 'block', boxSizing: 'border-box', fontFamily: 'InterTight, sans-serif', background: darkMode ? '#2a2a2a' : 'white', color: darkMode ? '#f0f0f0' : '#111' },
    textarea: { width: '100%', padding: '11px 12px', marginBottom: '12px', borderRadius: '8px', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, fontSize: '15px', outline: 'none', display: 'block', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', fontFamily: 'InterTight, sans-serif', background: darkMode ? '#2a2a2a' : 'white', color: darkMode ? '#f0f0f0' : '#111' },
    contactCard: { background: darkMode ? '#2a2a2a' : '#f9f9f9', borderRadius: '8px', padding: '16px', marginBottom: '12px' },
    contactHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    contactLabel: { fontSize: '14px', fontWeight: '600', color: darkMode ? '#aaa' : '#555' },
    removeBtn: { padding: '4px 12px', background: 'transparent', border: '1px solid #e53e3e', color: '#e53e3e', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'InterTight, sans-serif' },
    addBtn: { width: '100%', padding: '10px', background: 'transparent', border: `1px dashed ${darkMode ? '#444' : '#ddd'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: darkMode ? '#aaa' : '#666', fontFamily: 'InterTight, sans-serif' },
    saveBtn: { width: '100%', padding: '14px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '32px', fontFamily: 'InterTight, sans-serif' },
    error: { background: darkMode ? '#2a1a1a' : '#fff5f5', color: '#e53e3e', padding: '10px', borderRadius: '8px', fontSize: '14px' },
    successMsg: { background: darkMode ? '#1a2a1a' : '#f0fff4', color: darkMode ? '#68d391' : '#276749', padding: '10px', borderRadius: '8px', fontSize: '14px' },
    deleteSection: { background: darkMode ? '#1a1a1a' : 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '16px' },
    deleteTitle: { fontSize: '16px', color: '#e53e3e', marginBottom: '8px', fontWeight: '600' },
    deleteWarning: { fontSize: '13px', color: darkMode ? '#aaa' : '#666', marginBottom: '16px', lineHeight: '1.5' },
    deleteBtn: { padding: '10px 24px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'InterTight, sans-serif' },
    deleteCancelBtn: { padding: '10px 24px', background: 'transparent', color: darkMode ? '#aaa' : '#666', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'InterTight, sans-serif', marginLeft: '8px' },
    confirmRow: { display: 'flex', alignItems: 'center', gap: '8px' }
  };

  if (loading) return (
    <div style={s.container}>
      <div style={s.header}><h1 style={s.logo}>RESCUE<span style={s.logoRed}>ID</span></h1></div>
      <div style={s.content}>
        <div style={s.emergencyCard}>
          <Skeleton height={20} width={200} style={{ marginBottom: 8 }} />
          <Skeleton height={14} width={300} style={{ marginBottom: 12 }} />
          <div style={{ display: 'flex', justifyContent: 'center' }}><Skeleton height={100} width={100} circle /></div>
          <Skeleton height={40} style={{ marginTop: 12 }} />
        </div>
        <div style={s.section}>
          <Skeleton height={20} width={150} style={{ marginBottom: 16 }} />
          <Skeleton height={44} style={{ marginBottom: 12 }} count={4} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.logo}>RESCUE<span style={s.logoRed}>ID</span></h1>
        <div style={s.headerRight}>
          <button style={s.darkToggle} onClick={toggleDarkMode}>{darkMode ? t.home.lightMode : t.home.darkMode}</button>
          <select style={s.langSelect} value={language} onChange={(e) => changeLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="te">తెలుగు</option>
          </select>
          <button style={s.logoutBtn} onClick={handleLogout}>{t.dashboard.logout}</button>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.emergencyCard}>
          <h3 style={s.emergencyTitle}>{t.dashboard.emergencyLink}</h3>
          <p style={s.emergencySubtitle}>{t.dashboard.emergencySubtitle}</p>
          <div style={s.photoSection}>
            {photo ? <img src={`http://10.1.11.43:8080${photo}`} alt="Profile" style={s.photo} /> : <div style={s.photoPlaceholder}>+</div>}
            <label style={s.uploadBtn}>
              {photoUploading ? t.dashboard.uploading : t.dashboard.uploadPhoto}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={s.linkBox}>
            <span style={s.linkText}>{emergencyUrl}</span>
            <button style={s.copyBtn} onClick={() => navigator.clipboard.writeText(emergencyUrl)}>{t.dashboard.copy}</button>
          </div>
          <div style={s.qrContainer}>
            <canvas ref={qrRef} />
            <p style={s.qrText}>{t.dashboard.scanQR}</p>
            <div style={s.qrButtons}>
              <button style={s.downloadBtn} onClick={downloadQR}>{t.dashboard.downloadQR}</button>
              <button style={s.downloadBtn} onClick={printEmergencyCard}>{t.dashboard.printCard}</button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {error && <div style={s.error}>{error}</div>}
          {success && <div style={s.successMsg}>{success}</div>}

          <div style={s.section}>
            <h2 style={s.sectionTitle}>{t.dashboard.personalDetails}</h2>
            <input style={s.input} name="fullName" placeholder={t.dashboard.fullName} value={form.fullName} onChange={handleChange} required />
            <input style={s.input} name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required />
            <select style={s.input} name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">{t.register.gender}</option>
              <option value="male">{t.register.male}</option>
              <option value="female">{t.register.female}</option>
              <option value="other">{t.register.other}</option>
            </select>
            <select style={s.input} name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
              <option value="">{t.register.bloodGroup}</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>{t.dashboard.medicalDetails}</h2>
            <textarea style={s.textarea} name="allergies" placeholder={t.dashboard.allergies} value={form.allergies} onChange={handleChange} />
            <textarea style={s.textarea} name="medications" placeholder={t.dashboard.medications} value={form.medications} onChange={handleChange} />
            <textarea style={s.textarea} name="medicalConditions" placeholder={t.dashboard.medicalConditions} value={form.medicalConditions} onChange={handleChange} />
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>{t.dashboard.emergencyContacts}</h2>
            {form.emergencyContacts.map((contact, index) => (
              <div key={index} style={s.contactCard}>
                <div style={s.contactHeader}>
                  <span style={s.contactLabel}>{t.dashboard.contact} {index + 1}</span>
                  {index > 0 && <button type="button" style={s.removeBtn} onClick={() => removeContact(index)}>{t.dashboard.removeContact}</button>}
                </div>
                <input style={s.input} name="name" placeholder={t.dashboard.contactName} value={contact.name} onChange={(e) => handleContactChange(index, e)} />
                <input style={s.input} name="relationship" placeholder={t.dashboard.relationship} value={contact.relationship} onChange={(e) => handleContactChange(index, e)} />
                <input style={s.input} name="phone" placeholder={t.dashboard.phone} value={contact.phone} onChange={(e) => handleContactChange(index, e)} />
              </div>
            ))}
            {form.emergencyContacts.length < 3 && <button type="button" style={s.addBtn} onClick={addContact}>{t.dashboard.addContact}</button>}
          </div>

          <button type="submit" style={s.saveBtn} disabled={saving}>{saving ? t.dashboard.saving : t.dashboard.saveProfile}</button>
        </form>

        {/* Change Password */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>{t.dashboard.changePassword}</h2>
          {passwordError && <div style={s.error}>{passwordError}</div>}
          {passwordSuccess && <div style={{...s.successMsg, marginBottom: '12px'}}>{passwordSuccess}</div>}
          <form onSubmit={handleChangePassword}>
            <input style={s.input} type="password" placeholder={t.dashboard.currentPassword} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
            <input style={s.input} type="password" placeholder={t.dashboard.newPassword} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
            <input style={s.input} type="password" placeholder={t.dashboard.confirmPassword} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} />
            <button type="submit" style={{...s.saveBtn, marginBottom: '0'}} disabled={passwordUpdating}>
              {passwordUpdating ? t.dashboard.updating : t.dashboard.updatePassword}
            </button>
          </form>
        </div>

        {/* Delete Account */}
        <div style={s.deleteSection}>
          <h2 style={s.deleteTitle}>{t.dashboard.deleteAccount}</h2>
          <p style={s.deleteWarning}>{t.dashboard.deleteWarning}</p>
          {!showDeleteConfirm ? (
            <button style={s.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>{t.dashboard.deleteAccount}</button>
          ) : (
            <div style={s.confirmRow}>
              <button style={s.deleteBtn} onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? t.dashboard.deleting : t.dashboard.deleteConfirm}
              </button>
              <button style={s.deleteCancelBtn} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;