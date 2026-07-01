import * as Notifications from 'expo-notifications';
import { Appointment, Reminder } from './storage';
import { NOTIFICATION_IDS } from '../constants/config';
import { getVerseForTime, formatVerseNotification, checkFeastDay, BibleLanguage } from './bible';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAppointmentReminder(appointment: Appointment): Promise<string | null> {
  const permitted = await requestNotificationPermissions();
  if (!permitted) return null;

  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  const notifyAt = new Date(appointmentDate.getTime() - appointment.notifyMinutesBefore * 60 * 1000);
  if (notifyAt <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `KAIROS: Upcoming — ${appointment.title}`,
      body: `In ${appointment.notifyMinutesBefore} minutes${appointment.location ? ` at ${appointment.location}` : ''}.`,
      sound: true,
      data: { type: 'appointment', id: appointment.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notifyAt },
  });
  return id;
}

export async function scheduleReminder(reminder: Reminder): Promise<string | null> {
  const permitted = await requestNotificationPermissions();
  if (!permitted) return null;

  const triggerDate = new Date(reminder.datetime);
  if (triggerDate <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `KAIROS: ${reminder.title}`,
      body: reminder.message,
      sound: true,
      data: { type: 'reminder', id: reminder.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
  return id;
}

export async function scheduleDailySportReminder(
  hour: number,
  minute: number,
  weekdays: number[],
): Promise<void> {
  const permitted = await requestNotificationPermissions();
  if (!permitted) return;

  await cancelNotificationsByTag('sport');

  for (const weekday of weekdays) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'KAIROS: Time to Work Out!',
        body: "Your scheduled workout time is now. Engage peak performance mode!",
        sound: true,
        data: { type: 'sport', tag: 'sport' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
      },
    });
  }
}

export async function scheduleSleepReminder(hour: number, minute: number): Promise<void> {
  const permitted = await requestNotificationPermissions();
  if (!permitted) return;

  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.SLEEP_REMINDER);

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.SLEEP_REMINDER,
    content: {
      title: 'KAIROS: Sleep Time',
      body: "Time to recharge. A well-rested mind performs at its best.",
      sound: true,
      data: { type: 'sleep' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleMorningBrief(hour: number, minute: number): Promise<void> {
  const permitted = await requestNotificationPermissions();
  if (!permitted) return;

  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.MORNING_BRIEF);

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.MORNING_BRIEF,
    content: {
      title: 'KAIROS: Good Morning',
      body: "Your daily brief is ready. Tap to review your schedule.",
      sound: true,
      data: { type: 'brief' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

// ─── Bible Verse Notifications (3x daily) ───────────────────────────────────

export async function scheduleBibleVerseNotifications(
  morningHour: number,
  morningMinute: number,
  noonHour: number,
  noonMinute: number,
  eveningHour: number,
  eveningMinute: number,
  lang: BibleLanguage = 'en',
): Promise<void> {
  const permitted = await requestNotificationPermissions();
  if (!permitted) return;

  // Cancel existing Bible notifications before rescheduling
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.BIBLE_MORNING);
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.BIBLE_NOON);
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.BIBLE_EVENING);

  const slots: Array<{ id: string; time: 'morning' | 'noon' | 'evening'; h: number; m: number }> = [
    { id: NOTIFICATION_IDS.BIBLE_MORNING, time: 'morning', h: morningHour, m: morningMinute },
    { id: NOTIFICATION_IDS.BIBLE_NOON, time: 'noon', h: noonHour, m: noonMinute },
    { id: NOTIFICATION_IDS.BIBLE_EVENING, time: 'evening', h: eveningHour, m: eveningMinute },
  ];

  for (const slot of slots) {
    const verse = getVerseForTime(slot.time, lang);
    const { title, body } = formatVerseNotification(verse, slot.time, lang);

    await Notifications.scheduleNotificationAsync({
      identifier: slot.id,
      content: {
        title,
        body,
        sound: true,
        data: { type: 'bible', time: slot.time, reference: verse.reference },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: slot.h,
        minute: slot.m,
      },
    });
  }
}

export async function cancelBibleVerseNotifications(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.BIBLE_MORNING);
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.BIBLE_NOON);
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.BIBLE_EVENING);
}

// ─── Combined Smart Reminders Setup ─────────────────────────────────────────

export async function sendImmediateNotification(title: string, body: string): Promise<void> {
  const permitted = await requestNotificationPermissions();
  if (!permitted) return;

  await Notifications.scheduleNotificationAsync({
    content: { title: `KAIROS: ${title}`, body, sound: true },
    trigger: null,
  });
}

async function cancelNotificationsByTag(tag: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as Record<string, unknown>)?.tag === tag) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleSmartReminders(settings: {
  morningBriefTime: string;
  sleepReminderTime: string;
  sportDays: string[];
  sportTime: string;
  bibleNotificationsEnabled?: boolean;
  bibleMorningTime?: string;
  bibleNoonTime?: string;
  bibleEveningTime?: string;
  bibleLanguage?: BibleLanguage;
}): Promise<void> {
  const dayMap: Record<string, number> = {
    Sunday: 1, Monday: 2, Tuesday: 3, Wednesday: 4,
    Thursday: 5, Friday: 6, Saturday: 7,
  };

  const [mbH, mbM] = settings.morningBriefTime.split(':').map(Number);
  await scheduleMorningBrief(mbH, mbM);

  const [slH, slM] = settings.sleepReminderTime.split(':').map(Number);
  await scheduleSleepReminder(slH, slM);

  const [spH, spM] = settings.sportTime.split(':').map(Number);
  const sportWeekdays = settings.sportDays.map(d => dayMap[d]).filter(Boolean);
  await scheduleDailySportReminder(spH, spM, sportWeekdays);

  // Bible verse notifications (3x daily)
  if (settings.bibleNotificationsEnabled !== false) {
    const [bmH, bmM] = (settings.bibleMorningTime ?? '07:00').split(':').map(Number);
    const [bnH, bnM] = (settings.bibleNoonTime ?? '12:00').split(':').map(Number);
    const [beH, beM] = (settings.bibleEveningTime ?? '18:00').split(':').map(Number);
    await scheduleBibleVerseNotifications(bmH, bmM, bnH, bnM, beH, beM, settings.bibleLanguage ?? 'en');
  } else {
    await cancelBibleVerseNotifications();
  }
}
