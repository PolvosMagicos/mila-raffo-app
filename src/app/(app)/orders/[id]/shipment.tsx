import { Ionicons } from '@expo/vector-icons';
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
import { useOrdersStore, type Order, type ShipmentStatus } from '@/modules/orders';

const STEPS: {
  status: ShipmentStatus;
  title: string;
  pendingTitle?: string;
  activeIcon: React.ComponentProps<typeof Ionicons>['name'];
  message: string;
  pendingMessage: string;
}[] = [
  {
    status: 'En preparacion',
    title: 'En preparación',
    activeIcon: 'construct-outline',
    message: 'Tu pedido ha sido preparado en nuestro taller.',
    pendingMessage: 'Tu pedido será preparado con cuidado en nuestro taller.',
  },
  {
    status: 'Enviado',
    title: 'Enviado',
    activeIcon: 'car-outline',
    message: 'El paquete ha salido de nuestras instalaciones y está en tránsito.',
    pendingMessage: 'El paquete saldrá de nuestras instalaciones cuando esté listo.',
  },
  {
    status: 'Entregado',
    title: 'Entregado',
    activeIcon: 'home-outline',
    message: 'El paquete ha sido entregado en la dirección indicada.',
    pendingMessage: 'El paquete será entregado en la dirección indicada.',
  },
];

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getOrderNumber(order: Order): string {
  return order.orderNumber ?? `#${order.id.slice(0, 8).toUpperCase()}`;
}

function getStatusIndex(status?: ShipmentStatus): number {
  if (!status) return -1;
  return STEPS.findIndex((step) => step.status === status);
}

function getStatusCopy(status?: ShipmentStatus) {
  if (status === 'Entregado') {
    return {
      badge: 'Entregado',
      title: '¡Tu pedido ha sido entregado!',
    };
  }

  if (status === 'Enviado') {
    return {
      badge: 'En camino',
      title: 'Tu pedido está en manos de la mensajería y llegará pronto',
    };
  }

  return {
    badge: 'En taller',
    title: 'Estamos preparando tu pieza artesanal con el mayor cuidado',
  };
}

function ShipmentPendingState({
  order,
  colors,
  styles,
  onBackToOrders,
}: {
  order: Order;
  colors: typeof Colors.light | typeof Colors.dark;
  styles: ReturnType<typeof createStyles>;
  onBackToOrders: () => void;
}) {
  return (
    <View style={styles.pendingContainer}>
      <View style={styles.pendingIconWrap}>
        <View style={styles.pendingGlow} />
        <View style={styles.pendingMainIcon}>
          <Ionicons name="construct-outline" size={64} color={colors.accent} />
        </View>
        <View style={[styles.pendingFloatingIcon, styles.pendingFloatingIconRight]}>
          <Ionicons name="cut-outline" size={16} color={colors.muted} />
        </View>
        <View style={[styles.pendingFloatingIcon, styles.pendingFloatingIconLeft]}>
          <Ionicons name="hammer-outline" size={16} color={colors.muted} />
        </View>
      </View>

      <View style={styles.pendingTextBlock}>
        <Text style={styles.pendingTitle}>Creando tu pieza</Text>
        <Text style={styles.pendingText}>
          Estamos preparando tu pieza artesanal con el mayor cuidado. Te avisaremos en cuanto esté lista para su envío.
        </Text>
      </View>

      <View style={styles.pendingStatusPill}>
        <View style={styles.statusPulse} />
        <Text style={styles.pendingStatusText}>
          Estado: {order.shipment?.status === 'En preparacion' ? 'En Taller' : 'Preparando envío'}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.backToOrdersButton, pressed && styles.pressed]}
        onPress={onBackToOrders}
      >
        <Ionicons name="file-tray-full-outline" size={18} color="#ffffff" />
        <Text style={styles.backToOrdersText}>Volver a Mis Pedidos</Text>
      </Pressable>
    </View>
  );
}

function Timeline({
  order,
  colors,
  styles,
}: {
  order: Order;
  colors: typeof Colors.light | typeof Colors.dark;
  styles: ReturnType<typeof createStyles>;
}) {
  const activeIndex = Math.max(getStatusIndex(order.shipment?.status), 0);

  return (
    <View style={styles.timeline}>
      <View style={styles.timelineLine} />
      {STEPS.map((step, index) => {
        const isDone = index < activeIndex || order.shipment?.status === 'Entregado';
        const isActive = index === activeIndex && order.shipment?.status !== 'Entregado';
        const date =
          step.status === 'Enviado'
            ? formatDate(order.shipment?.shippedAt)
            : step.status === 'Entregado'
              ? formatDate(order.shipment?.deliveredAt)
              : formatDate(order.createdAt);

        return (
          <View key={step.status} style={[styles.timelineStep, index === STEPS.length - 1 && styles.timelineStepLast]}>
            <View
              style={[
                styles.timelineDot,
                isDone && styles.timelineDotDone,
                isActive && styles.timelineDotActive,
              ]}
            >
              {isDone ? (
                <Ionicons name="checkmark" size={18} color="#ffffff" />
              ) : (
                <Ionicons
                  name={step.activeIcon}
                  size={18}
                  color={isActive ? colors.accent : colors.muted}
                />
              )}
            </View>
            <View style={[styles.timelineContent, !isDone && !isActive && styles.timelineContentPending]}>
              <Text style={[styles.timelineTitle, isActive && styles.timelineTitleActive]}>{step.title}</Text>
              <Text style={styles.timelineText}>{isDone || isActive ? step.message : step.pendingMessage}</Text>
              {date && (isDone || isActive) ? <Text style={styles.timelineDate}>{date}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function ShipmentTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const selectedOrder = useOrdersStore((s) => s.selectedOrder);
  const orders = useOrdersStore((s) => s.orders);
  const isLoading = useOrdersStore((s) => s.isLoading);
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
          <Text style={styles.topTitle}>Seguimiento</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>No pudimos cargar el seguimiento</Text>
        </View>
      </SafeAreaView>
    );
  }

  const shipment = order.shipment;
  const status = shipment?.status;
  const copy = getStatusCopy(status);
  const shippingAddress = order.shippingAddress;
  const isPendingShipment = !shipment || status === 'En preparacion';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.topTitleBlock}>
          <Text style={styles.topTitle}>Seguimiento</Text>
          <Text style={styles.topSubtitle}>{getOrderNumber(order)}</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={() => router.push('/cart' as never)}>
          <Ionicons name="bag-handle-outline" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      {isPendingShipment ? (
        <ShipmentPendingState
          order={order}
          colors={colors}
          styles={styles}
          onBackToOrders={() => router.push('/orders' as never)}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statusHeader}>
            <View style={styles.statusPill}>
              <View style={styles.statusPulse} />
              <Text style={styles.statusPillText}>{copy.badge}</Text>
            </View>
            <Text style={styles.statusTitle}>{copy.title}</Text>

            <View style={styles.trackingCard}>
              <Text style={styles.kicker}>Mensajería</Text>
              <Text style={styles.trackingValue}>{shipment.courier ?? 'Por confirmar'}</Text>
              <Text style={[styles.kicker, styles.kickerSpaced]}>Número de seguimiento</Text>
              <Text style={styles.trackingNumber}>{shipment.trackingNumber ?? 'Pendiente'}</Text>
            </View>
          </View>

          <Timeline order={order} colors={colors} styles={styles} />

          {shippingAddress ? (
            <View style={styles.deliveryCard}>
              <Text style={styles.deliveryTitle}>Información de Entrega</Text>
              <View style={styles.deliverySection}>
                <Text style={styles.deliveryLabel}>Dirección</Text>
                <Text style={styles.deliveryValue}>{shippingAddress.streetAddress}</Text>
                {shippingAddress.apartment ? <Text style={styles.deliveryValue}>{shippingAddress.apartment}</Text> : null}
                <Text style={styles.deliveryValue}>
                  {shippingAddress.city}, {shippingAddress.country}
                </Text>
              </View>
              <View style={styles.deliverySection}>
                <Text style={styles.deliveryLabel}>Destinatario</Text>
                <Text style={styles.deliveryValue}>
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </Text>
              </View>
              <View style={styles.estimateBox}>
                <Ionicons name="calendar-outline" size={24} color={colors.accent} />
                <View>
                  <Text style={styles.deliveryLabel}>Entrega Estimada</Text>
                  <Text style={styles.estimateText}>Próximamente</Text>
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: typeof Colors.light | typeof Colors.dark) {
  const surface = colors.background === '#ffffff' ? '#fbf9f9' : colors.background;
  const card = colors.background === '#ffffff' ? '#ffffff' : colors.backgroundElement;
  const lowSurface = colors.background === '#ffffff' ? '#f5f3f3' : colors.backgroundSelected;
  const mutedSurface = colors.background === '#ffffff' ? '#e4e2e2' : colors.backgroundSelected;
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
      gap: Spacing.four,
      paddingBottom: Spacing.five,
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
      textAlign: 'center',
    },
    statusHeader: {
      alignItems: 'center',
      gap: Spacing.two,
      paddingTop: Spacing.three,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      backgroundColor: '#ffdbcb',
    },
    statusPulse: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
    },
    statusPillText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.xs,
      color: '#7a3000',
      textTransform: 'uppercase',
      letterSpacing: 1.1,
    },
    statusTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.lg,
      color: colors.foreground,
      textAlign: 'center',
      lineHeight: 26,
      maxWidth: 330,
      marginTop: Spacing.two,
    },
    trackingCard: {
      width: '100%',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: outline,
      borderRadius: Radius.md,
      backgroundColor: card,
      padding: Spacing.four,
      marginTop: Spacing.three,
    },
    kicker: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 1.1,
    },
    kickerSpaced: {
      marginTop: Spacing.three,
    },
    trackingValue: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
      marginTop: Spacing.one,
    },
    trackingNumber: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.md,
      color: colors.foreground,
      marginTop: Spacing.one,
      letterSpacing: 1.1,
    },
    timeline: {
      position: 'relative',
      paddingLeft: Spacing.five,
      marginHorizontal: Spacing.one,
    },
    timelineLine: {
      position: 'absolute',
      left: 15,
      top: Spacing.one,
      bottom: Spacing.one,
      width: 2,
      backgroundColor: outline,
    },
    timelineStep: {
      minHeight: 104,
      paddingBottom: Spacing.four,
    },
    timelineStepLast: {
      minHeight: 0,
      paddingBottom: 0,
    },
    timelineDot: {
      position: 'absolute',
      left: -Spacing.five,
      top: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: mutedSurface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: surface,
    },
    timelineDotDone: {
      backgroundColor: colors.accent,
    },
    timelineDotActive: {
      backgroundColor: card,
      borderColor: colors.accent,
      borderWidth: 2,
    },
    timelineContent: {
      paddingLeft: Spacing.two,
    },
    timelineContentPending: {
      opacity: 0.5,
    },
    timelineTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    timelineTitleActive: {
      color: colors.accent,
    },
    timelineText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
      lineHeight: 20,
      marginTop: Spacing.one,
    },
    timelineDate: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
      marginTop: Spacing.one,
    },
    deliveryCard: {
      borderWidth: 1,
      borderColor: outline,
      borderRadius: Radius.md,
      backgroundColor: card,
      padding: Spacing.four,
      gap: Spacing.three,
    },
    deliveryTitle: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 1.1,
      paddingBottom: Spacing.two,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    deliverySection: {
      gap: Spacing.half,
    },
    deliveryLabel: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    deliveryValue: {
      fontFamily: FontFamily.bodyMedium,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    estimateBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      backgroundColor: lowSurface,
      borderRadius: Radius.sm,
      padding: Spacing.three,
      marginTop: Spacing.one,
    },
    estimateText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.base,
      color: colors.accent,
      marginTop: Spacing.half,
    },
    pendingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.five,
      gap: Spacing.four,
    },
    pendingIconWrap: {
      width: 192,
      height: 192,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pendingGlow: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: '#ffdbcb',
      opacity: 0.35,
    },
    pendingMainIcon: {
      width: 128,
      height: 128,
      borderRadius: 64,
      borderWidth: 1,
      borderColor: outline,
      backgroundColor: card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pendingFloatingIcon: {
      position: 'absolute',
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: outline,
      backgroundColor: card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pendingFloatingIconRight: {
      top: 18,
      right: 38,
    },
    pendingFloatingIconLeft: {
      bottom: 18,
      left: 38,
    },
    pendingTextBlock: {
      alignItems: 'center',
      maxWidth: 300,
      gap: Spacing.two,
    },
    pendingTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.lg,
      color: colors.foreground,
    },
    pendingText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: colors.muted,
      textAlign: 'center',
      lineHeight: 24,
    },
    pendingStatusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.full,
      backgroundColor: lowSurface,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
    },
    pendingStatusText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    backToOrdersButton: {
      width: '100%',
      minHeight: 56,
      borderRadius: Radius.sm,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: Spacing.two,
      marginTop: Spacing.two,
    },
    backToOrdersText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.xs,
      color: '#ffffff',
      textTransform: 'uppercase',
      letterSpacing: 1.1,
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
