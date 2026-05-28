import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { Appointment } from '../services/storage';

interface Props {
  appointment: Appointment;
  onDelete: (id: string) => void;
}

export default function AppointmentCard({ appointment, onDelete }: Props) {
  const date = new Date(`${appointment.date}T${appointment.time}`);
  const isToday = date.toDateString() === new Date().toDateString();
  const isPast = date < new Date();

  const formattedDate = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.card, isToday && styles.todayCard, isPast && styles.pastCard]}>
      <View style={styles.timeColumn}>
        <View style={[styles.dot, isToday ? styles.dotToday : isPast ? styles.dotPast : styles.dotFuture]} />
        <Text style={styles.timeText}>{formattedTime}</Text>
        <Text style={styles.dateText}>{isToday ? 'Today' : formattedDate}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, isPast && styles.pastText]} numberOfLines={1}>
          {appointment.title}
        </Text>
        {appointment.location ? (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.meta} numberOfLines={1}>{appointment.location}</Text>
          </View>
        ) : null}
        {appointment.notes ? (
          <Text style={styles.notes} numberOfLines={1}>{appointment.notes}</Text>
        ) : null}
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(appointment.id)}>
        <Ionicons name="trash-outline" size={16} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  todayCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
  },
  pastCard: {
    opacity: 0.55,
  },
  timeColumn: {
    alignItems: 'center',
    marginRight: Spacing.md,
    width: 52,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  dotToday: { backgroundColor: Colors.primary },
  dotFuture: { backgroundColor: Colors.success },
  dotPast: { backgroundColor: Colors.textDim },
  timeText: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  pastText: {
    color: Colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    flex: 1,
  },
  notes: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  deleteBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
});
