import DelayPicker from '@/components/DelayPicker';
import {
    cancelBackgroundAlarm,
    getActiveAlarms,
    initializeBackgroundAlarms,
    scheduleBackgroundAlarm
} from '@/utils/backgroundAlarms';
import { DEFAULT_MESSAGES } from '@/utils/customization';
import { ensureNotificationPermissions, scheduleUrgentText } from '@/utils/notifications';
import { loadPreferences } from '@/utils/preferences';
import { parseDelay } from '@/utils/scheduler';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [triggerNow, setTriggerNow] = useState(true);
  const [delayMs, setDelayMs] = useState<number | null>(null);
  const [defaultContactId, setDefaultContactId] = useState('mom');
  const [defaultMessageId, setDefaultMessageId] = useState('urgent');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  // Timer state management (hybrid: visual + background-safe)
  const [scheduledAlarm, setScheduledAlarm] = useState<{
    type: 'call' | 'text';
    endTime: number;
    originalDelayMs: number;
    backgroundAlarmId?: string; // ID from background alarm system
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  // Load user preferences and initialize background alarms
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
    
    const initializeApp = async () => {
      await Promise.all([
        loadUserPrefs(),
        initializeBackgroundAlarms()
      ]);
      
      // Check for any active alarms on app start
      await checkForActiveAlarms();
    };
    
    initializeApp();
  }, []);

  // Monitor app state changes to handle background/foreground transitions
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App came to foreground, sync with background alarms
        checkForActiveAlarms();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Check for active background alarms and sync state
  const checkForActiveAlarms = async () => {
    try {
      const activeAlarms = await getActiveAlarms();
      
      if (activeAlarms.length > 0) {
        // Restore the most recent alarm to UI state
        const latestAlarm = activeAlarms[activeAlarms.length - 1];
        const now = Date.now();
        const remaining = Math.max(0, latestAlarm.scheduledTime - now);
        
        if (remaining > 0) {
          setScheduledAlarm({
            type: latestAlarm.type,
            endTime: latestAlarm.scheduledTime,
            originalDelayMs: latestAlarm.scheduledTime - latestAlarm.createdAt,
            backgroundAlarmId: latestAlarm.id
          });
          setTimeRemaining(remaining);
          setIsAlarmActive(true);
          console.log(`Restored active alarm: ${latestAlarm.id} with ${Math.ceil(remaining/1000)}s remaining`);
        }
      }
    } catch (error) {
      console.error('Failed to check active alarms:', error);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (scheduledAlarm && isAlarmActive) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, scheduledAlarm.endTime - now);
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          triggerScheduledAlarm();
        }
      }, 100); // Update every 100ms for smooth countdown
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [scheduledAlarm, isAlarmActive]);

  // Pulse animation for timer
  useEffect(() => {
    if (isAlarmActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      
      return () => pulse.stop();
    }
  }, [isAlarmActive]);

  // Format time remaining for display
  const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${seconds}s`;
    }
  };

  // Schedule an alarm (hybrid: visual timer + background-safe notifications)
  const scheduleEscapeAlarm = async (type: 'call' | 'text', delayMs: number) => {
    try {
      const scheduledTime = Date.now() + delayMs;
      
      // Schedule background-safe alarm
      const backgroundAlarmId = await scheduleBackgroundAlarm({
        type,
        contactId: defaultContactId,
        messageId: defaultMessageId,
        scheduledTime
      });
      
      // Set up visual timer for when app is active
      const alarm = {
        type,
        endTime: scheduledTime,
        originalDelayMs: delayMs,
        backgroundAlarmId
      };
      
      setScheduledAlarm(alarm);
      setTimeRemaining(delayMs);
      setIsAlarmActive(true);
      
      if (vibrationEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      console.log(`Hybrid escape alarm scheduled: ${type} in ${formatTimeRemaining(delayMs)} (Background ID: ${backgroundAlarmId})`);
      
    } catch (error) {
      console.error('Failed to schedule escape alarm:', error);
      Alert.alert(
        'Alarm Error',
        'Failed to schedule escape alarm. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Cancel the scheduled alarm (both visual and background)
  const cancelScheduledAlarm = async () => {
    try {
      // Clear visual timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Cancel background alarm
      if (scheduledAlarm?.backgroundAlarmId) {
        await cancelBackgroundAlarm(scheduledAlarm.backgroundAlarmId);
      }
      
      // Reset state
      setScheduledAlarm(null);
      setIsAlarmActive(false);
      setTimeRemaining(0);
      
      if (vibrationEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      console.log('Hybrid escape alarm cancelled');
      
    } catch (error) {
      console.error('Failed to cancel alarm:', error);
    }
  };

  // Trigger the scheduled alarm when time is up
  const triggerScheduledAlarm = () => {
    if (!scheduledAlarm) return;
    
    setIsAlarmActive(false);
    
    if (vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    console.log(`Escape alarm triggered: ${scheduledAlarm.type}`);
    
    if (scheduledAlarm.type === 'call') {
      router.push({ pathname: '/fake-call', params: { contactId: defaultContactId } });
    } else {
      router.push({ pathname: '/messages-mock', params: { messageId: defaultMessageId } });
    }
    
    setScheduledAlarm(null);
  };

  const goFakeCall = async () => {
    const ms = parseDelay(triggerNow, delayMs);
    
    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (ms === 0) {
      // Immediate fake call
      router.push({ pathname: '/fake-call', params: { contactId: defaultContactId } });
    } else {
      // Show confirmation dialog for scheduled call
      Alert.alert(
        'Schedule Fake Call',
        `Set alarm for fake call in ${formatTimeRemaining(ms)}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Set Alarm',
            onPress: () => scheduleEscapeAlarm('call', ms),
            style: 'default'
          }
        ]
      );
    }
  };

  const goFakeText = async () => {
    try {
      await ensureNotificationPermissions();
      const ms = parseDelay(triggerNow, delayMs);
      
      // Find the message template
      const messageTemplate = DEFAULT_MESSAGES.find(m => m.id === defaultMessageId) || DEFAULT_MESSAGES[0];
      
      if (ms === 0) {
        // Immediate fake text
        router.push({ pathname: '/messages-mock', params: { messageId: defaultMessageId } });
      } else {
        // Show confirmation dialog for scheduled text
        Alert.alert(
          'Schedule Fake Text',
          `Set alarm for fake text in ${formatTimeRemaining(ms)}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Set Alarm',
              onPress: () => {
                scheduleEscapeAlarm('text', ms);
                // Also schedule the notification
                scheduleUrgentText({ 
                  delayMs: ms, 
                  message: messageTemplate, 
                  vibrate: vibrationEnabled 
                });
              },
              style: 'default'
            }
          ]
        );
      }
    } catch (e: any) {
      Alert.alert('Notifications disabled', e?.message ?? 'Enable notifications in Settings.');
    }
  };

  const goToSettings = () => {
    router.push('/settings');
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
      {/* Alarm Timer Display (like an alarm clock) */}
      {isAlarmActive && scheduledAlarm && (
        <Animated.View 
          style={[
            styles.alarmDisplay,
            { transform: [{ scale: pulseAnimation }] }
          ]}
        >
          <View style={styles.alarmHeader}>
            <Text style={styles.alarmTitle}>
              🚨 {scheduledAlarm.type === 'call' ? 'FAKE CALL' : 'FAKE TEXT'} ALARM
            </Text>
            <Pressable 
              style={styles.cancelAlarmButton}
              onPress={cancelScheduledAlarm}
              android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <Text style={styles.cancelAlarmText}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.alarmCountdown}>
            {formatTimeRemaining(timeRemaining)}
          </Text>
          <Text style={styles.alarmSubtitle}>
            {scheduledAlarm.type === 'call' ? 'Incoming call from' : 'Text message from'} {defaultContactId}
          </Text>
          <View style={styles.alarmProgress}>
            <View 
              style={[
                styles.alarmProgressFill,
                { 
                  width: `${Math.max(0, (1 - timeRemaining / scheduledAlarm.originalDelayMs) * 100)}%` 
                }
              ]}
            />
          </View>
        </Animated.View>
      )}
      
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
      
      {/* Show confirmation message when delay is selected */}
      {!triggerNow && delayMs && !isAlarmActive && (
        <View style={styles.delayConfirmation}>
          <Text style={styles.delayConfirmationText}>
            ⏰ {formatTimeRemaining(delayMs)} selected
          </Text>
          <Text style={styles.delayConfirmationSubtext}>
            Choose "Fake Call" or "Fake Text" to set your escape alarm
          </Text>
        </View>
      )}
      
      <View style={styles.buttonRow}>
        <Pressable 
          style={styles.settingsButton} 
          onPress={goToSettings}
          android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
        >
          <Text style={styles.settingsText}>Settings</Text>
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
  // Alarm Clock Timer Styles
  alarmDisplay: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  alarmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alarmTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
    flex: 1,
  },
  cancelAlarmButton: {
    backgroundColor: '#DC2626',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelAlarmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  alarmCountdown: {
    fontSize: 36,
    fontWeight: '900',
    color: '#DC2626',
    textAlign: 'center',
    marginVertical: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  alarmSubtitle: {
    fontSize: 14,
    color: '#7F1D1D',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  alarmProgress: {
    height: 6,
    backgroundColor: '#FECACA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  alarmProgressFill: {
    height: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 3,
  },
  // Delay Confirmation Styles
  delayConfirmation: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#0EA5E9',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  delayConfirmationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C4A6E',
    marginBottom: 4,
  },
  delayConfirmationSubtext: {
    fontSize: 12,
    color: '#075985',
    textAlign: 'center',
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
