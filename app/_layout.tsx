import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

function SplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <Text style={styles.splashTitle}>Quick Escape Artist</Text>
      <Text style={styles.splashSubtitle}>Your social lifesaver</Text>
    </View>
  );
}

function InitialLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show splash for 2.5 seconds then navigate to main app
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="fake-call" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="call-in-progress" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="messages-mock" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
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

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
});
