// Browser localStorage-backed storage. Mirrors the KAIROS mobile app's
// Storage API shape so the ported services (assistant, inbox, bible) need
// no logic changes — only the persistence layer swaps out.
//
// Note: unlike the native app's SecureStore (OS keychain), localStorage is
// not encrypted at rest. Fine for a demo/PWA; a production web build would
// want IndexedDB + an actual auth/session boundary.

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function save(key: string, value: unknown): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function load<T>(key: string): T | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function remove(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

function clearAll(): void {
  if (!isBrowser()) return;
  window.localStorage.clear();
}

export const Storage = {
  save,
  load,
  remove,
  clearAll,
  // Aliases so ported code that called the secure variants keeps working.
  saveSecure: save,
  loadSecure: load,
  deleteSecure: remove,
};

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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AppSettings {
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  currency: string;
  language: string;
  bibleLanguage: 'en' | 'de';
}
