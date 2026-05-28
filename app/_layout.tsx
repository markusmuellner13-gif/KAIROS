import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import { Storage, AppSettings } from '../services/storage';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants/config';
import { scheduleSmartReminders, requestNotificationPermissions } from '../services/notifications';

export default function RootLayout() {
  useEffect(() => {
    initApp();
    const sub = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    return () => sub.remove();
  }, []);

  async function initApp() {
    await requestNotificationPermissions();
    const settings = await Storage.load<AppSettings>(STORAGE_KEYS.SETTINGS);
    const activeSettings = settings ?? DEFAULT_SETTINGS;

    if (!settings) {
      await Storage.save(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }

    if (activeSettings.notificationsEnabled) {
      await scheduleSmartReminders({
        morningBriefTime: activeSettings.morningBriefTime,
        sleepReminderTime: activeSettings.sleepReminderTime,
        sportDays: activeSettings.sportDays,
        sportTime: activeSettings.sportTime,
      });
    }
  }

  function handleNotificationResponse(response: Notifications.NotificationResponse) {
    // Navigate to relevant screen based on notification type
    const data = response.notification.request.content.data as Record<string, string>;
    console.log('Notification tapped:', data.type);
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
});
