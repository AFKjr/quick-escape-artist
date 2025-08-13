// Types for contact and message customization
export interface ContactOption {
  id: string;
  name: string;
  relationship: string;
  imageUri?: string; // Optional profile image
}

export interface MessageTemplate {
  id: string;
  title: string;
  body: string;
}

// Default contact options
export const DEFAULT_CONTACTS: ContactOption[] = [
  { id: 'mom', name: 'Mom', relationship: 'Family' },
  { id: 'dad', name: 'Dad', relationship: 'Family' },
  { id: 'partner', name: 'Partner', relationship: 'Personal' },
  { id: 'roommate', name: 'Roommate', relationship: 'Personal' },
  { id: 'boss', name: 'Boss', relationship: 'Work' },
  { id: 'coworker', name: 'Coworker', relationship: 'Work' },
  { id: 'friend', name: 'Friend', relationship: 'Personal' },
];

// Default message templates
export const DEFAULT_MESSAGES: MessageTemplate[] = [
  {
    id: 'urgent',
    title: 'URGENT',
    body: 'Hey, I need you right now — urgent.'
  },
  {
    id: 'emergency',
    title: 'Emergency',
    body: 'Emergency at home. Call me ASAP!'
  },
  {
    id: 'work',
    title: 'Work Emergency',
    body: 'Critical issue at work. Need you to check your email right away.'
  },
  {
    id: 'personal',
    title: 'Personal Matter',
    body: 'We need to talk about something important. Can you call me?'
  },
];

// User preferences management
export interface UserPreferences {
  defaultContactId: string;
  defaultMessageId: string;
  defaultRingtoneId: string;
  vibrationEnabled: boolean;
  customContacts?: ContactOption[];
  customMessages?: MessageTemplate[];
}

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultContactId: 'mom',
  defaultMessageId: 'urgent',
  defaultRingtoneId: 'quick-escape',
  vibrationEnabled: true,
};
