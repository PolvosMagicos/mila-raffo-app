import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReduceMotion } from './use-reduce-motion';

export interface ShakeRef {
  trigger: () => void;
}

interface ShakeProps {
  children: React.ReactNode;
  style?: object;
}

export const Shake = forwardRef<ShakeRef, ShakeProps>(function Shake({ children, style }, ref) {
  const reduceMotion = useReduceMotion();
  const translateX = useSharedValue(0);

  useImperativeHandle(ref, () => ({
    trigger() {
      if (reduceMotion) return;
      translateX.value = withSequence(
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    },
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (reduceMotion) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
});
