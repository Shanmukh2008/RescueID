import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEmergencyProfile } from '../services/api';
import axios from 'axios';

function Emergency() {
  const { id } = useParams();
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
      const res = await axios.post('http://10.1.11.43:8080/api/ai/summary', {
        profile: {
          ...profileData,
          age: calculateAge(profileData.dateOfBirth),
          emergencyContacts: profileData.EmergencyContacts
        }
      });
      setSummary(res.data.summary);
    } catch (err) {
      setSummary('Could not generate AI summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.badge}>🚨 EMERGENCY ACCESS</span>
        <h1 style={styles.name}>{profile.fullName}</h1>
        <div style={styles.basicInfo}>
          <span style={styles.tag}>{profile.bloodGroup}</span>
          <span style={styles.tag}>{profile.gender}</span>
          <span style={styles.tag}>{calculateAge(profile.dateOfBirth)} years old</span>
        </div>
      </div>

      <div style={styles.content}>

        {/* AI Summary */}
        <div style={styles.aiCard}>
          <h2 style={styles.aiTitle}>🤖 AI Paramedic Summary</h2>
          {summaryLoading ? (
            <p style={styles.aiLoading}>Generating summary...</p>
          ) : (
            <p style={styles.aiText}>{summary}</p>
          )}
        </div>

        {/* Medical Info */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>⚕️ Medical Information</h2>
          <div style={styles.row}>
            <span style={styles.label}>Allergies</span>
            <span style={styles.value}>{profile.allergies || 'None reported'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Medications</span>
            <span style={styles.value}>{profile.medications || 'None reported'}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Conditions</span>
            <span style={styles.value}>{profile.medicalConditions || 'None reported'}</span>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📞 Emergency Contacts</h2>
          {profile.EmergencyContacts?.length > 0 ? (
            profile.EmergencyContacts.map((contact, index) => (
              <div key={index} style={styles.contactCard}>
                <div style={styles.contactName}>{contact.name}</div>
                <div style={styles.contactRelation}>{contact.relationship}</div>
                <a href={`tel:${contact.phone}`} style={styles.phoneBtn}>
                  📱 {contact.phone}
                </a>
              </div>
            ))
          ) : (
            <p style={styles.value}>No emergency contacts added</p>
          )}
        </div>

        <p style={styles.footer}>Powered by RescueID • For emergency use only</p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#666' },
  header: {
    background: '#e53e3e',
    padding: '32px 24px',
    textAlign: 'center',
    color: 'white'
  },
  badge: {
    background: 'rgba(255,255,255,0.2)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  name: { fontSize: '28px', margin: '12px 0 16px', fontWeight: '700' },
  basicInfo: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' },
  tag: {
    background: 'rgba(255,255,255,0.25)',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  content: { maxWidth: '600px', margin: '0 auto', padding: '24px 16px' },
  aiCard: {
    background: '#ebf8ff',
    border: '1px solid #bee3f8',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px'
  },
  aiTitle: { fontSize: '16px', color: '#2b6cb0', marginBottom: '10px', fontWeight: '600' },
  aiLoading: { color: '#4a90d9', fontSize: '14px', fontStyle: 'italic' },
  aiText: { color: '#2d3748', fontSize: '15px', lineHeight: '1.7' },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },
  cardTitle: { fontSize: '16px', color: '#333', marginBottom: '16px', fontWeight: '600' },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  label: { fontSize: '14px', color: '#999', fontWeight: '500' },
  value: { fontSize: '14px', color: '#333', maxWidth: '60%', textAlign: 'right' },
  contactCard: {
    background: '#f9f9f9',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '10px'
  },
  contactName: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' },
  contactRelation: { fontSize: '13px', color: '#999', marginBottom: '10px' },
  phoneBtn: {
    display: 'inline-block',
    padding: '8px 16px',
    background: '#e53e3e',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600'
  },
  footer: { textAlign: 'center', color: '#999', fontSize: '12px', marginTop: '8px', marginBottom: '32px' }
};

export default Emergency;