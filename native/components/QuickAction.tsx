import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '../constants/theme';

interface Props {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
}

export default function QuickAction({ icon, label, onPress, color = Colors.primary, style }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: color + '44' }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon as any} size={22} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    gap: Spacing.xs,
    flex: 1,
    minHeight: 72,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
});
