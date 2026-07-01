import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { EmailItem, TextItem } from '../../services/storage';
import {
  getEmails, getTexts, addEmail, addText,
  markEmailRead, markTextRead, deleteEmail, deleteText,
} from '../../services/inbox';
import HUDBackground from '../../components/HUDBackground';
import GlassCard from '../../components/GlassCard';

type Tab = 'emails' | 'texts';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function InboxScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('emails');
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const load = useCallback(async () => {
    const [e, t] = await Promise.all([getEmails(), getTexts()]);
    setEmails(e);
    setTexts(t);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleAdd = useCallback(async () => {
    if (!from.trim()) return;
    if (activeTab === 'emails') {
      await addEmail({ from: from.trim(), subject: subject.trim() || '(no subject)', preview: body.trim(), receivedAt: new Date().toISOString() });
    } else {
      await addText({ from: from.trim(), message: body.trim(), receivedAt: new Date().toISOString() });
    }
    setFrom(''); setSubject(''); setBody('');
    setShowModal(false);
    await load();
  }, [activeTab, from, subject, body, load]);

  const unreadEmails = emails.filter(e => !e.read).length;
  const unreadTexts = texts.filter(t => !t.read).length;

  return (
    <HUDBackground>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inbox</Text>
          <Text style={styles.headerSub}>Emails & texts KAIROS can reason over</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {([
          { key: 'emails' as Tab, icon: 'mail-outline', label: 'Emails', count: unreadEmails },
          { key: 'texts' as Tab, icon: 'chatbubble-outline', label: 'Texts', count: unreadTexts },
        ]).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Ionicons name={t.icon as any} size={16} color={activeTab === t.key ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
            {t.count > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{t.count}</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {activeTab === 'emails' ? (
          emails.length === 0 ? (
            <GlassCard style={styles.empty}>
              <Ionicons name="mail-outline" size={40} color={Colors.textDim} />
              <Text style={styles.emptyTitle}>No Emails Logged</Text>
              <Text style={styles.emptyText}>Tap + to log an email for KAIROS to reference.</Text>
            </GlassCard>
          ) : (
            emails.map(email => (
              <TouchableOpacity key={email.id} activeOpacity={0.8} onPress={() => !email.read && markEmailRead(email.id).then(load)}>
                <GlassCard style={[styles.item, !email.read && styles.itemUnread] as any}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemDotWrap}>
                      {!email.read && <View style={styles.dot} />}
                    </View>
                    <View style={styles.itemBody}>
                      <View style={styles.itemTopRow}>
                        <Text style={styles.itemFrom} numberOfLines={1}>{email.from}</Text>
                        <Text style={styles.itemTime}>{timeAgo(email.receivedAt)}</Text>
                      </View>
                      <Text style={styles.itemSubject} numberOfLines={1}>{email.subject}</Text>
                      <Text style={styles.itemPreview} numberOfLines={2}>{email.preview}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteEmail(email.id).then(load)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="trash-outline" size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))
          )
        ) : (
          texts.length === 0 ? (
            <GlassCard style={styles.empty}>
              <Ionicons name="chatbubble-outline" size={40} color={Colors.textDim} />
              <Text style={styles.emptyTitle}>No Texts Logged</Text>
              <Text style={styles.emptyText}>Tap + to log a text for KAIROS to reference.</Text>
            </GlassCard>
          ) : (
            texts.map(text => (
              <TouchableOpacity key={text.id} activeOpacity={0.8} onPress={() => !text.read && markTextRead(text.id).then(load)}>
                <GlassCard style={[styles.item, !text.read && styles.itemUnread] as any}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemDotWrap}>
                      {!text.read && <View style={styles.dot} />}
                    </View>
                    <View style={styles.itemBody}>
                      <View style={styles.itemTopRow}>
                        <Text style={styles.itemFrom} numberOfLines={1}>{text.from}</Text>
                        <Text style={styles.itemTime}>{timeAgo(text.receivedAt)}</Text>
                      </View>
                      <Text style={styles.itemPreview} numberOfLines={2}>{text.message}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteText(text.id).then(load)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="trash-outline" size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))
          )
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Log {activeTab === 'emails' ? 'Email' : 'Text'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={activeTab === 'emails' ? 'From (e.g. Bank)' : 'From (e.g. Mom)'}
              placeholderTextColor={Colors.textMuted}
              value={from}
              onChangeText={setFrom}
            />
            {activeTab === 'emails' && (
              <TextInput
                style={styles.modalInput}
                placeholder="Subject"
                placeholderTextColor={Colors.textMuted}
                value={subject}
                onChangeText={setSubject}
              />
            )}
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder={activeTab === 'emails' ? 'Preview / body' : 'Message'}
              placeholderTextColor={Colors.textMuted}
              value={body}
              onChangeText={setBody}
              multiline
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd}>
                <Text style={styles.confirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </HUDBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md,
  },
  headerTitle: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  headerSub: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row', marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, overflow: 'hidden',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.sm, gap: Spacing.xs,
  },
  tabActive: { backgroundColor: Colors.surfaceElevated },
  tabText: { color: Colors.textMuted, fontSize: FontSize.sm },
  tabTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  badge: {
    backgroundColor: Colors.accent, borderRadius: BorderRadius.full,
    paddingHorizontal: 6, paddingVertical: 1, marginLeft: 2,
  },
  badgeText: { color: Colors.background, fontSize: 10, fontWeight: FontWeight.bold },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg },
  empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl, marginTop: Spacing.lg },
  emptyTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center' },
  item: { marginBottom: Spacing.sm },
  itemUnread: { borderColor: Colors.primaryDim },
  itemRow: { flexDirection: 'row', gap: Spacing.sm },
  itemDotWrap: { width: 8, alignItems: 'center', paddingTop: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  itemBody: { flex: 1 },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemFrom: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.semibold, flex: 1 },
  itemTime: { color: Colors.textMuted, fontSize: FontSize.xs, marginLeft: Spacing.sm },
  itemSubject: { color: Colors.primary, fontSize: FontSize.sm, marginTop: 2 },
  itemPreview: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2, lineHeight: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl, padding: Spacing.xl,
    borderTopWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { color: Colors.primary, fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: Spacing.lg },
  modalInput: {
    backgroundColor: Colors.surfaceElevated, color: Colors.text,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, fontSize: FontSize.md, marginBottom: Spacing.sm,
  },
  modalTextArea: { minHeight: 80, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  cancelBtn: {
    flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelText: { color: Colors.textMuted, fontSize: FontSize.md },
  confirmBtn: {
    flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  confirmText: { color: Colors.background, fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
