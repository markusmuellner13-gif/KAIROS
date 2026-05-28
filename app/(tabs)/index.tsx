import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { ASSISTANT_NAME, STORAGE_KEYS } from '../../constants/config';
import { Storage, Appointment, UserProfile } from '../../services/storage';
import { getGreeting, getDailyBrief } from '../../services/assistant';
import { speak } from '../../services/voice';
import GlassCard from '../../components/GlassCard';
import KAIROSAvatar from '../../components/KAIROSAvatar';
import QuickAction from '../../components/QuickAction';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [brief, setBrief] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [avatarActive, setAvatarActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const loadData = useCallback(async () => {
    const [greet, dailyBrief, prof, appts] = await Promise.all([
      getGreeting(),
      getDailyBrief(),
      Storage.loadSecure<UserProfile>(STORAGE_KEYS.USER_PROFILE),
      Storage.load<Appointment[]>(STORAGE_KEYS.APPOINTMENTS),
    ]);

    setGreeting(greet);
    setBrief(dailyBrief);
    setProfile(prof);

    const today = new Date().toDateString();
    const todayAppts = (appts ?? []).filter(
      a => new Date(`${a.date}T${a.time}`).toDateString() === today,
    ).sort((a, b) => a.time.localeCompare(b.time));
    setTodayAppointments(todayAppts);
  }, []);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleSpeak = useCallback(() => {
    setAvatarActive(true);
    setIsSpeaking(true);
    speak(brief, () => {
      setIsSpeaking(false);
      setAvatarActive(false);
    });
  }, [brief]);

  const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  const hour = currentTime.getHours();
  const sportDays = profile?.sportDays ?? ['Monday', 'Wednesday', 'Friday'];
  const dayName = currentTime.toLocaleDateString('en', { weekday: 'long' });
  const isSportDay = sportDays.includes(dayName);
  const sleepTime = profile?.sleepTime ?? '23:00';
  const [sleepH] = sleepTime.split(':').map(Number);
  const isNearSleep = hour >= sleepH - 1;

  return (
    <LinearGradient colors={['#0A0E1A', '#0D1429', '#0A0E1A']} style={styles.gradient}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{ASSISTANT_NAME}</Text>
            <Text style={styles.headerSub}>Personal Intelligence System</Text>
          </View>
          <View style={styles.statusDot}>
            <View style={styles.dotOnline} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        {/* Clock + Avatar */}
        <View style={styles.clockSection}>
          <KAIROSAvatar isActive={avatarActive} isSpeaking={isSpeaking} size={88} />
          <View style={styles.clockInfo}>
            <Text style={styles.clockTime}>{timeStr}</Text>
            <Text style={styles.clockDate}>{dateStr}</Text>
          </View>
        </View>

        {/* Greeting Card */}
        <GlassCard style={styles.greetingCard} glowing>
          <Text style={styles.greetingText}>{greeting}</Text>
          <TouchableOpacity style={styles.speakBtn} onPress={handleSpeak}>
            <Ionicons name={isSpeaking ? 'volume-high' : 'play-circle-outline'} size={22} color={Colors.primary} />
            <Text style={styles.speakBtnText}>{isSpeaking ? 'Speaking...' : 'Hear Brief'}</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Daily Brief */}
        <GlassCard style={styles.briefCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="newspaper-outline" size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Daily Brief</Text>
          </View>
          <Text style={styles.briefText}>{brief}</Text>
        </GlassCard>

        {/* Smart Alerts */}
        {(isSportDay || isNearSleep) && (
          <View style={styles.alertsRow}>
            {isSportDay && (
              <View style={[styles.alertChip, { borderColor: Colors.success + '66' }]}>
                <Ionicons name="barbell-outline" size={14} color={Colors.success} />
                <Text style={[styles.alertText, { color: Colors.success }]}>
                  Sport day — {profile?.sportTime ?? '18:00'}
                </Text>
              </View>
            )}
            {isNearSleep && (
              <View style={[styles.alertChip, { borderColor: Colors.warning + '66' }]}>
                <Ionicons name="moon-outline" size={14} color={Colors.warning} />
                <Text style={[styles.alertText, { color: Colors.warning }]}>Sleep soon</Text>
              </View>
            )}
          </View>
        )}

        {/* Today's Appointments */}
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')} style={styles.seeAll}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {todayAppointments.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={28} color={Colors.success} />
            <Text style={styles.emptyText}>No appointments today</Text>
          </GlassCard>
        ) : (
          todayAppointments.map(appt => (
            <GlassCard key={appt.id} style={styles.apptRow}>
              <View style={styles.apptTime}>
                <Text style={styles.apptTimeText}>{appt.time}</Text>
              </View>
              <View style={styles.apptInfo}>
                <Text style={styles.apptTitle}>{appt.title}</Text>
                {appt.location ? (
                  <Text style={styles.apptSub}>{appt.location}</Text>
                ) : null}
              </View>
              <View style={[styles.apptDot, { backgroundColor: Colors.primary }]} />
            </GlassCard>
          ))
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Ionicons name="flash-outline" size={16} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.actionsRow}>
          <QuickAction
            icon="mic-outline"
            label="Talk to ARIA"
            onPress={() => router.push('/(tabs)/assistant')}
            color={Colors.primary}
          />
          <QuickAction
            icon="add-circle-outline"
            label="Add Event"
            onPress={() => router.push('/(tabs)/schedule')}
            color={Colors.success}
          />
          <QuickAction
            icon="trending-up-outline"
            label="Markets"
            onPress={() => router.push('/(tabs)/stocks')}
            color={Colors.accent}
          />
        </View>

        <View style={styles.bottom} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    color: Colors.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    letterSpacing: 4,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    marginTop: 2,
  },
  statusDot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dotOnline: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  statusText: { color: Colors.success, fontSize: FontSize.xs },
  clockSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  clockInfo: { alignItems: 'flex-start' },
  clockTime: {
    color: Colors.text,
    fontSize: 52,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
    lineHeight: 58,
  },
  clockDate: { color: Colors.textMuted, fontSize: FontSize.sm },
  greetingCard: { marginBottom: Spacing.md },
  greetingText: { color: Colors.text, fontSize: FontSize.md, lineHeight: 22, marginBottom: Spacing.sm },
  speakBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  speakBtnText: { color: Colors.primary, fontSize: FontSize.sm },
  briefCard: { marginBottom: Spacing.md },
  briefText: { color: Colors.textMuted, fontSize: FontSize.sm, lineHeight: 20 },
  alertsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap' },
  alertChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.surfaceElevated, borderWidth: 1,
    borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  alertText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.xs, marginBottom: Spacing.sm, marginTop: Spacing.xs,
  },
  sectionTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.semibold, flex: 1 },
  seeAll: { padding: 4 },
  seeAllText: { color: Colors.primary, fontSize: FontSize.sm },
  emptyCard: { alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm },
  apptRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.xs, gap: Spacing.sm,
  },
  apptTime: {
    width: 48, alignItems: 'center',
    backgroundColor: Colors.primaryGlow, borderRadius: BorderRadius.sm, padding: 4,
  },
  apptTimeText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  apptInfo: { flex: 1 },
  apptTitle: { color: Colors.text, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  apptSub: { color: Colors.textMuted, fontSize: FontSize.xs },
  apptDot: { width: 8, height: 8, borderRadius: 4 },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  bottom: { height: Spacing.xxl },
});
