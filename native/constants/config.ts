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
  ROUTINE: 'kairos_routine',
  STORE_FAVORITES: 'kairos_store_favorites',
  EMAILS: 'kairos_emails',
  MESSAGES: 'kairos_messages',
  INBOX_SEEDED: 'kairos_inbox_seeded',
};

export const NOTIFICATION_IDS = {
  MORNING_BRIEF: 'morning_brief',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  SPORT_REMINDER: 'sport_reminder',
  SLEEP_REMINDER: 'sleep_reminder',
  STOCK_ALERT: 'stock_alert',
  BIBLE_MORNING: 'bible_morning',
  BIBLE_NOON: 'bible_noon',
  BIBLE_EVENING: 'bible_evening',
};

export const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
export const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

export const DEFAULT_SETTINGS = {
  wakeWordEnabled: true,
  voiceEnabled: true,
  notificationsEnabled: true,
  morningBriefTime: '07:30',
  sleepReminderTime: '22:30',
  sportDays: ['Monday', 'Wednesday', 'Friday'],
  sportTime: '18:00',
  currency: 'EUR',
  language: 'en',
  theme: 'dark',
  bibleNotificationsEnabled: true,
  bibleMorningTime: '07:00',
  bibleNoonTime: '12:00',
  bibleEveningTime: '18:00',
  bibleLanguage: 'en' as const,
};

export const GREETINGS = {
  morning: [
    "Good morning! Ready to make today exceptional?",
    "Morning! I've reviewed your schedule. Here's what's ahead.",
    "Rise and shine! Your daily brief is ready.",
  ],
  afternoon: [
    "Good afternoon! How can I assist you?",
    "Afternoon check-in. Everything on track?",
    "Good afternoon! Need anything?",
  ],
  evening: [
    "Good evening! Time to wind down.",
    "Evening! Let's review how today went.",
    "Good evening. Your day is wrapping up nicely.",
  ],
  night: [
    "Still up? Don't forget your sleep schedule.",
    "Late night mode active. Get some rest soon.",
    "Night owl mode. I'm here if you need me.",
  ],
};
