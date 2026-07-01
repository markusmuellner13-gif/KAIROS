'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Play, Volume2, Mic, PlusCircle, TrendingUp, ChevronRight, Mail, CheckCircle2 } from 'lucide-react';
import HUDShell from '../components/HUDShell';
import GlassCard from '../components/GlassCard';
import HUDAvatar from '../components/HUDAvatar';
import { Colors } from '../lib/theme';
import { ASSISTANT_NAME, STORAGE_KEYS } from '../lib/config';
import { Storage, Appointment, UserProfile } from '../lib/storage';
import { getGreeting, getDailyBrief } from '../lib/assistant';
import { getUnreadCounts, removeLegacyDemoDataIfPresent } from '../lib/inbox';
import { speak, stopSpeaking } from '../lib/voice';

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');
  const [brief, setBrief] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({ emails: 0, texts: 0 });

  const loadData = useCallback(() => {
    removeLegacyDemoDataIfPresent();
    setGreeting(getGreeting());
    setBrief(getDailyBrief());
    setProfile(Storage.loadSecure<UserProfile>(STORAGE_KEYS.USER_PROFILE));
    setUnreadCounts(getUnreadCounts());

    const appts = Storage.load<Appointment[]>(STORAGE_KEYS.APPOINTMENTS) ?? [];
    const today = new Date().toDateString();
    setTodayAppointments(
      appts.filter(a => new Date(`${a.date}T${a.time}`).toDateString() === today)
        .sort((a, b) => a.time.localeCompare(b.time)),
    );
  }, []);

  useEffect(() => {
    loadData();
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speak(brief, () => setIsSpeaking(false));
  };

  const timeStr = currentTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '--:--';
  const dateStr = currentTime?.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) ?? '';
  const hour = currentTime?.getHours() ?? 0;
  const sportDays = profile?.sportDays ?? ['Monday', 'Wednesday', 'Friday'];
  const dayName = currentTime?.toLocaleDateString('en', { weekday: 'long' }) ?? '';
  const isSportDay = sportDays.includes(dayName);
  const sleepTime = profile?.sleepTime ?? '23:00';
  const sleepH = parseInt(sleepTime.split(':')[0], 10);
  const isNearSleep = currentTime ? hour >= sleepH - 1 : false;
  const totalUnread = unreadCounts.emails + unreadCounts.texts;

  return (
    <HUDShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ color: 'var(--primary)', fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>{ASSISTANT_NAME}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11, letterSpacing: 1, marginTop: 2 }}>Personal Intelligence System</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--success)' }} />
          <span style={{ color: 'var(--success)', fontSize: 11 }}>Online</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 24 }}>
        <HUDAvatar isActive={isSpeaking} isSpeaking={isSpeaking} size={88} />
        <div>
          <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: 2, lineHeight: '1.1' }}>{timeStr}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{dateStr}</div>
        </div>
      </div>

      <GlassCard glow style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, marginBottom: 10, lineHeight: 1.5, fontSize: 15 }}>{greeting}</p>
        <button
          onClick={handleSpeak}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, fontSize: 13 }}
        >
          {isSpeaking ? <Volume2 size={18} /> : <Play size={18} />}
          {isSpeaking ? 'Speaking...' : 'Hear Brief'}
        </button>
      </GlassCard>

      <GlassCard style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ color: 'var(--primary)', fontSize: 15, fontWeight: 600 }}>Daily Brief</span>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>{brief}</p>
      </GlassCard>

      {(isSportDay || isNearSleep) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {isSportDay && (
            <span className="chip" style={{ borderColor: 'rgba(0,230,118,0.4)', color: 'var(--success)' }}>
              Sport day — {profile?.sportTime ?? '18:00'}
            </span>
          )}
          {isNearSleep && (
            <span className="chip" style={{ borderColor: 'rgba(255,179,0,0.4)', color: 'var(--warning)' }}>
              Sleep soon
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>Today&apos;s Schedule</span>
        <Link href="/schedule" style={{ color: 'var(--primary)', fontSize: 13 }}>See All</Link>
      </div>

      {todayAppointments.length === 0 ? (
        <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24, marginBottom: 16 }}>
          <CheckCircle2 size={28} color={Colors.success} />
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No appointments today</span>
        </GlassCard>
      ) : (
        todayAppointments.map(appt => (
          <GlassCard key={appt.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 48, textAlign: 'center', background: 'var(--primary-glow)', borderRadius: 8, padding: 4 }}>
              <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600 }}>{appt.time}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{appt.title}</div>
              {appt.location && <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{appt.location}</div>}
            </div>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--primary)' }} />
          </GlassCard>
        ))
      )}

      <Link href="/inbox">
        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 16, cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={20} color={Colors.primary} />
            {totalUnread > 0 && (
              <span className="badge-count" style={{ position: 'absolute', top: -6, right: -8 }}>{totalUnread}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Inbox</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
              {totalUnread === 0 ? 'All caught up' : `${unreadCounts.emails} unread email${unreadCounts.emails !== 1 ? 's' : ''} · ${unreadCounts.texts} unread text${unreadCounts.texts !== 1 ? 's' : ''}`}
            </div>
          </div>
          <ChevronRight size={18} color={Colors.textMuted} />
        </GlassCard>
      </Link>

      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Quick Actions</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <QuickLink href="/assistant" icon={<Mic size={20} color={Colors.primary} />} label="Talk to KAIROS" color={Colors.primary} />
        <QuickLink href="/schedule" icon={<PlusCircle size={20} color={Colors.success} />} label="Add Event" color={Colors.success} />
        <QuickLink href="/markets" icon={<TrendingUp size={20} color={Colors.accent} />} label="Markets" color={Colors.accent} />
      </div>
    </HUDShell>
  );
}

function QuickLink({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link
      href={href}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, background: 'var(--surface-elevated)', borderRadius: 12, border: `1px solid ${color}44`,
        padding: 10, minHeight: 72, textAlign: 'center',
      }}
    >
      {icon}
      <span style={{ color, fontSize: 11, fontWeight: 500 }}>{label}</span>
    </Link>
  );
}
