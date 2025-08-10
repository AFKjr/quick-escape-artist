import { DEFAULT_MESSAGES, MessageTemplate } from '@/utils/customization';
import { loadPreferences } from '@/utils/preferences';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function MessagesMockScreen() {
  const [message, setMessage] = useState<MessageTemplate>(DEFAULT_MESSAGES[0]);
  const { messageId } = useLocalSearchParams();
  
  useEffect(() => {
    const getMessageInfo = async () => {
      try {
        const prefs = await loadPreferences();
        const id = messageId as string || prefs.defaultMessageId;
        
        // Find the message template
        const messageTemplate = DEFAULT_MESSAGES.find(m => m.id === id) || DEFAULT_MESSAGES[0];
        if (messageTemplate) {
          setMessage(messageTemplate);
        }
      } catch (error) {
        console.error('Error loading message info:', error);
      }
    };
    
    getMessageInfo();
  }, [messageId]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
      </View>
      
      <View style={styles.bubbleWrap}>
        <Text style={styles.senderName}>Mom</Text>
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
    marginBottom: 4
  },
  bubble: { 
    backgroundColor: '#e5e7eb', 
    padding: 12, 
    borderRadius: 16, 
    maxWidth: '80%' 
  },
  msg: { 
    color: '#111827' 
  },
  timestamp: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4
  }
});
