import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface BackgroundAlarm {
  id: string;
  type: 'call' | 'text';
  contactId: string;
  messageId?: string;
  scheduledTime: number; // Unix timestamp
  createdAt: number;
}

// Storage keys
const ACTIVE_ALARMS_KEY = 'quick-escape-active-alarms';
const ALARM_NOTIFICATIONS_KEY = 'quick-escape-alarm-notifications';

// Configure notification handler for background alarms
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isAlarmNotification = notification.request.identifier.startsWith('escape-alarm-');
    
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: isAlarmNotification ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.DEFAULT,
    };
  },
});

/**
 * Schedule a background-safe alarm that works even when app is closed
 */
export async function scheduleBackgroundAlarm(alarm: Omit<BackgroundAlarm, 'id' | 'createdAt'>): Promise<string> {
  const alarmId = `escape-alarm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const delayMs = alarm.scheduledTime - Date.now();
  
  if (delayMs <= 0) {
    throw new Error('Cannot schedule alarm in the past');
  }

  // Create the alarm object
  const fullAlarm: BackgroundAlarm = {
    ...alarm,
    id: alarmId,
    createdAt: Date.now(),
  };

  try {
    // 1. Schedule a local notification
    const notificationContent = alarm.type === 'call' 
      ? {
          title: '📞 Fake Call Incoming!',
          body: `Emergency call from ${alarm.contactId}. Time to make your escape!`,
          sound: true,
          data: { 
            alarmId,
            type: 'call',
            contactId: alarm.contactId,
            action: 'trigger-fake-call'
          }
        }
      : {
          title: '📱 Urgent Message!',
          body: `Important message from ${alarm.contactId}. Perfect excuse to leave!`,
          sound: true,
          data: { 
            alarmId,
            type: 'text',
            contactId: alarm.contactId,
            messageId: alarm.messageId,
            action: 'trigger-fake-text'
          }
        };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        ...notificationContent,
        priority: Notifications.AndroidNotificationPriority.MAX,
        ...(Platform.OS === 'android' ? { 
          channelId: 'escape-alarms',
          badge: 1,
        } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.ceil(delayMs / 1000),
      },
      identifier: alarmId,
    });

    // 2. Store alarm data for recovery
    await storeActiveAlarm(fullAlarm, notificationId);

    // 3. Set up background capabilities
    await setupBackgroundCapabilities();

    console.log(`Background alarm scheduled: ${alarmId} in ${Math.ceil(delayMs / 1000)}s`);
    return alarmId;

  } catch (error) {
    console.error('Failed to schedule background alarm:', error);
    throw new Error('Failed to schedule escape alarm');
  }
}

/**
 * Cancel a scheduled background alarm
 */
export async function cancelBackgroundAlarm(alarmId: string): Promise<void> {
  try {
    // Cancel the notification
    await Notifications.cancelScheduledNotificationAsync(alarmId);
    
    // Remove from storage
    await removeActiveAlarm(alarmId);
    
    console.log(`Background alarm cancelled: ${alarmId}`);
  } catch (error) {
    console.error('Failed to cancel background alarm:', error);
  }
}

/**
 * Get all active alarms
 */
export async function getActiveAlarms(): Promise<BackgroundAlarm[]> {
  try {
    const stored = await AsyncStorage.getItem(ACTIVE_ALARMS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get active alarms:', error);
    return [];
  }
}

/**
 * Clear all active alarms
 */
export async function clearAllAlarms(): Promise<void> {
  try {
    const alarms = await getActiveAlarms();
    
    // Cancel all notifications
    for (const alarm of alarms) {
      await Notifications.cancelScheduledNotificationAsync(alarm.id);
    }
    
    // Clear storage
    await AsyncStorage.removeItem(ACTIVE_ALARMS_KEY);
    await AsyncStorage.removeItem(ALARM_NOTIFICATIONS_KEY);
    
    console.log('All alarms cleared');
  } catch (error) {
    console.error('Failed to clear all alarms:', error);
  }
}

/**
 * Check for expired alarms on app launch
 */
export async function checkExpiredAlarms(): Promise<BackgroundAlarm[]> {
  try {
    const alarms = await getActiveAlarms();
    const now = Date.now();
    const expiredAlarms: BackgroundAlarm[] = [];
    const validAlarms: BackgroundAlarm[] = [];
    
    for (const alarm of alarms) {
      if (alarm.scheduledTime <= now) {
        expiredAlarms.push(alarm);
      } else {
        validAlarms.push(alarm);
      }
    }
    
    // Update storage with only valid alarms
    if (expiredAlarms.length > 0) {
      await AsyncStorage.setItem(ACTIVE_ALARMS_KEY, JSON.stringify(validAlarms));
      console.log(`Found ${expiredAlarms.length} expired alarms`);
    }
    
    return expiredAlarms;
  } catch (error) {
    console.error('Failed to check expired alarms:', error);
    return [];
  }
}

/**
 * Store an active alarm
 */
async function storeActiveAlarm(alarm: BackgroundAlarm, notificationId: string): Promise<void> {
  try {
    const existingAlarms = await getActiveAlarms();
    const updatedAlarms = [...existingAlarms, alarm];
    
    await AsyncStorage.setItem(ACTIVE_ALARMS_KEY, JSON.stringify(updatedAlarms));
    
    // Store notification mapping
    const notificationMap = await getNotificationMap();
    notificationMap[alarm.id] = notificationId;
    await AsyncStorage.setItem(ALARM_NOTIFICATIONS_KEY, JSON.stringify(notificationMap));
    
  } catch (error) {
    console.error('Failed to store active alarm:', error);
  }
}

/**
 * Remove an active alarm
 */
async function removeActiveAlarm(alarmId: string): Promise<void> {
  try {
    const existingAlarms = await getActiveAlarms();
    const updatedAlarms = existingAlarms.filter(alarm => alarm.id !== alarmId);
    
    await AsyncStorage.setItem(ACTIVE_ALARMS_KEY, JSON.stringify(updatedAlarms));
    
    // Remove from notification mapping
    const notificationMap = await getNotificationMap();
    delete notificationMap[alarmId];
    await AsyncStorage.setItem(ALARM_NOTIFICATIONS_KEY, JSON.stringify(notificationMap));
    
  } catch (error) {
    console.error('Failed to remove active alarm:', error);
  }
}

/**
 * Get notification ID mapping
 */
async function getNotificationMap(): Promise<Record<string, string>> {
  try {
    const stored = await AsyncStorage.getItem(ALARM_NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    return {};
  }
}

/**
 * Setup background capabilities (simplified)
 */
async function setupBackgroundCapabilities(): Promise<void> {
  // For React Native/Expo, background execution is limited
  // The main background capability comes from scheduled notifications
  console.log('Background capabilities configured for notifications');
}

/**
 * Initialize background alarm system
 */
export async function initializeBackgroundAlarms(): Promise<void> {
  try {
    // Ensure notification permissions
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const request = await Notifications.requestPermissionsAsync();
      if (request.status !== 'granted') {
        throw new Error('Notification permissions required for alarms');
      }
    }
    
    // Create notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('escape-alarms', {
        name: 'Escape Alarms',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF0000',
        description: 'Fake call and text alarms for social escapes',
        enableVibrate: true,
        showBadge: true,
      });
    }
    
    // Check for any expired alarms on app start
    await checkExpiredAlarms();
    
    console.log('Background alarm system initialized');
    
  } catch (error) {
    console.error('Failed to initialize background alarms:', error);
  }
}

/**
 * Handle notification response (when user taps notification)
 */
export function handleAlarmNotificationResponse(response: Notifications.NotificationResponse): boolean {
  const data = response.notification.request.content.data as any;
  
  if (data?.action && typeof data.action === 'string' && data.action.startsWith('trigger-fake-')) {
    console.log('Alarm notification tapped:', data);
    
    // Remove the alarm from active list
    if (data.alarmId && typeof data.alarmId === 'string') {
      removeActiveAlarm(data.alarmId);
    }
    
    return true; // Indicates this was an alarm notification
  }
  
  return false; // Not an alarm notification
}
