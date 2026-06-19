import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { Alert, Vibration } from 'react-native';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { sendLocalNotification } from '../utils/notifications';

const CRASH_THRESHOLD = 4.0; // G-force threshold
const STILLNESS_THRESHOLD = 0.3; // G-force for stillness detection
const STILLNESS_DURATION = 2000; // 2 seconds of stillness after impact
const COUNTDOWN_SECONDS = 10;

export default function useCrashDetection(profile, enabled = true) {
  const [crashDetected, setCrashDetected] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const impactTime = useRef(null);
  const countdownTimer = useRef(null);
  const countdownRef = useRef(COUNTDOWN_SECONDS);
  const cancelled = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(100); // 10 times per second

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const gForce = Math.sqrt(x * x + y * y + z * z);

      // Detect impact
      if (gForce > CRASH_THRESHOLD && !impactTime.current && !crashDetected) {
        console.log('Impact detected! G-force:', gForce);
        impactTime.current = Date.now();
      }

      // After impact, check for stillness
      if (impactTime.current && !crashDetected) {
        const timeSinceImpact = Date.now() - impactTime.current;
        const isStill = gForce < STILLNESS_THRESHOLD;

        if (isStill && timeSinceImpact > STILLNESS_DURATION) {
          console.log('Crash confirmed - stillness detected after impact');
          impactTime.current = null;
          triggerCrashAlert();
        }

        // Reset if no stillness after 5 seconds (false alarm)
        if (timeSinceImpact > 5000) {
          impactTime.current = null;
        }
      }

      lastAcceleration.current = { x, y, z };
    });

    return () => subscription.remove();
  }, [enabled, crashDetected]);

  const triggerCrashAlert = () => {
    cancelled.current = false;
    setCrashDetected(true);
    countdownRef.current = COUNTDOWN_SECONDS;
    setCountdown(COUNTDOWN_SECONDS);
    Vibration.vibrate([500, 500, 500, 500, 500], true);

    

    // Start countdown
    countdownTimer.current = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);

      sendLocalNotification(
  'Crash Detected!',
  'RescueID has detected a possible crash. SOS will activate in 10 seconds.'
);
      if (countdownRef.current <= 0) {
        clearInterval(countdownTimer.current);
        if (!cancelled.current) {
          activateSOS();
        }
      }
    }, 1000);
  };

  const cancelCrash = () => {
    cancelled.current = true;
    clearInterval(countdownTimer.current);
    Vibration.cancel();
    setCrashDetected(false);
    setCountdown(COUNTDOWN_SECONDS);
    impactTime.current = null;
  };

  const activateSOS = async () => {
    Vibration.cancel();
    setCrashDetected(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let locationText = 'unknown location';
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        locationText = `latitude ${location.coords.latitude.toFixed(4)}, longitude ${location.coords.longitude.toFixed(4)}`;
      }

      const contact = profile?.emergencyContacts?.[0];
      const message = `Emergency crash detected. Patient name: ${profile?.fullName || 'unknown'}. 
        Blood group ${profile?.bloodGroup || 'unknown'}. 
        Location: ${locationText}. 
        Allergies: ${profile?.allergies || 'none'}. 
        Medical conditions: ${profile?.medicalConditions || 'none'}. 
        Emergency contact: ${contact?.name || 'none'}, ${contact?.phone || 'none'}.`;

      Speech.speak(message, { language: 'en-IN', pitch: 1.0, rate: 0.85 });

      Linking.openURL('tel:112');
    } catch (err) {
      console.error('SOS activation failed:', err);
    }
  };

return { crashDetected, countdown, cancelCrash, triggerCrashAlert };
}