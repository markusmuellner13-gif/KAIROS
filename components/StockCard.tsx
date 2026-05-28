import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import { StockQuote, StockAnalysis, signalColor } from '../services/stocks';

interface Props {
  quote: StockQuote;
  analysis?: StockAnalysis;
  onPress?: () => void;
  onRemove?: (symbol: string) => void;
}

export default function StockCard({ quote, analysis, onPress, onRemove }: Props) {
  const isPositive = quote.change >= 0;
  const changeColor = isPositive ? Colors.success : Colors.error;
  const changeIcon = isPositive ? 'trending-up' : 'trending-down';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.left}>
        <View style={styles.symbolBadge}>
          <Text style={styles.symbolText}>{quote.symbol.slice(0, 4)}</Text>
        </View>
        <View>
          <Text style={styles.symbol}>{quote.symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>{quote.name}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>${quote.price.toFixed(2)}</Text>
        <View style={styles.changeRow}>
          <Ionicons name={changeIcon as any} size={12} color={changeColor} />
          <Text style={[styles.change, { color: changeColor }]}>
            {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
          </Text>
        </View>
        {analysis && (
          <View style={[styles.signalBadge, { backgroundColor: signalColor(analysis.signal) + '22' }]}>
            <Text style={[styles.signalText, { color: signalColor(analysis.signal) }]}>
              {analysis.signal.replace('_', ' ')}
            </Text>
          </View>
        )}
      </View>

      {onRemove && (
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => onRemove(quote.symbol)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={18} color={Colors.textDim} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  symbolBadge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  symbol: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  name: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    maxWidth: 120,
  },
  right: {
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
  },
  price: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  change: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  signalBadge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  signalText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  removeBtn: {
    padding: 4,
  },
});
