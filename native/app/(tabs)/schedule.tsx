import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, RefreshControl, ViewStyle,
} from 'react-native';
import HUDBackground from '../../components/HUDBackground';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { STORAGE_KEYS } from '../../constants/config';
import { Storage, Appointment, Reminder } from '../../services/storage';
import { scheduleAppointmentReminder, scheduleReminder } from '../../services/notifications';
import { generateId } from '../../services/assistant';
import AppointmentCard from '../../components/AppointmentCard';
import GlassCard from '../../components/GlassCard';

type Tab = 'appointments' | 'reminders';

export default function ScheduleScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showApptModal, setShowApptModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Appointment form
  const [apptTitle, setApptTitle] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [apptLocation, setApptLocation] = useState('');
  const [apptNotes, setApptNotes] = useState('');

  // Reminder form
  const [remTitle, setRemTitle] = useState('');
  const [remMessage, setRemMessage] = useState('');
  const [remDatetime, setRemDatetime] = useState('');

  const load = useCallback(async () => {
    const [appts, rems] = await Promise.all([
      Storage.load<Appointment[]>(STORAGE_KEYS.APPOINTMENTS),
      Storage.load<Reminder[]>(STORAGE_KEYS.REMINDERS),
    ]);
    const sorted = (appts ?? []).sort(
      (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime(),
    );
    setAppointments(sorted);
    setReminders(rems ?? []);
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const addAppointment = useCallback(async () => {
    if (!apptTitle.trim() || !apptDate.trim() || !apptTime.trim()) {
      Alert.alert('KAIROS', 'Please fill in title, date (YYYY-MM-DD), and time (HH:MM).');
      return;
    }
    const appt: Appointment = {
      id: generateId(),
      title: apptTitle.trim(),
      date: apptDate.trim(),
      time: apptTime.trim(),
      location: apptLocation.trim() || undefined,
      notes: apptNotes.trim() || undefined,
      notifyMinutesBefore: 30,
      createdAt: new Date().toISOString(),
    };
    const updated = [...appointments, appt].sort(
      (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime(),
    );
    await Storage.save(STORAGE_KEYS.APPOINTMENTS, updated);
    await scheduleAppointmentReminder(appt);
    setAppointments(updated);
    setShowApptModal(false);
    setApptTitle(''); setApptDate(''); setApptTime(''); setApptLocation(''); setApptNotes('');
  }, [apptTitle, apptDate, apptTime, apptLocation, apptNotes, appointments]);

  const deleteAppointment = useCallback(async (id: string) => {
    const updated = appointments.filter(a => a.id !== id);
    await Storage.save(STORAGE_KEYS.APPOINTMENTS, updated);
    setAppointments(updated);
  }, [appointments]);

  const addReminder = useCallback(async () => {
    if (!remTitle.trim() || !remDatetime.trim()) {
      Alert.alert('KAIROS', 'Please fill in title and datetime (YYYY-MM-DDTHH:MM).');
      return;
    }
    const rem: Reminder = {
      id: generateId(),
      title: remTitle.trim(),
      message: remMessage.trim() || remTitle.trim(),
      datetime: remDatetime.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...reminders, rem];
    await Storage.save(STORAGE_KEYS.REMINDERS, updated);
    await scheduleReminder(rem);
    setReminders(updated);
    setShowReminderModal(false);
    setRemTitle(''); setRemMessage(''); setRemDatetime('');
  }, [remTitle, remMessage, remDatetime, reminders]);

  const toggleReminder = useCallback(async (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r);
    await Storage.save(STORAGE_KEYS.REMINDERS, updated);
    setReminders(updated);
  }, [reminders]);

  const deleteReminder = useCallback(async (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    await Storage.save(STORAGE_KEYS.REMINDERS, updated);
    setReminders(updated);
  }, [reminders]);

  const pending = reminders.filter(r => !r.completed);
  const done = reminders.filter(r => r.completed);

  return (
    <HUDBackground>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => activeTab === 'appointments' ? setShowApptModal(true) : setShowReminderModal(true)}
        >
          <Ionicons name="add" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['appointments', 'reminders'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={tab === 'appointments' ? 'calendar-outline' : 'alarm-outline'}
              size={16}
              color={activeTab === tab ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {activeTab === 'appointments' ? (
          appointments.length === 0 ? (
            <GlassCard style={styles.empty}>
              <Ionicons name="calendar-outline" size={40} color={Colors.textDim} />
              <Text style={styles.emptyTitle}>No Appointments</Text>
              <Text style={styles.emptyText}>Tap + to add your first appointment.</Text>
            </GlassCard>
          ) : (
            appointments.map(appt => (
              <AppointmentCard key={appt.id} appointment={appt} onDelete={deleteAppointment} />
            ))
          )
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <Text style={styles.groupLabel}>Pending ({pending.length})</Text>
                {pending.map(rem => (
                  <GlassCard key={rem.id} style={styles.remCard}>
                    <TouchableOpacity style={styles.remCheck} onPress={() => toggleReminder(rem.id)}>
                      <Ionicons name="ellipse-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.remInfo}>
                      <Text style={styles.remTitle}>{rem.title}</Text>
                      <Text style={styles.remTime}>
                        {new Date(rem.datetime).toLocaleString([], {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteReminder(rem.id)}>
                      <Ionicons name="trash-outline" size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </GlassCard>
                ))}
              </>
            )}
            {done.length > 0 && (
              <>
                <Text style={[styles.groupLabel, { marginTop: Spacing.md }]}>Completed</Text>
                {done.map(rem => (
                  <GlassCard key={rem.id} style={styles.remCard as ViewStyle}>
                    <TouchableOpacity style={styles.remCheck} onPress={() => toggleReminder(rem.id)}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    </TouchableOpacity>
                    <View style={styles.remInfo}>
                      <Text style={[styles.remTitle, styles.strikethrough]}>{rem.title}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteReminder(rem.id)}>
                      <Ionicons name="trash-outline" size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </GlassCard>
                ))}
              </>
            )}
            {reminders.length === 0 && (
              <GlassCard style={styles.empty}>
                <Ionicons name="alarm-outline" size={40} color={Colors.textDim} />
                <Text style={styles.emptyTitle}>No Reminders</Text>
                <Text style={styles.emptyText}>Tap + to set a reminder.</Text>
              </GlassCard>
            )}
          </>
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Add Appointment Modal */}
      <Modal visible={showApptModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Appointment</Text>
            {[
              { placeholder: 'Title *', value: apptTitle, set: setApptTitle },
              { placeholder: 'Date (YYYY-MM-DD) *', value: apptDate, set: setApptDate },
              { placeholder: 'Time (HH:MM) *', value: apptTime, set: setApptTime },
              { placeholder: 'Location (optional)', value: apptLocation, set: setApptLocation },
              { placeholder: 'Notes (optional)', value: apptNotes, set: setApptNotes },
            ].map(({ placeholder, value, set }) => (
              <TextInput
                key={placeholder}
                style={styles.modalInput}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMuted}
                value={value}
                onChangeText={set}
                returnKeyType="next"
              />
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowApptModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={addAppointment}>
                <Text style={styles.confirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal visible={showReminderModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Reminder</Text>
            {[
              { placeholder: 'Title *', value: remTitle, set: setRemTitle },
              { placeholder: 'Message (optional)', value: remMessage, set: setRemMessage },
              { placeholder: 'Date & Time (YYYY-MM-DDTHH:MM) *', value: remDatetime, set: setRemDatetime },
            ].map(({ placeholder, value, set }) => (
              <TextInput
                key={placeholder}
                style={styles.modalInput}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMuted}
                value={value}
                onChangeText={set}
              />
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowReminderModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={addReminder}>
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md,
  },
  headerTitle: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row', marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, overflow: 'hidden',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.sm, gap: Spacing.xs,
  },
  tabActive: { backgroundColor: Colors.surfaceElevated },
  tabText: { color: Colors.textMuted, fontSize: FontSize.sm },
  tabTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg },
  empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl, marginTop: Spacing.lg },
  emptyTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm },
  groupLabel: { color: Colors.textMuted, fontSize: FontSize.sm, marginBottom: Spacing.xs, marginLeft: 2 },
  remCard: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs, gap: Spacing.sm },
  remDone: { opacity: 0.6 },
  remCheck: { padding: 2 },
  remInfo: { flex: 1 },
  remTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.medium },
  remTime: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  strikethrough: { textDecorationLine: 'line-through', color: Colors.textMuted },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl, padding: Spacing.xl,
    borderTopWidth: 1, borderColor: Colors.border,
  },
  modalTitle: {
    color: Colors.primary, fontSize: FontSize.xl, fontWeight: FontWeight.bold,
    marginBottom: Spacing.lg,
  },
  modalInput: {
    backgroundColor: Colors.surfaceElevated, color: Colors.text,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, fontSize: FontSize.md, marginBottom: Spacing.sm,
  },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
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
