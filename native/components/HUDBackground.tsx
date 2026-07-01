import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
  corners?: boolean;
}

// Cinematic HUD backdrop: base gradient + faint grid + drifting scanline + vignette corners.
export default function HUDBackground({ children, corners = true }: Props) {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 6000, useNativeDriver: true }),
    ).start();
  }, []);

  const translateY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, height] });
  const scanOpacity = scanAnim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 0.35, 0.35, 0],
  });

  return (
    <LinearGradient colors={['#060810', '#0A0E1A', '#0D1429', '#080B15']} style={styles.gradient}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgLinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={Colors.primary} stopOpacity={0} />
              <Stop offset="0.5" stopColor={Colors.primary} stopOpacity={0.06} />
              <Stop offset="1" stopColor={Colors.primary} stopOpacity={0} />
            </SvgLinearGradient>
          </Defs>
          {Array.from({ length: Math.ceil(width / 40) }).map((_, i) => (
            <Line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={height} stroke={Colors.primary} strokeOpacity={0.035} strokeWidth={1} />
          ))}
          {Array.from({ length: Math.ceil(height / 40) }).map((_, i) => (
            <Line key={`h${i}`} x1={0} y1={i * 40} x2={width} y2={i * 40} stroke={Colors.primary} strokeOpacity={0.035} strokeWidth={1} />
          ))}
          <Rect x={0} y={0} width={width} height={height} fill="url(#fade)" />
        </Svg>

        <Animated.View
          style={[styles.scanline, { opacity: scanOpacity, transform: [{ translateY }] }]}
        />

        {corners && (
          <>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </>
        )}
      </View>
      {children}
    </LinearGradient>
  );
}

const CORNER_SIZE = 22;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: Colors.primary,
    opacity: 0.04,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Colors.primary,
    opacity: 0.5,
  },
  cornerTL: { top: 48, left: 10, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 48, right: 10, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2 },
});
