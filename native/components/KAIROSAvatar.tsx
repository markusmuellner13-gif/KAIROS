import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import Svg, { Circle, G, Defs, RadialGradient, Stop, Line } from 'react-native-svg';
import { Colors } from '../constants/theme';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  isActive: boolean;
  isSpeaking: boolean;
  size?: number;
}

// Jarvis-style arc-reactor HUD core: layered rotating rings, tick marks,
// a pulsing gradient core, and a speaking waveform on the outer band.
export default function KAIROSAvatar({ isActive, isSpeaking, size = 80 }: Props) {
  const outerRotate = useRef(new Animated.Value(0)).current;
  const innerRotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;

  const engaged = isActive || isSpeaking;

  useEffect(() => {
    const outerLoop = Animated.loop(
      Animated.timing(outerRotate, { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: true }),
    );
    const innerLoop = Animated.loop(
      Animated.timing(innerRotate, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true }),
    );
    outerLoop.start();
    innerLoop.start();
    return () => { outerLoop.stop(); innerLoop.stop(); };
  }, []);

  useEffect(() => {
    if (engaged) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
          Animated.timing(pulse, { toValue: 0.35, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        ]),
      ).start();
    } else {
      Animated.timing(pulse, { toValue: 0.15, duration: 400, useNativeDriver: false }).start();
    }
  }, [engaged]);

  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wave, { toValue: 1, duration: 260, useNativeDriver: false }),
          Animated.timing(wave, { toValue: 0.2, duration: 260, useNativeDriver: false }),
        ]),
      ).start();
    } else {
      wave.stopAnimation();
      Animated.timing(wave, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  }, [isSpeaking]);

  const half = (size + 44) / 2;
  const outerR = size / 2 + 20;
  const midR = size / 2 + 10;
  const coreR = size / 2 - 6;

  const outerDeg = outerRotate.interpolate({ inputRange: [0, 1], outputRange: [0, 360] });
  const innerDeg = innerRotate.interpolate({ inputRange: [0, 1], outputRange: [360, 0] });
  const coreOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const waveScale = wave.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });

  const tickCount = 24;
  const ticks = Array.from({ length: tickCount }).map((_, i) => {
    const angle = (i / tickCount) * Math.PI * 2;
    const inner = outerR - 5;
    const outer = outerR;
    return (
      <Line
        key={i}
        x1={half + inner * Math.cos(angle)}
        y1={half + inner * Math.sin(angle)}
        x2={half + outer * Math.cos(angle)}
        y2={half + outer * Math.sin(angle)}
        stroke={Colors.primary}
        strokeWidth={i % 3 === 0 ? 2 : 1}
        strokeOpacity={i % 3 === 0 ? 0.8 : 0.35}
      />
    );
  });

  return (
    <View style={{ width: half * 2, height: half * 2, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={half * 2} height={half * 2}>
        <Defs>
          <RadialGradient id="core" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity={1} />
            <Stop offset="55%" stopColor={Colors.primaryDim} stopOpacity={0.9} />
            <Stop offset="100%" stopColor={Colors.surfaceElevated} stopOpacity={1} />
          </RadialGradient>
        </Defs>

        {/* Tick ring — fixed */}
        <G>{ticks}</G>

        {/* Outer segmented ring — slow rotation */}
        <AnimatedG origin={`${half}, ${half}`} rotation={outerDeg as unknown as number}>
          <Circle
            cx={half} cy={half} r={outerR - 3}
            stroke={Colors.secondary}
            strokeWidth={2}
            strokeDasharray="10 14"
            fill="none"
            strokeOpacity={0.7}
          />
        </AnimatedG>

        {/* Mid dashed ring — opposite rotation */}
        <AnimatedG origin={`${half}, ${half}`} rotation={innerDeg as unknown as number}>
          <Circle
            cx={half} cy={half} r={midR}
            stroke={Colors.primary}
            strokeWidth={1.5}
            strokeDasharray="2 6"
            fill="none"
            strokeOpacity={0.6}
          />
        </AnimatedG>

        {/* Speaking waveform ring */}
        {isSpeaking && (
          <AnimatedCircle
            cx={half} cy={half} r={midR + 4}
            stroke={Colors.accent}
            strokeWidth={1.5}
            fill="none"
            strokeOpacity={0.5}
          />
        )}

        {/* Glowing core */}
        <AnimatedCircle
          cx={half} cy={half} r={coreR}
          fill="url(#core)"
          opacity={coreOpacity}
        />
        <Circle cx={half} cy={half} r={coreR} stroke={Colors.primary} strokeWidth={2} fill="none" />
      </Svg>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.speakPulse,
          {
            width: size * 0.5, height: size * 0.5, borderRadius: size,
            transform: [{ scale: waveScale }],
            opacity: isSpeaking ? 0.5 : 0,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  speakPulse: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
});
