'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, X, Eye, Briefcase, TrendingUp, TrendingDown, Info } from 'lucide-react';
import HUDShell from '../../components/HUDShell';
import GlassCard from '../../components/GlassCard';
import { Colors } from '../../lib/theme';
import { STORAGE_KEYS } from '../../lib/config';
import { Storage, StockWatchlistItem, PortfolioItem } from '../../lib/storage';
import { fetchQuote, fetchDailyTimeSeries, analyzeStock, StockQuote, StockAnalysis, signalColor, DEFAULT_WATCHLIST } from '../../lib/stocks';

type Tab = 'watchlist' | 'portfolio';
interface StockData { quote: StockQuote; analysis: StockAnalysis; }

export default function MarketsPage() {
  const [tab, setTab] = useState<Tab>('watchlist');
  const [watchlist, setWatchlist] = useState<StockWatchlistItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPortModal, setShowPortModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [portSymbol, setPortSymbol] = useState('');
  const [portShares, setPortShares] = useState('');
  const [portPrice, setPortPrice] = useState('');

  const loadStockData = useCallback(async (symbols: string[]) => {
    setLoading(true);
    const results: Record<string, StockData> = {};
    await Promise.all(symbols.map(async (sym) => {
      const [quote, series] = await Promise.all([fetchQuote(sym), fetchDailyTimeSeries(sym)]);
      if (quote) results[sym] = { quote, analysis: analyzeStock(sym, series, quote.price) };
    }));
    setStockData(prev => ({ ...prev, ...results }));
    setLoading(false);
  }, []);

  const load = useCallback(() => {
    let wl = Storage.load<StockWatchlistItem[]>(STORAGE_KEYS.STOCK_WATCHLIST);
    if (!wl || wl.length === 0) {
      wl = DEFAULT_WATCHLIST.map(symbol => ({ symbol, name: symbol, addedAt: new Date().toISOString() }));
      Storage.save(STORAGE_KEYS.STOCK_WATCHLIST, wl);
    }
    setWatchlist(wl);
    setPortfolio(Storage.load<PortfolioItem[]>(STORAGE_KEYS.STOCK_PORTFOLIO) ?? []);
    loadStockData(wl.map(w => w.symbol));
  }, [loadStockData]);

  useEffect(() => { load(); }, [load]);

  const addToWatchlist = () => {
    const sym = newSymbol.trim().toUpperCase();
    if (!sym) return;
    if (watchlist.some(w => w.symbol === sym)) { alert(`${sym} is already in your watchlist.`); return; }
    const updated = [...watchlist, { symbol: sym, name: sym, addedAt: new Date().toISOString() }];
    Storage.save(STORAGE_KEYS.STOCK_WATCHLIST, updated);
    setWatchlist(updated);
    setShowAddModal(false);
    setNewSymbol('');
    loadStockData([sym]);
  };

  const removeFromWatchlist = (symbol: string) => {
    const updated = watchlist.filter(w => w.symbol !== symbol);
    Storage.save(STORAGE_KEYS.STOCK_WATCHLIST, updated);
    setWatchlist(updated);
  };

  const addToPortfolio = () => {
    const sym = portSymbol.trim().toUpperCase();
    if (!sym || !portShares || !portPrice) { alert('Please fill in symbol, shares, and average buy price.'); return; }
    const existing = portfolio.find(p => p.symbol === sym);
    const updated = existing
      ? portfolio.map(p => p.symbol === sym ? { ...p, shares: p.shares + parseFloat(portShares), avgBuyPrice: parseFloat(portPrice) } : p)
      : [...portfolio, { symbol: sym, name: sym, shares: parseFloat(portShares), avgBuyPrice: parseFloat(portPrice), addedAt: new Date().toISOString() }];
    Storage.save(STORAGE_KEYS.STOCK_PORTFOLIO, updated);
    setPortfolio(updated);
    setShowPortModal(false);
    setPortSymbol(''); setPortShares(''); setPortPrice('');
    loadStockData([sym]);
  };

  const portfolioValue = portfolio.reduce((sum, item) => sum + (stockData[item.symbol]?.quote.price ?? item.avgBuyPrice) * item.shares, 0);
  const portfolioCost = portfolio.reduce((sum, item) => sum + item.avgBuyPrice * item.shares, 0);
  const portfolioPnL = portfolioValue - portfolioCost;
  const portfolioPnLPct = portfolioCost > 0 ? (portfolioPnL / portfolioCost) * 100 : 0;

  return (
    <HUDShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 26, fontWeight: 700 }}>Markets</div>
        <button
          onClick={() => tab === 'watchlist' ? setShowAddModal(true) : setShowPortModal(true)}
          style={{ width: 38, height: 38, borderRadius: 19, border: '1.5px solid var(--primary)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Plus size={20} color={Colors.primary} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface-elevated)', border: '1px solid rgba(255,179,0,0.2)', borderRadius: 8, padding: '6px 10px', marginBottom: 12 }}>
        <Info size={13} color={Colors.warning} />
        <span style={{ color: 'var(--warning)', fontSize: 10 }}>Analysis signals only. All investments carry risk. No profit is guaranteed.</span>
      </div>

      <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        {([{ key: 'watchlist' as Tab, icon: Eye, label: 'Watchlist' }, { key: 'portfolio' as Tab, icon: Briefcase, label: 'Portfolio' }]).map(t => (
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
            <t.icon size={16} />{t.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>Fetching market data...</div>}

      {tab === 'watchlist' ? (
        watchlist.length === 0 ? (
          <EmptyState icon={<Eye size={36} color={Colors.textDim} />} title="No Stocks Watched" text="Tap + to add stocks to your watchlist." />
        ) : (
          watchlist.map(item => {
            const data = stockData[item.symbol];
            if (!data) return <GlassCard key={item.symbol} style={{ marginBottom: 8, color: 'var(--text-muted)' }}>{item.symbol} — loading...</GlassCard>;
            const positive = data.quote.change >= 0;
            return (
              <GlassCard key={item.symbol} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--surface-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>{item.symbol.slice(0, 4)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.symbol}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{data.quote.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>${data.quote.price.toFixed(2)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', color: positive ? Colors.success : Colors.error, fontSize: 12 }}>
                    {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {positive ? '+' : ''}{data.quote.changePercent.toFixed(2)}%
                  </div>
                  <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 6px', background: `${signalColor(data.analysis.signal)}22`, color: signalColor(data.analysis.signal) }}>
                    {data.analysis.signal.replace('_', ' ')}
                  </span>
                </div>
                <button onClick={() => removeFromWatchlist(item.symbol)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <X size={18} color={Colors.textDim} />
                </button>
              </GlassCard>
            );
          })
        )
      ) : (
        <>
          {portfolio.length > 0 && (
            <GlassCard glow={portfolioPnL >= 0} style={{ marginBottom: 16 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Total Portfolio Value</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>${portfolioValue.toFixed(2)}</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, alignItems: 'center' }}>
                <span style={{ color: portfolioPnL >= 0 ? Colors.success : Colors.error, fontWeight: 600 }}>
                  {portfolioPnL >= 0 ? '+' : ''}${portfolioPnL.toFixed(2)} ({portfolioPnLPct.toFixed(2)}%)
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>vs. cost basis ${portfolioCost.toFixed(2)}</span>
              </div>
            </GlassCard>
          )}
          {portfolio.length === 0 ? (
            <EmptyState icon={<Briefcase size={36} color={Colors.textDim} />} title="No Portfolio Items" text="Tap + to add your TradeRepublic holdings." />
          ) : (
            portfolio.map(item => {
              const data = stockData[item.symbol];
              const currentPrice = data?.quote.price ?? item.avgBuyPrice;
              const pnl = (currentPrice - item.avgBuyPrice) * item.shares;
              const pnlPct = ((currentPrice - item.avgBuyPrice) / item.avgBuyPrice) * 100;
              return (
                <GlassCard key={item.symbol} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 18 }}>{item.symbol}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{item.shares} shares</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Current</div><div style={{ fontWeight: 600 }}>${currentPrice.toFixed(2)}</div></div>
                    <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Avg Buy</div><div style={{ fontWeight: 600 }}>${item.avgBuyPrice.toFixed(2)}</div></div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>P&L</div>
                      <div style={{ fontWeight: 600, color: pnl >= 0 ? Colors.success : Colors.error }}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} <span style={{ fontSize: 11 }}>({pnlPct.toFixed(1)}%)</span>
                      </div>
                    </div>
                  </div>
                  {data?.analysis && (
                    <div style={{ marginTop: 8, borderRadius: 8, padding: 8, background: `${signalColor(data.analysis.signal)}18`, color: signalColor(data.analysis.signal), fontSize: 12 }}>
                      {data.analysis.signal.replace('_', ' ')} — {data.analysis.notes}
                    </div>
                  )}
                </GlassCard>
              );
            })
          )}
        </>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ color: 'var(--primary)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Add to Watchlist</div>
            <input className="input" placeholder="Stock Symbol (e.g. AAPL, TSLA)" value={newSymbol} onChange={e => setNewSymbol(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && addToWatchlist()} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={addToWatchlist}>Add</button>
            </div>
          </div>
        </div>
      )}

      {showPortModal && (
        <div className="modal-overlay" onClick={() => setShowPortModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ color: 'var(--primary)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Add to Portfolio</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>Enter your TradeRepublic holdings manually.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input" placeholder="Symbol (e.g. AAPL)" value={portSymbol} onChange={e => setPortSymbol(e.target.value.toUpperCase())} />
              <input className="input" placeholder="Number of Shares" value={portShares} onChange={e => setPortShares(e.target.value)} />
              <input className="input" placeholder="Average Buy Price (€)" value={portPrice} onChange={e => setPortPrice(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowPortModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={addToPortfolio}>Save</button>
            </div>
          </div>
        </div>
      )}
    </HUDShell>
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
