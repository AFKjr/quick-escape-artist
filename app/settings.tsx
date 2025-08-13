import { ContactOption, DEFAULT_CONTACTS, DEFAULT_MESSAGES, MessageTemplate } from '@/utils/customization';
import { loadPreferences, savePreferences } from '@/utils/preferences';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

// Available ringtone options
const RINGTONE_OPTIONS = [
  {
    id: 'quick-escape',
    name: 'Quick Escape',
    file: require('../assets/audio/Quick Escape Ringtone.mp3')
  },
  {
    id: 'goat-scream',
    name: 'Goat Scream',
    file: require('../assets/audio/suara-goat-berteriak-367222.mp3')
  }
];

export default function SettingsScreen() {
  const [selectedContactId, setSelectedContactId] = useState<string>('mom');
  const [selectedMessageId, setSelectedMessageId] = useState<string>('urgent');
  const [selectedRingtoneId, setSelectedRingtoneId] = useState<string>('quick-escape');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Custom contact/message state
  const [customContacts, setCustomContacts] = useState<ContactOption[]>([]);
  const [customMessages, setCustomMessages] = useState<MessageTemplate[]>([]);
  const [allContacts, setAllContacts] = useState<ContactOption[]>([]);
  const [allMessages, setAllMessages] = useState<MessageTemplate[]>([]);
  
  // Modal state for adding custom items
  const [showContactModal, setShowContactModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState('');
  const [newMessageTitle, setNewMessageTitle] = useState('');
  const [newMessageBody, setNewMessageBody] = useState('');

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const prefs = await loadPreferences();
      setSelectedContactId(prefs.defaultContactId);
      setSelectedMessageId(prefs.defaultMessageId);
      setSelectedRingtoneId(prefs.defaultRingtoneId || 'quick-escape');
      setVibrationEnabled(prefs.vibrationEnabled);
      
      // Load custom contacts and messages
      const customCont = prefs.customContacts || [];
      const customMsgs = prefs.customMessages || [];
      setCustomContacts(customCont);
      setCustomMessages(customMsgs);
      
      // Combine default and custom options
      setAllContacts([...DEFAULT_CONTACTS, ...customCont]);
      setAllMessages([...DEFAULT_MESSAGES, ...customMsgs]);
      
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
        defaultRingtoneId: selectedRingtoneId,
        vibrationEnabled,
        customContacts,
        customMessages,
      });
      router.back();
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const addCustomContact = () => {
    if (!newContactName.trim()) {
      Alert.alert('Error', 'Please enter a contact name');
      return;
    }
    
    const newContact: ContactOption = {
      id: `custom_${Date.now()}`,
      name: newContactName.trim(),
      relationship: newContactRelationship.trim() || 'Custom'
    };
    
    const updatedCustomContacts = [...customContacts, newContact];
    setCustomContacts(updatedCustomContacts);
    setAllContacts([...DEFAULT_CONTACTS, ...updatedCustomContacts]);
    
    // Clear form and close modal
    setNewContactName('');
    setNewContactRelationship('');
    setShowContactModal(false);
  };

  const addCustomMessage = () => {
    if (!newMessageTitle.trim() || !newMessageBody.trim()) {
      Alert.alert('Error', 'Please enter both title and message');
      return;
    }
    
    const newMessage: MessageTemplate = {
      id: `custom_${Date.now()}`,
      title: newMessageTitle.trim(),
      body: newMessageBody.trim()
    };
    
    const updatedCustomMessages = [...customMessages, newMessage];
    setCustomMessages(updatedCustomMessages);
    setAllMessages([...DEFAULT_MESSAGES, ...updatedCustomMessages]);
    
    // Clear form and close modal
    setNewMessageTitle('');
    setNewMessageBody('');
    setShowMessageModal(false);
  };

  const deleteCustomContact = (contactId: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this custom contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedCustomContacts = customContacts.filter(c => c.id !== contactId);
            setCustomContacts(updatedCustomContacts);
            setAllContacts([...DEFAULT_CONTACTS, ...updatedCustomContacts]);
            
            // If deleted contact was selected, reset to default
            if (selectedContactId === contactId) {
              setSelectedContactId('mom');
            }
          }
        }
      ]
    );
  };

  const deleteCustomMessage = (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this custom message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedCustomMessages = customMessages.filter(m => m.id !== messageId);
            setCustomMessages(updatedCustomMessages);
            setAllMessages([...DEFAULT_MESSAGES, ...updatedCustomMessages]);
            
            // If deleted message was selected, reset to default
            if (selectedMessageId === messageId) {
              setSelectedMessageId('urgent');
            }
          }
        }
      ]
    );
  };

  const renderContactItem = ({ item }: { item: ContactOption }) => (
    <View style={styles.itemWrapper}>
      <Pressable
        style={[styles.optionItem, selectedContactId === item.id && styles.selectedItem]}
        onPress={() => setSelectedContactId(item.id)}
      >
        <Text style={[styles.optionName, selectedContactId === item.id && styles.selectedText]}>
          {item.name}
        </Text>
        <Text style={styles.optionDetails}>{item.relationship}</Text>
      </Pressable>
      {item.id.startsWith('custom_') && (
        <Pressable
          style={styles.deleteButton}
          onPress={() => deleteCustomContact(item.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </Pressable>
      )}
    </View>
  );

  const renderMessageItem = ({ item }: { item: MessageTemplate }) => (
    <View style={styles.itemWrapper}>
      <Pressable
        style={[styles.optionItem, selectedMessageId === item.id && styles.selectedItem]}
        onPress={() => setSelectedMessageId(item.id)}
      >
        <Text style={[styles.optionName, selectedMessageId === item.id && styles.selectedText]}>
          {item.title}
        </Text>
        <Text style={styles.optionDetails}>{item.body}</Text>
      </Pressable>
      {item.id.startsWith('custom_') && (
        <Pressable
          style={styles.deleteButton}
          onPress={() => deleteCustomMessage(item.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </Pressable>
      )}
    </View>
  );

  const renderRingtoneItem = ({ item }: { item: typeof RINGTONE_OPTIONS[0] }) => (
    <Pressable
      style={[styles.optionItem, selectedRingtoneId === item.id && styles.selectedItem]}
      onPress={() => setSelectedRingtoneId(item.id)}
    >
      <Text style={[styles.optionName, selectedRingtoneId === item.id && styles.selectedText]}>
        {item.name}
      </Text>
      <Text style={styles.optionDetails}>Ringtone</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.messageSection}>
          <Text style={styles.sectionTitle}>Choose Default Contact</Text>
          <Pressable style={styles.addButton} onPress={() => setShowContactModal(true)}>
            <Text style={styles.addButtonText}>+ Add Custom</Text>
          </Pressable>
        </View>
      <FlatList
        data={allContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      <View style={styles.messageSection}>
        <Text style={styles.sectionTitle}>Choose Default Message</Text>
        <Pressable style={styles.addButton} onPress={() => setShowMessageModal(true)}>
          <Text style={styles.addButtonText}>+ Add Custom</Text>
        </Pressable>
      </View>
      <FlatList
        data={allMessages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      <View style={styles.messageSection}>
        <Text style={styles.sectionTitle}>Choose Ringtone</Text>
      </View>
      <FlatList
        data={RINGTONE_OPTIONS}
        renderItem={renderRingtoneItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
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

      {/* Custom Contact Modal */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Contact</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Contact Name (required)"
              value={newContactName}
              onChangeText={setNewContactName}
              maxLength={50}
            />
            
            <TextInput
              style={styles.textInput}
              placeholder="Relationship (optional)"
              value={newContactRelationship}
              onChangeText={setNewContactRelationship}
              maxLength={30}
            />
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewContactName('');
                  setNewContactRelationship('');
                  setShowContactModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addCustomContact}
              >
                <Text style={styles.confirmButtonText}>Add Contact</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Message Modal */}
      <Modal
        visible={showMessageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Message</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Message Title (required)"
              value={newMessageTitle}
              onChangeText={setNewMessageTitle}
              maxLength={50}
            />
            
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Message Content (required)"
              value={newMessageBody}
              onChangeText={setNewMessageBody}
              multiline={true}
              numberOfLines={4}
              maxLength={200}
            />
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewMessageTitle('');
                  setNewMessageBody('');
                  setShowMessageModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addCustomMessage}
              >
                <Text style={styles.confirmButtonText}>Add Message</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  backButton: {
    color: '#3B82F6',
    fontSize: 20,
  },
  messageSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40, 
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingVertical: 40,
  },
  itemWrapper: {
    position: 'relative',
  },
  optionItem: {
    backgroundColor: '#E5E7EB',
    padding: 15,
    borderRadius: 8,
    minWidth: 140, // Increased from 120 for better mobile spacing
    maxWidth: 200, // Prevent items from getting too wide
    flex: 1,
  },
  selectedItem: {
    backgroundColor: '#111827',
  },
  optionName: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 5,
    fontSize: 15, 
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  optionDetails: {
    color: '#4B5563',
    fontSize: 13, 
    lineHeight: 16,
    flexWrap: 'wrap',
  },
  deleteButton: {
    position: 'absolute',
    top: -2,
    right: 150,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 16,
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
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#111827',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
