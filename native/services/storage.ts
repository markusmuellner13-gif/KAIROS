import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SecureStore for sensitive data (encrypted by the OS keychain/keystore)
// AsyncStorage for non-sensitive app data

async function saveSecure(key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  await SecureStore.setItemAsync(key, json, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

async function loadSecure<T>(key: string): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

async function deleteSecure(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

async function save(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function load<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

async function remove(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

async function clearAll(): Promise<void> {
  await AsyncStorage.clear();
  // Note: SecureStore items must be removed individually
}

export const Storage = {
  saveSecure,
  loadSecure,
  deleteSecure,
  save,
  load,
  remove,
  clearAll,
};

// Type definitions for stored data

export interface UserProfile {
  name: string;
  wakeUpTime: string;
  sleepTime: string;
  sportDays: string[];
  sportTime: string;
  timezone: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  notifyMinutesBefore: number;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  message: string;
  datetime: string;
  recurring?: 'daily' | 'weekly' | 'monthly';
  recurringDays?: number[];
  completed: boolean;
  createdAt: string;
}

export interface StockWatchlistItem {
  symbol: string;
  name: string;
  addedAt: string;
  targetPrice?: number;
  alertOnChange?: number;
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  shares: number;
  avgBuyPrice: number;
  addedAt: string;
}

export interface EmailItem {
  id: string;
  from: string;
  subject: string;
  preview: string;
  receivedAt: string;
  read: boolean;
  important?: boolean;
}

export interface TextItem {
  id: string;
  from: string;
  message: string;
  receivedAt: string;
  read: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone: string; // include country code, e.g. +491701234567
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: { type: 'whatsapp' | 'call'; href: string; label: string };
}

export interface AppSettings {
  wakeWordEnabled: boolean;
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  morningBriefTime: string;
  sleepReminderTime: string;
  sportDays: string[];
  sportTime: string;
  currency: string;
  language: string;
  bibleNotificationsEnabled: boolean;
  bibleMorningTime: string;
  bibleNoonTime: string;
  bibleEveningTime: string;
  bibleLanguage: 'en' | 'de';
}
