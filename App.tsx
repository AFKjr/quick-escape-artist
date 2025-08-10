import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import DelayPicker from './components/DelayPicker';
import CallInProgress from './screens/CallInProgress';
import FakeCall from './screens/FakeCall';
import MessagesMock from './screens/MessagesMock';
import SettingsScreen from './screens/SettingsScreen';
import { DEFAULT_MESSAGES } from './utils/customization';
import { ensureNotificationPermissions, scheduleUrgentText } from './utils/notifications';
import { loadPreferences } from './utils/preferences';
import { parseDelay } from './utils/scheduler';

const Stack = createNativeStackNavigator();

function Home({ navigation }: any) {
  const [triggerNow, setTriggerNow] = useState(true);
  const [delayMs, setDelayMs] = useState<number | null>(null);
  const [defaultContactId, setDefaultContactId] = useState('mom');
  const [defaultMessageId, setDefaultMessageId] = useState('urgent');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  // Load user preferences
  useEffect(() => {
    const loadUserPrefs = async () => {
      try {
        const prefs = await loadPreferences();
        setDefaultContactId(prefs.defaultContactId);
        setDefaultMessageId(prefs.defaultMessageId);
        setVibrationEnabled(prefs.vibrationEnabled);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    // Load preferences when the screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserPrefs();
    });
    
    // Initial load
    loadUserPrefs();
    
    return unsubscribe;
  }, [navigation]);

  const goFakeCall = async () => {
    const ms = parseDelay(triggerNow, delayMs);
    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (ms === 0) {
      navigation.navigate('FakeCall', { contactId: defaultContactId });
    } else {
      Alert.alert(
        'Call Scheduled',
        `Your fake call will arrive in ${ms/1000} seconds`,
        [{ text: 'OK' }]
      );
      setTimeout(() => navigation.navigate('FakeCall', { contactId: defaultContactId }), ms);
    }
  };

  const goFakeText = async () => {
    try {
      await ensureNotificationPermissions();
      const ms = parseDelay(triggerNow, delayMs);
      
      // Find the message template
      const messageTemplate = DEFAULT_MESSAGES.find(m => m.id === defaultMessageId) || DEFAULT_MESSAGES[0];
      
      await scheduleUrgentText({ 
        delayMs: ms, 
        message: messageTemplate, 
        vibrate: vibrationEnabled 
      });
      
      if (ms === 0) {
        navigation.navigate('MessagesMock', { messageId: defaultMessageId });
      } else {
        Alert.alert(
          'Message Scheduled',
          `Your fake message will arrive in ${ms/1000} seconds`,
          [{ text: 'OK' }]
        );
      }
    } catch (e: any) {
      Alert.alert('Notifications disabled', e?.message ?? 'Enable notifications in Settings.');
    }
  };

  const goToSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Escape Artist</Text>
      <Text style={styles.subtitle}>Tap to make your exit</Text>

      <View style={styles.actions}>
        <Pressable 
          style={[styles.btn, styles.primary]} 
          onPress={goFakeCall}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <Text style={styles.btnTxt}>Fake Call</Text>
        </Pressable>
        <Pressable 
          style={[styles.btn, styles.secondary]} 
          onPress={goFakeText}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <Text style={styles.btnTxt}>Fake Text</Text>
        </Pressable>
      </View>

      <DelayPicker
        triggerNow={triggerNow}
        selectedMs={delayMs}
        onSelect={setDelayMs}
        onToggleTriggerNow={setTriggerNow}
      />
      
      <Pressable 
        style={styles.settingsButton} 
        onPress={goToSettings}
        android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
      >
        <Text style={styles.settingsText}>Settings</Text>
      </Pressable>

      <Text style={styles.price}>One-time purchase • $4.99</Text>
    </View>
  );
}

import OnboardingScreen, { hasCompletedOnboarding } from './screens/OnboardingScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  
  // Check if the user has completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await hasCompletedOnboarding();
      setHasOnboarded(completed);
      setIsLoading(false);
    };
    
    checkOnboarding();
  }, []);
  
  // Show a loading screen while checking onboarding status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!hasOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : null}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="FakeCall" component={FakeCall} />
        <Stack.Screen name="CallInProgress" component={CallInProgress} />
        <Stack.Screen name="MessagesMock" component={MessagesMock} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 20, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: '#111827' },
  subtitle: { textAlign: 'center', color: '#6B7280', marginTop: 6 },
  actions: { marginTop: 28, gap: 12 },
  btn: { paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
  primary: { backgroundColor: '#111827' },
  secondary: { backgroundColor: '#374151' },
  btnTxt: { color: 'white', fontWeight: '800', fontSize: 16 },
  settingsButton: { 
    marginTop: 30, 
    alignSelf: 'center',
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#6B7280'
  },
  settingsText: { 
    color: '#6B7280', 
    fontWeight: '600',
    fontSize: 14
  },
  price: { position: 'absolute', bottom: 24, width: '100%', textAlign: 'center', color: '#6B7280' }
});
