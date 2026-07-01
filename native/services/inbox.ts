import { Storage, EmailItem, TextItem } from './storage';
import { STORAGE_KEYS } from '../constants/config';

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

export async function getEmails(): Promise<EmailItem[]> {
  const items = (await Storage.load<EmailItem[]>(STORAGE_KEYS.EMAILS)) ?? [];
  return items.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}

export async function getTexts(): Promise<TextItem[]> {
  const items = (await Storage.load<TextItem[]>(STORAGE_KEYS.MESSAGES)) ?? [];
  return items.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}

export async function addEmail(input: Omit<EmailItem, 'id' | 'read'>): Promise<void> {
  const items = await getEmails();
  const item: EmailItem = { ...input, id: generateId(), read: false };
  await Storage.save(STORAGE_KEYS.EMAILS, [item, ...items]);
}

export async function addText(input: Omit<TextItem, 'id' | 'read'>): Promise<void> {
  const items = await getTexts();
  const item: TextItem = { ...input, id: generateId(), read: false };
  await Storage.save(STORAGE_KEYS.MESSAGES, [item, ...items]);
}

export async function markEmailRead(id: string): Promise<void> {
  const items = await getEmails();
  await Storage.save(STORAGE_KEYS.EMAILS, items.map(e => e.id === id ? { ...e, read: true } : e));
}

export async function markTextRead(id: string): Promise<void> {
  const items = await getTexts();
  await Storage.save(STORAGE_KEYS.MESSAGES, items.map(t => t.id === id ? { ...t, read: true } : t));
}

export async function deleteEmail(id: string): Promise<void> {
  const items = await getEmails();
  await Storage.save(STORAGE_KEYS.EMAILS, items.filter(e => e.id !== id));
}

export async function deleteText(id: string): Promise<void> {
  const items = await getTexts();
  await Storage.save(STORAGE_KEYS.MESSAGES, items.filter(t => t.id !== id));
}

export async function getUnreadCounts(): Promise<{ emails: number; texts: number }> {
  const [emails, texts] = await Promise.all([getEmails(), getTexts()]);
  return {
    emails: emails.filter(e => !e.read).length,
    texts: texts.filter(t => !t.read).length,
  };
}

export async function getInboxBrief(): Promise<string> {
  const [emails, texts] = await Promise.all([getEmails(), getTexts()]);
  const unreadEmails = emails.filter(e => !e.read);
  const unreadTexts = texts.filter(t => !t.read);

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

export async function removeLegacyDemoDataIfPresent(): Promise<void> {
  const alreadyCleaned = await Storage.load<boolean>(STORAGE_KEYS.DEMO_DATA_REMOVED);
  if (alreadyCleaned) return;

  const emails = (await getEmails()).filter(e => !DEMO_EMAIL_SUBJECTS.has(e.subject));
  await Storage.save(STORAGE_KEYS.EMAILS, emails);

  const texts = (await getTexts()).filter(t => t.message !== DEMO_TEXT_SIGNATURE);
  await Storage.save(STORAGE_KEYS.MESSAGES, texts);

  await Storage.save(STORAGE_KEYS.DEMO_DATA_REMOVED, true);
}
