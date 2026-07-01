'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Mail, MessageCircle } from 'lucide-react';
import HUDShell from '../../components/HUDShell';
import GlassCard from '../../components/GlassCard';
import { Colors } from '../../lib/theme';
import { EmailItem, TextItem } from '../../lib/storage';
import { getEmails, getTexts, addEmail, addText, markEmailRead, markTextRead, deleteEmail, deleteText, seedDemoInboxIfEmpty } from '../../lib/inbox';

type Tab = 'emails' | 'texts';

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function InboxPage() {
  const [tab, setTab] = useState<Tab>('emails');
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const load = useCallback(() => {
    seedDemoInboxIfEmpty();
    setEmails(getEmails());
    setTexts(getTexts());
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = () => {
    if (!from.trim()) return;
    if (tab === 'emails') {
      addEmail({ from: from.trim(), subject: subject.trim() || '(no subject)', preview: body.trim(), receivedAt: new Date().toISOString() });
    } else {
      addText({ from: from.trim(), message: body.trim(), receivedAt: new Date().toISOString() });
    }
    setFrom(''); setSubject(''); setBody('');
    setShowModal(false);
    load();
  };

  const unreadEmails = emails.filter(e => !e.read).length;
  const unreadTexts = texts.filter(t => !t.read).length;

  return (
    <HUDShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>Inbox</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>Emails & texts KAIROS can reason over</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ width: 38, height: 38, borderRadius: 19, border: '1.5px solid var(--primary)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Plus size={20} color={Colors.primary} />
        </button>
      </div>

      <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        {([
          { key: 'emails' as Tab, icon: Mail, label: 'Emails', count: unreadEmails },
          { key: 'texts' as Tab, icon: MessageCircle, label: 'Texts', count: unreadTexts },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 0', background: tab === t.key ? 'var(--surface-elevated)' : 'transparent',
              border: 'none', color: tab === t.key ? Colors.primary : Colors.textMuted,
              fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer',
            }}
          >
            <t.icon size={16} />
            {t.label}
            {t.count > 0 && <span className="badge-count">{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'emails' ? (
        emails.length === 0 ? (
          <EmptyState icon={<Mail size={36} color={Colors.textDim} />} title="No Emails Logged" text="Tap + to log an email for KAIROS to reference." />
        ) : (
          emails.map(email => (
            <GlassCard
              key={email.id}
              style={{ marginBottom: 8, cursor: 'pointer', borderColor: !email.read ? Colors.primaryDim : undefined }}
              onClick={() => { if (!email.read) { markEmailRead(email.id); load(); } }}
            >
              <Row
                unread={!email.read}
                time={timeAgo(email.receivedAt)}
                from={email.from}
                title={email.subject}
                preview={email.preview}
                onDelete={() => { deleteEmail(email.id); load(); }}
              />
            </GlassCard>
          ))
        )
      ) : (
        texts.length === 0 ? (
          <EmptyState icon={<MessageCircle size={36} color={Colors.textDim} />} title="No Texts Logged" text="Tap + to log a text for KAIROS to reference." />
        ) : (
          texts.map(text => (
            <GlassCard
              key={text.id}
              style={{ marginBottom: 8, cursor: 'pointer', borderColor: !text.read ? Colors.primaryDim : undefined }}
              onClick={() => { if (!text.read) { markTextRead(text.id); load(); } }}
            >
              <Row
                unread={!text.read}
                time={timeAgo(text.receivedAt)}
                from={text.from}
                preview={text.message}
                onDelete={() => { deleteText(text.id); load(); }}
              />
            </GlassCard>
          ))
        )
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ color: 'var(--primary)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
              Log {tab === 'emails' ? 'Email' : 'Text'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input" placeholder={tab === 'emails' ? 'From (e.g. Bank)' : 'From (e.g. Mom)'} value={from} onChange={e => setFrom(e.target.value)} />
              {tab === 'emails' && (
                <input className="input" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
              )}
              <textarea className="input" placeholder={tab === 'emails' ? 'Preview / body' : 'Message'} value={body} onChange={e => setBody(e.target.value)} rows={4} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAdd}>Save</button>
            </div>
          </div>
        </div>
      )}
    </HUDShell>
  );
}

function Row({ unread, time, from, title, preview, onDelete }: { unread: boolean; time: string; from: string; title?: string; preview: string; onDelete: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ width: 8, paddingTop: 6 }}>
        {unread && <div style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--primary)' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{from}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 8, flexShrink: 0 }}>{time}</div>
        </div>
        {title && <div style={{ color: 'var(--primary)', fontSize: 13, marginTop: 2 }}>{title}</div>}
        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>{preview}</div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}
      >
        <Trash2 size={16} color={Colors.error} />
      </button>
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 32, marginTop: 12 }}>
      {icon}
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>{text}</div>
    </GlassCard>
  );
}
