import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWishlistStore, type WishlistItem } from '@/modules/wishlist';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function WishlistScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const wishlist = useWishlistStore((s) => s.wishlist);
  const isLoading = useWishlistStore((s) => s.isLoading);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);

  useEffect(() => {
    void fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = useCallback(
    (itemId: string) => {
      void removeFromWishlist(itemId);
    },
    [removeFromWishlist],
  );

  const handleOpenProduct = useCallback(
    (productId: string) => {
      router.push(`/catalog/${productId}` as never);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: WishlistItem }) => (
      <WishlistItemRow
        item={item}
        styles={styles}
        colors={colors}
        onRemove={() => handleRemove(item.id)}
        onPress={() => handleOpenProduct(item.productId)}
      />
    ),
    [handleRemove, handleOpenProduct, styles, colors],
  );

  if (isLoading && !wishlist) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={wishlist?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={(
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color={colors.foreground} />
            </Pressable>
            <Text style={styles.title}>Mi Wishlist</Text>
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>Tu wishlist está vacía</Text>
            <Text style={styles.emptyText}>Guardá tus piezas favoritas para comprarlas después.</Text>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
              onPress={() => router.push('/catalog' as never)}
            >
              <Text style={styles.ctaButtonText}>Explorar catálogo</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function WishlistItemRow({
  item,
  styles,
  colors,
  onRemove,
  onPress,
}: {
  item: WishlistItem;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
  onRemove: () => void;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.itemRow, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.itemImageFrame}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.itemImage}
            contentFit="cover"
            accessibilityLabel={item.productName}
          />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Text style={styles.itemImagePlaceholderText}>MR</Text>
          </View>
        )}
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
        {item.colorName ? (
          <View style={styles.colorRow}>
            {item.colorHex ? (
              <View style={[styles.colorDot, { backgroundColor: item.colorHex }]} />
            ) : null}
            <Text style={styles.colorName}>{item.colorName}</Text>
          </View>
        ) : null}
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
        <Text style={[
          styles.stockLabel,
          item.isAvailable ? styles.stockAvailable : styles.stockUnavailable,
        ]}>
          {item.isAvailable
            ? item.stockAvailable > 0 ? `${item.stockAvailable} en stock` : 'Sin stock'
            : 'No disponible'}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.heartButton, pressed && styles.pressed]}
        onPress={onRemove}
        hitSlop={8}
      >
        <Ionicons name="heart" size={22} color={colors.accent} />
      </Pressable>
    </Pressable>
  );
}

function createStyles(colors: typeof Colors.light | typeof Colors.dark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.five,
      flexGrow: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.three,
    },
    backButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      color: colors.foreground,
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      padding: Spacing.four,
      minHeight: 400,
    },
    emptyTitle: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
    },
    emptyText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: colors.muted,
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: FontSize.base * 1.5,
    },
    ctaButton: {
      marginTop: Spacing.two,
      minHeight: 44,
      paddingHorizontal: Spacing.four,
      justifyContent: 'center',
      borderRadius: Radius.sm,
      backgroundColor: colors.foreground,
    },
    ctaButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.background,
    },
    itemRow: {
      flexDirection: 'row',
      gap: Spacing.three,
      paddingVertical: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    itemImageFrame: {
      width: 80,
      height: 96,
      borderRadius: Radius.sm,
      overflow: 'hidden',
      backgroundColor: colors.backgroundElement,
      flexShrink: 0,
    },
    itemImage: {
      width: '100%',
      height: '100%',
    },
    itemImagePlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemImagePlaceholderText: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.base,
      color: colors.muted,
    },
    itemInfo: {
      flex: 1,
      gap: Spacing.one,
    },
    itemName: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.base,
      color: colors.foreground,
      lineHeight: FontSize.base * 1.3,
    },
    colorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
    },
    colorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    colorName: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    itemPrice: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.base,
      color: colors.accent,
    },
    stockLabel: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
    },
    stockAvailable: {
      color: colors.muted,
    },
    stockUnavailable: {
      color: '#DC2626',
    },
    heartButton: {
      padding: Spacing.two,
      flexShrink: 0,
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
