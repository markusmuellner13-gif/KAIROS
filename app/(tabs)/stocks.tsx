import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';
import { STORAGE_KEYS } from '../../constants/config';
import { Storage, StockWatchlistItem, PortfolioItem } from '../../services/storage';
import {
  fetchQuote, fetchDailyTimeSeries, analyzeStock,
  StockQuote, StockAnalysis, signalColor, DEFAULT_WATCHLIST,
} from '../../services/stocks';
import StockCard from '../../components/StockCard';
import GlassCard from '../../components/GlassCard';

type Tab = 'watchlist' | 'portfolio';

interface StockData {
  quote: StockQuote;
  analysis: StockAnalysis;
}

export default function StocksScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('watchlist');
  const [watchlist, setWatchlist] = useState<StockWatchlistItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [portSymbol, setPortSymbol] = useState('');
  const [portShares, setPortShares] = useState('');
  const [portPrice, setPortPrice] = useState('');

  const loadStockData = useCallback(async (symbols: string[]) => {
    setLoading(true);
    const results: Record<string, StockData> = {};
    for (const sym of symbols) {
      const [quote, series] = await Promise.all([
        fetchQuote(sym),
        fetchDailyTimeSeries(sym),
      ]);
      if (quote) {
        const analysis = analyzeStock(sym, series, quote.price);
        results[sym] = { quote, analysis };
      }
    }
    setStockData(prev => ({ ...prev, ...results }));
    setLoading(false);
  }, []);

  const load = useCallback(async () => {
    const [wl, port] = await Promise.all([
      Storage.load<StockWatchlistItem[]>(STORAGE_KEYS.STOCK_WATCHLIST),
      Storage.load<PortfolioItem[]>(STORAGE_KEYS.STOCK_PORTFOLIO),
    ]);

    let watchlistItems = wl;
    if (!watchlistItems || watchlistItems.length === 0) {
      watchlistItems = DEFAULT_WATCHLIST.map(sym => ({
        symbol: sym, name: sym, addedAt: new Date().toISOString(),
      }));
      await Storage.save(STORAGE_KEYS.STOCK_WATCHLIST, watchlistItems);
    }

    setWatchlist(watchlistItems);
    setPortfolio(port ?? []);

    const symbols = watchlistItems.map(w => w.symbol);
    await loadStockData(symbols);
  }, [loadStockData]);

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const symbols = watchlist.map(w => w.symbol);
    await loadStockData(symbols);
    setRefreshing(false);
  }, [watchlist, loadStockData]);

  const addToWatchlist = useCallback(async () => {
    const sym = newSymbol.trim().toUpperCase();
    if (!sym) return;
    if (watchlist.some(w => w.symbol === sym)) {
      Alert.alert('ARIA', `${sym} is already in your watchlist.`);
      return;
    }
    const item: StockWatchlistItem = { symbol: sym, name: sym, addedAt: new Date().toISOString() };
    const updated = [...watchlist, item];
    await Storage.save(STORAGE_KEYS.STOCK_WATCHLIST, updated);
    setWatchlist(updated);
    setShowAddModal(false);
    setNewSymbol('');
    await loadStockData([sym]);
  }, [newSymbol, watchlist, loadStockData]);

  const removeFromWatchlist = useCallback(async (symbol: string) => {
    const updated = watchlist.filter(w => w.symbol !== symbol);
    await Storage.save(STORAGE_KEYS.STOCK_WATCHLIST, updated);
    setWatchlist(updated);
  }, [watchlist]);

  const addToPortfolio = useCallback(async () => {
    const sym = portSymbol.trim().toUpperCase();
    if (!sym || !portShares || !portPrice) {
      Alert.alert('ARIA', 'Please fill in symbol, shares, and average buy price.');
      return;
    }
    const existing = portfolio.find(p => p.symbol === sym);
    let updated: PortfolioItem[];
    if (existing) {
      updated = portfolio.map(p => p.symbol === sym
        ? { ...p, shares: p.shares + parseFloat(portShares), avgBuyPrice: parseFloat(portPrice) }
        : p,
      );
    } else {
      const item: PortfolioItem = {
        symbol: sym, name: sym,
        shares: parseFloat(portShares),
        avgBuyPrice: parseFloat(portPrice),
        addedAt: new Date().toISOString(),
      };
      updated = [...portfolio, item];
    }
    await Storage.save(STORAGE_KEYS.STOCK_PORTFOLIO, updated);
    setPortfolio(updated);
    setShowPortfolioModal(false);
    setPortSymbol(''); setPortShares(''); setPortPrice('');
    await loadStockData([sym]);
  }, [portSymbol, portShares, portPrice, portfolio, loadStockData]);

  const portfolioValue = portfolio.reduce((sum, item) => {
    const data = stockData[item.symbol];
    return sum + (data ? data.quote.price * item.shares : item.avgBuyPrice * item.shares);
  }, 0);

  const portfolioCost = portfolio.reduce((sum, item) => sum + item.avgBuyPrice * item.shares, 0);
  const portfolioPnL = portfolioValue - portfolioCost;
  const portfolioPnLPct = portfolioCost > 0 ? (portfolioPnL / portfolioCost) * 100 : 0;

  return (
    <LinearGradient colors={['#0A0E1A', '#0D1429', '#0A0E1A']} style={styles.gradient}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Markets</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => activeTab === 'watchlist' ? setShowAddModal(true) : setShowPortfolioModal(true)}
        >
          <Ionicons name="add" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={13} color={Colors.warning} />
        <Text style={styles.disclaimerText}>
          Analysis signals only. All investments carry risk. No profit is guaranteed.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['watchlist', 'portfolio'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={tab === 'watchlist' ? 'eye-outline' : 'briefcase-outline'}
              size={16}
              color={activeTab === tab ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={Colors.primary} size="small" />
            <Text style={styles.loadingText}>Fetching market data...</Text>
          </View>
        )}

        {activeTab === 'watchlist' ? (
          watchlist.length === 0 ? (
            <GlassCard style={styles.empty}>
              <Ionicons name="eye-outline" size={40} color={Colors.textDim} />
              <Text style={styles.emptyTitle}>No Stocks Watched</Text>
              <Text style={styles.emptyText}>Tap + to add stocks to your watchlist.</Text>
            </GlassCard>
          ) : (
            watchlist.map(item => {
              const data = stockData[item.symbol];
              return data ? (
                <StockCard
                  key={item.symbol}
                  quote={data.quote}
                  analysis={data.analysis}
                  onRemove={removeFromWatchlist}
                />
              ) : (
                <GlassCard key={item.symbol} style={styles.loadingCard}>
                  <Text style={styles.symbolLoading}>{item.symbol}</Text>
                  <ActivityIndicator color={Colors.primary} size="small" />
                </GlassCard>
              );
            })
          )
        ) : (
          <>
            {/* Portfolio Summary */}
            {portfolio.length > 0 && (
              <GlassCard style={styles.summaryCard} glowing={portfolioPnL >= 0}>
                <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
                <Text style={styles.summaryValue}>${portfolioValue.toFixed(2)}</Text>
                <View style={styles.summaryRow}>
                  <Text style={[styles.pnl, { color: portfolioPnL >= 0 ? Colors.success : Colors.error }]}>
                    {portfolioPnL >= 0 ? '+' : ''}${portfolioPnL.toFixed(2)} ({portfolioPnLPct.toFixed(2)}%)
                  </Text>
                  <Text style={styles.summaryMeta}>vs. cost basis ${portfolioCost.toFixed(2)}</Text>
                </View>
              </GlassCard>
            )}

            {portfolio.length === 0 ? (
              <GlassCard style={styles.empty}>
                <Ionicons name="briefcase-outline" size={40} color={Colors.textDim} />
                <Text style={styles.emptyTitle}>No Portfolio Items</Text>
                <Text style={styles.emptyText}>Tap + to add your TradeRepublic holdings.</Text>
              </GlassCard>
            ) : (
              portfolio.map(item => {
                const data = stockData[item.symbol];
                const currentPrice = data?.quote.price ?? item.avgBuyPrice;
                const pnl = (currentPrice - item.avgBuyPrice) * item.shares;
                const pnlPct = ((currentPrice - item.avgBuyPrice) / item.avgBuyPrice) * 100;

                return (
                  <GlassCard key={item.symbol} style={styles.portCard}>
                    <View style={styles.portHeader}>
                      <Text style={styles.portSymbol}>{item.symbol}</Text>
                      <Text style={styles.portShares}>{item.shares} shares</Text>
                    </View>
                    <View style={styles.portRow}>
                      <View>
                        <Text style={styles.portLabel}>Current</Text>
                        <Text style={styles.portPrice}>${currentPrice.toFixed(2)}</Text>
                      </View>
                      <View>
                        <Text style={styles.portLabel}>Avg Buy</Text>
                        <Text style={styles.portPrice}>${item.avgBuyPrice.toFixed(2)}</Text>
                      </View>
                      <View>
                        <Text style={styles.portLabel}>P&L</Text>
                        <Text style={[styles.portPrice, { color: pnl >= 0 ? Colors.success : Colors.error }]}>
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          {'\n'}
                          <Text style={{ fontSize: FontSize.xs }}>({pnlPct.toFixed(1)}%)</Text>
                        </Text>
                      </View>
                    </View>
                    {data?.analysis && (
                      <View style={[styles.signalRow, { backgroundColor: signalColor(data.analysis.signal) + '18' }]}>
                        <Ionicons name="analytics-outline" size={13} color={signalColor(data.analysis.signal)} />
                        <Text style={[styles.signalNote, { color: signalColor(data.analysis.signal) }]}>
                          {data.analysis.signal.replace('_', ' ')} — {data.analysis.notes}
                        </Text>
                      </View>
                    )}
                  </GlassCard>
                );
              })
            )}
          </>
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Add to Watchlist Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add to Watchlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Stock Symbol (e.g. AAPL, TSLA)"
              placeholderTextColor={Colors.textMuted}
              value={newSymbol}
              onChangeText={setNewSymbol}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={addToWatchlist}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={addToWatchlist}>
                <Text style={styles.confirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add to Portfolio Modal */}
      <Modal visible={showPortfolioModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add to Portfolio</Text>
            <Text style={styles.modalNote}>Enter your TradeRepublic holdings manually.</Text>
            {[
              { placeholder: 'Symbol (e.g. AAPL)', value: portSymbol, set: setPortSymbol, caps: true as const },
              { placeholder: 'Number of Shares', value: portShares, set: setPortShares, caps: false as const },
              { placeholder: 'Average Buy Price (€)', value: portPrice, set: setPortPrice, caps: false as const },
            ].map(({ placeholder, value, set, caps }) => (
              <TextInput
                key={placeholder}
                style={styles.modalInput}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMuted}
                value={value}
                onChangeText={set}
                autoCapitalize={caps ? 'characters' : 'none'}
                keyboardType={caps ? 'default' : 'decimal-pad'}
              />
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPortfolioModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={addToPortfolio}>
                <Text style={styles.confirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.sm,
  },
  headerTitle: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  addBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  disclaimer: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.warning + '33',
  },
  disclaimerText: { color: Colors.warning, fontSize: 10, flex: 1 },
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
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.md },
  loadingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.sm },
  loadingCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  symbolLoading: { color: Colors.textMuted, fontSize: FontSize.md, fontWeight: FontWeight.medium },
  empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl, marginTop: Spacing.md },
  emptyTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm },
  summaryCard: { marginBottom: Spacing.md, gap: 4 },
  summaryLabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  summaryValue: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: 2 },
  pnl: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  summaryMeta: { color: Colors.textMuted, fontSize: FontSize.xs },
  portCard: { marginBottom: Spacing.sm, gap: Spacing.sm },
  portHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  portSymbol: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  portShares: { color: Colors.textMuted, fontSize: FontSize.sm },
  portRow: { flexDirection: 'row', justifyContent: 'space-between' },
  portLabel: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: 2 },
  portPrice: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  signalRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 5,
    borderRadius: BorderRadius.sm, padding: Spacing.sm,
  },
  signalNote: { fontSize: FontSize.xs, flex: 1, lineHeight: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl, padding: Spacing.xl,
    borderTopWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { color: Colors.primary, fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  modalNote: { color: Colors.textMuted, fontSize: FontSize.sm, marginBottom: Spacing.md },
  modalInput: {
    backgroundColor: Colors.surfaceElevated, color: Colors.text,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, fontSize: FontSize.md, marginBottom: Spacing.sm,
  },
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
