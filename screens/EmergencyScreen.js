import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';

const API_URL = 'https://rescueid-production.up.railway.app/api';

export default function DashboardScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { token, user } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '', dateOfBirth: '', gender: '', bloodGroup: '',
    allergies: '', medications: '', medicalConditions: '',
    emergencyContacts: [{ name: '', relationship: '', phone: '' }]
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setForm({
        fullName: data.fullName || '', dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '', bloodGroup: data.bloodGroup || '',
        allergies: data.allergies || '', medications: data.medications || '',
        medicalConditions: data.medicalConditions || '',
        emergencyContacts: data.EmergencyContacts?.length > 0 ? data.EmergencyContacts : [{ name: '', relationship: '', phone: '' }]
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to load profile');
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
      Alert.alert('Success', 'Profile updated successfully!');
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

  const handleSOS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for SOS');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const contact = form.emergencyContacts[0];
      const message = `Emergency. Patient name: ${form.fullName}. 
        Blood group ${form.bloodGroup}. 
        Location: latitude ${latitude.toFixed(4)}, longitude ${longitude.toFixed(4)}. 
        Allergies: ${form.allergies || 'none'}. 
        Medical conditions: ${form.medicalConditions || 'none'}. 
        Emergency contact: ${contact?.name || 'none'}, ${contact?.phone || 'none'}.`;

      Speech.speak(message, { language: 'en-IN', pitch: 1.0, rate: 0.9 });

      Alert.alert(
        'SOS Activated',
        'Your details are being read out. Calling 112 now.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => Speech.stop() },
          { text: 'Call 112', onPress: () => Linking.openURL('tel:112') }
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to activate SOS');
    }
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#e53e3e" />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.logo}>RESCUE<Text style={styles.red}>ID</Text></Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Link */}
      <View style={styles.emergencyCard}>
        <Text style={styles.emergencyTitle}>Your Emergency Link</Text>
        <Text style={styles.emergencyUrl}>rescueid.tech/emergency/{user.emergencyAccessId}</Text>
        <TouchableOpacity style={styles.emergencyBtn} onPress={() => navigation.navigate('Emergency', { id: user.emergencyAccessId })}>
          <Text style={styles.emergencyBtnText}>Preview Emergency Page</Text>
        </TouchableOpacity>
      </View>

      {/* SOS Button */}
      <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
        <Text style={styles.sosBtnText}>SOS EMERGENCY</Text>
        <Text style={styles.sosBtnSubtext}>Press to call 112 and read your details</Text>
      </TouchableOpacity>

      {/* Personal Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <TextInput style={styles.input} placeholder="Full Name" value={form.fullName} onChangeText={(v) => setForm({ ...form, fullName: v })} />
        <TextInput style={styles.input} placeholder="Date of Birth (YYYY-MM-DD)" value={form.dateOfBirth} onChangeText={(v) => setForm({ ...form, dateOfBirth: v })} />
        <TextInput style={styles.input} placeholder="Gender" value={form.gender} onChangeText={(v) => setForm({ ...form, gender: v })} />
        <TextInput style={styles.input} placeholder="Blood Group" value={form.bloodGroup} onChangeText={(v) => setForm({ ...form, bloodGroup: v })} autoCapitalize="characters" />
      </View>

      {/* Medical Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Details</Text>
        <TextInput style={styles.textarea} placeholder="Allergies" value={form.allergies} onChangeText={(v) => setForm({ ...form, allergies: v })} multiline />
        <TextInput style={styles.textarea} placeholder="Current Medications" value={form.medications} onChangeText={(v) => setForm({ ...form, medications: v })} multiline />
        <TextInput style={styles.textarea} placeholder="Medical Conditions" value={form.medicalConditions} onChangeText={(v) => setForm({ ...form, medicalConditions: v })} multiline />
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        {form.emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <Text style={styles.contactLabel}>Contact {index + 1}</Text>
            <TextInput style={styles.input} placeholder="Full Name" value={contact.name} onChangeText={(v) => handleContactChange(index, 'name', v)} />
            <TextInput style={styles.input} placeholder="Relationship" value={contact.relationship} onChangeText={(v) => handleContactChange(index, 'relationship', v)} />
            <TextInput style={styles.input} placeholder="Phone Number" value={contact.phone} onChangeText={(v) => handleContactChange(index, 'phone', v)} keyboardType="phone-pad" />
          </View>
        ))}
        {form.emergencyContacts.length < 3 && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setForm({ ...form, emergencyContacts: [...form.emergencyContacts, { name: '', relationship: '', phone: '' }] })}>
            <Text style={styles.addBtnText}>+ Add Another Contact</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={[styles.saveBtn, { marginBottom: insets.bottom + 16 }]} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  logo: { fontSize: 20, fontWeight: '800', color: '#111' },
  red: { color: '#e53e3e' },
  logout: { color: '#666', fontSize: 14 },
  emergencyCard: { margin: 16, backgroundColor: '#fff5f5', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#feb2b2' },
  emergencyTitle: { color: '#e53e3e', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  emergencyUrl: { color: '#333', fontSize: 12, marginBottom: 12 },
  emergencyBtn: { backgroundColor: '#e53e3e', padding: 12, borderRadius: 8, alignItems: 'center' },
  emergencyBtnText: { color: 'white', fontWeight: '600' },
  sosBtn: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#c53030', padding: 24, borderRadius: 16, alignItems: 'center', shadowColor: '#e53e3e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  sosBtnText: { color: 'white', fontSize: 24, fontWeight: '800', letterSpacing: 1 },
  sosBtnSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  section: { marginHorizontal: 16, marginBottom: 16, backgroundColor: 'white', borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 16 },
  input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 15, borderWidth: 1, borderColor: '#eee' },
  textarea: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 15, borderWidth: 1, borderColor: '#eee', minHeight: 80, textAlignVertical: 'top' },
  contactCard: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 12 },
  contactLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  addBtn: { borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', padding: 12, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#666', fontSize: 14 },
  saveBtn: { margin: 16, backgroundColor: '#e53e3e', padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 18, fontWeight: '700' }
});