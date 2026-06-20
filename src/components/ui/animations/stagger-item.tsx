import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useReduceMotion } from './use-reduce-motion';

interface StaggerItemProps {
  index: number;
  children: React.ReactNode;
  style?: object;
}

const MAX_STAGGER_INDEX = 8;
const STAGGER_DELAY_MS = 60;

export function StaggerItem({ index, children, style }: StaggerItemProps) {
  const reduceMotion = useReduceMotion();

  if (reduceMotion) {
    return <View style={style}>{children}</View>;
  }

  const delay = Math.min(index, MAX_STAGGER_INDEX) * STAGGER_DELAY_MS;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(200)} style={style}>
      {children}
    </Animated.View>
  );
}
