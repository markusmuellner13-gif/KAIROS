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

// Seeds a handful of realistic demo entries on first launch so the Inbox
// isn't empty before the user has logged anything — purely illustrative,
// clearly editable/removable, and never presented as live-synced data.
export function seedDemoInboxIfEmpty(): void {
  const alreadySeeded = Storage.load<boolean>(STORAGE_KEYS.INBOX_SEEDED);
  if (alreadySeeded) return;

  if (getEmails().length === 0) {
    const now = Date.now();
    Storage.save(STORAGE_KEYS.EMAILS, [
      {
        id: generateId(), from: 'IT Support', subject: 'Password expiry notice',
        preview: 'Your workspace password will expire in 5 days. Update it to avoid interruption.',
        receivedAt: new Date(now - 1000 * 60 * 40).toISOString(), read: false, important: true,
      },
      {
        id: generateId(), from: 'Amazon', subject: 'Your order has shipped',
        preview: 'Package arriving tomorrow between 10am–2pm.',
        receivedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(), read: false,
      },
    ] as EmailItem[]);
  }
  if (getTexts().length === 0) {
    const now = Date.now();
    Storage.save(STORAGE_KEYS.MESSAGES, [
      {
        id: generateId(), from: 'Mom', message: 'Dinner Sunday at 6? Let me know 💛',
        receivedAt: new Date(now - 1000 * 60 * 25).toISOString(), read: false,
      },
    ] as TextItem[]);
  }
  Storage.save(STORAGE_KEYS.INBOX_SEEDED, true);
}
