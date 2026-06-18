import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, darkMode, toggleDarkMode } = useTheme();
  const { t, language, changeLanguage } = useLanguage();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <Text style={[styles.title, { color: colors.text }]}>RESCUE<Text style={styles.red}>ID</Text></Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>{t.home.subtitle}</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.buttonText}>{t.home.getStarted}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.buttonOutline, { borderColor: colors.border }]} onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.buttonOutlineText, { color: colors.text }]}>{t.home.login}</Text>
      </TouchableOpacity>
      <View style={styles.bottomRow}>
        <TouchableOpacity onPress={toggleDarkMode}>
          <Text style={[styles.toggleText, { color: colors.subtext }]}>{darkMode ? t.home.lightMode : t.home.darkMode}</Text>
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
      </View>
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
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  toggleText: { fontSize: 13 },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: { padding: 6, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', minWidth: 36, alignItems: 'center' },
  langBtnActive: { backgroundColor: '#e53e3e', borderColor: '#e53e3e' },
  langText: { fontSize: 13, color: '#666' },
  langTextActive: { color: 'white', fontWeight: '600' }
});