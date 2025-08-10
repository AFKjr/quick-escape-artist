import React, { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { DELAYS } from '../utils/scheduler';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  triggerNow: boolean;
  selectedMs: number | null;
  onSelect(ms: number): void;
  onToggleTriggerNow(v: boolean): void;
};

export default function DelayPicker({ triggerNow, selectedMs, onSelect, onToggleTriggerNow }: Props) {
  const [awkwardnessLevel, setAwkwardnessLevel] = useState<number>(1);
  const [showAwkwardnessSlider, setShowAwkwardnessSlider] = useState<boolean>(false);
  
  // Easter egg: When user taps multiple times, show awkwardness slider
  const handleToggleAwkwardnessSlider = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAwkwardnessSlider(!showAwkwardnessSlider);
  };
  
  const getAwkwardnessEmoji = () => {
    switch(awkwardnessLevel) {
      case 1: return '😊'; // Fine
      case 2: return '😐'; // Mildly awkward
      case 3: return '😬'; // Pretty awkward
      case 4: return '😰'; // Very awkward
      case 5: return '🤯'; // Maximum awkwardness
      default: return '😊';
    }
  };
  
  const getAwkwardnessText = () => {
    switch(awkwardnessLevel) {
      case 1: return 'Just being polite';
      case 2: return 'Ready to leave';
      case 3: return 'Getting uncomfortable';
      case 4: return 'Need to escape NOW';
      case 5: return 'AWKWARDNESS OVERLOAD';
      default: return 'Just being polite';
    }
  };
  
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

      <Pressable onPress={handleToggleAwkwardnessSlider} style={styles.awkwardnessToggle}>
        <Text style={styles.awkwardnessToggleText}>
          {showAwkwardnessSlider ? 'Hide Awkwardness Meter' : 'Tap to rate awkwardness'}
        </Text>
      </Pressable>
      
      {showAwkwardnessSlider && (
        <View style={styles.awkwardnessContainer}>
          <Text style={styles.awkwardnessEmoji}>{getAwkwardnessEmoji()}</Text>
          <Text style={styles.awkwardnessLabel}>{getAwkwardnessText()}</Text>
          <View style={styles.sliderContainer}>
            {[1, 2, 3, 4, 5].map(level => (
              <Pressable
                key={level}
                onPress={() => setAwkwardnessLevel(level)}
                style={[
                  styles.sliderButton,
                  level <= awkwardnessLevel ? styles.sliderActive : styles.sliderInactive
                ]}
              />
            ))}
          </View>
        </View>
      )}

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
  
  // Awkwardness meter styles
  awkwardnessToggle: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  awkwardnessToggleText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  awkwardnessContainer: {
    marginTop: 12,
    marginBottom: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
  },
  awkwardnessEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  awkwardnessLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 8,
  },
  sliderButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  sliderActive: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  sliderInactive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
});
