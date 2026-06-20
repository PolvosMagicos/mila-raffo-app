import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Palette, Radius, Spacing } from '@/constants/theme';
import { FadeInView, PressScale } from '@/components/ui/animations';

const BG = require('../../../assets/images/auth-bg.png');
const LOGO = require('../../../assets/images/logo-mila.png');
const TOTAL_STEPS = 4;

export default function OnboardingStep1() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>

          <View style={styles.top}>
            <FadeInView delay={0} duration={300}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            </FadeInView>
            <FadeInView delay={150} duration={300}>
              <View style={styles.divider} />
            </FadeInView>
            <FadeInView delay={250} slideFrom="bottom" duration={300}>
              <Text style={styles.headline}>Bienvenida a{'\n'}Mila Raffo</Text>
            </FadeInView>
            <FadeInView delay={380} slideFrom="bottom" duration={300}>
              <Text style={styles.subtext}>
                Carteras, bolsos y accesorios de cuero artesanales.{'\n'}
                Descubrí nuestra colección y recibilo en tu puerta.
              </Text>
            </FadeInView>
          </View>

          <View style={styles.bottom}>
            <FadeInView delay={500} slideFrom="bottom" duration={250}>
              <PressScale>
                <Pressable
                  accessibilityRole="button"
                  style={styles.button}
                  onPress={() => router.push('/step-2-address' as never)}
                >
                  <Text style={styles.buttonText}>Comenzar</Text>
                </Pressable>
              </PressScale>
            </FadeInView>

            <FadeInView delay={600} duration={250}>
              <StepDots total={TOTAL_STEPS} current={0} />
            </FadeInView>
          </View>

        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[dotStyles.dot, i === current && dotStyles.dotActive]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    width: 20,
    backgroundColor: Palette.accent,
  },
});

function createStyles(colors: typeof Colors.light | typeof Colors.dark) {
  return StyleSheet.create({
    bg: { flex: 1 },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10, 8, 6, 0.6)',
    },
    safe: { flex: 1 },
    container: {
      flex: 1,
      paddingHorizontal: Spacing.four,
      justifyContent: 'space-between',
      paddingTop: Spacing.six,
      paddingBottom: Spacing.five,
    },
    top: {
      alignItems: 'center',
      gap: Spacing.three,
    },
    logo: {
      width: 260,
      height: 104,
    },
    divider: {
      width: 36,
      height: 1.5,
      backgroundColor: Palette.accent,
      marginVertical: Spacing.one,
    },
    headline: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['4xl'],
      color: '#fff',
      textAlign: 'center',
      lineHeight: 56,
    },
    subtext: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'center',
      lineHeight: 24,
    },
    bottom: {
      gap: Spacing.four,
    },
    button: {
      backgroundColor: Palette.accent,
      borderRadius: Radius.full,
      paddingVertical: Spacing.three + 2,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: '#fff',
      letterSpacing: 1.5,
    },
  });
}
