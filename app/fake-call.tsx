import { DEFAULT_CONTACTS } from '@/utils/customization';
import { loadPreferences } from '@/utils/preferences';
import { Audio } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, Vibration, View } from 'react-native';

// Ringtone mapping
const RINGTONE_FILES = {
  'quick-escape': require('../assets/audio/Quick Escape Ringtone.mp3'),
  'goat-scream': require('../assets/audio/suara-goat-berteriak-367222.mp3'),
};

export default function FakeCallScreen() {
  useKeepAwake();
  const soundRef = React.useRef<Audio.Sound | null>(null);
  const [ringing, setRinging] = useState(true);
  const [contactName, setContactName] = useState("Loading...");
  const { contactId, ringtoneId } = useLocalSearchParams();
  
  // Get contact info from params or preferences
  useEffect(() => {
    const getContactInfo = async () => {
      try {
        const prefs = await loadPreferences();
        const id = contactId as string || prefs.defaultContactId;
        
        // Find the contact (check custom contacts first, then defaults)
        let contact = prefs.customContacts?.find(c => c.id === id);
        
        if (!contact) {
          contact = DEFAULT_CONTACTS.find(c => c.id === id);
        }
        
        // If still no contact found, use the first available contact as fallback
        if (!contact) {
          if (prefs.customContacts && prefs.customContacts.length > 0) {
            contact = prefs.customContacts[0];
          } else {
            contact = DEFAULT_CONTACTS[0]; // Default to "Mom"
          }
        }
        
        if (contact) {
          setContactName(contact.name);
        } else {
          // Ultimate fallback
          setContactName("Unknown Contact");
        }
      } catch (error) {
        setContactName("Emergency Contact"); // Error fallback
      }
    };
    
    getContactInfo();
  }, [contactId]);

  // Play ringtone when fake call screen opens
  useEffect(() => {
    const playFakeCallRingtone = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        // Get the ringtone file based on selection
        const ringtoneKey = Array.isArray(ringtoneId) ? ringtoneId[0] : ringtoneId;
        const selectedRingtone = ringtoneKey && ringtoneKey in RINGTONE_FILES ? ringtoneKey as keyof typeof RINGTONE_FILES : 'quick-escape';
        const ringtoneFile = RINGTONE_FILES[selectedRingtone];

        // Play the selected ringtone as the "incoming call" sound
        const { sound } = await Audio.Sound.createAsync(
          ringtoneFile,
          {
            shouldPlay: true,
            isLooping: true, // Loop for incoming call effect
            volume: 1.0,
          }
        );

        soundRef.current = sound;

        // Call-like vibration pattern
        const callVibration = [0, 1000, 500, 1000, 500, 1000];
        Vibration.vibrate(callVibration, true);
        
      } catch (error) {
        // Fallback vibration
        Vibration.vibrate([0, 1000, 500, 1000], true);
      }
    };

    playFakeCallRingtone();
    
    return () => {
      // Cleanup only if component unmounts, not on contactName changes
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      Vibration.cancel();
    };
  }, [ringtoneId]); // Include ringtoneId to reload when ringtone changes

  const answer = async () => {
    // Stop everything immediately for instant response
    setRinging(false);
    Vibration.cancel();
    
    // Try multiple immediate stop methods in parallel - don't wait for status checks
    if (soundRef.current) {
      // Fire all stop methods immediately without waiting
      soundRef.current.setIsLoopingAsync(false).catch(() => {});
      soundRef.current.stopAsync().catch(() => {});
      soundRef.current.pauseAsync().catch(() => {});
      soundRef.current.setVolumeAsync(0).catch(() => {});
    }
    
    // Navigate immediately - don't wait for sound operations
    router.replace({
      pathname: "/call-in-progress",
      params: { contactName }
    });
    
    // Clean up in background after navigation
    setTimeout(async () => {
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        } catch (error) {
          soundRef.current = null;
        }
      }
    }, 200);
  };

  const decline = async () => {
    // Stop everything immediately for instant response
    setRinging(false);
    Vibration.cancel();
    
    // Try multiple immediate stop methods in parallel - don't wait for status checks
    if (soundRef.current) {
      // Fire all stop methods immediately without waiting
      soundRef.current.setIsLoopingAsync(false).catch(() => {});
      soundRef.current.stopAsync().catch(() => {});
      soundRef.current.pauseAsync().catch(() => {});
      soundRef.current.setVolumeAsync(0).catch(() => {});
    }
    
    // Navigate immediately - don't wait for sound operations
    router.back();
    
    // Clean up in background after navigation
    setTimeout(async () => {
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        } catch (error) {
          soundRef.current = null;
        }
      }
    }, 200);
  };  return (
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
