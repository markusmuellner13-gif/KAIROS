import { Storage, Appointment, Reminder, ChatMessage, UserProfile } from './storage';
import { STORAGE_KEYS, GREETINGS, ASSISTANT_NAME } from '../constants/config';
import type { BibleLanguage, VerseTheme } from './bible';

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

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function isToday(isoString: string): boolean {
  return new Date(isoString).toDateString() === new Date().toDateString();
}

function isTomorrow(isoString: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Date(isoString).toDateString() === tomorrow.toDateString();
}

async function getBibleLang(): Promise<BibleLanguage> {
  const sett = await Storage.load<{ bibleLanguage?: BibleLanguage }>(STORAGE_KEYS.SETTINGS);
  return sett?.bibleLanguage ?? 'en';
}

// Detect emotional/situational themes from user input
function detectThemes(lower: string): VerseTheme[] {
  const {
    EMOTION_THEME_MAP,
  } = require('./bible') as typeof import('./bible');

  const found = new Set<VerseTheme>();
  for (const [keyword, themes] of Object.entries(EMOTION_THEME_MAP)) {
    if (lower.includes(keyword)) {
      themes.forEach(t => found.add(t as VerseTheme));
    }
  }
  return [...found];
}

export async function getGreeting(): Promise<string> {
  const tod = getTimeOfDay();
  const profile = await Storage.loadSecure<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  const base = randomFrom(GREETINGS[tod]);
  const name = profile?.name ? `, ${profile.name}` : '';
  return base.replace('!', `${name}!`);
}

export async function getDailyBrief(): Promise<string> {
  const now = new Date();
  const appointments = (await Storage.load<Appointment[]>(STORAGE_KEYS.APPOINTMENTS)) ?? [];
  const reminders = (await Storage.load<Reminder[]>(STORAGE_KEYS.REMINDERS)) ?? [];
  const profile = await Storage.loadSecure<UserProfile>(STORAGE_KEYS.USER_PROFILE);

  const todayAppts = appointments.filter(a => isToday(`${a.date}T${a.time}`));
  const tomorrowAppts = appointments.filter(a => isTomorrow(`${a.date}T${a.time}`));
  const pending = reminders.filter(r => !r.completed && new Date(r.datetime) > now);

  let brief = '';
  if (todayAppts.length === 0 && pending.length === 0) {
    brief = "Your schedule is clear today. A great day to stay focused or catch up on things.";
  } else {
    const parts: string[] = [];
    if (todayAppts.length > 0) {
      const list = todayAppts.map(a => `${a.title} at ${a.time}`).join(', ');
      parts.push(`You have ${todayAppts.length} appointment${todayAppts.length > 1 ? 's' : ''} today: ${list}.`);
    }
    if (pending.length > 0) {
      parts.push(`${pending.length} reminder${pending.length > 1 ? 's' : ''} pending.`);
    }
    brief = parts.join(' ');
  }

  if (tomorrowAppts.length > 0) {
    brief += ` Tomorrow: ${tomorrowAppts.map(a => a.title).join(', ')}.`;
  }

  const sportDays = profile?.sportDays ?? ['Monday', 'Wednesday', 'Friday'];
  const dayName = now.toLocaleDateString('en', { weekday: 'long' });
  if (sportDays.includes(dayName)) {
    brief += ` Today is a sport day — workout at ${profile?.sportTime ?? '18:00'}.`;
  }

  return brief;
}

export async function processUserInput(input: string): Promise<string> {
  const lower = input.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|what's up|sup|howdy|hallo|guten)/i.test(lower)) {
    return await getGreeting();
  }

  // Time
  if (lower.includes('what time') || lower.includes('current time') || lower.includes('wie spät')) {
    const now = new Date();
    return `It is currently ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
  }

  // Date
  if (lower.includes('what day') || lower.includes("today's date") || lower.includes('what date') || lower.includes('welcher tag') || lower.includes('welches datum')) {
    return `Today is ${formatDate(new Date().toISOString())}.`;
  }

  // Schedule
  if (lower.includes('schedule') || lower.includes('appointments') || lower.includes('what do i have') || lower.includes('termine')) {
    return await getDailyBrief();
  }

  // Sleep
  if (lower.includes('sleep') || lower.includes('bedtime') || lower.includes('schlafen')) {
    const profile = await Storage.loadSecure<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    const sleepTime = profile?.sleepTime ?? '23:00';
    return `Your sleep schedule is set for ${sleepTime}. Good rest is essential for peak performance.`;
  }

  // Sport
  if (lower.includes('sport') || lower.includes('workout') || lower.includes('gym') || lower.includes('exercise') || lower.includes('training')) {
    const profile = await Storage.loadSecure<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    const days = profile?.sportDays?.join(', ') ?? 'Monday, Wednesday, Friday';
    const time = profile?.sportTime ?? '18:00';
    return `Your workout schedule: ${days} at ${time}. Consistency is key to peak physical performance.`;
  }

  // ─── Bible / Scripture — context-aware ───────────────────────────────────
  const isBibleRequest =
    lower.includes('bible') || lower.includes('vers') || lower.includes('verse') ||
    lower.includes('scripture') || lower.includes('gospel') || lower.includes('evangelium') ||
    lower.includes('catholic') || lower.includes('bibelvers') || lower.includes('heilige schrift') ||
    lower.includes('psalm') || lower.includes('gebet') || lower.includes('pray') ||
    lower.includes('spiritual') || lower.includes('god') || lower.includes('gott') ||
    lower.includes('lord') || lower.includes('herr') || lower.includes('jesus');

  // Also detect if user expresses an emotion (even without asking for a verse)
  const emotionalContext = detectThemes(lower);
  const wantsVerse = isBibleRequest || lower.includes('sad') || lower.includes('traurig') ||
    lower.includes('anxious') || lower.includes('lonely') || lower.includes('afraid') ||
    lower.includes('hopeless') || lower.includes('comfort') || lower.includes('trost') ||
    emotionalContext.length > 0 && (lower.includes('verse') || lower.includes('quote') || lower.includes('word') || lower.includes('wort'));

  if (isBibleRequest || (emotionalContext.length > 0 && wantsVerse)) {
    const {
      getLiturgicalSeason, getLiturgicalSeasonLabel, checkFeastDay,
      getRandomVerseForToday, getContextualVerse,
    } = await import('./bible');

    const lang = await getBibleLang();
    const season = getLiturgicalSeason();
    const feast = checkFeastDay();
    const feastNote = feast ? ` ${lang === 'de' ? 'Heute ist' : 'Today is'} ${feast}.` : '';
    const q = lang === 'en' ? '"' : '„', qc = lang === 'en' ? '"' : '"';

    let verse;
    let intro = '';

    if (emotionalContext.length > 0) {
      verse = getContextualVerse(emotionalContext, lang);
      const contextMap: Record<string, [string, string]> = {
        comfort:    ['I hear you. Here is a verse to bring you comfort:', 'Ich höre dich. Hier ist ein Vers, der dir Trost bringen möge:'],
        peace:      ['Here is a verse to bring you peace:', 'Hier ist ein Vers, der dir Frieden schenken möge:'],
        strength:   ['Here is a verse to strengthen you:', 'Hier ist ein Vers, der dich stärken möge:'],
        courage:    ['Here is a verse to give you courage:', 'Hier ist ein Vers, der dir Mut schenken möge:'],
        hope:       ['Here is a verse to give you hope:', 'Hier ist ein Vers, der dir Hoffnung schenken möge:'],
        joy:        ['Here is a verse of joy for you:', 'Hier ist ein Vers der Freude für dich:'],
        love:       ['Here is a verse about God\'s love for you:', 'Hier ist ein Vers über Gottes Liebe für dich:'],
        guidance:   ['Here is a verse to guide you:', 'Hier ist ein Vers, der dich leiten möge:'],
        healing:    ['Here is a verse for your healing:', 'Hier ist ein Vers für deine Heilung:'],
        forgiveness:['Here is a verse of forgiveness and mercy:', 'Hier ist ein Vers über Vergebung und Barmherzigkeit:'],
        trust:      ['Here is a verse to help you trust:', 'Hier ist ein Vers, der dir Vertrauen schenkt:'],
        loneliness: ['You are never alone. Here is a verse to remind you:', 'Du bist niemals allein. Hier ist ein Vers zur Erinnerung:'],
        wisdom:     ['Here is a verse of wisdom for your situation:', 'Hier ist ein Vers der Weisheit für deine Situation:'],
        gratitude:  ['Here is a verse of gratitude and blessing:', 'Hier ist ein Vers der Dankbarkeit und des Segens:'],
        prayer:     ['Here is a verse about prayer:', 'Hier ist ein Vers über das Gebet:'],
        praise:     ['Here is a verse of praise:', 'Hier ist ein Vers des Lobes:'],
      };
      const firstTheme = emotionalContext[0];
      const labels = contextMap[firstTheme];
      intro = labels ? (lang === 'en' ? labels[0] : labels[1]) : '';
    } else {
      verse = getRandomVerseForToday(lang);
      intro = lang === 'en'
        ? `${getLiturgicalSeasonLabel(season, lang)}.${feastNote}`
        : `${getLiturgicalSeasonLabel(season, lang)}.${feastNote}`;
    }

    return `${intro}\n\n${q}${verse.text}${qc}\n— ${verse.reference}`;
  }

  // Stocks
  if (lower.includes('stock') || lower.includes('market') || lower.includes('trade') || lower.includes('invest') || lower.includes('aktie')) {
    return "I can analyse your watchlist stocks and show market trends in the Stocks tab. Note: TradeRepublic has no public trading API, so I provide analysis signals for your manual decisions.";
  }

  // Store hours
  if (lower.includes('store') || lower.includes('shop') || lower.includes('open') || lower.includes('hours') || lower.includes('laden') || lower.includes('öffnungszeiten')) {
    return "To check store hours, go to the Schedule tab. I'll show opening times for stores near you — make sure location access is enabled.";
  }

  // Reminder
  if (lower.includes('remind me') || lower.includes('set reminder') || lower.includes('erinnerung')) {
    return "Head to the Schedule tab and tap + to add a reminder, or tell me: 'Remind me to [task] at [time]'.";
  }

  // Appointment
  if (lower.includes('appointment') || lower.includes('meeting') || lower.includes('add event') || lower.includes('termin')) {
    return "Head to the Schedule tab and tap + to add an appointment with title, date and time.";
  }

  // Weather
  if (lower.includes('weather') || lower.includes('wetter')) {
    return "I don't have live weather data configured yet. Add a weather API key in Settings to enable this feature.";
  }

  // Daily brief
  if (lower.includes('brief') || lower.includes('overview') || lower.includes('summary') || lower.includes('my day') || lower.includes('mein tag')) {
    return await getDailyBrief();
  }

  // Capabilities
  if (lower.includes('what can you do') || lower.includes('help') || lower.includes('capabilities') || lower.includes('was kannst du')) {
    return `I'm ${ASSISTANT_NAME} — your personal intelligence assistant. I can: manage appointments and reminders, give daily briefings, track workouts, analyse markets, send smart notifications, share Bible verses for any occasion, and respond to your voice commands. Just ask — in English or German.`;
  }

  const responses = [
    "Could you be more specific? I want to help as precisely as possible.",
    "I'm here. Try asking about your schedule, a Bible verse, your stocks, or set a reminder.",
    "Got it — I'm not sure exactly what you need yet. What can I help you with?",
  ];
  return randomFrom(responses);
}

export async function saveChatMessage(message: ChatMessage): Promise<void> {
  const history = (await Storage.load<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY)) ?? [];
  history.push(message);
  await Storage.save(STORAGE_KEYS.CHAT_HISTORY, history.slice(-100));
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
