import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PREFERENCES, UserPreferences } from './customization';

const PREFERENCES_KEY = 'quick-escape-artist-preferences';

/**
 * Save user preferences to AsyncStorage
 */
export async function savePreferences(preferences: UserPreferences): Promise<void> {
  try {
    const jsonValue = JSON.stringify(preferences);
    await AsyncStorage.setItem(PREFERENCES_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
}

/**
 * Load user preferences from AsyncStorage
 */
export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const jsonValue = await AsyncStorage.getItem(PREFERENCES_KEY);
    return jsonValue != null 
      ? JSON.parse(jsonValue) 
      : DEFAULT_PREFERENCES;
  } catch (e) {
    console.error('Failed to load preferences', e);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Get a specific contact by ID
 */
export async function getContactById(id: string) {
  const prefs = await loadPreferences();
  const customContact = prefs.customContacts?.find(c => c.id === id);
  if (customContact) return customContact;
  
  const defaultContact = DEFAULT_PREFERENCES.defaultContactId;
  return defaultContact;
}

/**
 * Get a specific message template by ID
 */
export async function getMessageById(id: string) {
  const prefs = await loadPreferences();
  const customMessage = prefs.customMessages?.find(m => m.id === id);
  if (customMessage) return customMessage;
  
  const defaultMessage = DEFAULT_PREFERENCES.defaultMessageId;
  return defaultMessage;
}
