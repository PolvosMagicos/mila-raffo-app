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
import { useAddressesStore } from '@/modules/addresses';
import { FadeInView, PressScale } from '@/components/ui/animations';

const TOTAL_STEPS = 4;

export default function OnboardingStep3() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const addresses = useAddressesStore((s) => s.addresses);
  const address = addresses[addresses.length - 1];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.headerRow}>
        <StepDots total={TOTAL_STEPS} current={2} />
        <Text style={styles.stepLabel}>Paso 3 de 4</Text>
      </View>

      <View style={styles.content}>
        <FadeInView slideFrom="bottom" delay={0} duration={250}>
          <Text style={styles.title}>¿Confirmamos{'\n'}esta dirección?</Text>
          <Text style={styles.subtitle}>
            Esta será tu dirección de entrega predeterminada.
          </Text>
        </FadeInView>

        {address ? (
          <FadeInView delay={120} slideFrom="bottom" duration={250}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="location" size={20} color={Palette.accent} />
                <Text style={styles.cardTitle}>Dirección guardada</Text>
              </View>
              <View style={styles.cardDivider} />
              <Text style={styles.addressLine}>{address.streetAddress}</Text>
              {address.apartment ? (
                <Text style={styles.addressDetail}>{address.apartment}</Text>
              ) : null}
              <Text style={styles.addressDetail}>
                {address.city}, {address.stateProvince} {address.postalCode}
              </Text>
              <Text style={styles.addressDetail}>{address.country}</Text>
              {address.phone ? (
                <Text style={styles.addressDetail}>Tel: {address.phone}</Text>
              ) : null}
              {address.notes ? (
                <Text style={[styles.addressDetail, styles.notes]}>{address.notes}</Text>
              ) : null}
            </View>
          </FadeInView>
        ) : (
          <FadeInView delay={120} duration={250}>
            <View style={[styles.card, styles.cardEmpty]}>
              <Text style={styles.cardEmptyText}>No se encontró la dirección guardada.</Text>
            </View>
          </FadeInView>
        )}

        <FadeInView delay={240} slideFrom="bottom" duration={250}>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
              onPress={() => router.back()}
            >
              <Ionicons name="pencil-outline" size={16} color={colors.foreground} />
              <Text style={styles.editButtonText}>Editar</Text>
            </Pressable>

            <PressScale style={styles.flex}>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
                onPress={() => router.push('/step-4-finish' as never)}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </Pressable>
            </PressScale>
          </View>
        </FadeInView>
      </View>
    </SafeAreaView>
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
      gap: Spacing.four,
    },
    flex: { flex: 1 },
    title: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      color: colors.foreground,
      lineHeight: 44,
      marginBottom: Spacing.one,
    },
    subtitle: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      padding: Spacing.three,
      gap: Spacing.two,
      backgroundColor: colors.background,
    },
    cardEmpty: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 100,
    },
    cardEmptyText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    cardTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    cardDivider: {
      height: 1,
      backgroundColor: colors.border,
    },
    addressLine: {
      fontFamily: FontFamily.bodyBold ?? FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    addressDetail: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    notes: {
      fontStyle: 'italic',
      marginTop: Spacing.one,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.three,
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
    },
    editButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    confirmButton: {
      flex: 1,
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.sm,
      backgroundColor: Palette.accent,
    },
    confirmButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: '#fff',
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
