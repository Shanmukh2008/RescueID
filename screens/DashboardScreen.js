import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import useCrashDetection from '../hooks/useCrashDetection';
import CrashAlert from '../components/CrashAlert';

const API_URL = 'https://rescueid-production.up.railway.app/api';

export default function DashboardScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { colors, darkMode, toggleDarkMode } = useTheme();
  const { t, language, changeLanguage } = useLanguage();
  const { token, user } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '', dateOfBirth: '', gender: '', bloodGroup: '',
    allergies: '', medications: '', medicalConditions: '',
    emergencyContacts: [{ name: '', relationship: '', phone: '' }]
  });

  const { crashDetected, countdown, cancelCrash } = useCrashDetection(form);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const profileData = {
        fullName: data.fullName || '', dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '', bloodGroup: data.bloodGroup || '',
        allergies: data.allergies || '', medications: data.medications || '',
        medicalConditions: data.medicalConditions || '',
        emergencyContacts: data.EmergencyContacts?.length > 0 ? data.EmergencyContacts : [{ name: '', relationship: '', phone: '' }]
      };
      setForm(profileData);
      await SecureStore.setItemAsync('cachedProfile', JSON.stringify(profileData));
    } catch (err) {
      const cached = await SecureStore.getItemAsync('cachedProfile');
      if (cached) {
        setForm(JSON.parse(cached));
        Alert.alert(t.dashboard.offlineMode, t.dashboard.offlineMsg);
      } else {
        Alert.alert('Error', 'No internet connection and no cached profile found.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      await SecureStore.setItemAsync('cachedProfile', JSON.stringify(form));
      Alert.alert('Success', t.dashboard.saving);
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleContactChange = (index, field, value) => {
    const updated = [...form.emergencyContacts];
    updated[index][field] = value;
    setForm({ ...form, emergencyContacts: updated });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await SecureStore.deleteItemAsync('cachedProfile');
    navigation.navigate('Home');
  };

  const handleSOS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Denied', 'Location permission is required for SOS'); return; }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const contact = form.emergencyContacts[0];
      const message = `Emergency. Patient name: ${form.fullName}. Blood group ${form.bloodGroup}. Location: latitude ${latitude.toFixed(4)}, longitude ${longitude.toFixed(4)}. Allergies: ${form.allergies || 'none'}. Medical conditions: ${form.medicalConditions || 'none'}. Emergency contact: ${contact?.name || 'none'}, ${contact?.phone || 'none'}.`;
      Speech.speak(message, { language: 'en-IN', pitch: 1.0, rate: 0.9 });
      Alert.alert(t.dashboard.sosActivated, t.dashboard.sosMsg,
        [{ text: t.dashboard.cancel, style: 'cancel', onPress: () => Speech.stop() },
         { text: t.dashboard.call112, onPress: () => Linking.openURL('tel:112') }]);
    } catch (err) {
      Alert.alert('Error', 'Failed to activate SOS');
    }
  };

  if (loading) return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color="#e53e3e" />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.logo, { color: colors.text }]}>RESCUE<Text style={styles.red}>ID</Text></Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleDarkMode}>
              <Text style={[styles.darkToggleText, { color: colors.subtext }]}>{darkMode ? t.dashboard.light : t.dashboard.dark}</Text>
            </TouchableOpacity>
            <View style={styles.langRow}>
              {['en', 'hi', 'te'].map(lang => (
                <TouchableOpacity key={lang} onPress={() => changeLanguage(lang)} style={[styles.langBtn, language === lang && styles.langBtnActive]}>
                  <Text style={[styles.langText, language === lang && styles.langTextActive]}>
                    {lang === 'en' ? 'EN' : lang === 'hi' ? 'हि' : 'తె'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={[styles.logout, { color: colors.subtext }]}>{t.dashboard.logout}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.emergencyCard, { backgroundColor: darkMode ? '#1a1a1a' : '#fff5f5', borderColor: darkMode ? '#333' : '#feb2b2' }]}>
          <Text style={styles.emergencyTitle}>{t.dashboard.emergencyLink}</Text>
          <Text style={[styles.emergencyUrl, { color: colors.subtext }]}>rescueid.tech/emergency/{user.emergencyAccessId}</Text>
          <TouchableOpacity style={styles.emergencyBtn} onPress={() => navigation.navigate('Emergency', { id: user.emergencyAccessId })}>
            <Text style={styles.emergencyBtnText}>{t.dashboard.preview}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.emergencyBtn, { marginTop: 8, backgroundColor: '#333' }]} onPress={() => navigation.navigate('Scanner')}>
            <Text style={styles.emergencyBtnText}>{t.dashboard.scan}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
          <Text style={styles.sosBtnText}>{t.dashboard.sos}</Text>
          <Text style={styles.sosBtnSubtext}>{t.dashboard.sosSubtext}</Text>
        </TouchableOpacity>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.dashboard.personalDetails}</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]} placeholder={t.dashboard.fullName} placeholderTextColor={colors.subtext} value={form.fullName} onChangeText={(v) => setForm({ ...form, fullName: v })} />
          <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]} placeholder={t.dashboard.dob} placeholderTextColor={colors.subtext} value={form.dateOfBirth} onChangeText={(v) => setForm({ ...form, dateOfBirth: v })} />
          <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]} placeholder={t.dashboard.gender} placeholderTextColor={colors.subtext} value={form.gender} onChangeText={(v) => setForm({ ...form, gender: v })} />
          <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]} placeholder={t.dashboard.bloodGroup} placeholderTextColor={colors.subtext} value={form.bloodGroup} onChangeText={(v) => setForm({ ...form, bloodGroup: v })} autoCapitalize="characters" />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.dashboard.medicalDetails}</Text>
          <TextInput style={[styles.textarea, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]} placeholder={t.dashboard.allergies} placeholderTextColor={colors.subtext} value={form.allergies} onChangeText={(v) => setForm({ ...form, allergies: v })} multiline />
          <TextInput style={[styles.textarea, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]} placeholder={t.dashboard.medications} placeholderTextColor={colors.subtext} value={form.medications} onChangeText={(v) => setForm({ ...form, medications: v })} multiline />
          <TextInput style={[styles.textarea, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]} placeholder={t.dashboard.conditions} placeholderTextColor={colors.subtext} value={form.medicalConditions} onChangeText={(v) => setForm({ ...form, medicalConditions: v })} multiline />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.dashboard.emergencyContacts}</Text>
          {form.emergencyContacts.map((contact, index) => (
            <View key={index} style={[styles.contactCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.contactLabel, { color: colors.subtext }]}>{t.dashboard.contact} {index + 1}</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]} placeholder={t.dashboard.contactName} placeholderTextColor={colors.subtext} value={contact.name} onChangeText={(v) => handleContactChange(index, 'name', v)} />
              <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]} placeholder={t.dashboard.relationship} placeholderTextColor={colors.subtext} value={contact.relationship} onChangeText={(v) => handleContactChange(index, 'relationship', v)} />
              <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]} placeholder={t.dashboard.phone} placeholderTextColor={colors.subtext} value={contact.phone} onChangeText={(v) => handleContactChange(index, 'phone', v)} keyboardType="phone-pad" />
            </View>
          ))}
          {form.emergencyContacts.length < 3 && (
            <TouchableOpacity style={[styles.addBtn, { borderColor: colors.border }]} onPress={() => setForm({ ...form, emergencyContacts: [...form.emergencyContacts, { name: '', relationship: '', phone: '' }] })}>
              <Text style={[styles.addBtnText, { color: colors.subtext }]}>{t.dashboard.addContact}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={[styles.saveBtn, { marginBottom: insets.bottom + 16 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? t.dashboard.saving : t.dashboard.save}</Text>
        </TouchableOpacity>
      </ScrollView>

      {crashDetected && (
        <CrashAlert countdown={countdown} onCancel={cancelCrash} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  logo: { fontSize: 20, fontWeight: '800' },
  red: { color: '#e53e3e' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  darkToggleText: { fontSize: 12 },
  langRow: { flexDirection: 'row', gap: 4 },
  langBtn: { padding: 4, borderRadius: 4, borderWidth: 1, borderColor: '#ddd', minWidth: 28, alignItems: 'center' },
  langBtnActive: { backgroundColor: '#e53e3e', borderColor: '#e53e3e' },
  langText: { fontSize: 11, color: '#666' },
  langTextActive: { color: 'white', fontWeight: '600' },
  logout: { fontSize: 13 },
  emergencyCard: { margin: 16, borderRadius: 12, padding: 16, borderWidth: 1 },
  emergencyTitle: { color: '#e53e3e', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  emergencyUrl: { fontSize: 12, marginBottom: 12 },
  emergencyBtn: { backgroundColor: '#e53e3e', padding: 12, borderRadius: 8, alignItems: 'center' },
  emergencyBtnText: { color: 'white', fontWeight: '600' },
  sosBtn: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#c53030', padding: 24, borderRadius: 16, alignItems: 'center' },
  sosBtnText: { color: 'white', fontSize: 24, fontWeight: '800', letterSpacing: 1 },
  sosBtnSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  section: { marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  input: { padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 15, borderWidth: 1 },
  textarea: { padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 15, borderWidth: 1, minHeight: 80, textAlignVertical: 'top' },
  contactCard: { borderRadius: 8, padding: 12, marginBottom: 12 },
  contactLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  addBtn: { borderWidth: 1, borderStyle: 'dashed', padding: 12, borderRadius: 8, alignItems: 'center' },
  addBtnText: { fontSize: 14 },
  saveBtn: { margin: 16, backgroundColor: '#e53e3e', padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 18, fontWeight: '700' }
});