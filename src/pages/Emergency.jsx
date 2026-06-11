import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEmergencyProfile } from '../services/api';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import useIsMobile from '../useIsMobile';
import axios from 'axios';
import { jsPDF } from 'jspdf';

function Emergency() {
  const { id } = useParams();
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getEmergencyProfile(id);
        setProfile(res.data);
        generateSummary(res.data);
      } catch (err) {
        setError('No profile found for this ID.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const calculateAge = (dob) => {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const generateSummary = async (profileData) => {
    setSummaryLoading(true);
    try {
      const res = await axios.post('rescueid-production.up.railway.app/api/ai/summary', {
        profile: { ...profileData, age: calculateAge(profileData.dateOfBirth), emergencyContacts: profileData.EmergencyContacts }
      });
      setSummary(res.data.summary);
    } catch (err) {
      setSummary('Could not generate AI summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const s = {
    container: { minHeight: '100vh', background: darkMode ? '#0f0f0f' : '#f0f4f8' },
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: darkMode ? '#aaa' : '#666' },
    header: { background: '#e53e3e', padding: isMobile ? '24px 16px' : '32px 24px', textAlign: 'center', color: 'white' },
    badge: { background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '2px' },
    photo: { width: isMobile ? '80px' : '100px', height: isMobile ? '80px' : '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', margin: '16px auto 0', display: 'block' },
    photoPlaceholder: { width: isMobile ? '80px' : '100px', height: isMobile ? '80px' : '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'white', margin: '16px auto 0' },
    name: { fontSize: isMobile ? '24px' : '32px', margin: '12px 0 16px', fontWeight: '800', letterSpacing: '-1px' },
    basicInfo: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' },
    tag: { background: 'rgba(255,255,255,0.25)', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' },
    content: { maxWidth: '600px', margin: '0 auto', padding: isMobile ? '16px' : '24px 16px' },
    aiCard: { background: darkMode ? '#1a2233' : '#ebf8ff', border: `1px solid ${darkMode ? '#2a3a4a' : '#bee3f8'}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    aiTitle: { fontSize: '16px', color: darkMode ? '#90cdf4' : '#2b6cb0', marginBottom: '10px', fontWeight: '600' },
    aiLoading: { color: darkMode ? '#90cdf4' : '#4a90d9', fontSize: '14px', fontStyle: 'italic' },
    aiText: { color: darkMode ? '#e2e8f0' : '#2d3748', fontSize: '15px', lineHeight: '1.7' },
    card: { background: darkMode ? '#1a1a1a' : 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
    cardTitle: { fontSize: '16px', color: darkMode ? '#f0f0f0' : '#333', marginBottom: '16px', fontWeight: '600' },
    row: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${darkMode ? '#2a2a2a' : '#f0f0f0'}`, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '4px' : '0' },
    label: { fontSize: '14px', color: darkMode ? '#aaa' : '#999', fontWeight: '500' },
    value: { fontSize: '14px', color: darkMode ? '#f0f0f0' : '#333', maxWidth: isMobile ? '100%' : '60%', textAlign: isMobile ? 'left' : 'right' },
    contactCard: { background: darkMode ? '#2a2a2a' : '#f9f9f9', borderRadius: '8px', padding: '16px', marginBottom: '10px' },
    contactName: { fontSize: '16px', fontWeight: '600', color: darkMode ? '#f0f0f0' : '#333', marginBottom: '4px' },
    contactRelation: { fontSize: '13px', color: darkMode ? '#aaa' : '#999', marginBottom: '10px' },
    phoneBtn: { display: 'inline-block', padding: '8px 16px', background: '#e53e3e', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600', width: isMobile ? '100%' : 'auto', textAlign: 'center', boxSizing: 'border-box' },
    footer: { textAlign: 'center', color: darkMode ? '#555' : '#999', fontSize: '12px', marginTop: '8px', marginBottom: '32px' }
  };

  if (loading) return <div style={s.center}>Loading...</div>;
  if (error) return <div style={s.center}>{error}</div>;

  const printEmergencyCard = () => {
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
  pdf.text(profile.fullName, 5, 25);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Blood Group: ${profile.bloodGroup}`, 5, 31);
  pdf.text(`DOB: ${profile.dateOfBirth}`, 5, 36);
  if (profile.allergies) pdf.text(`Allergies: ${profile.allergies.substring(0, 40)}`, 5, 41);
  if (profile.medicalConditions) pdf.text(`Conditions: ${profile.medicalConditions.substring(0, 40)}`, 5, 46);
  if (profile.EmergencyContacts?.[0]?.name) {
    pdf.text(`Emergency: ${profile.EmergencyContacts[0].name} - ${profile.EmergencyContacts[0].phone}`, 5, 51);
  }
  pdf.save('RescueID-EmergencyCard.pdf');
};

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.badge}>{t.emergency.badge}</span>
        {profile.photo ? (
          <img src={`http://10.1.11.43:8080${profile.photo}`} alt="Patient" style={s.photo} />
        ) : (
          <div style={s.photoPlaceholder}>?</div>
        )}
        <h1 style={s.name}>{profile.fullName}</h1>
        <div style={s.basicInfo}>
          <span style={s.tag}>{profile.bloodGroup}</span>
          <span style={s.tag}>{profile.gender}</span>
          <span style={s.tag}>{calculateAge(profile.dateOfBirth)} yrs</span>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.aiCard}>
          <h2 style={s.aiTitle}>{t.emergency.aiTitle}</h2>
          {summaryLoading ? <p style={s.aiLoading}>{t.emergency.generating}</p> : <p style={s.aiText}>{summary}</p>}
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>{t.emergency.medicalInfo}</h2>
          <div style={s.row}><span style={s.label}>{t.emergency.allergies}</span><span style={s.value}>{profile.allergies || t.emergency.noneReported}</span></div>
          <div style={s.row}><span style={s.label}>{t.emergency.medications}</span><span style={s.value}>{profile.medications || t.emergency.noneReported}</span></div>
          <div style={s.row}><span style={s.label}>{t.emergency.conditions}</span><span style={s.value}>{profile.medicalConditions || t.emergency.noneReported}</span></div>
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>{t.emergency.emergencyContacts}</h2>
          {profile.EmergencyContacts?.length > 0 ? (
            profile.EmergencyContacts.map((contact, index) => (
              <div key={index} style={s.contactCard}>
                <div style={s.contactName}>{contact.name}</div>
                <div style={s.contactRelation}>{contact.relationship}</div>
                <a href={`tel:${contact.phone}`} style={s.phoneBtn}>{t.emergency.call} {contact.phone}</a>
              </div>
            ))
          ) : (
            <p style={s.value}>{t.emergency.noContacts}</p>
          )}
        </div>

        <p style={s.footer}>{t.emergency.footer}</p>
      </div>
    </div>
  );
}
<div style={{ textAlign: 'center', marginBottom: '16px' }}>
  <button
    onClick={printEmergencyCard}
    style={{
      padding: '12px 32px',
      background: '#e53e3e',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: 'InterTight, sans-serif',
      width: isMobile ? '100%' : 'auto'
    }}
  >
    Download Emergency Card
  </button>
</div>

export default Emergency;