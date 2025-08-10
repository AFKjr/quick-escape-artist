import DelayPicker from '@/components/DelayPicker';
import { DEFAULT_MESSAGES } from '@/utils/customization';
import { ensureNotificationPermissions, scheduleUrgentText } from '@/utils/notifications';
import { loadPreferences } from '@/utils/preferences';
import { parseDelay } from '@/utils/scheduler';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
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
    
    loadUserPrefs();
  }, []);

  const goFakeCall = async () => {
    const ms = parseDelay(triggerNow, delayMs);
    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (ms === 0) {
      router.push({ pathname: '/fake-call', params: { contactId: defaultContactId } });
    } else {
      Alert.alert(
        'Call Scheduled',
        `Your fake call will arrive in ${ms/1000} seconds`,
        [{ text: 'OK' }]
      );
      setTimeout(() => 
        router.push({ pathname: '/fake-call', params: { contactId: defaultContactId } }), 
        ms
      );
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
        router.push({ pathname: '/messages-mock', params: { messageId: defaultMessageId } });
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
    router.push('/settings');
  };
  
  const goToSurvivalGuide = () => {
    router.push('/survival-guide');
  };
  
  // Emergency fake call - skips delay and uses most urgent settings
  const emergencyEscape = async () => {
    if (vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Random funny quotes that appear when the emergency button is pressed
    const emergencyQuotes = [
      "Initiating escape sequence!",
      "Awkwardness detected! Deploying countermeasures!",
      "Social ejection seat activated!",
      "Engaging conversation escape pod!",
      "Executing Operation: Get Me Outta Here!"
    ];
    
    // Show random quote
    const randomQuote = emergencyQuotes[Math.floor(Math.random() * emergencyQuotes.length)];
    Alert.alert("Emergency Escape!", randomQuote, [{ text: "Let's Go!" }], { cancelable: false });
    
    // Trigger immediate fake call
    setTimeout(() => 
      router.push({ pathname: '/fake-call', params: { contactId: defaultContactId } }), 
      800
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Escape Artist</Text>
      <Text style={styles.subtitle}>Your ticket to social freedom</Text>
      
      <Pressable 
        style={styles.emergencyButton} 
        onPress={emergencyEscape}
        android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
      >
        <Text style={styles.emergencyButtonText}>🆘 EMERGENCY ESCAPE 🆘</Text>
      </Pressable>

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
      
      <View style={styles.buttonRow}>
        <Pressable 
          style={styles.settingsButton} 
          onPress={goToSettings}
          android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
        >
          <Text style={styles.settingsText}>Settings</Text>
        </Pressable>
        
        <Pressable 
          style={styles.guideButton} 
          onPress={goToSurvivalGuide}
          android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
        >
          <Text style={styles.settingsText}>Survival Guide</Text>
        </Pressable>
      </View>

      <Text style={styles.price}>One-time purchase • $4.99</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB', 
    paddingHorizontal: 20, 
    paddingTop: 80 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    textAlign: 'center', 
    color: '#111827' 
  },
  subtitle: { 
    textAlign: 'center', 
    color: '#6B7280', 
    marginTop: 6 
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emergencyButtonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
  },
  actions: { 
    marginTop: 16, 
    gap: 12 
  },
  btn: { 
    paddingVertical: 18, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  primary: { 
    backgroundColor: '#111827' 
  },
  secondary: { 
    backgroundColor: '#374151' 
  },
  btnTxt: { 
    color: 'white', 
    fontWeight: '800', 
    fontSize: 16 
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 30
  },
  settingsButton: { 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#6B7280'
  },
  guideButton: { 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    backgroundColor: '#E0E7FF',
    borderWidth: 1, 
    borderColor: '#818CF8'
  },
  settingsText: { 
    color: '#6B7280', 
    fontWeight: '600',
    fontSize: 14
  },
  price: { 
    position: 'absolute', 
    bottom: 24, 
    width: '100%', 
    textAlign: 'center', 
    color: '#6B7280' 
  }
});
