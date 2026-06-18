import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';

const API_URL = 'https://rescueid-production.up.railway.app/api';

export default function EmergencyScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { colors, darkMode } = useTheme();
  const { id } = route.params;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const calculateAge = (dob) => {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/emergency/${id}`);
      const data = await res.json();
      setProfile(data);
      generateSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (profileData) => {
    setSummaryLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { ...profileData, age: calculateAge(profileData.dateOfBirth), emergencyContacts: profileData.EmergencyContacts }
        })
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setSummary('Could not generate AI summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color="#e53e3e" />
    </View>
  );

  if (!profile) return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.text }}>No profile found</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.badge}>EMERGENCY ACCESS</Text>
        <Text style={styles.name}>{profile.fullName}</Text>
        <View style={styles.tags}>
          <Text style={styles.tag}>{profile.bloodGroup}</Text>
          <Text style={styles.tag}>{profile.gender}</Text>
          <Text style={styles.tag}>{calculateAge(profile.dateOfBirth)} yrs</Text>
        </View>
      </View>

      <View style={[styles.aiCard, { backgroundColor: darkMode ? '#1a2233' : '#ebf8ff', borderColor: darkMode ? '#2a3a4a' : '#bee3f8' }]}>
        <Text style={[styles.aiTitle, { color: darkMode ? '#90cdf4' : '#2b6cb0' }]}>AI Paramedic Summary</Text>
        {summaryLoading ? <ActivityIndicator color="#2b6cb0" /> : <Text style={[styles.aiText, { color: darkMode ? '#e2e8f0' : '#2d3748' }]}>{summary}</Text>}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Medical Information</Text>
        <View style={[styles.row, { borderBottomColor: colors.border }]}><Text style={[styles.label, { color: colors.subtext }]}>Allergies</Text><Text style={[styles.value, { color: colors.text }]}>{profile.allergies || 'None reported'}</Text></View>
        <View style={[styles.row, { borderBottomColor: colors.border }]}><Text style={[styles.label, { color: colors.subtext }]}>Medications</Text><Text style={[styles.value, { color: colors.text }]}>{profile.medications || 'None reported'}</Text></View>
        <View style={[styles.row, { borderBottomColor: colors.border }]}><Text style={[styles.label, { color: colors.subtext }]}>Conditions</Text><Text style={[styles.value, { color: colors.text }]}>{profile.medicalConditions || 'None reported'}</Text></View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Emergency Contacts</Text>
        {profile.EmergencyContacts?.length > 0 ? (
          profile.EmergencyContacts.map((contact, index) => (
            <View key={index} style={[styles.contactCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
              <Text style={[styles.contactRelation, { color: colors.subtext }]}>{contact.relationship}</Text>
              <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${contact.phone}`)}>
                <Text style={styles.callBtnText}>Call {contact.phone}</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={[styles.value, { color: colors.subtext }]}>No emergency contacts added</Text>
        )}
      </View>

      <Text style={[styles.footer, { marginBottom: insets.bottom + 16, color: colors.subtext }]}>Powered by RescueID — For emergency use only</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#e53e3e', padding: 24, alignItems: 'center' },
  badge: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  name: { color: 'white', fontSize: 28, fontWeight: '800', marginBottom: 12 },
  tags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  tag: { backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, fontSize: 14, fontWeight: '600' },
  aiCard: { margin: 16, borderRadius: 12, padding: 16, borderWidth: 1 },
  aiTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  aiText: { fontSize: 15, lineHeight: 24 },
  card: { marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  label: { fontSize: 14, fontWeight: '500' },
  value: { fontSize: 14, maxWidth: '60%', textAlign: 'right' },
  contactCard: { borderRadius: 8, padding: 12, marginBottom: 8 },
  contactName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  contactRelation: { fontSize: 13, marginBottom: 8 },
  callBtn: { backgroundColor: '#e53e3e', padding: 10, borderRadius: 8, alignItems: 'center' },
  callBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  footer: { textAlign: 'center', fontSize: 12, margin: 16 }
});