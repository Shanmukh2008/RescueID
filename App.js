import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { ThemeProvider } from './ThemeContext';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import ScannerScreen from './screens/ScannerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [initialParams, setInitialParams] = useState(null);

  useEffect(() => { checkLogin(); }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      if (token && user) {
        // Check if biometrics available
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (compatible && enrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to open RescueID',
            fallbackLabel: 'Use Passcode',
            cancelLabel: 'Cancel'
          });

          if (result.success) {
            setInitialParams({ token, user: JSON.parse(user) });
            setInitialRoute('Dashboard');
          } else {
            // Authentication failed or cancelled
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setInitialRoute('Home');
          }
        } else {
          // No biometrics available, just log in normally
          setInitialParams({ token, user: JSON.parse(user) });
          setInitialRoute('Dashboard');
        }
      } else {
        setInitialRoute('Home');
      }
    } catch {
      setInitialRoute('Home');
    }
  };

  if (!initialRoute) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' }}>
      <ActivityIndicator size="large" color="#e53e3e" />
    </View>
  );

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {initialRoute === 'Dashboard' ? (
              <>
                <Stack.Screen name="Dashboard" component={DashboardScreen} initialParams={initialParams} />
                <Stack.Screen name="Emergency" component={EmergencyScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Scanner" component={ScannerScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Emergency" component={EmergencyScreen} />
                <Stack.Screen name="Scanner" component={ScannerScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}