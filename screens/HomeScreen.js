import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>RESCUE<Text style={styles.red}>ID</Text></Text>
      <Text style={styles.subtitle}>Your emergency medical profile, accessible instantly when it matters most.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOutline} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonOutlineText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8', padding: 24 },
  title: { fontSize: 64, fontWeight: '800', color: '#111', letterSpacing: -2, marginBottom: 8 },
  red: { color: '#e53e3e' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 48, textAlign: 'center', lineHeight: 24 },
  button: { backgroundColor: '#e53e3e', paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 12 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  buttonOutline: { borderWidth: 1, borderColor: '#ddd', paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonOutlineText: { color: '#333', fontSize: 18, fontWeight: '600' }
});