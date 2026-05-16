import { Ionicons } from '@expo/vector-icons';
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
import { useOrdersStore, type Order, type OrderStatus } from '@/modules/orders';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  confirmed: { bg: '#DBEAFE', text: '#2563EB' },
  processing: { bg: '#EDE9FE', text: '#7C3AED' },
  shipped: { bg: '#CFFAFE', text: '#0891B2' },
  delivered: { bg: '#D1FAE5', text: '#059669' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

export default function OrdersScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const orders = useOrdersStore((s) => s.orders);
  const isLoading = useOrdersStore((s) => s.isLoading);
  const fetchOrders = useOrdersStore((s) => s.fetchOrders);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const renderOrder = useCallback(
    ({ item }: { item: Order }) => (
      <OrderCard order={item} styles={styles} />
    ),
    [styles],
  );

  if (isLoading && orders.length === 0) {
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
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={(
          <View style={styles.header}>
            <Text style={styles.title}>Mis Pedidos</Text>
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>Aún no tenés pedidos</Text>
            <Text style={styles.emptyText}>Cuando realices una compra, tus pedidos aparecerán aquí.</Text>
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

function OrderCard({
  order,
  styles,
}: {
  order: Order;
  styles: ReturnType<typeof createStyles>;
}) {
  const statusConfig = STATUS_COLORS[order.status];
  const label = STATUS_LABELS[order.status];
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderMeta}>
          <Text style={styles.orderNumber}>#{order.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.statusText, { color: statusConfig.text }]}>{label}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.items.slice(0, 2).map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={styles.orderItemName} numberOfLines={1}>{item.productName}</Text>
            <Text style={styles.orderItemQty}>×{item.quantity}</Text>
          </View>
        ))}
        {order.items.length > 2 ? (
          <Text style={styles.moreItems}>+{order.items.length - 2} producto{order.items.length - 2 > 1 ? 's' : ''} más</Text>
        ) : null}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderItemCount}>{itemCount} artículo{itemCount !== 1 ? 's' : ''}</Text>
        <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
      </View>
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
      paddingTop: Spacing.two,
      paddingBottom: Spacing.three,
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
    orderCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      backgroundColor: colors.background,
      marginBottom: Spacing.three,
      padding: Spacing.three,
      gap: Spacing.two,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    orderMeta: {
      gap: Spacing.half,
    },
    orderNumber: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    orderDate: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    statusBadge: {
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.half,
      borderRadius: Radius.full,
    },
    statusText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
    },
    orderItems: {
      gap: Spacing.one,
      paddingTop: Spacing.one,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    orderItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.two,
    },
    orderItemName: {
      flex: 1,
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    orderItemQty: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    moreItems: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: Spacing.one,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    orderItemCount: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    orderTotal: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
