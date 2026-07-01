import { Storage, Contact } from './storage';
import { STORAGE_KEYS } from './config';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getContacts(): Contact[] {
  return Storage.load<Contact[]>(STORAGE_KEYS.CONTACTS) ?? [];
}

export function addContact(input: Omit<Contact, 'id'>): void {
  const contacts = getContacts();
  Storage.save(STORAGE_KEYS.CONTACTS, [...contacts, { ...input, id: generateId() }]);
}

export function deleteContact(id: string): void {
  Storage.save(STORAGE_KEYS.CONTACTS, getContacts().filter(c => c.id !== id));
}

// Finds the contact whose name best matches the start of the given text,
// preferring the longest match (so "mom" doesn't shadow "mom's friend").
export function findContactByNamePrefix(text: string): { contact: Contact; rest: string } | null {
  const lower = text.toLowerCase().trim();
  const contacts = getContacts();
  let best: { contact: Contact; rest: string } | null = null;

  for (const contact of contacts) {
    const name = contact.name.toLowerCase();
    if (lower === name || lower.startsWith(`${name} `) || lower.startsWith(`${name}:`)) {
      if (!best || name.length > best.contact.name.length) {
        const rest = text.slice(contact.name.length).replace(/^[:\s]+/, '');
        best = { contact, rest };
      }
    }
  }
  return best;
}

export function findContactByName(name: string): Contact | null {
  const lower = name.toLowerCase().trim();
  return getContacts().find(c => c.name.toLowerCase() === lower) ?? null;
}
