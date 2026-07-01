import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { WAKE_WORDS, ASSISTANT_NAME } from '../constants/config';

let recording: Audio.Recording | null = null;
let isListening = false;

export async function speak(text: string, onDone?: () => void): Promise<void> {
  Speech.stop();
  Speech.speak(text, {
    language: 'en-US',
    pitch: 1.05,
    rate: 0.95,
    onDone,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}

export function isSpeaking(): boolean {
  return Speech.isSpeakingAsync !== undefined;
}

export async function requestMicPermission(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

export async function startRecording(): Promise<void> {
  if (isListening) return;

  const granted = await requestMicPermission();
  if (!granted) return;

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording: rec } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY,
  );
  recording = rec;
  isListening = true;
}

export async function stopRecording(): Promise<string | null> {
  if (!recording) return null;

  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  recording = null;
  isListening = false;

  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
  return uri;
}

export function getIsListening(): boolean {
  return isListening;
}

// Checks if user input contains a wake word
export function containsWakeWord(input: string): boolean {
  const lower = input.toLowerCase();
  return WAKE_WORDS.some(w => lower.includes(w));
}

// Strips wake word from input so just the command remains
export function stripWakeWord(input: string): string {
  let clean = input.toLowerCase();
  for (const w of WAKE_WORDS) {
    clean = clean.replace(w, '').trim();
  }
  // Remove leading comma or punctuation after stripping
  return clean.replace(/^[,.\s]+/, '').trim();
}
