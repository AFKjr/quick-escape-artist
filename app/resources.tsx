import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SafetyResourcesScreen() {
  const openWebPage = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Could not open URL', err));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Resources</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.introduction}>
          Below are some resources that may be helpful if you find yourself in an unsafe situation.
          Remember, this app is just a tool - if you're in real danger, please seek help from
          authorities or trusted resources.
        </Text>
        
        <View style={styles.resourceItem}>
          <Text style={styles.resourceTitle}>Emergency Services</Text>
          <Text style={styles.resourceDescription}>
            In case of emergency, contact your local emergency services:
          </Text>
          <Pressable 
            style={styles.resourceButton} 
            onPress={() => Linking.openURL('tel:911')}
          >
            <Text style={styles.resourceButtonText}>911 (United States)</Text>
          </Pressable>
        </View>
        
        <View style={styles.resourceItem}>
          <Text style={styles.resourceTitle}>National Domestic Violence Hotline</Text>
          <Text style={styles.resourceDescription}>
            Available 24/7 for crisis intervention, safety planning, and referrals to local resources.
          </Text>
          <Pressable 
            style={styles.resourceButton} 
            onPress={() => Linking.openURL('tel:18007997233')}
          >
            <Text style={styles.resourceButtonText}>1-800-799-SAFE (7233)</Text>
          </Pressable>
          <Pressable 
            style={[styles.resourceButton, styles.secondaryButton]} 
            onPress={() => openWebPage('https://www.thehotline.org')}
          >
            <Text style={styles.resourceButtonText}>Visit Website</Text>
          </Pressable>
        </View>
        
        <View style={styles.resourceItem}>
          <Text style={styles.resourceTitle}>RAINN (Rape, Abuse & Incest National Network)</Text>
          <Text style={styles.resourceDescription}>
            The nation's largest anti-sexual violence organization.
          </Text>
          <Pressable 
            style={styles.resourceButton} 
            onPress={() => Linking.openURL('tel:18006564673')}
          >
            <Text style={styles.resourceButtonText}>1-800-656-HOPE (4673)</Text>
          </Pressable>
          <Pressable 
            style={[styles.resourceButton, styles.secondaryButton]} 
            onPress={() => openWebPage('https://www.rainn.org')}
          >
            <Text style={styles.resourceButtonText}>Visit Website</Text>
          </Pressable>
        </View>
        
        <View style={styles.resourceItem}>
          <Text style={styles.resourceTitle}>Crisis Text Line</Text>
          <Text style={styles.resourceDescription}>
            Free 24/7 support for those in crisis. Text with a trained Crisis Counselor.
          </Text>
          <Pressable 
            style={styles.resourceButton} 
            onPress={() => Linking.openURL('sms:741741&body=HOME')}
          >
            <Text style={styles.resourceButtonText}>Text HOME to 741741</Text>
          </Pressable>
          <Pressable 
            style={[styles.resourceButton, styles.secondaryButton]} 
            onPress={() => openWebPage('https://www.crisistextline.org')}
          >
            <Text style={styles.resourceButtonText}>Visit Website</Text>
          </Pressable>
        </View>
        
        <Text style={styles.disclaimer}>
          This app is designed to help you exit uncomfortable situations, but it is not a substitute
          for professional help in case of real danger or emergency.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  introduction: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 24,
  },
  resourceItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  resourceButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryButton: {
    backgroundColor: '#374151',
  },
  resourceButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  disclaimer: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
});
