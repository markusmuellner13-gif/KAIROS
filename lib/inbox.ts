import { Storage, EmailItem, TextItem } from './storage';
import { STORAGE_KEYS } from './config';

// KAIROS Inbox — a private, on-device log of emails & texts.
//
// There is no OAuth backend in this build, so KAIROS cannot pull live
// Gmail/iMessage/SMS data on its own. Instead, this is the surface where
// that data lives once it's in the app (forwarded, pasted, or logged by
// the user, or written here by a future sync integration) so KAIROS can
// search, summarise, and reason over it just like a real assistant would.

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getEmails(): EmailItem[] {
  const items = Storage.load<EmailItem[]>(STORAGE_KEYS.EMAILS) ?? [];
  return items.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}

export function getTexts(): TextItem[] {
  const items = Storage.load<TextItem[]>(STORAGE_KEYS.MESSAGES) ?? [];
  return items.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}

export function addEmail(input: Omit<EmailItem, 'id' | 'read'>): void {
  const items = getEmails();
  const item: EmailItem = { ...input, id: generateId(), read: false };
  Storage.save(STORAGE_KEYS.EMAILS, [item, ...items]);
}

export function addText(input: Omit<TextItem, 'id' | 'read'>): void {
  const items = getTexts();
  const item: TextItem = { ...input, id: generateId(), read: false };
  Storage.save(STORAGE_KEYS.MESSAGES, [item, ...items]);
}

export function markEmailRead(id: string): void {
  const items = getEmails();
  Storage.save(STORAGE_KEYS.EMAILS, items.map(e => e.id === id ? { ...e, read: true } : e));
}

export function markTextRead(id: string): void {
  const items = getTexts();
  Storage.save(STORAGE_KEYS.MESSAGES, items.map(t => t.id === id ? { ...t, read: true } : t));
}

export function deleteEmail(id: string): void {
  Storage.save(STORAGE_KEYS.EMAILS, getEmails().filter(e => e.id !== id));
}

export function deleteText(id: string): void {
  Storage.save(STORAGE_KEYS.MESSAGES, getTexts().filter(t => t.id !== id));
}

export function getUnreadCounts(): { emails: number; texts: number } {
  return {
    emails: getEmails().filter(e => !e.read).length,
    texts: getTexts().filter(t => !t.read).length,
  };
}

export function getInboxBrief(): string {
  const unreadEmails = getEmails().filter(e => !e.read);
  const unreadTexts = getTexts().filter(t => !t.read);

  if (unreadEmails.length === 0 && unreadTexts.length === 0) {
    return 'Your inbox is clear — no unread emails or messages.';
  }

  const parts: string[] = [];
  if (unreadEmails.length > 0) {
    const senders = [...new Set(unreadEmails.slice(0, 3).map(e => e.from))].join(', ');
    parts.push(`${unreadEmails.length} unread email${unreadEmails.length > 1 ? 's' : ''} (from ${senders}${unreadEmails.length > 3 ? ', and others' : ''})`);
  }
  if (unreadTexts.length > 0) {
    const senders = [...new Set(unreadTexts.slice(0, 3).map(t => t.from))].join(', ');
    parts.push(`${unreadTexts.length} unread text${unreadTexts.length > 1 ? 's' : ''} (from ${senders}${unreadTexts.length > 3 ? ', and others' : ''})`);
  }
  return `You have ${parts.join(' and ')}.`;
}

// One-time cleanup: earlier builds auto-seeded a few illustrative demo
// entries (from "IT Support", "Amazon", "Mom") so the Inbox wouldn't look
// empty on first launch. That was confusing — it read as real data. This
// strips those exact entries out for anyone who already has them, once,
// and nothing seeds fake data going forward.
const DEMO_EMAIL_SUBJECTS = new Set(['Password expiry notice', 'Your order has shipped']);
const DEMO_TEXT_SIGNATURE = 'Dinner Sunday at 6? Let me know 💛';

export function removeLegacyDemoDataIfPresent(): void {
  const alreadyCleaned = Storage.load<boolean>(STORAGE_KEYS.DEMO_DATA_REMOVED);
  if (alreadyCleaned) return;

  const emails = getEmails().filter(e => !DEMO_EMAIL_SUBJECTS.has(e.subject));
  Storage.save(STORAGE_KEYS.EMAILS, emails);

  const texts = getTexts().filter(t => t.message !== DEMO_TEXT_SIGNATURE);
  Storage.save(STORAGE_KEYS.MESSAGES, texts);

  Storage.save(STORAGE_KEYS.DEMO_DATA_REMOVED, true);
}
