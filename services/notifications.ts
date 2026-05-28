import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Appointment, Reminder } from './storage';
import { NOTIFICATION_IDS } from '../constants/config';

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
      title: `ARIA: Upcoming — ${appointment.title}`,
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
      title: `ARIA: ${reminder.title}`,
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
        title: 'ARIA: Time to Work Out!',
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
      title: 'ARIA: Sleep Time',
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
      title: 'ARIA: Good Morning',
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

export async function sendImmediateNotification(title: string, body: string): Promise<void> {
  const permitted = await requestNotificationPermissions();
  if (!permitted) return;

  await Notifications.scheduleNotificationAsync({
    content: { title: `ARIA: ${title}`, body, sound: true },
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
}
