import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import { MessageTemplate } from './customization';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false
  }),
});

export async function ensureNotificationPermissions() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== 'granted') throw new Error('Notification permission denied');
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('urgent', {
      name: 'Urgent', importance: Notifications.AndroidImportance.MAX
    });
  }
}

export interface NotificationOptions {
  delayMs: number;
  message: MessageTemplate;
  vibrate?: boolean;
  channelId?: string;
}

export async function scheduleUrgentText({
  delayMs, 
  message, 
  vibrate = true, 
  channelId = 'urgent'
}: NotificationOptions) {
  // Create vibration pattern if enabled
  if (vibrate) {
    Vibration.vibrate([0, 500, 200, 500], false);
  }
  
  return Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      ...(Platform.OS === 'android' ? { channelId } : {})
    },
    trigger: delayMs
      ? {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.ceil(delayMs / 1000),
        }
      : null
  });
}
