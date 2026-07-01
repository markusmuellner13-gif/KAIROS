'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Send, Mic, Volume2, VolumeX, Trash2, StopCircle } from 'lucide-react';
import HUDShell from '../../components/HUDShell';
import HUDAvatar from '../../components/HUDAvatar';
import { Colors } from '../../lib/theme';
import { ASSISTANT_NAME } from '../../lib/config';
import { ChatMessage } from '../../lib/storage';
import { processUserInput, saveChatMessage, getChatHistory, clearChatHistory, generateId } from '../../lib/assistant';
import { speak, stopSpeaking, listenOnce } from '../../lib/voice';

export default function AssistantPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const stopListenRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const hist = getChatHistory();
    if (hist.length === 0) {
      setMessages([{
        id: generateId(),
        role: 'assistant',
        content: `Systems online. I'm ${ASSISTANT_NAME} — I have access to your schedule, inbox, and markets, and I'm ready to assist. Ask me for your daily brief, to check your emails or texts, set a reminder, review your portfolio, or ask for a word of Scripture.`,
        timestamp: new Date().toISOString(),
      }]);
    } else {
      setMessages(hist);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isProcessing]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);
    saveChatMessage(userMsg);

    setTimeout(() => {
      const response = processUserInput(text);
      const reply: ChatMessage = { id: generateId(), role: 'assistant', content: response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, reply]);
      setIsProcessing(false);
      saveChatMessage(reply);
      if (voiceEnabled) {
        setIsSpeaking(true);
        speak(response, () => setIsSpeaking(false));
      }
    }, 350);
  }, [voiceEnabled]);

  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListenRef.current?.();
      setIsListening(false);
      return;
    }
    setIsListening(true);
    const stop = listenOnce(
      (text) => {
        setIsListening(false);
        setInput(text);
      },
      () => {
        setIsListening(false);
        setInput('Voice recognition is not supported in this browser — try Chrome or type your message.');
      },
    );
    stopListenRef.current = stop;
  }, [isListening]);

  const handleClear = useCallback(() => {
    clearChatHistory();
    setMessages([]);
  }, []);

  const handleStopSpeak = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return (
    <HUDShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HUDAvatar isActive={isProcessing || isListening} isSpeaking={isSpeaking} size={40} />
          <div>
            <div style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>{ASSISTANT_NAME}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
              {isListening ? 'Listening...' : isProcessing ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Ready'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={isSpeaking ? handleStopSpeak : () => setVoiceEnabled(v => !v)} style={iconBtnStyle}>
            {isSpeaking ? <StopCircle size={20} color={Colors.primary} /> : voiceEnabled ? <Volume2 size={20} color={Colors.primary} /> : <VolumeX size={20} color={Colors.textMuted} />}
          </button>
          <button onClick={handleClear} style={iconBtnStyle}>
            <Trash2 size={20} color={Colors.textMuted} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: '50vh', paddingBottom: 8 }}>
        {messages.map(msg => <Bubble key={msg.id} message={msg} />)}
        {isProcessing && (
          <div style={{ alignSelf: 'flex-start', background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 16, padding: '10px 14px', color: 'var(--text-muted)', fontSize: 13 }}>
            {ASSISTANT_NAME} is thinking<span style={{ color: 'var(--primary)' }}>...</span>
          </div>
        )}
      </div>

      <div style={{ position: 'sticky', bottom: 78, display: 'flex', gap: 8, alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: 8, marginTop: 12 }}>
        <button onClick={toggleMic} style={{ ...micBtnStyle, background: isListening ? Colors.primary : 'transparent', borderColor: Colors.primary }}>
          <Mic size={18} color={isListening ? Colors.background : Colors.primary} />
        </button>
        <input
          className="input"
          style={{ flex: 1, background: 'transparent', border: 'none', padding: '8px 4px' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }}
          placeholder={isListening ? 'Listening...' : `Ask ${ASSISTANT_NAME} anything...`}
          disabled={isListening}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isProcessing}
          style={{ ...micBtnStyle, background: input.trim() ? Colors.primary : Colors.border, borderColor: 'transparent' }}
        >
          <Send size={16} color={input.trim() ? Colors.background : Colors.textDim} />
        </button>
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 11, marginTop: 8 }}>
        Tap the mic and speak, or type your command
      </p>
    </HUDShell>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 8 }}>
      {!isUser && (
        <div style={{ width: 26, height: 26, borderRadius: 13, background: 'var(--primary-dim)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 12 }}>K</span>
        </div>
      )}
      <div
        style={{
          maxWidth: '78%', borderRadius: 16, padding: '10px 14px',
          background: isUser ? 'var(--primary-dim)' : 'var(--surface-elevated)',
          border: isUser ? 'none' : '1px solid var(--border)',
          whiteSpace: 'pre-wrap',
        }}
      >
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{message.content}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{time}</div>
      </div>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 };
const micBtnStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 18, border: '1.5px solid', display: 'flex',
  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
};
