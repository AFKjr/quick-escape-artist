import { router, Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, Text } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarButton: () => (
            <Pressable
              onPress={() => router.push('/privacy')}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: Colors[colorScheme ?? 'light'].tint, fontSize: 12, fontWeight: '600', lineHeight: 16, textAlign: 'center' }}>
                Privacy Policy
              </Text>
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}
