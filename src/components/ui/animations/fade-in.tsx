import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp } from 'react-native-reanimated';

import { useReduceMotion } from './use-reduce-motion';

type SlideDirection = 'bottom' | 'top' | 'left' | 'right';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  slideFrom?: SlideDirection;
  style?: object;
}

function getEntering(slideFrom: SlideDirection | undefined, duration: number, delay: number) {
  const distance = 16;
  switch (slideFrom) {
    case 'bottom':
      return FadeInDown.duration(duration).delay(delay).withInitialValues({ transform: [{ translateY: distance }] });
    case 'top':
      return FadeInUp.duration(duration).delay(delay).withInitialValues({ transform: [{ translateY: -distance }] });
    case 'left':
      return FadeInLeft.duration(duration).delay(delay).withInitialValues({ transform: [{ translateX: -distance }] });
    case 'right':
      return FadeInRight.duration(duration).delay(delay).withInitialValues({ transform: [{ translateX: distance }] });
    default:
      return FadeIn.duration(duration).delay(delay);
  }
}

export function FadeInView({
  children,
  delay = 0,
  duration = 200,
  slideFrom,
  style,
}: FadeInViewProps) {
  const reduceMotion = useReduceMotion();

  if (reduceMotion) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View entering={getEntering(slideFrom, duration, delay)} style={style}>
      {children}
    </Animated.View>
  );
}
