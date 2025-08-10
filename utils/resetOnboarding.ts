import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing onboarding status - must match the one in onboarding.tsx
const ONBOARDING_KEY = 'quick-escape-artist-onboarding-completed';

// Function to reset onboarding status (for testing)
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    console.log('Onboarding status reset successfully');
  } catch (error) {
    console.error('Error resetting onboarding status:', error);
  }
}

// Call this function for testing only
// resetOnboarding();
