import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const LOGO = require('@/assets/images/logo-mila.png');
const BACKGROUND = '#EC7C43';
const FADE_DURATION = 350;

interface BrandedSplashProps {
  shouldHide: boolean;
  onHidden: () => void;
}

export function BrandedSplash({ shouldHide, onHidden }: BrandedSplashProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!shouldHide) return;
    opacity.value = withTiming(0, { duration: FADE_DURATION }, (finished) => {
      if (finished) runOnJS(onHidden)();
    });
  }, [shouldHide, opacity, onHidden]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  // Logo inicia visible — el splash nativo (mismo fondo naranja) cubre la transición.
  const logoStyle = useAnimatedStyle(() => ({ opacity: 1 }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={logoStyle}>
        <Image source={LOGO} style={styles.logo} contentFit="contain" />
      </Animated.View>
      <Animated.View style={styles.bar} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  logo: {
    width: 240,
    height: 96,
  },
  bar: {
    position: 'absolute',
    bottom: 56,
    width: 36,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ffffff',
  },
});
