import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, darkMode, toggleDarkMode } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <Text style={[styles.title, { color: colors.text }]}>RESCUE<Text style={styles.red}>ID</Text></Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>Your emergency medical profile, accessible instantly when it matters most.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.buttonOutline, { borderColor: colors.border }]} onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.buttonOutlineText, { color: colors.text }]}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.darkToggle} onPress={toggleDarkMode}>
        <Text style={[styles.darkToggleText, { color: colors.subtext }]}>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 64, fontWeight: '800', letterSpacing: -2, marginBottom: 8 },
  red: { color: '#e53e3e' },
  subtitle: { fontSize: 16, marginBottom: 48, textAlign: 'center', lineHeight: 24 },
  button: { backgroundColor: '#e53e3e', paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 12 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  buttonOutline: { borderWidth: 1, paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 24 },
  buttonOutlineText: { fontSize: 18, fontWeight: '600' },
  darkToggle: { marginTop: 8 },
  darkToggleText: { fontSize: 13 }
});