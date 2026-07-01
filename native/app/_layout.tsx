import { useEffect, useCallback, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../constants/theme';
import { Storage, AppSettings } from '../services/storage';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants/config';
import { scheduleSmartReminders, requestNotificationPermissions } from '../services/notifications';
import { removeLegacyDemoDataIfPresent } from '../services/inbox';

// Keep the splash screen visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    prepare();
    return () => sub.remove();
  }, []);

  async function prepare() {
    try {
      await requestNotificationPermissions();
      await removeLegacyDemoDataIfPresent();
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
          bibleNotificationsEnabled: activeSettings.bibleNotificationsEnabled ?? true,
          bibleMorningTime: activeSettings.bibleMorningTime ?? '07:00',
          bibleNoonTime: activeSettings.bibleNoonTime ?? '12:00',
          bibleEveningTime: activeSettings.bibleEveningTime ?? '18:00',
          bibleLanguage: activeSettings.bibleLanguage ?? 'en',
        });
      }
    } catch (e) {
      console.warn('Init error:', e);
    } finally {
      setAppReady(true);
      await SplashScreen.hideAsync();
    }
  }

  function handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data as Record<string, string>;
    console.log('Notification tapped:', data.type);
  }

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
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
