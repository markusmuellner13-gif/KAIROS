'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Circle, CheckCircle2, CalendarDays, AlarmClock } from 'lucide-react';
import HUDShell from '../../components/HUDShell';
import GlassCard from '../../components/GlassCard';
import { Colors } from '../../lib/theme';
import { STORAGE_KEYS } from '../../lib/config';
import { Storage, Appointment, Reminder } from '../../lib/storage';
import { generateId } from '../../lib/assistant';

type Tab = 'appointments' | 'reminders';

export default function SchedulePage() {
  const [tab, setTab] = useState<Tab>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showApptModal, setShowApptModal] = useState(false);
  const [showRemModal, setShowRemModal] = useState(false);

  const [apptTitle, setApptTitle] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [apptLocation, setApptLocation] = useState('');
  const [apptNotes, setApptNotes] = useState('');

  const [remTitle, setRemTitle] = useState('');
  const [remMessage, setRemMessage] = useState('');
  const [remDatetime, setRemDatetime] = useState('');

  const load = useCallback(() => {
    const appts = (Storage.load<Appointment[]>(STORAGE_KEYS.APPOINTMENTS) ?? [])
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    setAppointments(appts);
    setReminders(Storage.load<Reminder[]>(STORAGE_KEYS.REMINDERS) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addAppointment = () => {
    if (!apptTitle.trim() || !apptDate.trim() || !apptTime.trim()) {
      alert('Please fill in title, date (YYYY-MM-DD), and time (HH:MM).');
      return;
    }
    const appt: Appointment = {
      id: generateId(), title: apptTitle.trim(), date: apptDate.trim(), time: apptTime.trim(),
      location: apptLocation.trim() || undefined, notes: apptNotes.trim() || undefined,
      notifyMinutesBefore: 30, createdAt: new Date().toISOString(),
    };
    const updated = [...appointments, appt].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    Storage.save(STORAGE_KEYS.APPOINTMENTS, updated);
    setAppointments(updated);
    setShowApptModal(false);
    setApptTitle(''); setApptDate(''); setApptTime(''); setApptLocation(''); setApptNotes('');
  };

  const deleteAppointment = (id: string) => {
    const updated = appointments.filter(a => a.id !== id);
    Storage.save(STORAGE_KEYS.APPOINTMENTS, updated);
    setAppointments(updated);
  };

  const addReminder = () => {
    if (!remTitle.trim() || !remDatetime.trim()) {
      alert('Please fill in title and datetime (YYYY-MM-DDTHH:MM).');
      return;
    }
    const rem: Reminder = {
      id: generateId(), title: remTitle.trim(), message: remMessage.trim() || remTitle.trim(),
      datetime: remDatetime.trim(), completed: false, createdAt: new Date().toISOString(),
    };
    const updated = [...reminders, rem];
    Storage.save(STORAGE_KEYS.REMINDERS, updated);
    setReminders(updated);
    setShowRemModal(false);
    setRemTitle(''); setRemMessage(''); setRemDatetime('');
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r);
    Storage.save(STORAGE_KEYS.REMINDERS, updated);
    setReminders(updated);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    Storage.save(STORAGE_KEYS.REMINDERS, updated);
    setReminders(updated);
  };

  const pending = reminders.filter(r => !r.completed);
  const done = reminders.filter(r => r.completed);

  return (
    <HUDShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 26, fontWeight: 700 }}>Schedule</div>
        <button
          onClick={() => tab === 'appointments' ? setShowApptModal(true) : setShowRemModal(true)}
          style={{ width: 38, height: 38, borderRadius: 19, border: '1.5px solid var(--primary)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Plus size={20} color={Colors.primary} />
        </button>
      </div>

      <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        {(['appointments', 'reminders'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 0', background: tab === t ? 'var(--surface-elevated)' : 'transparent',
              border: 'none', color: tab === t ? Colors.primary : Colors.textMuted,
              fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {t === 'appointments' ? <CalendarDays size={16} /> : <AlarmClock size={16} />}
            {t}
          </button>
        ))}
      </div>

      {tab === 'appointments' ? (
        appointments.length === 0 ? (
          <EmptyState icon={<CalendarDays size={36} color={Colors.textDim} />} title="No Appointments" text="Tap + to add your first appointment." />
        ) : (
          appointments.map(appt => {
            const date = new Date(`${appt.date}T${appt.time}`);
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <GlassCard key={appt.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, borderColor: isToday ? Colors.primary : undefined }}>
                <div style={{ width: 56, textAlign: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: isToday ? Colors.primary : Colors.success, margin: '0 auto 4px' }} />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{appt.time}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{isToday ? 'Today' : date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{appt.title}</div>
                  {appt.location && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{appt.location}</div>}
                  {appt.notes && <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>{appt.notes}</div>}
                </div>
                <button onClick={() => deleteAppointment(appt.id)} style={iconBtn}><Trash2 size={16} color={Colors.error} /></button>
              </GlassCard>
            );
          })
        )
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Pending ({pending.length})</div>
              {pending.map(rem => (
                <GlassCard key={rem.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <button onClick={() => toggleReminder(rem.id)} style={iconBtn}><Circle size={20} color={Colors.primary} /></button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{rem.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
                      {new Date(rem.datetime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button onClick={() => deleteReminder(rem.id)} style={iconBtn}><Trash2 size={16} color={Colors.error} /></button>
                </GlassCard>
              ))}
            </>
          )}
          {done.length > 0 && (
            <>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6, marginTop: 12 }}>Completed</div>
              {done.map(rem => (
                <GlassCard key={rem.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <button onClick={() => toggleReminder(rem.id)} style={iconBtn}><CheckCircle2 size={20} color={Colors.success} /></button>
                  <div style={{ flex: 1, textDecoration: 'line-through', color: 'var(--text-muted)' }}>{rem.title}</div>
                  <button onClick={() => deleteReminder(rem.id)} style={iconBtn}><Trash2 size={16} color={Colors.error} /></button>
                </GlassCard>
              ))}
            </>
          )}
          {reminders.length === 0 && (
            <EmptyState icon={<AlarmClock size={36} color={Colors.textDim} />} title="No Reminders" text="Tap + to set a reminder." />
          )}
        </>
      )}

      {showApptModal && (
        <Modal onClose={() => setShowApptModal(false)} title="New Appointment" onConfirm={addAppointment}>
          <input className="input" style={inputStyle} placeholder="Title *" value={apptTitle} onChange={e => setApptTitle(e.target.value)} />
          <input className="input" style={inputStyle} placeholder="Date (YYYY-MM-DD) *" value={apptDate} onChange={e => setApptDate(e.target.value)} />
          <input className="input" style={inputStyle} placeholder="Time (HH:MM) *" value={apptTime} onChange={e => setApptTime(e.target.value)} />
          <input className="input" style={inputStyle} placeholder="Location (optional)" value={apptLocation} onChange={e => setApptLocation(e.target.value)} />
          <input className="input" style={inputStyle} placeholder="Notes (optional)" value={apptNotes} onChange={e => setApptNotes(e.target.value)} />
        </Modal>
      )}

      {showRemModal && (
        <Modal onClose={() => setShowRemModal(false)} title="New Reminder" onConfirm={addReminder}>
          <input className="input" style={inputStyle} placeholder="Title *" value={remTitle} onChange={e => setRemTitle(e.target.value)} />
          <input className="input" style={inputStyle} placeholder="Message (optional)" value={remMessage} onChange={e => setRemMessage(e.target.value)} />
          <input className="input" style={inputStyle} placeholder="Date & Time (YYYY-MM-DDTHH:MM) *" value={remDatetime} onChange={e => setRemDatetime(e.target.value)} />
        </Modal>
      )}
    </HUDShell>
  );
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 32, marginTop: 12 }}>
      {icon}
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{text}</div>
    </GlassCard>
  );
}

function Modal({ children, title, onClose, onConfirm }: { children: React.ReactNode; title: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ color: 'var(--primary)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={onConfirm}>Save</button>
        </div>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' };
const inputStyle: React.CSSProperties = { marginBottom: 0 };
