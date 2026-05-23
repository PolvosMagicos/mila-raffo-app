import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useCartStore } from '@/modules/cart';

export function AppHeader() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const itemCount = useCartStore((s) => s.cart.itemCount);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <Pressable
        accessibilityRole="button"
        style={[styles.searchBar, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
        onPress={() => router.push('/catalog' as never)}
      >
        <Ionicons name="search-outline" size={16} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Buscar productos..."
          placeholderTextColor={colors.muted}
          editable={false}
          pointerEvents="none"
        />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        style={styles.cartButton}
        onPress={() => router.push('/cart' as never)}
        hitSlop={8}
      >
        <Ionicons name="bag-outline" size={24} color={colors.foreground} />
        {itemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
          </View>
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
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two + 4,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    padding: 0,
  },
  cartButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
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
