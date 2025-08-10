import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { hasCompletedOnboarding } from './onboarding';

function InitialLayout() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await hasCompletedOnboarding();
      setIsOnboardingComplete(completed);
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    if (isOnboardingComplete === null) {
      // Still loading onboarding status
      return;
    }

    const inAuthGroup = segments[0] === '(tabs)';
    
    if (!isOnboardingComplete && !segments.includes('onboarding')) {
      // Redirect to onboarding
      router.replace('/onboarding');
    } else if (isOnboardingComplete && segments.includes('onboarding')) {
      // Redirect to home if they've completed onboarding
      router.replace('/(tabs)');
    }
  }, [isOnboardingComplete, segments]);

  if (isOnboardingComplete === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="fake-call" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="call-in-progress" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="messages-mock" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      <Stack.Screen name="resources" options={{ headerShown: false }} />
      <Stack.Screen name="survival-guide" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <InitialLayout />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
