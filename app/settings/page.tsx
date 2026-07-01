'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Pencil, ShieldCheck, Globe2, Trash2, BookOpen } from 'lucide-react';
import HUDShell from '../../components/HUDShell';
import GlassCard from '../../components/GlassCard';
import { Colors } from '../../lib/theme';
import { ASSISTANT_FULL_NAME, STORAGE_KEYS, DEFAULT_SETTINGS } from '../../lib/config';
import { Storage, UserProfile, AppSettings } from '../../lib/storage';
import { getLiturgicalSeason, getLiturgicalSeasonLabel, checkFeastDay, getRandomVerseForToday, BibleLanguage } from '../../lib/bible';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [sportTime, setSportTime] = useState('18:00');

  const [biblePreview, setBiblePreview] = useState('');
  const [biblePreviewRef, setBiblePreviewRef] = useState('');
  const [seasonLabel, setSeasonLabel] = useState('');
  const [feastDay, setFeastDay] = useState<string | null>(null);

  const refreshBible = useCallback((lang: BibleLanguage) => {
    const verse = getRandomVerseForToday(lang);
    setBiblePreview(verse.text);
    setBiblePreviewRef(verse.reference);
    setSeasonLabel(getLiturgicalSeasonLabel(getLiturgicalSeason(), lang));
    setFeastDay(checkFeastDay());
  }, []);

  useEffect(() => {
    const prof = Storage.loadSecure<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    const sett = Storage.load<AppSettings>(STORAGE_KEYS.SETTINGS) ?? DEFAULT_SETTINGS;
    if (prof) {
      setProfile(prof);
      setName(prof.name);
      setWakeUpTime(prof.wakeUpTime);
      setSleepTime(prof.sleepTime);
      setSportTime(prof.sportTime);
    }
    setSettings(sett);
    refreshBible(sett.bibleLanguage ?? 'en');
  }, [refreshBible]);

  const updateSettings = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    Storage.save(STORAGE_KEYS.SETTINGS, updated);
    if (partial.bibleLanguage) refreshBible(partial.bibleLanguage);
    if (partial.notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const saveProfile = () => {
    const prof: UserProfile = {
      name: name.trim(), wakeUpTime, sleepTime,
      sportDays: profile?.sportDays ?? ['Monday', 'Wednesday', 'Friday'],
      sportTime, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
    };
    Storage.saveSecure(STORAGE_KEYS.USER_PROFILE, prof);
    setProfile(prof);
    setShowModal(false);
  };

  const handleClearData = () => {
    if (!confirm('This clears appointments, reminders, chat history, and inbox on this device. Continue?')) return;
    Storage.remove(STORAGE_KEYS.APPOINTMENTS);
    Storage.remove(STORAGE_KEYS.REMINDERS);
    Storage.remove(STORAGE_KEYS.CHAT_HISTORY);
    Storage.remove(STORAGE_KEYS.EMAILS);
    Storage.remove(STORAGE_KEYS.MESSAGES);
    alert('Data cleared. Ready for a fresh start.');
  };

  return (
    <HUDShell>
      <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>Settings</div>

      <GlassCard glow style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--surface-elevated)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={26} color={Colors.primary} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{profile?.name || 'Commander'}</div>
          <div style={{ color: 'var(--primary)', fontSize: 11 }}>{ASSISTANT_FULL_NAME}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <Pencil size={18} color={Colors.primary} />
        </button>
      </GlassCard>

      <SectionTitle>Preferences</SectionTitle>
      <GlassCard style={{ marginBottom: 20 }}>
        <SettingRow label="Voice Responses" desc="KAIROS speaks replies aloud" value={settings.voiceEnabled} onChange={v => updateSettings({ voiceEnabled: v })} />
        <SettingRow label="Browser Notifications" desc="Ask permission for reminder alerts" value={settings.notificationsEnabled} onChange={v => updateSettings({ notificationsEnabled: v })} last />
      </GlassCard>

      <SectionTitle icon={<BookOpen size={13} color={Colors.accent} />}>Catholic Bible</SectionTitle>
      <GlassCard glow style={{ marginBottom: 12 }}>
        <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 13 }}>{seasonLabel}</div>
        {feastDay && <div style={{ color: 'var(--warning)', fontSize: 11, marginTop: 2 }}>{feastDay}</div>}
        <p style={{ margin: '8px 0 4px', fontStyle: 'italic', fontSize: 14, lineHeight: 1.5 }}>&quot;{biblePreview}&quot;</p>
        <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}>— {biblePreviewRef}</div>
      </GlassCard>
      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Bible Language</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['en', 'de'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => updateSettings({ bibleLanguage: lang })}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${(settings.bibleLanguage ?? 'en') === lang ? Colors.primary : Colors.border}`,
                background: (settings.bibleLanguage ?? 'en') === lang ? 'var(--primary-glow)' : 'var(--surface-elevated)',
                color: (settings.bibleLanguage ?? 'en') === lang ? Colors.primary : Colors.textMuted,
                fontWeight: (settings.bibleLanguage ?? 'en') === lang ? 700 : 500,
              }}
            >
              {lang === 'en' ? '🇬🇧 English' : '🇩🇪 Deutsch'}
            </button>
          ))}
        </div>
      </GlassCard>

      <SectionTitle icon={<ShieldCheck size={13} color={Colors.success} />}>Security & Privacy</SectionTitle>
      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Globe2 size={20} color={Colors.primary} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Browser-Local Storage</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
              Everything lives in this browser&apos;s localStorage — no server, no account, no sync between devices. Clearing browser data erases it.
            </div>
          </div>
        </div>
      </GlassCard>

      <SectionTitle style={{ color: Colors.error }}>Danger Zone</SectionTitle>
      <GlassCard style={{ marginBottom: 20 }}>
        <button onClick={handleClearData} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: Colors.error, cursor: 'pointer', fontSize: 14 }}>
          <Trash2 size={18} /> Clear App Data
        </button>
      </GlassCard>

      <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 11, marginBottom: 12 }}>
        KAIROS Web — {ASSISTANT_FULL_NAME}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ color: 'var(--primary)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Your Profile</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field label="Your Name"><input className="input" placeholder="e.g. Markus" value={name} onChange={e => setName(e.target.value)} /></Field>
              <Field label="Wake Up Time (HH:MM)"><input className="input" value={wakeUpTime} onChange={e => setWakeUpTime(e.target.value)} /></Field>
              <Field label="Sleep Time (HH:MM)"><input className="input" value={sleepTime} onChange={e => setSleepTime(e.target.value)} /></Field>
              <Field label="Workout Time (HH:MM)"><input className="input" value={sportTime} onChange={e => setSportTime(e.target.value)} /></Field>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={saveProfile}>Save</button>
            </div>
          </div>
        </div>
      )}
    </HUDShell>
  );
}

function SectionTitle({ children, icon, style }: { children: React.ReactNode; icon?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, ...style }}>
      {icon}{children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function SettingRow({ label, desc, value, onChange, last }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: last ? 'none' : '1px solid rgba(42,48,80,0.4)' }}>
      <div style={{ flex: 1 }}>
        <div>{label}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>{desc}</div>
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 24 }}>
        <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
        <span
          style={{
            position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: 24,
            background: value ? Colors.primaryDim : Colors.border, transition: '0.2s',
          }}
          onClick={() => onChange(!value)}
        >
          <span style={{
            position: 'absolute', height: 18, width: 18, left: value ? 21 : 3, top: 3,
            background: value ? Colors.primary : Colors.textMuted, borderRadius: '50%', transition: '0.2s',
          }} />
        </span>
      </label>
    </div>
  );
}
