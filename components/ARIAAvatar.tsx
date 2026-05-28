import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { Colors, FontSize, FontWeight } from '../constants/theme';

interface Props {
  isActive: boolean;
  isSpeaking: boolean;
  size?: number;
}

export default function ARIAAvatar({ isActive, isSpeaking, size = 80 }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive || isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 8000, useNativeDriver: true }),
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1000, useNativeDriver: false }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      rotateAnim.stopAnimation();
      glowAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      Animated.timing(glowAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    }
  }, [isActive, isSpeaking]);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.5] });

  return (
    <View style={[styles.container, { width: size + 40, height: size + 40 }]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          { width: size + 36, height: size + 36, borderRadius: (size + 36) / 2, opacity: glowOpacity },
        ]}
      />
      {/* Rotating ring */}
      <Animated.View
        style={[
          styles.rotatingRing,
          { width: size + 20, height: size + 20, borderRadius: (size + 20) / 2, transform: [{ rotate }] },
        ]}
      />
      {/* Core avatar */}
      <Animated.View
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2, transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>A</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  rotatingRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  avatar: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  avatarText: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});
