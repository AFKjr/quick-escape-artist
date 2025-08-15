import { Stack, router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const PRIVACY_TEXT = `Quick Escape Artist — Privacy Policy

Last updated: August 14, 2025

Summary
- This app stores user-created contacts, message templates, and scheduled alarms locally on your device.
- The app uses local notifications, device audio and vibration for its features.
- No data is transmitted to external servers by the app. There are no logins, analytics, or remote backups implemented.

What we collect
- Data you enter manually: custom contact names/relationship labels, custom message templates, and scheduled alarm metadata.
- Local runtime state such as active scheduled alarms stored in app local storage.

How we use data
- All data is stored locally to provide core functionality: generating fake calls/texts and scheduling alarms.
- Notifications are scheduled and triggered locally; audio and vibration are used on-device.

Third parties
- The app uses Expo libraries (for notifications and audio) but does not send user data to third-party servers.
- No analytics, crash-reporting, or advertising SDKs are included.

Data sharing
- We do not share, sell, or transmit user data to external parties.

Storage & deletion
- Data is stored on the device. To remove all personal data, uninstall the app or use the app Settings (delete custom contacts/messages and clear scheduled alarms) — see Settings → Clear data.

Permissions
- Notifications: required for scheduled alarms. The app will request notification permission when needed.
- Audio/vibration: used locally to play ringtones and vibrate the device.
- The app does not request contacts/address-book access.

Changes
- If the app behavior changes (e.g., introducing backups, analytics, or server sync), this policy will be updated and users will be informed.

Contact
- For privacy questions, contact afk.appsllc@gmail.com
`;

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Privacy Policy' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>{PRIVACY_TEXT}</Text>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  text: { fontSize: 16, lineHeight: 24, color: '#111' },
  footer: { padding: 12, borderTopWidth: 1, borderColor: '#eee' },
  backBtn: { alignSelf: 'center', padding: 10 },
  backTxt: { color: '#0b6efd', fontWeight: '600' }
});
