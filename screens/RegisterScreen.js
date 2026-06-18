import { Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';

const API_URL = 'https://rescueid-production.up.railway.app/api';

export default function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, darkMode, toggleDarkMode } = useTheme();
  const [form, setForm] = useState({ fullName: '', dateOfBirth: '', gender: '', bloodGroup: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password || !form.bloodGroup || !form.gender || !form.dateOfBirth) {
      Alert.alert('Error', 'Please fill in all fields'); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        navigation.navigate('Dashboard', { token: data.token, user: data.user });
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>RESCUE<Text style={styles.red}>ID</Text></Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>Create your account</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Full Name" placeholderTextColor={colors.subtext} value={form.fullName} onChangeText={(v) => setForm({ ...form, fullName: v })} />
      <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Date of Birth (YYYY-MM-DD)" placeholderTextColor={colors.subtext} value={form.dateOfBirth} onChangeText={(v) => setForm({ ...form, dateOfBirth: v })} />
      <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Gender (male/female/other)" placeholderTextColor={colors.subtext} value={form.gender} onChangeText={(v) => setForm({ ...form, gender: v })} autoCapitalize="none" />
      <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Blood Group (e.g. O+)" placeholderTextColor={colors.subtext} value={form.bloodGroup} onChangeText={(v) => setForm({ ...form, bloodGroup: v })} autoCapitalize="characters" />
      <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Email" placeholderTextColor={colors.subtext} value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} placeholder="Password" placeholderTextColor={colors.subtext} value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.link, { color: colors.subtext }]}>Already have an account? <Text style={styles.linkRed}>Login</Text></Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 16 }} onPress={toggleDarkMode}>
        <Text style={[styles.link, { color: colors.subtext }]}>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 48, fontWeight: '800', letterSpacing: -2, marginBottom: 4 },
  red: { color: '#e53e3e' },
  subtitle: { fontSize: 18, marginBottom: 32 },
  input: { padding: 14, borderRadius: 10, marginBottom: 12, fontSize: 16, borderWidth: 1 },
  button: { backgroundColor: '#e53e3e', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  link: { textAlign: 'center', fontSize: 14, marginTop: 8 },
  linkRed: { color: '#e53e3e', fontWeight: '600' }
});