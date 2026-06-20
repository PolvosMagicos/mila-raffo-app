import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { useReduceMotion } from './use-reduce-motion';

export interface BounceRef {
  trigger: () => void;
}

interface BounceProps {
  children: React.ReactNode;
  style?: object;
}

export const Bounce = forwardRef<BounceRef, BounceProps>(function Bounce({ children, style }, ref) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);

  useImperativeHandle(ref, () => ({
    trigger() {
      if (reduceMotion) return;
      scale.value = withSequence(
        withSpring(1.25, { damping: 5, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    },
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
