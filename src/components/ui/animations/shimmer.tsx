import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from './use-reduce-motion';

interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  baseColor?: string;
}

export function Shimmer({
  width = '100%',
  height,
  borderRadius = 6,
  style,
  baseColor = '#e5e7eb',
}: ShimmerProps) {
  const reduceMotion = useReduceMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      false,
    );
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as number, height, borderRadius, backgroundColor: baseColor },
        style,
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
