import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Fun social survival tips
const SURVIVAL_TIPS = [
  {
    title: "The Bathroom Escape",
    description: "A classic that never fails. Say 'Excuse me, I need to use the restroom' and then take your sweet time returning. For advanced users: return with a made-up stomach issue story.",
    emoji: "🚽"
  },
  {
    title: "The Mysterious Text",
    description: "Look at your phone with concern and say 'Oh no! I completely forgot about...' then trail off vaguely. No one will question what you forgot.",
    emoji: "📱"
  },
  {
    title: "The Early Morning Excuse",
    description: "No matter what time it is, you can always say 'I should get going, I have an early start tomorrow.' Works best when said while looking at your watch with concern.",
    emoji: "🌅"
  },
  {
    title: "The Fake Friend Spotting",
    description: "Wave enthusiastically at a non-existent friend across the room, then excuse yourself to 'quickly say hi.' Disappear into the crowd never to return.",
    emoji: "👋"
  },
  {
    title: "The Pet Emergency",
    description: "Tell them your pet sitter just texted that your pet is acting strange. Everyone loves animals and won't question you leaving to check on your 'poor kitty.'",
    emoji: "🐱"
  },
  {
    title: "The Battery Drain",
    description: "Say 'My phone's about to die and I'm expecting an important call.' Then leave to 'find a charger' and never come back.",
    emoji: "🔋"
  },
  {
    title: "The Forgotten Appointment",
    description: "Slap your forehead and exclaim, 'I completely forgot I have a dentist appointment!' No one wants to hear about dental work, so they'll let you go easily.",
    emoji: "🦷"
  },
  {
    title: "The Food in the Oven",
    description: "Pretend you just remembered you left food cooking at home. 'Oh no, I left the oven on!' works as both an exit strategy and makes you seem endearingly forgetful.",
    emoji: "🔥"
  }
];

export default function SocialSurvivalGuideScreen() {
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  
  const toggleTip = (index: number) => {
    setExpandedTip(expandedTip === index ? null : index);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Social Survival Guide</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
      </View>
      
      <Text style={styles.subtitle}>
        Expert tips for awkward situation survivors
      </Text>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {SURVIVAL_TIPS.map((tip, index) => (
          <Pressable 
            key={index} 
            style={[styles.tipCard, expandedTip === index && styles.expandedCard]}
            onPress={() => toggleTip(index)}
          >
            <View style={styles.tipHeader}>
              <Text style={styles.emoji}>{tip.emoji}</Text>
              <Text style={styles.tipTitle}>{tip.title}</Text>
            </View>
            
            {expandedTip === index && (
              <Text style={styles.tipDescription}>{tip.description}</Text>
            )}
          </Pressable>
        ))}
        
        <View style={styles.footerContent}>
          <Text style={styles.footerTitle}>Remember!</Text>
          <Text style={styles.footerText}>
            When all else fails, use Quick Escape Artist for the perfect excuse to leave any situation!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  backButton: {
    color: '#3B82F6',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#111827',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expandedCard: {
    backgroundColor: '#F3F4F6',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  tipDescription: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 12,
    lineHeight: 22,
  },
  footerContent: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4338CA',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 16,
    color: '#4338CA',
    textAlign: 'center',
    opacity: 0.8,
  },
});
