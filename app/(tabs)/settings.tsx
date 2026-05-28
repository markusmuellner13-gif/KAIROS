import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Switch, Alert, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import {
  ASSISTANT_NAME, ASSISTANT_FULL_NAME, STORAGE_KEYS, DEFAULT_SETTINGS,
} from '../../constants/config';
import { Storage, UserProfile, AppSettings } from '../../services/storage';
import { scheduleSmartReminders, cancelAllNotifications } from '../../services/notifications';
import GlassCard from '../../components/GlassCard';

const SPORT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [name, setName] = useState('');
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [sportTime, setSportTime] = useState('18:00');
  const [morningBrief, setMorningBrief] = useState('07:30');
  const [sleepReminder, setSleepReminder] = useState('22:30');

  const load = useCallback(async () => {
    const [prof, sett] = await Promise.all([
      Storage.loadSecure<UserProfile>(STORAGE_KEYS.USER_PROFILE),
      Storage.load<AppSettings>(STORAGE_KEYS.SETTINGS),
    ]);
    if (prof) {
      setProfile(prof);
      setName(prof.name);
      setWakeUpTime(prof.wakeUpTime);
      setSleepTime(prof.sleepTime);
      setSportTime(prof.sportTime);
    }
    if (sett) {
      setSettings(sett);
      setMorningBrief(sett.morningBriefTime);
      setSleepReminder(sett.sleepReminderTime);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const saveProfile = useCallback(async () => {
    const prof: UserProfile = {
      name: name.trim(),
      wakeUpTime,
      sleepTime,
      sportDays: settings.sportDays,
      sportTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
    };
    await Storage.saveSecure(STORAGE_KEYS.USER_PROFILE, prof);
    setProfile(prof);
    setShowProfileModal(false);
    Alert.alert(ASSISTANT_NAME, `Profile saved. Nice to meet you, ${name.trim() || 'Commander'}!`);
  }, [name, wakeUpTime, sleepTime, sportTime, settings.sportDays, profile]);

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await Storage.save(STORAGE_KEYS.SETTINGS, updated);

    if (updated.notificationsEnabled) {
      await scheduleSmartReminders({
        morningBriefTime: updated.morningBriefTime,
        sleepReminderTime: updated.sleepReminderTime,
        sportDays: updated.sportDays,
        sportTime: updated.sportTime,
      });
    } else {
      await cancelAllNotifications();
    }
  }, [settings]);

  const toggleSportDay = useCallback(async (day: string) => {
    const current = settings.sportDays;
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    await updateSettings({ sportDays: updated });
  }, [settings.sportDays, updateSettings]);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'This will delete all appointments, reminders, and chat history. Profile will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear', style: 'destructive',
          onPress: async () => {
            await Promise.all([
              Storage.remove(STORAGE_KEYS.APPOINTMENTS),
              Storage.remove(STORAGE_KEYS.REMINDERS),
              Storage.remove(STORAGE_KEYS.CHAT_HISTORY),
            ]);
            Alert.alert(ASSISTANT_NAME, 'Data cleared. Ready for a fresh start.');
          },
        },
      ],
    );
  }, []);

  const settingRow = (
    label: string,
    value: boolean,
    onToggle: (v: boolean) => void,
    description?: string,
  ) => (
    <View style={styles.settingRow} key={label}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDesc}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.primaryDim }}
        thumbColor={value ? Colors.primary : Colors.textMuted}
      />
    </View>
  );

  return (
    <LinearGradient colors={['#0A0E1A', '#0D1429', '#0A0E1A']} style={styles.gradient}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <GlassCard style={styles.profileCard} glowing>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={28} color={Colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name || 'Commander'}</Text>
            <Text style={styles.profileSub}>{ASSISTANT_FULL_NAME}</Text>
            <Text style={styles.profileSub2}>
              Timezone: {profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone}
            </Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => setShowProfileModal(true)}>
            <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </GlassCard>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <GlassCard>
          {settingRow(
            'Enable Notifications',
            settings.notificationsEnabled,
            v => updateSettings({ notificationsEnabled: v }),
            'Smart reminders, alerts, and daily briefs',
          )}
          {settingRow(
            'Voice Responses',
            settings.voiceEnabled,
            v => updateSettings({ voiceEnabled: v }),
            'ARIA speaks responses aloud',
          )}
          {settingRow(
            'Wake Word Detection',
            settings.wakeWordEnabled,
            v => updateSettings({ wakeWordEnabled: v }),
            'Say "Hey ARIA" to activate',
          )}
        </GlassCard>

        {/* Schedule Times */}
        <Text style={styles.sectionTitle}>Daily Schedule</Text>
        <GlassCard style={styles.timeCard}>
          {[
            { label: 'Morning Brief', value: morningBrief, set: setMorningBrief, key: 'morningBriefTime' },
            { label: 'Sleep Reminder', value: sleepReminder, set: setSleepReminder, key: 'sleepReminderTime' },
          ].map(({ label, value, set, key }) => (
            <View key={label} style={styles.timeRow}>
              <Text style={styles.timeLabel}>{label}</Text>
              <TextInput
                style={styles.timeInput}
                value={value}
                onChangeText={set}
                onBlur={() => updateSettings({ [key]: value } as Partial<AppSettings>)}
                placeholder="HH:MM"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
          ))}
        </GlassCard>

        {/* Sport Days */}
        <Text style={styles.sectionTitle}>Workout Days</Text>
        <GlassCard>
          <View style={styles.daysGrid}>
            {SPORT_DAYS.map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayChip,
                  settings.sportDays.includes(day) && styles.dayChipActive,
                ]}
                onPress={() => toggleSportDay(day)}
              >
                <Text style={[
                  styles.dayText,
                  settings.sportDays.includes(day) && styles.dayTextActive,
                ]}>
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.timeRow, { marginTop: Spacing.md }]}>
            <Text style={styles.timeLabel}>Workout Time</Text>
            <TextInput
              style={styles.timeInput}
              value={settings.sportTime}
              onChangeText={v => updateSettings({ sportTime: v })}
              placeholder="HH:MM"
              placeholderTextColor={Colors.textMuted}
              maxLength={5}
            />
          </View>
        </GlassCard>

        {/* Security & Data */}
        <Text style={styles.sectionTitle}>Security & Privacy</Text>
        <GlassCard>
          <View style={styles.securityItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.success} />
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>End-to-End Encrypted Storage</Text>
              <Text style={styles.securityDesc}>All personal data stored locally using OS keychain. Never shared.</Text>
            </View>
          </View>
          <View style={[styles.securityItem, { marginTop: Spacing.sm }]}>
            <Ionicons name="phone-portrait-outline" size={20} color={Colors.primary} />
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>On-Device Only</Text>
              <Text style={styles.securityDesc}>No cloud sync. Your data never leaves this device.</Text>
            </View>
          </View>
        </GlassCard>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: Colors.error }]}>Danger Zone</Text>
        <GlassCard>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={styles.dangerText}>Clear App Data</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Version */}
        <Text style={styles.version}>ARIA v1.0.0 — {ASSISTANT_FULL_NAME}</Text>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={showProfileModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Your Profile</Text>
            <Text style={styles.modalNote}>ARIA uses this to personalise your experience. Stored securely on-device only.</Text>
            {[
              { label: 'Your Name', value: name, set: setName, placeholder: 'e.g. Markus' },
              { label: 'Wake Up Time (HH:MM)', value: wakeUpTime, set: setWakeUpTime, placeholder: '07:00' },
              { label: 'Sleep Time (HH:MM)', value: sleepTime, set: setSleepTime, placeholder: '23:00' },
              { label: 'Workout Time (HH:MM)', value: sportTime, set: setSportTime, placeholder: '18:00' },
            ].map(({ label, value, set, placeholder }) => (
              <View key={label} style={styles.formGroup}>
                <Text style={styles.formLabel}>{label}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={placeholder}
                  placeholderTextColor={Colors.textMuted}
                  value={value}
                  onChangeText={set}
                />
              </View>
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowProfileModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={saveProfile}>
                <Text style={styles.confirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md,
  },
  headerTitle: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.md },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { color: Colors.text, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  profileSub: { color: Colors.primary, fontSize: FontSize.xs, marginTop: 2 },
  profileSub2: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 1 },
  editBtn: { padding: Spacing.sm },
  sectionTitle: {
    color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    letterSpacing: 1, marginTop: Spacing.lg, marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border + '55',
  },
  settingInfo: { flex: 1, marginRight: Spacing.sm },
  settingLabel: { color: Colors.text, fontSize: FontSize.md },
  settingDesc: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  timeCard: { gap: Spacing.sm },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeLabel: { color: Colors.text, fontSize: FontSize.md },
  timeInput: {
    backgroundColor: Colors.surfaceElevated, color: Colors.primary,
    borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    fontSize: FontSize.md, fontWeight: FontWeight.semibold,
    width: 80, textAlign: 'center',
  },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  dayChip: {
    paddingHorizontal: Spacing.sm, paddingVertical: 5,
    borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  dayChipActive: { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary },
  dayText: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  dayTextActive: { color: Colors.primary },
  securityItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  securityInfo: { flex: 1 },
  securityTitle: { color: Colors.text, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  securityDesc: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dangerText: { color: Colors.error, fontSize: FontSize.md },
  version: {
    color: Colors.textDim, fontSize: FontSize.xs, textAlign: 'center',
    marginTop: Spacing.xl, marginBottom: Spacing.sm,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl, padding: Spacing.xl,
    borderTopWidth: 1, borderColor: Colors.border,
    maxHeight: '90%',
  },
  modalTitle: { color: Colors.primary, fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
  modalNote: { color: Colors.textMuted, fontSize: FontSize.sm, marginBottom: Spacing.md },
  formGroup: { marginBottom: Spacing.sm },
  formLabel: { color: Colors.textMuted, fontSize: FontSize.sm, marginBottom: 4 },
  modalInput: {
    backgroundColor: Colors.surfaceElevated, color: Colors.text,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, fontSize: FontSize.md,
  },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  cancelBtn: {
    flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelText: { color: Colors.textMuted, fontSize: FontSize.md },
  confirmBtn: {
    flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  confirmText: { color: Colors.background, fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
