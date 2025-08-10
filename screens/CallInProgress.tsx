import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function CallInProgress({ navigation, route }: any) {
  const [secs, setSecs] = useState(0);
  const timer = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const contactName = route.params?.contactName || "Mom";
  
  // Keep screen awake during call
  useKeepAwake();

  useEffect(() => {
    // Start timer
    timer.current = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(timer.current);
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleSpeaker = () => {
    setIsSpeaker(!isSpeaker);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const hangup = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.popToTop();
  };

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <View style={styles.wrap}>
      <Text style={styles.caller}>{contactName}</Text>
      <Text style={styles.timer}>{mm}:{ss}</Text>

      <View style={styles.row}>
        <Pressable 
          style={[styles.icon, isMuted && styles.iconActive]} 
          onPress={toggleMute}
        >
          <Text style={[styles.iconTxt, isMuted && styles.iconTxtActive]}>
            {isMuted ? 'Unmute' : 'Mute'}
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.icon, isSpeaker && styles.iconActive]} 
          onPress={toggleSpeaker}
        >
          <Text style={[styles.iconTxt, isSpeaker && styles.iconTxtActive]}>
            {isSpeaker ? 'Speaker On' : 'Speaker'}
          </Text>
        </Pressable>
      </View>

      <Pressable style={styles.hang} onPress={hangup}>
        <Text style={styles.hangTxt}>End</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 24 },
  caller: { color: '#fff', fontSize: 28, fontWeight: '700' },
  timer: { color: '#9CA3AF', marginTop: 8, fontSize: 18 },
  row: { flexDirection: 'row', gap: 24, marginTop: 24 },
  icon: { borderWidth: 1, borderColor: '#9CA3AF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  iconActive: { backgroundColor: '#374151', borderColor: '#374151' },
  iconTxt: { color: '#fff', fontWeight: '700' },
  iconTxtActive: { color: '#fff', fontWeight: '800' },
  hang: { position: 'absolute', bottom: 48, backgroundColor: '#ef4444', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 999 },
  hangTxt: { color: '#fff', fontWeight: '800' }
});
