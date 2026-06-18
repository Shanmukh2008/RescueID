import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';

export default function ScannerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Text style={[styles.message, { color: colors.text }]}>Camera permission is required to scan QR codes</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    // Extract emergency ID from URL
    // URL format: https://rescueid.tech/emergency/UUID
    const parts = data.split('/');
    const emergencyId = parts[parts.length - 1];

    if (emergencyId && emergencyId.length > 0) {
      navigation.replace('Emergency', { id: emergencyId });
    } else {
      Alert.alert('Invalid QR Code', 'This is not a valid RescueID QR code', [
        { text: 'Try Again', onPress: () => setScanned(false) }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      <View style={[styles.overlay, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>RESCUE<Text style={styles.red}>ID</Text></Text>
        <Text style={styles.subtitle}>Scan a RescueID QR code</Text>
      </View>
      <View style={styles.frame}>
        <View style={styles.corner} />
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
        {scanned && (
          <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: 'white' },
  red: { color: '#e53e3e' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  frame: { position: 'absolute', top: '30%', left: '15%', right: '15%', aspectRatio: 1, borderWidth: 2, borderColor: 'white', borderRadius: 12 },
  corner: { position: 'absolute', top: -2, left: -2, width: 30, height: 30, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#e53e3e', borderTopLeftRadius: 12 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', padding: 24 },
  button: { backgroundColor: '#e53e3e', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, marginBottom: 12 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  cancelBtn: { padding: 12 },
  cancelText: { color: 'white', fontSize: 16 },
  message: { fontSize: 16, textAlign: 'center', margin: 24 }
});