import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, FontFamily, FontSize, Palette, Radius, Spacing } from '@/constants/theme';
import { useOnboardingStore } from '@/modules/onboarding';
import { FadeInView, PressScale, Float } from '@/components/ui/animations';

const TOTAL_STEPS = 4;

const TIPS = [
  {
    icon: 'search-outline' as const,
    title: 'Explorá el catálogo',
    text: 'Navegá por nuestra colección y filtrá por categoría o precio.',
  },
  {
    icon: 'bag-add-outline' as const,
    title: 'Agregá al carrito',
    text: 'Seleccioná los productos que te gusten y agregálos a tu carrito.',
  },
  {
    icon: 'checkmark-circle-outline' as const,
    title: 'Confirmá tu pedido',
    text: 'Revisá tu carrito y completá el pago de forma segura.',
  },
] as const;

export default function OnboardingStep4() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const complete = useOnboardingStore((s) => s.complete);

  const handleStart = async () => {
    await complete();
    router.replace('/home' as never);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.headerRow}>
        <StepDots total={TOTAL_STEPS} current={3} />
        <Text style={styles.stepLabel}>Paso 4 de 4</Text>
      </View>

      <View style={styles.content}>
        <FadeInView slideFrom="bottom" delay={0} duration={250}>
          <Float amplitude={5} duration={2000}>
            <View style={styles.iconWrap}>
              <Ionicons name="bag-handle" size={56} color={Palette.accent} />
            </View>
          </Float>
        </FadeInView>

        <FadeInView slideFrom="bottom" delay={100} duration={250}>
          <Text style={styles.title}>¡Todo listo!{'\n'}Empecemos.</Text>
          <Text style={styles.subtitle}>
            Así funciona Mila Raffo:
          </Text>
        </FadeInView>

        <View style={styles.tips}>
          {TIPS.map((tip, i) => (
            <FadeInView key={tip.title} delay={200 + i * 100} slideFrom="bottom" duration={250}>
              <View style={styles.tipRow}>
                <View style={styles.tipIcon}>
                  <Ionicons name={tip.icon} size={22} color={Palette.accent} />
                </View>
                <View style={styles.tipText}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipBody}>{tip.text}</Text>
                </View>
              </View>
            </FadeInView>
          ))}
        </View>

        <FadeInView delay={550} slideFrom="bottom" duration={250} style={styles.ctaWrap}>
          <PressScale>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              onPress={handleStart}
            >
              <Text style={styles.buttonText}>Empezar a comprar</Text>
            </Pressable>
          </PressScale>
        </FadeInView>
      </View>
    </SafeAreaView>
  );
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[dotStyles.dot, i === current && dotStyles.dotActive]} />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db' },
  dotActive: { width: 20, backgroundColor: Palette.accent },
});

function createStyles(colors: typeof Colors.light | typeof Colors.dark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.three,
    },
    stepLabel: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    content: {
      flex: 1,
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
      paddingBottom: Spacing.five,
      gap: Spacing.four,
    },
    iconWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: `${Palette.accent}18`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      color: colors.foreground,
      lineHeight: 44,
      marginBottom: Spacing.one,
    },
    subtitle: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: colors.muted,
    },
    tips: {
      gap: Spacing.three,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.three,
    },
    tipIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: `${Palette.accent}15`,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    tipText: {
      flex: 1,
      gap: Spacing.half,
    },
    tipTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    tipBody: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
      lineHeight: 20,
    },
    ctaWrap: {
      marginTop: 'auto',
    },
    button: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.sm,
      backgroundColor: Palette.accent,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: '#fff',
      letterSpacing: 1,
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
