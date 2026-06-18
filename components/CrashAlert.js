import { View, Text, StyleSheet, TouchableOpacity, Animated, useEffect, useRef } from 'react-native';
import { useEffect as useEffectNative, useRef as useRefNative } from 'react';

export default function CrashAlert({ countdown, onCancel }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.icon}>🚨</Text>
        <Text style={styles.title}>CRASH DETECTED</Text>
        <Text style={styles.subtitle}>Are you okay? Calling 112 in</Text>
        <Text style={styles.countdown}>{countdown}</Text>
        <Text style={styles.seconds}>seconds</Text>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>I'M OKAY — CANCEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  container: {
    backgroundColor: '#e53e3e',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: '85%'
  },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: 'white', letterSpacing: 1, marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 16, textAlign: 'center' },
  countdown: { fontSize: 96, fontWeight: '800', color: 'white', lineHeight: 100 },
  seconds: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 32 },
  cancelBtn: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center'
  },
  cancelText: { color: '#e53e3e', fontSize: 18, fontWeight: '800' }
});