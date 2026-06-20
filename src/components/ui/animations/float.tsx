import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from './use-reduce-motion';

interface FloatProps {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
  style?: object;
}

export function Float({ children, amplitude = 4, duration = 1800, style }: FloatProps) {
  const reduceMotion = useReduceMotion();
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    translateY.value = withRepeat(
      withTiming(amplitude, { duration }),
      -1,
      true,
    );
  }, [translateY, amplitude, duration, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (reduceMotion) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
