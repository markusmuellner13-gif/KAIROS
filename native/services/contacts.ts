import { Storage, Contact } from './storage';
import { STORAGE_KEYS } from '../constants/config';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function getContacts(): Promise<Contact[]> {
  return (await Storage.load<Contact[]>(STORAGE_KEYS.CONTACTS)) ?? [];
}

export async function addContact(input: Omit<Contact, 'id'>): Promise<void> {
  const contacts = await getContacts();
  await Storage.save(STORAGE_KEYS.CONTACTS, [...contacts, { ...input, id: generateId() }]);
}

export async function deleteContact(id: string): Promise<void> {
  const contacts = await getContacts();
  await Storage.save(STORAGE_KEYS.CONTACTS, contacts.filter(c => c.id !== id));
}

// Finds the contact whose name best matches the start of the given text,
// preferring the longest match (so "mom" doesn't shadow "mom's friend").
export async function findContactByNamePrefix(text: string): Promise<{ contact: Contact; rest: string } | null> {
  const lower = text.toLowerCase().trim();
  const contacts = await getContacts();
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

export async function findContactByName(name: string): Promise<Contact | null> {
  const lower = name.toLowerCase().trim();
  const contacts = await getContacts();
  return contacts.find(c => c.name.toLowerCase() === lower) ?? null;
}
