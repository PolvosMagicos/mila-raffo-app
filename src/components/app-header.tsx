import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { Bounce, type BounceRef } from '@/components/ui/animations';
import { useCartStore } from '@/modules/cart';

export function AppHeader() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const bounceRef = useRef<BounceRef>(null);

  const itemCount = useCartStore((s) => s.cart.itemCount);
  const prevCountRef = useRef(itemCount);

  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      bounceRef.current?.trigger();
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.headerCopy}>
        <Text style={[styles.headerKicker, { color: colors.accent }]}>Mila Raffo</Text>
        <Text style={[styles.headerTagline, { color: colors.foreground }]} numberOfLines={1}>
          Productos reales para personas reales
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={styles.cartButton}
        onPress={() => router.push('/cart' as never)}
        hitSlop={8}
      >
        <Ionicons name="bag-outline" size={24} color={colors.foreground} />
        {itemCount > 0 && (
          <Bounce ref={bounceRef} style={styles.badgeWrap}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
            </View>
          </Bounce>
        )}
      </Pressable>
    </View>
  );
}

const ACCENT = '#EC7C43';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
    borderBottomWidth: 1,
  },
  headerCopy: {
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  headerKicker: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  headerTagline: {
    marginTop: Spacing.half,
    fontFamily: FontFamily.editorialBold,
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg,
  },
  cartButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrap: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 9,
    color: '#fff',
    lineHeight: 11,
  },
});
