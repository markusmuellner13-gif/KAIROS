export const ASSISTANT_NAME = 'ARIA';
export const ASSISTANT_FULL_NAME = 'Artificial Reasoning Intelligence Assistant';
export const WAKE_WORDS = ['hey aria', 'aria', 'hey a.r.i.a.'];

export const STORAGE_KEYS = {
  USER_PROFILE: 'aria_user_profile',
  APPOINTMENTS: 'aria_appointments',
  REMINDERS: 'aria_reminders',
  STOCK_WATCHLIST: 'aria_stock_watchlist',
  STOCK_PORTFOLIO: 'aria_stock_portfolio',
  CHAT_HISTORY: 'aria_chat_history',
  SETTINGS: 'aria_settings',
  ROUTINE: 'aria_routine',
  STORE_FAVORITES: 'aria_store_favorites',
};

export const NOTIFICATION_IDS = {
  MORNING_BRIEF: 'morning_brief',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  SPORT_REMINDER: 'sport_reminder',
  SLEEP_REMINDER: 'sleep_reminder',
  STOCK_ALERT: 'stock_alert',
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
