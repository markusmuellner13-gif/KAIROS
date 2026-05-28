import { Storage, Appointment, Reminder, ChatMessage, UserProfile } from './storage';
import { STORAGE_KEYS, GREETINGS, ASSISTANT_NAME } from '../constants/config';
import { scheduleSmartReminders } from './notifications';

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function isToday(isoString: string): boolean {
  const d = new Date(isoString);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isTomorrow(isoString: string): boolean {
  const d = new Date(isoString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.toDateString() === tomorrow.toDateString();
}

export async function getGreeting(): Promise<string> {
  const tod = getTimeOfDay();
  const profile = await Storage.loadSecure<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  const base = randomFrom(GREETINGS[tod]);
  const name = profile?.name ? `, ${profile.name}` : '';
  return `${base.replace('!', `${name}!`)}`;
}

export async function getDailyBrief(): Promise<string> {
  const now = new Date();
  const appointments = (await Storage.load<Appointment[]>(STORAGE_KEYS.APPOINTMENTS)) ?? [];
  const reminders = (await Storage.load<Reminder[]>(STORAGE_KEYS.REMINDERS)) ?? [];
  const profile = await Storage.loadSecure<UserProfile>(STORAGE_KEYS.USER_PROFILE);

  const todayAppts = appointments.filter(a => isToday(a.date + 'T' + a.time));
  const tomorrowAppts = appointments.filter(a => isTomorrow(a.date + 'T' + a.time));
  const pendingReminders = reminders.filter(r => !r.completed && new Date(r.datetime) > now);

  let brief = '';

  if (todayAppts.length === 0 && pendingReminders.length === 0) {
    brief = "Your schedule is clear today. A great day to stay focused or catch up on things.";
  } else {
    const parts: string[] = [];
    if (todayAppts.length > 0) {
      const apptList = todayAppts.map(a => `${a.title} at ${a.time}`).join(', ');
      parts.push(`You have ${todayAppts.length} appointment${todayAppts.length > 1 ? 's' : ''} today: ${apptList}.`);
    }
    if (pendingReminders.length > 0) {
      parts.push(`${pendingReminders.length} reminder${pendingReminders.length > 1 ? 's' : ''} pending.`);
    }
    brief = parts.join(' ');
  }

  if (tomorrowAppts.length > 0) {
    brief += ` Tomorrow: ${tomorrowAppts.map(a => a.title).join(', ')}.`;
  }

  const sportDays = profile?.sportDays ?? ['Monday', 'Wednesday', 'Friday'];
  const dayName = now.toLocaleDateString('en', { weekday: 'long' });
  if (sportDays.includes(dayName)) {
    const sportTime = profile?.sportTime ?? '18:00';
    brief += ` Today is a sport day — workout at ${sportTime}.`;
  }

  return brief;
}

export async function processUserInput(input: string): Promise<string> {
  const lower = input.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|what's up|sup|howdy)/i.test(lower)) {
    return await getGreeting();
  }

  // Time queries
  if (lower.includes('what time') || lower.includes('current time')) {
    const now = new Date();
    return `It is currently ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
  }

  // Date queries
  if (lower.includes('what day') || lower.includes('today\'s date') || lower.includes('what date')) {
    return `Today is ${formatDate(new Date().toISOString())}.`;
  }

  // Schedule queries
  if (lower.includes('schedule') || lower.includes('appointments') || lower.includes('what do i have')) {
    return await getDailyBrief();
  }

  // Sleep reminder
  if (lower.includes('sleep') || lower.includes('bedtime')) {
    const profile = await Storage.loadSecure<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    const sleepTime = profile?.sleepTime ?? '23:00';
    return `Your sleep schedule is set for ${sleepTime}. I'll remind you when it's time. Good rest is essential for peak performance.`;
  }

  // Sport queries
  if (lower.includes('sport') || lower.includes('workout') || lower.includes('gym') || lower.includes('exercise')) {
    const profile = await Storage.loadSecure<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    const days = profile?.sportDays?.join(', ') ?? 'Monday, Wednesday, Friday';
    const time = profile?.sportTime ?? '18:00';
    return `Your workout schedule: ${days} at ${time}. Consistency is key to peak physical performance.`;
  }

  // Bible / scripture queries
  if (lower.includes('bible') || lower.includes('verse') || lower.includes('scripture') || lower.includes('gospel') || lower.includes('holy') || lower.includes('pray') || lower.includes('catholic')) {
    const { getLiturgicalSeason, getLiturgicalSeasonLabel, checkFeastDay, getRandomVerseForToday } = await import('./bible');
    const sett = await Storage.load<{ bibleLanguage?: 'en' | 'de' }>(STORAGE_KEYS.SETTINGS);
    const lang = sett?.bibleLanguage ?? 'en';
    const verse = getRandomVerseForToday(lang);
    const season = getLiturgicalSeason();
    const feast = checkFeastDay();
    const feastNote = feast ? ` ${lang === 'de' ? 'Heute ist' : 'Today is'} ${feast}.` : '';
    const quote = lang === 'de' ? '„' : '"';
    const quoteClose = lang === 'de' ? '"' : '"';
    return `${getLiturgicalSeasonLabel(season, lang)}.${feastNote}\n\n${quote}${verse.text}${quoteClose}\n— ${verse.reference}`;
  }

  // Stock queries
  if (lower.includes('stock') || lower.includes('market') || lower.includes('trade') || lower.includes('invest')) {
    return "I can analyse your watchlist stocks and show market trends in the Stocks tab. Note: I can't automatically trade on TradeRepublic as they don't offer a public trading API, but I provide smart buy/sell analysis signals.";
  }

  // Store hours
  if (lower.includes('store') || lower.includes('shop') || lower.includes('open') || lower.includes('hours')) {
    return "To check store hours, head to the Schedule tab and use the Store Finder. I'll show opening times for stores near you. Make sure location access is enabled.";
  }

  // Reminder creation intent
  if (lower.includes('remind me') || lower.includes('set reminder') || lower.includes('don\'t forget')) {
    return "I can set a reminder for you. Go to the Schedule tab and tap 'Add Reminder', or tell me: 'Remind me to [task] at [time]' and I'll parse it for you.";
  }

  // Appointment creation intent
  if (lower.includes('appointment') || lower.includes('meeting') || lower.includes('add event')) {
    return "I'll add that to your calendar. Head to the Schedule tab and tap 'New Appointment', or give me the details: title, date, and time.";
  }

  // Weather (informational - can't call API without key)
  if (lower.includes('weather')) {
    return "I don't have live weather data configured yet. Add your weather API key in Settings to enable real-time weather updates and smart outdoor planning.";
  }

  // Daily brief explicitly requested
  if (lower.includes('brief') || lower.includes('overview') || lower.includes('summary') || lower.includes('my day')) {
    return await getDailyBrief();
  }

  // Capabilities
  if (lower.includes('what can you do') || lower.includes('help') || lower.includes('capabilities')) {
    return `I'm ${ASSISTANT_NAME} — your Artificial Reasoning Intelligence Assistant. I can: manage your appointments and reminders, give you smart daily briefs, track your workout schedule, analyse stock markets, find store opening hours, send smart notifications, and respond to your voice commands. Just ask!`;
  }

  // Default intelligent response
  const responses = [
    `Understood. I'm processing your request. Could you be more specific so I can assist more precisely?`,
    `I'm here to help. For best results, try: 'What's my schedule?', 'Remind me to...', or check the specific tab for that feature.`,
    `Got it. I don't have a specific response for that yet, but I'm always learning. Try asking about your schedule, reminders, stocks, or store hours.`,
  ];
  return randomFrom(responses);
}

export async function saveChatMessage(message: ChatMessage): Promise<void> {
  const history = (await Storage.load<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY)) ?? [];
  history.push(message);
  // Keep last 100 messages only
  const trimmed = history.slice(-100);
  await Storage.save(STORAGE_KEYS.CHAT_HISTORY, trimmed);
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  return (await Storage.load<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY)) ?? [];
}

export async function clearChatHistory(): Promise<void> {
  await Storage.remove(STORAGE_KEYS.CHAT_HISTORY);
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
