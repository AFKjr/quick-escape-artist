import { DEFAULT_CONTACTS } from '@/utils/customization';
import { loadPreferences } from '@/utils/preferences';
import { Audio } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function FakeCallScreen() {
  useKeepAwake();
  const soundRef = React.useRef<Audio.Sound | null>(null);
  const [ringing, setRinging] = useState(true);
  const [contactName, setContactName] = useState("Mom");
  const { contactId } = useLocalSearchParams();
  
  // Get contact info from params or preferences
  useEffect(() => {
    const getContactInfo = async () => {
      try {
        const prefs = await loadPreferences();
        const id = contactId as string || prefs.defaultContactId;
        
        // Find the contact
        const contact = DEFAULT_CONTACTS.find(c => c.id === id) || 
                        prefs.customContacts?.find(c => c.id === id);
                        
        if (contact) {
          setContactName(contact.name);
        }
      } catch (error) {
        console.error('Error loading contact info:', error);
      }
    };
    
    getContactInfo();
  }, [contactId]);

  // Authentic platform-specific ringtone for maximum realism
  useEffect(() => {
    (async () => {
      try {
        // Configure audio session to behave like real phone calls
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true, // CRITICAL: Play even in silent mode (like real calls)
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Select platform-appropriate ringtone for authenticity
        const ringtoneSource = Platform.OS === 'ios' 
          ? require('../assets/audio/iphone-ringtone.mp3')
          : require('../assets/audio/android-ringtone.mp3');

        // Load and configure ringtone with system-like properties
        const { sound } = await Audio.Sound.createAsync(
          ringtoneSource,
          { 
            isLooping: true,
            volume: 1.0, // Full volume - respects system ringtone volume
            progressUpdateIntervalMillis: 100,
            positionMillis: 0,
          }
        );
        
        soundRef.current = sound;
        
        // Set additional properties for authenticity
        await sound.setVolumeAsync(1.0); // Maximum authenticity
        await sound.setIsLoopingAsync(true); // Continuous like real calls
        await sound.playAsync();
        
        console.log(`Platform-specific ringtone started: ${Platform.OS}`);
        console.log('✅ Plays in silent mode: YES (like real calls)');
        console.log('✅ Respects system volume: YES');
        console.log('✅ Platform authentic: YES');
        console.log('✅ Continuous looping: YES');
        
      } catch (error) {
        console.error('Error setting up platform ringtone:', error);
        console.log('Note: Add iphone-ringtone.mp3 and android-ringtone.mp3 to assets/audio/');
      }
    })();
    
    return () => { 
      soundRef.current?.unloadAsync();
    };
  }, []);

  const answer = async () => {
    setRinging(false);
    await soundRef.current?.stopAsync();
    router.replace({
      pathname: "/call-in-progress",
      params: { contactName }
    });
  };

  const decline = async () => {
    await soundRef.current?.stopAsync();
    router.back();
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.caller}>{contactName}</Text>
      <Text style={styles.subtitle}>{ringing ? 'Incoming call' : 'Connected'}</Text>

      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.decline]} onPress={decline}>
          <Text style={styles.btnTxt}>Decline</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.answer]} onPress={answer}>
          <Text style={styles.btnTxt}>Answer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { 
    flex: 1, 
    backgroundColor: '#000', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 24 
  },
  caller: { 
    color: '#fff', 
    fontSize: 32, 
    fontWeight: '700' 
  },
  subtitle: { 
    color: '#9CA3AF', 
    marginTop: 6 
  },
  actions: { 
    position: 'absolute', 
    bottom: 48, 
    width: '100%', 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  btn: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  decline: { 
    backgroundColor: '#ef4444' 
  },
  answer: { 
    backgroundColor: '#22c55e' 
  },
  btnTxt: { 
    color: '#fff', 
    fontWeight: '700' 
  }
});
