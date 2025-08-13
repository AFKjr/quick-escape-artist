import { DEFAULT_CONTACTS, DEFAULT_MESSAGES, MessageTemplate } from '@/utils/customization';
import { loadPreferences } from '@/utils/preferences';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, Vibration, View } from 'react-native';

// Ringtone file mapping
const RINGTONE_FILES = {
  'quick-escape': require('../assets/audio/Quick Escape Ringtone.mp3'),
  'goat-scream': require('../assets/audio/suara-goat-berteriak-367222.mp3'),
};

export default function MessagesMockScreen() {
  const [message, setMessage] = useState<MessageTemplate>(DEFAULT_MESSAGES[0]);
  const [contactName, setContactName] = useState("Mom");
  const { messageId, contactId, ringtoneId } = useLocalSearchParams();
  const soundRef = useRef<Audio.Sound | null>(null);
  
  useEffect(() => {
    const getMessageInfo = async () => {
      try {
        const prefs = await loadPreferences();
        const msgId = messageId as string || prefs.defaultMessageId;
        const ctId = contactId as string || prefs.defaultContactId;
        
        // Find the message template (check custom messages first, then defaults)
        const messageTemplate = prefs.customMessages?.find(m => m.id === msgId) ||
                                DEFAULT_MESSAGES.find(m => m.id === msgId) || 
                                DEFAULT_MESSAGES[0];
        if (messageTemplate) {
          setMessage(messageTemplate);
        }
        
        // Find the contact
        const contact = DEFAULT_CONTACTS.find(c => c.id === ctId) || 
                        prefs.customContacts?.find(c => c.id === ctId);
                        
        if (contact) {
          setContactName(contact.name);
        }
      } catch (error) {
        // Handle error silently
      }
    };
    
    getMessageInfo();
  }, [messageId, contactId]);

  // Play ringtone when fake message screen opens
  useEffect(() => {
    const playMessageRingtone = async () => {
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

        // Play the selected ringtone as the "incoming message" sound
        const { sound } = await Audio.Sound.createAsync(
          ringtoneFile,
          {
            shouldPlay: true,
            isLooping: true, // Loop for incoming message effect
            volume: 1.0,
          }
        );

        soundRef.current = sound;

        // Message-like vibration pattern (shorter than calls)
        const messageVibration = [0, 300, 200, 300];
        Vibration.vibrate(messageVibration, true);
        
      } catch (error) {
        // Fallback vibration
        Vibration.vibrate([0, 300, 200, 300], true);
      }
    };

    playMessageRingtone();
    
    return () => {
      // Cleanup when component unmounts
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      Vibration.cancel();
    };
  }, [ringtoneId]); // Include ringtoneId to reload when ringtone changes

  const handleBack = async () => {
    // Stop vibration immediately
    Vibration.cancel();
    
    // Stop sound immediately using multiple methods
    if (soundRef.current) {
      try {
        // Fire all stop methods immediately without waiting
        soundRef.current.setIsLoopingAsync(false).catch(() => {});
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.pauseAsync().catch(() => {});
        soundRef.current.setVolumeAsync(0).catch(() => {});
      } catch (error) {
        // Handle error silently
      }
    }
    
    // Navigate immediately
    router.back();
    
    // Clean up in background
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

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Pressable onPress={handleBack}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
      </View>
      
      <View style={styles.bubbleWrap}>
        <Text style={styles.senderName}>{contactName}</Text>
        <View style={styles.bubble}>
          <Text style={styles.msg}>{message.body}</Text>
        </View>
        <Text style={styles.timestamp}>now</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { 
    flex: 1, 
    backgroundColor: '#fff', 
    paddingTop: 60, 
    paddingHorizontal: 16 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700' 
  },
  backButton: {
    color: '#3B82F6',
    fontSize: 16
  },
  bubbleWrap: { 
    alignItems: 'flex-start' 
  },
  senderName: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 16,
    color: '#111827',
  },
  bubble: { 
    backgroundColor: '#e5e7eb', 
    padding: 12, 
    borderRadius: 16, 
    maxWidth: '85%', // Increased from 80% for better space usage
    minWidth: '50%', // Ensure minimum width for readability
  },
  msg: { 
    color: '#111827',
    fontSize: 16,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  timestamp: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4
  }
});
