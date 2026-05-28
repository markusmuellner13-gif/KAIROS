// Stock analysis service
// Uses Alpha Vantage free API for market data.
// NOTE: TradeRepublic does not offer a public API for automated trading.
// ARIA provides analysis signals; trades must be executed manually in TradeRepublic.
// IMPORTANT: No algorithm can guarantee profits. All investments carry risk.

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  lastUpdated: string;
}

export interface StockAnalysis {
  symbol: string;
  signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  rsi: number;
  trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
  support: number;
  resistance: number;
  notes: string;
}

export interface MarketOverview {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  topGainers: StockQuote[];
  topLosers: StockQuote[];
  lastUpdated: string;
}

// Alpha Vantage free tier: 25 requests/day
const AV_KEY = 'demo'; // Replace with real key in Settings

async function fetchAV(params: Record<string, string>): Promise<Record<string, unknown>> {
  const url = new URL('https://www.alphavantage.co/query');
  Object.entries({ ...params, apikey: AV_KEY }).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

export async function fetchQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const data = await fetchAV({ function: 'GLOBAL_QUOTE', symbol });
    const q = (data['Global Quote'] as Record<string, string>) ?? {};

    if (!q['05. price']) return getMockQuote(symbol);

    return {
      symbol,
      name: symbol,
      price: parseFloat(q['05. price']),
      change: parseFloat(q['09. change']),
      changePercent: parseFloat(q['10. change percent'].replace('%', '')),
      high: parseFloat(q['03. high']),
      low: parseFloat(q['04. low']),
      volume: parseInt(q['06. volume']),
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return getMockQuote(symbol);
  }
}

export async function fetchDailyTimeSeries(symbol: string): Promise<{ date: string; close: number }[]> {
  try {
    const data = await fetchAV({
      function: 'TIME_SERIES_DAILY',
      symbol,
      outputsize: 'compact',
    });
    const series = (data['Time Series (Daily)'] as Record<string, Record<string, string>>) ?? {};
    return Object.entries(series)
      .slice(0, 30)
      .map(([date, vals]) => ({ date, close: parseFloat(vals['4. close']) }))
      .reverse();
  } catch {
    return generateMockTimeSeries(30);
  }
}

export function analyzeStock(
  symbol: string,
  prices: { date: string; close: number }[],
  currentPrice: number,
): StockAnalysis {
  if (prices.length < 14) {
    return {
      symbol, signal: 'HOLD', confidence: 50, rsi: 50,
      trend: 'SIDEWAYS', support: currentPrice * 0.95,
      resistance: currentPrice * 1.05, notes: 'Insufficient data for analysis.',
    };
  }

  // RSI calculation (14-period)
  const changes = prices.slice(-15).map((p, i, arr) =>
    i === 0 ? 0 : arr[i].close - arr[i - 1].close,
  ).slice(1);

  const gains = changes.filter(c => c > 0);
  const losses = changes.filter(c => c < 0).map(c => Math.abs(c));
  const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / 14;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  // Simple moving averages
  const sma20 = prices.slice(-20).reduce((a, b) => a + b.close, 0) / Math.min(prices.length, 20);
  const sma5 = prices.slice(-5).reduce((a, b) => a + b.close, 0) / Math.min(prices.length, 5);

  const trend: StockAnalysis['trend'] =
    sma5 > sma20 * 1.01 ? 'UPTREND' :
    sma5 < sma20 * 0.99 ? 'DOWNTREND' : 'SIDEWAYS';

  const support = Math.min(...prices.slice(-10).map(p => p.close));
  const resistance = Math.max(...prices.slice(-10).map(p => p.close));

  let signal: StockAnalysis['signal'];
  let confidence: number;
  let notes: string;

  if (rsi < 30 && trend === 'DOWNTREND') {
    signal = 'STRONG_BUY'; confidence = 75;
    notes = 'Oversold (RSI < 30) with downtrend. Potential reversal.';
  } else if (rsi < 40 && trend !== 'DOWNTREND') {
    signal = 'BUY'; confidence = 60;
    notes = 'RSI approaching oversold territory. Consider accumulating.';
  } else if (rsi > 70 && trend === 'UPTREND') {
    signal = 'STRONG_SELL'; confidence = 70;
    notes = 'Overbought (RSI > 70). Consider taking profits.';
  } else if (rsi > 60) {
    signal = 'SELL'; confidence = 55;
    notes = 'RSI elevated. Monitor for signs of reversal.';
  } else {
    signal = 'HOLD'; confidence = 50;
    notes = 'Neutral zone. Wait for clearer signal.';
  }

  return { symbol, signal, confidence, rsi: Math.round(rsi), trend, support, resistance, notes };
}

export function signalColor(signal: StockAnalysis['signal']): string {
  switch (signal) {
    case 'STRONG_BUY': return '#00E676';
    case 'BUY': return '#69F0AE';
    case 'HOLD': return '#FFB300';
    case 'SELL': return '#FF7043';
    case 'STRONG_SELL': return '#FF3D71';
  }
}

// Mock data for demo/offline mode
function getMockQuote(symbol: string): StockQuote {
  const base = { AAPL: 189, TSLA: 248, NVDA: 875, AMZN: 182, MSFT: 415 };
  const price = (base as Record<string, number>)[symbol] ?? 100;
  const change = (Math.random() - 0.48) * price * 0.02;
  return {
    symbol, name: symbol,
    price: parseFloat((price + change).toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(((change / price) * 100).toFixed(2)),
    high: parseFloat((price * 1.01).toFixed(2)),
    low: parseFloat((price * 0.99).toFixed(2)),
    volume: Math.floor(Math.random() * 50000000),
    lastUpdated: new Date().toISOString(),
  };
}

function generateMockTimeSeries(days: number): { date: string; close: number }[] {
  const series = [];
  let price = 150 + Math.random() * 100;
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    price += (Math.random() - 0.48) * price * 0.015;
    series.push({ date: d.toISOString().split('T')[0], close: parseFloat(price.toFixed(2)) });
  }
  return series;
}

export const DEFAULT_WATCHLIST = ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT'];
