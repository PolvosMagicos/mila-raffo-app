import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

const CATEGORIES = [
  { name: 'Carteras', emoji: '', slug: 'carteras' },
  { name: 'Bolsos', emoji: '', slug: 'bolsos' },
  { name: 'Billeteras', emoji: '', slug: 'billeteras' },
  { name: 'Accesorios', emoji: '', slug: 'accesorios' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Bienvenida a</Text>
          <Text style={styles.brand}>Mila Raffo</Text>
          <Text style={styles.tagline}>Cuero artesanal con identidad propia</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.heroBanner, pressed && styles.pressed]}
          onPress={() => router.push('/catalog' as never)}
        >
          <View style={styles.heroBannerInner}>
            <Text style={styles.heroLabel}>Nueva colección</Text>
            <Text style={styles.heroTitle}>Piezas{'\n'}seleccionadas</Text>
            <View style={styles.heroCta}>
              <Text style={styles.heroCtaText}>Ver catálogo →</Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondaryBanner, pressed && styles.pressed]}
          onPress={() => router.push('/catalog' as never)}
        >
          <Text style={styles.secondaryBannerTitle}>Envíos a todo el país</Text>
          <Text style={styles.secondaryBannerSub}>Comprá con confianza · Envío gratis en pedidos +S/.150</Text>
        </Pressable>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Explorar por categoría</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.slug}
                accessibilityRole="button"
                style={({ pressed }) => [styles.categoryButton, pressed && styles.pressed]}
                onPress={() => router.push(`/catalog?category=${cat.slug}` as never)}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Mila Raffo</Text>
          <Text style={styles.footerTagline}>Cuero · Artesanía · Identidad</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: typeof Colors.light | typeof Colors.dark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.five,
      gap: Spacing.three,
    },
    header: {
      paddingTop: Spacing.two,
      gap: Spacing.one,
    },
    eyebrow: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    brand: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['4xl'],
      color: colors.foreground,
      lineHeight: FontSize['4xl'] * 1.05,
    },
    tagline: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: colors.muted,
    },
    heroBanner: {
      borderRadius: Radius.md,
      overflow: 'hidden',
      backgroundColor: colors.accent,
      minHeight: 220,
    },
    heroBannerInner: {
      flex: 1,
      padding: Spacing.four,
      justifyContent: 'flex-end',
      gap: Spacing.two,
    },
    heroLabel: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: 'rgba(255,255,255,0.75)',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    heroTitle: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      color: '#ffffff',
      lineHeight: FontSize['3xl'] * 1.1,
    },
    heroCta: {
      alignSelf: 'flex-start',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.6)',
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.one,
    },
    heroCtaText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: '#ffffff',
    },
    secondaryBanner: {
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.backgroundElement,
      padding: Spacing.three,
      gap: Spacing.one,
    },
    secondaryBannerTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    secondaryBannerSub: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    categoriesSection: {
      gap: Spacing.two,
    },
    sectionTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    categoryButton: {
      width: '47%',
      minHeight: 80,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.one,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      backgroundColor: colors.background,
    },
    categoryEmoji: {
      fontSize: 28,
    },
    categoryName: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    footer: {
      alignItems: 'center',
      paddingTop: Spacing.two,
      gap: Spacing.one,
    },
    footerBrand: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
    },
    footerTagline: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
