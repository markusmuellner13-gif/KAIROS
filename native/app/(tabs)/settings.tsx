import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Switch, Alert, Modal,
} from 'react-native';
import HUDBackground from '../../components/HUDBackground';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import {
  ASSISTANT_NAME, ASSISTANT_FULL_NAME, STORAGE_KEYS, DEFAULT_SETTINGS,
} from '../../constants/config';
import { Storage, UserProfile, AppSettings, Contact } from '../../services/storage';
import {
  scheduleSmartReminders, cancelAllNotifications,
  scheduleBibleVerseNotifications, cancelBibleVerseNotifications,
} from '../../services/notifications';
import {
  getLiturgicalSeason, getLiturgicalSeasonLabel, checkFeastDay,
  getRandomVerseForToday, BibleLanguage,
} from '../../services/bible';
import { getContacts, addContact, deleteContact } from '../../services/contacts';
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

  // Bible verse of the day preview
  const [biblePreview, setBiblePreview] = useState('');
  const [biblePreviewRef, setBiblePreviewRef] = useState('');
  const [seasonLabel, setSeasonLabel] = useState('');
  const [feastDay, setFeastDay] = useState<string | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

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

    // Load Bible preview in selected language
    const currentLang: BibleLanguage = (sett?.bibleLanguage as BibleLanguage) ?? 'en';
    const verse = getRandomVerseForToday(currentLang);
    setBiblePreview(verse.text);
    setBiblePreviewRef(verse.reference);
    setSeasonLabel(getLiturgicalSeasonLabel(getLiturgicalSeason(), currentLang));
    setFeastDay(checkFeastDay());
    setContacts(await getContacts());
  }, []);

  useEffect(() => { load(); }, []);

  const saveContact = useCallback(async () => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    await addContact({ name: contactName.trim(), phone: contactPhone.trim() });
    setContacts(await getContacts());
    setContactName(''); setContactPhone('');
    setShowContactModal(false);
  }, [contactName, contactPhone]);

  const removeContact = useCallback(async (id: string) => {
    await deleteContact(id);
    setContacts(await getContacts());
  }, []);

  // Refresh verse preview when language changes
  useEffect(() => {
    const lang: BibleLanguage = settings.bibleLanguage ?? 'en';
    const verse = getRandomVerseForToday(lang);
    setBiblePreview(verse.text);
    setBiblePreviewRef(verse.reference);
    setSeasonLabel(getLiturgicalSeasonLabel(getLiturgicalSeason(), lang));
  }, [settings.bibleLanguage]);

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
        bibleNotificationsEnabled: updated.bibleNotificationsEnabled,
        bibleMorningTime: updated.bibleMorningTime,
        bibleNoonTime: updated.bibleNoonTime,
        bibleEveningTime: updated.bibleEveningTime,
        bibleLanguage: updated.bibleLanguage ?? 'en',
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
    <HUDBackground>
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
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => setShowProfileModal(true)}>
            <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </GlassCard>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <GlassCard>
          {settingRow('Enable Notifications', settings.notificationsEnabled,
            v => updateSettings({ notificationsEnabled: v }),
            'Smart reminders, alerts, and daily briefs')}
          {settingRow('Voice Responses', settings.voiceEnabled,
            v => updateSettings({ voiceEnabled: v }),
            'KAIROS speaks responses aloud')}
          {settingRow('Wake Word Detection', settings.wakeWordEnabled,
            v => updateSettings({ wakeWordEnabled: v }),
            'Recognises "Hey KAIROS" while you\'re talking to the mic — not a passive background listener (no app can listen while your phone is locked or the app is closed)')}
        </GlassCard>

        {/* Daily Schedule */}
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

        {/* Workout Days */}
        <Text style={styles.sectionTitle}>Workout Days</Text>
        <GlassCard>
          <View style={styles.daysGrid}>
            {SPORT_DAYS.map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, settings.sportDays.includes(day) && styles.dayChipActive]}
                onPress={() => toggleSportDay(day)}
              >
                <Text style={[styles.dayText, settings.sportDays.includes(day) && styles.dayTextActive]}>
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

        {/* Contacts */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0 }]}>Contacts</Text>
          <TouchableOpacity style={styles.addContactBtn} onPress={() => setShowContactModal(true)}>
            <Ionicons name="add" size={16} color={Colors.primary} />
            <Text style={styles.addContactText}>Add</Text>
          </TouchableOpacity>
        </View>
        <GlassCard>
          {contacts.length === 0 ? (
            <Text style={styles.settingDesc}>
              No contacts yet. Add one so KAIROS can call or WhatsApp them for you — say &quot;call Mom&quot; or &quot;whatsapp Mom happy birthday&quot;.
            </Text>
          ) : (
            contacts.map((c, i) => (
              <View key={c.id} style={[styles.contactRow, i < contacts.length - 1 && styles.contactRowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>{c.name}</Text>
                  <Text style={styles.settingDesc}>{c.phone}</Text>
                </View>
                <TouchableOpacity onPress={() => removeContact(c.id)}>
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </GlassCard>

        {/* ─── Catholic Bible ─────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Catholic Bible</Text>

        {/* Liturgical season + today's verse preview */}
        <GlassCard style={styles.biblePreviewCard} glowing>
          <View style={styles.bibleHeader}>
            <Ionicons name="book-outline" size={18} color={Colors.accent} />
            <View style={styles.bibleHeaderText}>
              <Text style={styles.bibleSeasonLabel}>{seasonLabel}</Text>
              {feastDay && (
                <Text style={styles.bibleFeастLabel}>{feastDay}</Text>
              )}
            </View>
          </View>
          <Text style={styles.bibleVerseText}>"{biblePreview}"</Text>
          <Text style={styles.bibleRef}>— {biblePreviewRef}</Text>
          <Text style={styles.bibleTrans}>Douay-Rheims Bible (Catholic Edition)</Text>
        </GlassCard>

        {/* Bible language selector */}
        <GlassCard style={styles.langCard}>
          <Text style={styles.langLabel}>Bible Language</Text>
          <Text style={styles.langDesc}>
            English: Douay-Rheims (1899, public domain){'\n'}
            Deutsch: Eigene Übersetzung nach dem Urtext
          </Text>
          <View style={styles.langToggle}>
            {(['en', 'de'] as const).map(lang => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langBtn,
                  (settings.bibleLanguage ?? 'en') === lang && styles.langBtnActive,
                ]}
                onPress={() => updateSettings({ bibleLanguage: lang })}
              >
                <Text style={[
                  styles.langBtnText,
                  (settings.bibleLanguage ?? 'en') === lang && styles.langBtnTextActive,
                ]}>
                  {lang === 'en' ? '🇬🇧  English' : '🇩🇪  Deutsch'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Bible notification toggle */}
        <GlassCard>
          {settingRow(
            'Daily Scripture Notifications',
            settings.bibleNotificationsEnabled ?? true,
            v => updateSettings({ bibleNotificationsEnabled: v }),
            '3 Bible verses per day — morning, noon & evening',
          )}
        </GlassCard>

        {/* Bible notification times */}
        {(settings.bibleNotificationsEnabled ?? true) && (
          <GlassCard style={styles.timeCard}>
            <View style={styles.bibleTimesHeader}>
              <Ionicons name="notifications-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.bibleTimesTitle}>Scripture Notification Times</Text>
            </View>
            {[
              { label: 'Morning (Lauds)', value: settings.bibleMorningTime ?? '07:00', key: 'bibleMorningTime' },
              { label: 'Noon (Angelus)', value: settings.bibleNoonTime ?? '12:00', key: 'bibleNoonTime' },
              { label: 'Evening (Vespers)', value: settings.bibleEveningTime ?? '18:00', key: 'bibleEveningTime' },
            ].map(({ label, value, key }) => (
              <View key={label} style={styles.timeRow}>
                <Text style={styles.timeLabel}>{label}</Text>
                <TextInput
                  style={styles.timeInput}
                  value={value}
                  onChangeText={v => updateSettings({ [key]: v } as Partial<AppSettings>)}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            ))}
            <Text style={styles.bibleTimesNote}>
              Times are modelled on the Liturgy of the Hours: Lauds (morning prayer), Angelus (noon), and Vespers (evening prayer).
            </Text>
          </GlassCard>
        )}

        {/* Security & Privacy */}
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

        <Text style={styles.version}>KAIROS v1.1.0 — {ASSISTANT_FULL_NAME}</Text>
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={showProfileModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Your Profile</Text>
            <Text style={styles.modalNote}>KAIROS uses this to personalise your experience. Stored securely on-device only.</Text>
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

      {/* Add Contact Modal */}
      <Modal visible={showContactModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Contact</Text>
            <Text style={styles.modalNote}>
              Include the country code (e.g. +49 for Germany) so WhatsApp and calling links work correctly.
            </Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Mom"
                placeholderTextColor={Colors.textMuted}
                value={contactName}
                onChangeText={setContactName}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone (with country code)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="+491701234567"
                placeholderTextColor={Colors.textMuted}
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowContactModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={saveContact}>
                <Text style={styles.confirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </HUDBackground>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md },
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

  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  addContactBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  addContactText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  contactRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border + '55' },

  // Bible styles
  biblePreviewCard: { marginBottom: Spacing.sm, gap: Spacing.sm },
  bibleHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  bibleHeaderText: { flex: 1 },
  bibleSeasonLabel: { color: Colors.accent, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  bibleFeастLabel: { color: Colors.warning, fontSize: FontSize.xs, marginTop: 2 },
  bibleVerseText: {
    color: Colors.text, fontSize: FontSize.sm, lineHeight: 20,
    fontStyle: 'italic',
  },
  bibleRef: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  bibleTrans: { color: Colors.textDim, fontSize: FontSize.xs },
  bibleTimesHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  bibleTimesTitle: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  langCard: { gap: Spacing.sm, marginBottom: Spacing.sm },
  langLabel: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  langDesc: { color: Colors.textMuted, fontSize: FontSize.xs, lineHeight: 17 },
  langToggle: { flexDirection: 'row', gap: Spacing.sm },
  langBtn: {
    flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', backgroundColor: Colors.surfaceElevated,
  },
  langBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow },
  langBtnText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  langBtnTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  bibleTimesNote: {
    color: Colors.textDim, fontSize: FontSize.xs, lineHeight: 16,
    marginTop: Spacing.sm, fontStyle: 'italic',
  },

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
    borderTopWidth: 1, borderColor: Colors.border, maxHeight: '90%',
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
