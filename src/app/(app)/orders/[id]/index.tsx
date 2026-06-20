import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useOrdersStore, type Order } from '@/modules/orders';

function formatPrice(value?: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value ?? 0);
}

function formatDate(iso?: string): string {
  if (!iso) return 'Pendiente';
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getOrderNumber(order: Order): string {
  return order.orderNumber ?? `#${order.id.slice(0, 8).toUpperCase()}`;
}

function paymentLabel(status?: Order['paymentStatus']): string {
  const labels: Record<NonNullable<Order['paymentStatus']>, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado',
  };
  return status ? labels[status] : 'Pendiente';
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const selectedOrder = useOrdersStore((s) => s.selectedOrder);
  const orders = useOrdersStore((s) => s.orders);
  const isLoading = useOrdersStore((s) => s.isLoading);
  const error = useOrdersStore((s) => s.error);
  const fetchOrderById = useOrdersStore((s) => s.fetchOrderById);
  const clearSelected = useOrdersStore((s) => s.clearSelected);

  const cachedOrder = orders.find((order) => order.id === orderId);
  const order = selectedOrder?.id === orderId ? selectedOrder : cachedOrder;

  useEffect(() => {
    if (orderId) {
      void fetchOrderById(orderId);
    }
    return () => clearSelected();
  }, [clearSelected, fetchOrderById, orderId]);

  if (isLoading && !order) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <View style={styles.topBar}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={styles.topTitle}>Pedido</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>No pudimos cargar el pedido</Text>
          {error ? <Text style={styles.emptyText}>{error}</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

  const shippingAddress = order.shippingAddress;
  const hasShipment = Boolean(order.shipment?.id);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.topTitleBlock}>
          <Text style={styles.topTitle}>Detalle del pedido</Text>
          <Text style={styles.topSubtitle}>{getOrderNumber(order)}</Text>
        </View>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.kicker}>Resumen</Text>
          <Text style={styles.orderNumber}>{getOrderNumber(order)}</Text>
          <View style={styles.summaryGrid}>
            <View>
              <Text style={styles.fieldLabel}>Fecha</Text>
              <Text style={styles.fieldValue}>{formatDate(order.createdAt)}</Text>
            </View>
            <View>
              <Text style={styles.fieldLabel}>Pago</Text>
              <Text style={styles.fieldValue}>{paymentLabel(order.paymentStatus)}</Text>
            </View>
            <View>
              <Text style={styles.fieldLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.kicker}>Envío</Text>
              <Text style={styles.cardTitle}>
                {hasShipment ? order.shipment?.status : 'Sin envío generado'}
              </Text>
            </View>
            <Ionicons name="cube-outline" size={24} color={colors.accent} />
          </View>
          <Text style={styles.cardText}>
            {hasShipment
              ? 'Consultá el avance de preparación y entrega de tu pedido.'
              : 'Estamos preparando la información de envío para este pedido.'}
          </Text>
          {hasShipment ? (
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              onPress={() => router.push(`/orders/${order.id}/shipment` as never)}
            >
              <Text style={styles.primaryButtonText}>Ver seguimiento</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>Productos</Text>
          <View style={styles.itemsList}>
            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                {item.productImage ? (
                  <Image source={{ uri: item.productImage }} style={styles.itemImage} contentFit="cover" />
                ) : (
                  <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                    <Ionicons name="bag-handle-outline" size={20} color={colors.muted} />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                  <Text style={styles.itemMeta}>Cant: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>{formatPrice(item.total ?? item.subtotal)}</Text>
              </View>
            ))}
          </View>
        </View>

        {shippingAddress ? (
          <View style={styles.card}>
            <Text style={styles.kicker}>Dirección de entrega</Text>
            <Text style={styles.cardTitle}>
              {shippingAddress.firstName} {shippingAddress.lastName}
            </Text>
            <Text style={styles.cardText}>{shippingAddress.streetAddress}</Text>
            {shippingAddress.apartment ? <Text style={styles.cardText}>{shippingAddress.apartment}</Text> : null}
            <Text style={styles.cardText}>
              {shippingAddress.city}, {shippingAddress.stateProvince}
            </Text>
            <Text style={styles.cardText}>
              {shippingAddress.postalCode} · {shippingAddress.country}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: typeof Colors.light | typeof Colors.dark) {
  const surface = colors.background === '#ffffff' ? '#fbf9f9' : colors.background;
  const card = colors.background === '#ffffff' ? '#ffffff' : colors.backgroundElement;
  const lowSurface = colors.background === '#ffffff' ? '#f5f3f3' : colors.backgroundSelected;
  const outline = colors.background === '#ffffff' ? '#dcc1b5' : colors.border;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: surface,
    },
    topBar: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: outline,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topTitleBlock: {
      alignItems: 'center',
    },
    topTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.md,
      color: colors.accent,
    },
    topSubtitle: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
      marginTop: Spacing.half,
    },
    content: {
      padding: Spacing.three,
      gap: Spacing.three,
      paddingBottom: Spacing.five,
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.four,
    },
    emptyTitle: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
      textAlign: 'center',
    },
    emptyText: {
      marginTop: Spacing.one,
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
      textAlign: 'center',
    },
    summaryCard: {
      borderWidth: 1,
      borderColor: outline,
      borderRadius: Radius.md,
      backgroundColor: card,
      padding: Spacing.three,
      gap: Spacing.two,
    },
    kicker: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    orderNumber: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
    },
    summaryGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.two,
      paddingTop: Spacing.one,
    },
    fieldLabel: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    fieldValue: {
      marginTop: Spacing.half,
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    totalValue: {
      marginTop: Spacing.half,
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.sm,
      color: colors.accent,
    },
    card: {
      borderWidth: 1,
      borderColor: outline,
      borderRadius: Radius.md,
      backgroundColor: card,
      padding: Spacing.three,
      gap: Spacing.two,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.two,
    },
    cardTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
      marginTop: Spacing.half,
    },
    cardText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
      lineHeight: 20,
    },
    primaryButton: {
      minHeight: 48,
      borderRadius: Radius.sm,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.two,
    },
    primaryButtonText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.xs,
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 1.1,
    },
    itemsList: {
      gap: Spacing.two,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingVertical: Spacing.one,
    },
    itemImage: {
      width: 48,
      height: 48,
      borderRadius: Radius.sm,
    },
    itemImagePlaceholder: {
      backgroundColor: lowSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    itemMeta: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
      marginTop: Spacing.half,
    },
    itemPrice: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
