import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useReduceMotion } from './use-reduce-motion';

interface PressScaleProps extends PressableProps {
  children: React.ReactNode;
  scaleTo?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressScale({ children, scaleTo = 0.95, style, ...rest }: PressScaleProps) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (reduceMotion) {
    return (
      <Pressable style={style} {...rest}>
        {children}
      </Pressable>
    );
  }

  return (
    <AnimatedPressable
      style={[animatedStyle, style as object]}
      onPressIn={() => {
        scale.value = withSpring(scaleTo, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
