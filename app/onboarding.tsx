import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

interface OnboardingStep {
  title: string;
  description: string;
  tips?: string[];
  image: ImageSourcePropType;
  backgroundColor?: string;
}

// Key for storing onboarding status
const ONBOARDING_KEY = 'quick-escape-artist-onboarding-completed';

// Steps for onboarding
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Welcome to Quick Escape Artist",
    description: "Your social lifesaver for awkward situations! Escape boring conversations and dull gatherings with style.",
    tips: ["That date going nowhere?", "Trapped in a boring conversation?", "Dinner with the in-laws dragging on?"],
    image: require('../assets/images/react-logo.png'), // Replace with actual onboarding images
    backgroundColor: '#F0F4F8',
  },
  {
    title: "Fake Call to the Rescue",
    description: "Receive a perfectly-timed 'emergency' call that demands your immediate attention.",
    tips: ["Act surprised when it rings", "Use phrases like 'Oh no, I have to take this!'", "The perfect excuse to escape!"],
    image: require('../assets/images/react-logo.png'),
    backgroundColor: '#F3F1F5',
  },
  {
    title: "SOS Text Messages",
    description: "Get urgent-looking messages that give you the perfect excuse to make your exit.",
    tips: ["Show your screen with a dramatic sigh", "Say 'I'm so sorry, but this is urgent'", "Choose from hilarious message templates"],
    image: require('../assets/images/react-logo.png'),
    backgroundColor: '#F1F8F5',
  },
  {
    title: "Plan Your Great Escape",
    description: "Set up your exit strategy in advance with perfectly timed calls and messages.",
    tips: ["Schedule before that awful meeting starts", "Set for 30 mins into a bad date", "Your ticket to freedom is just a timer away"],
    image: require('../assets/images/react-logo.png'),
    backgroundColor: '#FFF8F0',
  },
  {
    title: "Your Escape, Your Way",
    description: "Customize your escape plan with different callers and message scenarios.",
    tips: ["Boss calling about 'urgent work'?", "'Mom needs help immediately'?", "You decide which excuse works best!"],
    image: require('../assets/images/react-logo.png'),
    backgroundColor: '#F0F4F8',
  }
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      // Move to the next step
      setCurrentStep(currentStep + 1);
    } else {
      // This is the last step, complete onboarding and go to main app
      completeOnboarding();
    }
  };
  
  const handleSkip = () => {
    completeOnboarding();
  };
  
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      // Force navigation to the main tab screen
      router.replace("/(tabs)");
    } catch (error) {
      console.error('Error storing onboarding status:', error);
      router.replace("/(tabs)");
    }
  };
  
  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  
  return (
    <View style={[
      styles.container, 
      {backgroundColor: currentStepData.backgroundColor || '#F9FAFB'}
    ]}>
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
      
      <View style={styles.content}>
        <Image source={currentStepData.image} style={styles.image} />
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>
        
        {currentStepData.tips && (
          <View style={styles.tipsContainer}>
            {currentStepData.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <View style={styles.tipBullet}>
                  <Text style={styles.bulletText}>•</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_STEPS.map((_, index) => (
            <Pressable 
              key={index}
              onPress={() => setCurrentStep(index)}
              style={[
                styles.paginationDot,
                index === currentStep && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
        
        <Pressable 
          style={styles.nextButton} 
          onPress={handleNext}
          android_ripple={{color: 'rgba(255,255,255,0.2)'}}
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// Helper function to check if onboarding has been completed
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginTop: 40,
  },
  skipText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111827',
  },
  description: {
    fontSize: 17,
    textAlign: 'center',
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  tipsContainer: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipBullet: {
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },
  tipText: {
    fontSize: 16,
    color: '#4B5563',
    flex: 1,
  },
  footer: {
    marginBottom: 50,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#111827',
    width: 16,
  },
  nextButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
});
