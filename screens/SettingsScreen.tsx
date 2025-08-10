import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { ContactOption, DEFAULT_CONTACTS, DEFAULT_MESSAGES, MessageTemplate } from '../utils/customization';
import { loadPreferences, savePreferences } from '../utils/preferences';

export default function SettingsScreen({ navigation }: any) {
  const [selectedContactId, setSelectedContactId] = useState<string>('mom');
  const [selectedMessageId, setSelectedMessageId] = useState<string>('urgent');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const prefs = await loadPreferences();
      setSelectedContactId(prefs.defaultContactId);
      setSelectedMessageId(prefs.defaultMessageId);
      setVibrationEnabled(prefs.vibrationEnabled);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await savePreferences({
        defaultContactId: selectedContactId,
        defaultMessageId: selectedMessageId,
        vibrationEnabled,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const renderContactItem = ({ item }: { item: ContactOption }) => (
    <Pressable
      style={[styles.optionItem, selectedContactId === item.id && styles.selectedItem]}
      onPress={() => setSelectedContactId(item.id)}
    >
      <Text style={[styles.optionName, selectedContactId === item.id && styles.selectedText]}>
        {item.name}
      </Text>
      <Text style={styles.optionDetails}>{item.relationship}</Text>
    </Pressable>
  );

  const renderMessageItem = ({ item }: { item: MessageTemplate }) => (
    <Pressable
      style={[styles.optionItem, selectedMessageId === item.id && styles.selectedItem]}
      onPress={() => setSelectedMessageId(item.id)}
    >
      <Text style={[styles.optionName, selectedMessageId === item.id && styles.selectedText]}>
        {item.title}
      </Text>
      <Text style={styles.optionDetails}>{item.body}</Text>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <Text style={styles.sectionTitle}>Choose Default Contact</Text>
      <FlatList
        data={DEFAULT_CONTACTS}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <Text style={styles.sectionTitle}>Choose Default Message</Text>
      <FlatList
        data={DEFAULT_MESSAGES}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Vibration</Text>
        <Switch
          value={vibrationEnabled}
          onValueChange={setVibrationEnabled}
          trackColor={{ false: '#767577', true: '#111827' }}
          thumbColor={vibrationEnabled ? '#ffffff' : '#f4f3f4'}
        />
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </Pressable>
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
  },
  listContainer: {
    paddingVertical: 10,
  },
  optionItem: {
    backgroundColor: '#E5E7EB',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 120,
  },
  selectedItem: {
    backgroundColor: '#111827',
  },
  optionName: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 5,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  optionDetails: {
    color: '#4B5563',
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#111827',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
