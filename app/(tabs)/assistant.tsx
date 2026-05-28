import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { ASSISTANT_NAME } from '../../constants/config';
import { ChatMessage } from '../../services/storage';
import {
  processUserInput, saveChatMessage, getChatHistory,
  clearChatHistory, generateId,
} from '../../services/assistant';
import { speak, stopSpeaking } from '../../services/voice';
import MessageBubble from '../../components/MessageBubble';
import KAIROSAvatar from '../../components/KAIROSAvatar';

export default function AssistantScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const micPulse = useRef(new Animated.Value(1)).current;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    getChatHistory().then(hist => {
      if (hist.length === 0) {
        const welcome: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: `Hello! I'm ${ASSISTANT_NAME} — your Artificial Reasoning Intelligence Assistant. I'm here to help you manage your day, check your schedule, analyse markets, and much more. Say or type anything to get started.`,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcome]);
      } else {
        setMessages(hist);
      }
    });
  }, []);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, { toValue: 1.3, duration: 500, useNativeDriver: true }),
          Animated.timing(micPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      micPulse.stopAnimation();
      Animated.timing(micPulse, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [isListening]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    await saveChatMessage(userMsg);

    setTimeout(async () => {
      const response = await processUserInput(text);
      const ariaMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, ariaMsg]);
      setIsProcessing(false);
      await saveChatMessage(ariaMsg);

      if (voiceEnabled) {
        setIsSpeaking(true);
        speak(response, () => setIsSpeaking(false));
      }

      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 400);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [voiceEnabled]);

  const toggleMic = useCallback(() => {
    // In a production app, this would use expo-av recording + speech-to-text API.
    // For demo, we simulate a voice command prompt.
    setIsListening(prev => {
      if (!prev) {
        setTimeout(() => {
          setIsListening(false);
          setInput('What is my schedule today?');
        }, 2500);
      }
      return !prev;
    });
  }, []);

  const handleClear = useCallback(async () => {
    await clearChatHistory();
    setMessages([]);
  }, []);

  const handleStopSpeak = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return (
    <LinearGradient colors={['#0A0E1A', '#0D1429', '#0A0E1A']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <KAIROSAvatar isActive={isProcessing || isListening} isSpeaking={isSpeaking} size={40} />
            <View>
              <Text style={styles.headerTitle}>{ASSISTANT_NAME}</Text>
              <Text style={styles.headerStatus}>
                {isListening ? 'Listening...' : isProcessing ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Ready'}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={isSpeaking ? handleStopSpeak : () => setVoiceEnabled(v => !v)}
            >
              <Ionicons
                name={isSpeaking ? 'stop-circle-outline' : voiceEnabled ? 'volume-high-outline' : 'volume-mute-outline'}
                size={20}
                color={voiceEnabled ? Colors.primary : Colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleClear}>
              <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
          {isProcessing && (
            <View style={styles.typingRow}>
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>KAIROS is thinking</Text>
                <Text style={styles.typingDots}>...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <Animated.View style={[styles.micWrap, { transform: [{ scale: micPulse }] }]}>
            <TouchableOpacity
              style={[styles.micBtn, isListening && styles.micBtnActive]}
              onPress={toggleMic}
            >
              <Ionicons
                name={isListening ? 'mic' : 'mic-outline'}
                size={22}
                color={isListening ? Colors.background : Colors.primary}
              />
            </TouchableOpacity>
          </Animated.View>

          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={isListening ? 'Listening...' : `Ask ${ASSISTANT_NAME} anything...`}
            placeholderTextColor={Colors.textMuted}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
            multiline={false}
            editable={!isListening}
          />

          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isProcessing}
          >
            <Ionicons name="send" size={18} color={input.trim() ? Colors.background : Colors.textDim} />
          </TouchableOpacity>
        </View>

        {/* Wake word hint */}
        <Text style={styles.hint}>Say "Hey KAIROS" to activate voice commands</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerTitle: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: FontWeight.bold, letterSpacing: 2 },
  headerStatus: { color: Colors.textMuted, fontSize: FontSize.xs },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { padding: Spacing.xs },
  messages: { flex: 1 },
  messagesContent: { paddingVertical: Spacing.md },
  typingRow: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    alignSelf: 'flex-start', gap: 4,
  },
  typingText: { color: Colors.textMuted, fontSize: FontSize.sm },
  typingDots: { color: Colors.primary, fontSize: FontSize.md, letterSpacing: 2 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.border,
    gap: Spacing.sm, backgroundColor: Colors.surface,
  },
  micWrap: { },
  micBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  micBtnActive: { backgroundColor: Colors.primary },
  textInput: {
    flex: 1, color: Colors.text, fontSize: FontSize.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    maxHeight: 80,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
  hint: { color: Colors.textDim, fontSize: FontSize.xs, textAlign: 'center', paddingBottom: Spacing.sm },
});
