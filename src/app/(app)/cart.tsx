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
import { useCartStore, type CartApiItem } from '@/modules/cart';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function CartScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const cart = useCartStore((s) => s.cart);
  const isLoading = useCartStore((s) => s.isLoading);
  const loadCart = useCartStore((s) => s.loadCart);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const handleDecrement = useCallback(
    (item: CartApiItem) => {
      if (item.quantity <= 1) {
        void removeItem(item.id);
      } else {
        void updateItem(item.id, item.quantity - 1);
      }
    },
    [removeItem, updateItem],
  );

  const handleIncrement = useCallback(
    (item: CartApiItem) => {
      if (item.quantity < item.stockAvailable) {
        void updateItem(item.id, item.quantity + 1);
      }
    },
    [updateItem],
  );

  const renderItem = useCallback(
    ({ item }: { item: CartApiItem }) => (
      <CartItemRow
        item={item}
        styles={styles}
        colors={colors}
        onDecrement={() => handleDecrement(item)}
        onIncrement={() => handleIncrement(item)}
        onRemove={() => void removeItem(item.id)}
      />
    ),
    [handleDecrement, handleIncrement, removeItem, styles, colors],
  );

  if (isLoading && cart.items.length === 0) {
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
        data={cart.items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={(
          <View style={styles.header}>
            <Text style={styles.title}>Mi Carrito</Text>
            {cart.items.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
                onPress={() => void clearCart()}
              >
                <Ionicons name="trash-outline" size={18} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
            <Text style={styles.emptyText}>Explorá el catálogo y agregá productos.</Text>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}
              onPress={() => router.push('/catalog' as never)}
            >
              <Text style={styles.ctaButtonText}>Ver catálogo</Text>
            </Pressable>
          </View>
        )}
        ListFooterComponent={cart.items.length > 0 ? (
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(cart.total)}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled
              style={[styles.checkoutButton, styles.checkoutButtonDisabled]}
            >
              <Text style={styles.checkoutButtonText}>Proceder al pago</Text>
              <Text style={styles.checkoutButtonSub}>Próximamente</Text>
            </Pressable>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}

function CartItemRow({
  item,
  styles,
  colors,
  onDecrement,
  onIncrement,
  onRemove,
}: {
  item: CartApiItem;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.itemRow}>
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
          <View style={styles.itemColorRow}>
            {item.colorHex ? (
              <View style={[styles.colorDot, { backgroundColor: item.colorHex }]} />
            ) : null}
            <Text style={styles.itemColor}>{item.colorName}</Text>
          </View>
        ) : null}
        <Text style={styles.itemPrice}>{formatPrice(item.unitPrice)}</Text>

        <View style={styles.quantityRow}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.qtyButton, pressed && styles.pressed]}
            onPress={onDecrement}
          >
            <Ionicons name="remove" size={16} color={colors.foreground} />
          </Pressable>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.qtyButton,
              item.quantity >= item.stockAvailable && styles.qtyButtonDisabled,
              pressed && styles.pressed,
            ]}
            onPress={onIncrement}
            disabled={item.quantity >= item.stockAvailable}
          >
            <Ionicons name="add" size={16} color={colors.foreground} />
          </Pressable>
          <Text style={styles.subtotal}>{formatPrice(item.subtotal)}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
        onPress={onRemove}
      >
        <Ionicons name="trash-outline" size={18} color={colors.muted} />
      </Pressable>
    </View>
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
      justifyContent: 'space-between',
      paddingTop: Spacing.two,
      paddingBottom: Spacing.three,
    },
    title: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      color: colors.foreground,
    },
    clearButton: {
      padding: Spacing.two,
    },
    itemRow: {
      flexDirection: 'row',
      gap: Spacing.three,
      paddingVertical: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
    itemColorRow: {
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
    itemColor: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    itemPrice: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.sm,
      color: colors.accent,
    },
    quantityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      marginTop: Spacing.one,
    },
    qtyButton: {
      width: 28,
      height: 28,
      borderRadius: Radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    qtyButtonDisabled: {
      opacity: 0.4,
    },
    qtyValue: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
      minWidth: 20,
      textAlign: 'center',
    },
    subtotal: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
      marginLeft: Spacing.one,
    },
    removeButton: {
      padding: Spacing.one,
      alignSelf: 'flex-start',
    },
    footer: {
      gap: Spacing.three,
      paddingTop: Spacing.four,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.lg,
      color: colors.foreground,
    },
    totalValue: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
    },
    checkoutButton: {
      minHeight: 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.sm,
      backgroundColor: colors.foreground,
      gap: Spacing.one,
    },
    checkoutButtonDisabled: {
      opacity: 0.5,
    },
    checkoutButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.background,
    },
    checkoutButtonSub: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
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
    pressed: {
      opacity: 0.78,
    },
  });
}
