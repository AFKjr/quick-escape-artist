import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

// Steps for onboarding
const ONBOARDING_STEPS = [
  {
    title: "Welcome to Quick Escape Artist",
    description: "Your personal safety app that helps you get out of uncomfortable situations discreetly.",
    image: require('../assets/images/react-logo.png'), // Replace with actual onboarding images
  },
  {
    title: "Fake Call",
    description: "Get a realistic fake call from a contact of your choice. Perfect for creating an excuse to step away.",
    image: require('../assets/images/react-logo.png'),
  },
  {
    title: "Fake Text",
    description: "Receive an urgent message notification that gives you a reason to leave.",
    image: require('../assets/images/react-logo.png'),
  },
  {
    title: "Scheduling",
    description: "Schedule your fake call or text to arrive exactly when you need it.",
    image: require('../assets/images/react-logo.png'),
  },
  {
    title: "Customization",
    description: "Choose different contacts and message templates to suit your needs.",
    image: require('../assets/images/react-logo.png'),
  }
];

// Key for storing onboarding status
const ONBOARDING_KEY = 'quick-escape-artist-onboarding-completed';

export default function OnboardingScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const handleSkip = () => {
    completeOnboarding();
  };
  
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      navigation.replace('Home');
    } catch (error) {
      console.error('Error storing onboarding status:', error);
      navigation.replace('Home');
    }
  };
  
  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  
  return (
    <View style={styles.container}>
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
      
      <View style={styles.content}>
        <Image source={currentStepData.image} style={styles.image} />
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.paginationDot,
                index === currentStep && styles.paginationDotActive
              ]} 
            />
          ))}
        </View>
        
        <Pressable style={styles.nextButton} onPress={handleNext}>
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
    marginBottom: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111827',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 24,
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
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
});
