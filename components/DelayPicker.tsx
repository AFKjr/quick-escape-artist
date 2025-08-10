import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DELAYS } from '../utils/scheduler';

type Props = {
  triggerNow: boolean;
  selectedMs: number | null;
  onSelect(ms: number): void;
  onToggleTriggerNow(v: boolean): void;
};

export default function DelayPicker({ triggerNow, selectedMs, onSelect, onToggleTriggerNow }: Props) {
  
  return (
    <View style={styles.wrap}>
      <View style={styles.toggleRow}>
        <Pressable onPress={() => onToggleTriggerNow(true)} style={[styles.toggleBtn, triggerNow && styles.active]}>
          <Text style={[styles.toggleTxt, triggerNow && styles.activeTxt]}>Trigger Now</Text>
        </Pressable>
        <Pressable onPress={() => onToggleTriggerNow(false)} style={[styles.toggleBtn, !triggerNow && styles.active]}>
          <Text style={[styles.toggleTxt, !triggerNow && styles.activeTxt]}>Delay</Text>
        </Pressable>
      </View>

      {!triggerNow && (
        <View style={styles.grid}>
          {DELAYS.map(d => (
            <Pressable key={d.label}
              onPress={() => onSelect(d.ms)}
              style={[styles.pill, selectedMs === d.ms && styles.pillActive]}>
              <Text style={[styles.pillTxt, selectedMs === d.ms && styles.pillTxtActive]}>{d.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24 },
  toggleRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  toggleBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#4B5563' },
  active: { backgroundColor: '#111827', borderColor: '#111827' },
  toggleTxt: { color: '#111827', fontWeight: '600' },
  activeTxt: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, justifyContent: 'center' },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#9CA3AF' },
  pillActive: { backgroundColor: '#111827', borderColor: '#111827' },
  pillTxt: { color: '#111827', fontWeight: '600' },
  pillTxtActive: { color: '#fff' },
});
