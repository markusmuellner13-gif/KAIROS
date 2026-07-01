import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '../constants/theme';
import { ChatMessage } from '../services/storage';

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {!isUser && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>K</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.sm,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  badgeText: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  userBubble: {
    backgroundColor: Colors.primaryDim,
    borderBottomRightRadius: BorderRadius.sm,
  },
  assistantBubble: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    borderWidth: 1,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  text: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  userText: {
    color: Colors.text,
  },
  assistantText: {
    color: Colors.text,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});
