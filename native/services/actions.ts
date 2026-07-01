// Deep-link actions KAIROS can hand back to the UI. Neither of these can be
// fully automated — WhatsApp and the OS dialer both require the user's own
// tap to actually send/call, by design (anti-spam/anti-fraud measures on
// their end, not a limitation we can code around). What KAIROS *can* do is
// prepare everything — the number, the message, the emoji — so all that's
// left is one tap.

export interface AssistantAction {
  type: 'whatsapp' | 'call';
  href: string;
  label: string;
}

// Common spoken/typed shorthand -> real emoji. Speech-to-text won't produce
// unicode emoji from spoken words on its own, so this is a small, honest
// substitution layer — not sticker support (WhatsApp's link scheme has no
// way to pre-attach a sticker, only text).
const EMOJI_SHORTHAND: [RegExp, string][] = [
  [/\bheart emoji\b/gi, '❤️'],
  [/\bred heart\b/gi, '❤️'],
  [/\bsmiley face\b/gi, '😊'],
  [/\bsmiley emoji\b/gi, '😊'],
  [/\bsmiling emoji\b/gi, '😊'],
  [/\blaughing emoji\b/gi, '😂'],
  [/\bcrying laughing\b/gi, '😂'],
  [/\bthumbs up emoji\b/gi, '👍'],
  [/\bthumbs up\b/gi, '👍'],
  [/\bthumbs down\b/gi, '👎'],
  [/\bfire emoji\b/gi, '🔥'],
  [/\bparty emoji\b/gi, '🎉'],
  [/\bcelebration emoji\b/gi, '🎉'],
  [/\bsad face\b/gi, '😢'],
  [/\bsad emoji\b/gi, '😢'],
  [/\bcrying emoji\b/gi, '😢'],
  [/\bwinking emoji\b/gi, '😉'],
  [/\bwink emoji\b/gi, '😉'],
  [/\bkiss emoji\b/gi, '😘'],
  [/\bpraying emoji\b/gi, '🙏'],
  [/\bthank you emoji\b/gi, '🙏'],
  [/\bclapping emoji\b/gi, '👏'],
  [/\bthinking emoji\b/gi, '🤔'],
  [/\bcheers emoji\b/gi, '🥂'],
  [/\bcake emoji\b/gi, '🎂'],
  [/\bbirthday emoji\b/gi, '🎂'],
  [/\bstar emoji\b/gi, '⭐'],
  [/\bcheck mark\b/gi, '✅'],
  [/\bok emoji\b/gi, '👌'],
  [/:\)/g, '🙂'],
  [/:\(/g, '🙁'],
  [/:d\b/gi, '😄'],
  [/<3/g, '❤️'],
];

export function applyEmojiShorthand(text: string): string {
  let result = text;
  for (const [pattern, emoji] of EMOJI_SHORTHAND) {
    result = result.replace(pattern, emoji);
  }
  return result;
}

function digitsOnly(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export function buildWhatsAppAction(phone: string, name: string, message: string): AssistantAction {
  const text = applyEmojiShorthand(message);
  const href = `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(text)}`;
  return { type: 'whatsapp', href, label: `Send to ${name} via WhatsApp` };
}

export function buildCallAction(phone: string, name: string): AssistantAction {
  return { type: 'call', href: `tel:${phone}`, label: `Call ${name}` };
}
