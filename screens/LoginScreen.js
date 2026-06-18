import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://rescueid-production.up.railway.app/api';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
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
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>RESCUE<Text style={styles.red}>ID</Text></Text>
      <Text style={styles.subtitle}>Welcome back</Text>
      <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? <Text style={styles.linkRed}>Register</Text></Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f0f4f8' },
  title: { fontSize: 48, fontWeight: '800', color: '#111', letterSpacing: -2, marginBottom: 4 },
  red: { color: '#e53e3e' },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 32 },
  input: { backgroundColor: 'white', padding: 14, borderRadius: 10, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#e53e3e', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  link: { textAlign: 'center', color: '#666', fontSize: 14, marginTop: 8 },
  linkRed: { color: '#e53e3e', fontWeight: '600' }
});