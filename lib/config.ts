export const ASSISTANT_NAME = 'KAIROS';
export const ASSISTANT_FULL_NAME = 'Knowledge And Intelligence Reasoning Operating System';
export const WAKE_WORDS = ['hey kairos', 'kairos', 'hey k.a.i.r.o.s.'];

export const STORAGE_KEYS = {
  USER_PROFILE: 'kairos_user_profile',
  APPOINTMENTS: 'kairos_appointments',
  REMINDERS: 'kairos_reminders',
  STOCK_WATCHLIST: 'kairos_stock_watchlist',
  STOCK_PORTFOLIO: 'kairos_stock_portfolio',
  CHAT_HISTORY: 'kairos_chat_history',
  SETTINGS: 'kairos_settings',
  EMAILS: 'kairos_emails',
  MESSAGES: 'kairos_messages',
  INBOX_SEEDED: 'kairos_inbox_seeded',
  DEMO_DATA_REMOVED: 'kairos_demo_data_removed_v1',
  CONTACTS: 'kairos_contacts',
};

export const DEFAULT_SETTINGS = {
  voiceEnabled: true,
  notificationsEnabled: true,
  currency: 'EUR',
  language: 'en',
  bibleLanguage: 'en' as const,
};

export const GREETINGS = {
  morning: [
    'Good morning! Ready to make today exceptional?',
    "Morning! I've reviewed your schedule. Here's what's ahead.",
    'Rise and shine! Your daily brief is ready.',
  ],
  afternoon: [
    'Good afternoon! How can I assist you?',
    'Afternoon check-in. Everything on track?',
    'Good afternoon! Need anything?',
  ],
  evening: [
    'Good evening! Time to wind down.',
    "Evening! Let's review how today went.",
    'Good evening. Your day is wrapping up nicely.',
  ],
  night: [
    "Still up? Don't forget your sleep schedule.",
    'Late night mode active. Get some rest soon.',
    "Night owl mode. I'm here if you need me.",
  ],
};
