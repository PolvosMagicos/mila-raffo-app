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

import { AppHeader } from '@/components/app-header';
import { Float } from '@/components/ui/animations';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useOrdersStore, type Order, type ShipmentStatus } from '@/modules/orders';

const SHIPMENT_STEPS: ShipmentStatus[] = ['En preparacion', 'Enviado', 'Entregado'];

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getOrderNumber(order: Order): string {
  return order.orderNumber ?? `#${order.id.slice(0, 8).toUpperCase()}`;
}

function getShipmentStatus(order: Order): ShipmentStatus {
  return order.shipment?.status ?? 'En preparacion';
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

function OrderItemPreview({
  order,
  colors,
  styles,
}: {
  order: Order;
  colors: typeof Colors.light | typeof Colors.dark;
  styles: ReturnType<typeof createStyles>;
}) {
  const firstItem = order.items[0];
  if (!firstItem) return null;

  return (
    <View style={styles.productPreview}>
      {firstItem.productImage ? (
        <Image
          source={{ uri: firstItem.productImage }}
          style={styles.productImage}
          contentFit="cover"
          accessibilityLabel={firstItem.productName}
        />
      ) : (
        <View style={[styles.productImage, styles.productImagePlaceholder]}>
          <Ionicons name="bag-handle-outline" size={22} color={colors.muted} />
        </View>
      )}
      <View style={styles.productText}>
        <Text style={styles.productName} numberOfLines={1}>{firstItem.productName}</Text>
        <Text style={styles.productQuantity}>Cant: {firstItem.quantity}</Text>
      </View>
    </View>
  );
}

function ShipmentProgress({
  status,
  colors,
  styles,
}: {
  status: ShipmentStatus;
  colors: typeof Colors.light | typeof Colors.dark;
  styles: ReturnType<typeof createStyles>;
}) {
  const activeIndex = SHIPMENT_STEPS.indexOf(status);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <View style={styles.progressBlock}>
      <View style={styles.progressTrack} />
      <View style={[styles.progressTrackActive, { width: `${(safeIndex / (SHIPMENT_STEPS.length - 1)) * 100}%` }]} />
      <View style={styles.progressSteps}>
        {SHIPMENT_STEPS.map((step, index) => {
          const isDone = index < safeIndex;
          const isActive = index === safeIndex;
          return (
            <View key={step} style={styles.progressStep}>
              <View
                style={[
                  styles.progressDot,
                  isDone && styles.progressDotDone,
                  isActive && styles.progressDotActive,
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={12} color={colors.background} />
                ) : isActive ? (
                  <View style={styles.progressDotInner} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.progressLabel,
                  isDone && styles.progressLabelDone,
                  isActive && styles.progressLabelActive,
                ]}
                numberOfLines={2}
              >
                {step === 'En preparacion' ? 'En preparación' : step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

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
      <OrderCard order={item} colors={colors} styles={styles} onPress={() => router.push(`/orders/${item.id}` as never)} />
    ),
    [colors, router, styles],
  );

  if (isLoading && orders.length === 0) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <AppHeader />
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <AppHeader />
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={(
          <View style={styles.header}>
            <Text style={styles.title}>Mis Pedidos</Text>
            <Text style={styles.subtitle}>Historial reciente para Mila Raffo</Text>
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Float>
              <Ionicons name="receipt-outline" size={64} color={colors.border} />
            </Float>
            <Text style={styles.emptyTitle}>Aún no tienes pedidos</Text>
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
  colors,
  styles,
  onPress,
}: {
  order: Order;
  colors: typeof Colors.light | typeof Colors.dark;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
}) {
  const status = getShipmentStatus(order);
  const isDelivered = status === 'Entregado';

  return (
    <View style={[styles.orderCard, isDelivered && styles.orderCardDelivered]}>
      <View style={styles.orderCardHeader}>
        <View>
          <Text style={styles.kicker}>Orden</Text>
          <Text style={styles.orderNumber}>{getOrderNumber(order)}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>

        <View style={styles.statusColumn}>
          <Text style={styles.kicker}>Estado</Text>
          <View style={[styles.shipmentBadge, isDelivered && styles.shipmentBadgeMuted]}>
            <Ionicons
              name={isDelivered ? 'checkmark-circle' : 'car-outline'}
              size={14}
              color={isDelivered ? colors.foreground : '#341000'}
            />
            <Text style={[styles.shipmentBadgeText, isDelivered && styles.shipmentBadgeTextMuted]}>{status}</Text>
          </View>
          <Text style={styles.paymentText}>Pago: {paymentLabel(order.paymentStatus)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <ShipmentProgress status={status} colors={colors} styles={styles} />
        <OrderItemPreview order={order} colors={colors} styles={styles} />
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.detailsButton,
          isDelivered && styles.detailsButtonSecondary,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        <Text style={[styles.detailsButtonText, isDelivered && styles.detailsButtonTextSecondary]}>
          Ver detalles
        </Text>
      </Pressable>

      <View style={styles.cardFooter}>
        <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
      </View>
    </View>
  );
}

function createStyles(colors: typeof Colors.light | typeof Colors.dark) {
  const softSurface = colors.background;
  const cardSurface = colors.background === '#ffffff' ? '#ffffff' : colors.backgroundElement;
  const lowSurface = colors.background === '#ffffff' ? '#f5f3f3' : colors.backgroundSelected;
  const mutedSurface = colors.background === '#ffffff' ? '#e9e8e7' : colors.backgroundSelected;
  const outline = colors.background === '#ffffff' ? '#dcc1b5' : colors.border;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: softSurface,
    },
    listContent: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.five,
      flexGrow: 1,
    },
    header: {
      paddingTop: Spacing.two,
      paddingBottom: Spacing.three,
      gap: Spacing.half,
    },
    title: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      color: colors.foreground,
    },
    subtitle: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
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
      maxWidth: 280,
      lineHeight: FontSize.base * 1.5,
    },
    ctaButton: {
      marginTop: Spacing.two,
      minHeight: 44,
      paddingHorizontal: Spacing.four,
      justifyContent: 'center',
      borderRadius: Radius.sm,
      backgroundColor: colors.accent,
    },
    ctaButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.background,
    },
    orderCard: {
      borderWidth: 1,
      borderColor: outline,
      borderRadius: Radius.md,
      backgroundColor: cardSurface,
      marginBottom: Spacing.three,
      overflow: 'hidden',
    },
    orderCardDelivered: {
      opacity: 0.88,
    },
    orderCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Spacing.two,
      padding: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: softSurface,
    },
    kicker: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: Spacing.half,
    },
    orderNumber: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.md,
      color: colors.foreground,
    },
    orderDate: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
      marginTop: Spacing.half,
    },
    statusColumn: {
      alignItems: 'flex-end',
      flexShrink: 0,
      maxWidth: 150,
    },
    shipmentBadge: {
      minHeight: 28,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.two,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
      backgroundColor: '#ffdbcb',
    },
    shipmentBadgeMuted: {
      backgroundColor: mutedSurface,
    },
    shipmentBadgeText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.xs,
      color: '#341000',
    },
    shipmentBadgeTextMuted: {
      color: colors.foreground,
    },
    paymentText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
      marginTop: Spacing.half,
    },
    cardBody: {
      padding: Spacing.three,
      gap: Spacing.three,
    },
    progressBlock: {
      position: 'relative',
      paddingTop: Spacing.two,
      paddingBottom: Spacing.one,
    },
    progressTrack: {
      position: 'absolute',
      top: 18,
      left: 24,
      right: 24,
      height: 2,
      backgroundColor: colors.border,
    },
    progressTrackActive: {
      position: 'absolute',
      top: 18,
      left: 24,
      height: 2,
      backgroundColor: colors.accent,
      maxWidth: '100%',
    },
    progressSteps: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      zIndex: 1,
    },
    progressStep: {
      width: 86,
      alignItems: 'center',
      gap: Spacing.one,
    },
    progressDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: cardSurface,
    },
    progressDotDone: {
      backgroundColor: colors.accent,
    },
    progressDotActive: {
      backgroundColor: cardSurface,
      borderColor: colors.accent,
      borderWidth: 2,
    },
    progressDotInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
    },
    progressLabel: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: 10,
      color: colors.muted,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      lineHeight: 14,
    },
    progressLabelDone: {
      color: colors.foreground,
    },
    progressLabelActive: {
      color: colors.accent,
      fontFamily: FontFamily.bodyBold,
    },
    productPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      backgroundColor: lowSurface,
      borderRadius: Radius.sm,
      padding: Spacing.two,
    },
    productImage: {
      width: 48,
      height: 48,
      borderRadius: Radius.sm,
    },
    productImagePlaceholder: {
      backgroundColor: mutedSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    productText: {
      flex: 1,
    },
    productName: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    productQuantity: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
      marginTop: Spacing.half,
    },
    detailsButton: {
      minHeight: 48,
      marginHorizontal: Spacing.three,
      marginBottom: Spacing.three,
      borderRadius: Radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    detailsButtonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.muted,
    },
    detailsButtonText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.xs,
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 1.1,
    },
    detailsButtonTextSecondary: {
      color: colors.foreground,
    },
    cardFooter: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.three,
      alignItems: 'flex-end',
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
