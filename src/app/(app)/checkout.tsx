import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Palette, Radius, Spacing } from '@/constants/theme';
import { useCartStore, type CartApiItem } from '@/modules/cart';

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation';
type ShippingMethod = 'standard' | 'express';
type PaymentMethod = 'whatsapp' | 'card';
type OrderSnapshot = {
  items: CartApiItem[];
  itemCount: number;
  shippingCost: number;
  total: number;
};

const EXPRESS_SHIPPING = 24;
const ORDER_NUMBER = 'MR-84291';
const PROMISE_IMAGE =
  'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=900&q=80';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function CheckoutScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const cart = useCartStore((s) => s.cart);
  const loadCart = useCartStore((s) => s.loadCart);
  const removeItem = useCartStore((s) => s.removeItem);

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [savePayment, setSavePayment] = useState(true);
  const [orderSnapshot, setOrderSnapshot] = useState<OrderSnapshot | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const resetCheckoutFlow = useCallback(() => {
    setStep('shipping');
    setSummaryExpanded(false);
    setShippingMethod('standard');
    setPaymentMethod('card');
    setSavePayment(true);
    setOrderSnapshot(null);
    setIsPlacingOrder(false);
  }, []);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  useFocusEffect(
    useCallback(() => {
      return resetCheckoutFlow;
    }, [resetCheckoutFlow]),
  );

  const shippingCost = shippingMethod === 'express' ? EXPRESS_SHIPPING : 0;
  const total = cart.total + shippingCost;
  const title = step === 'confirmation' ? 'Pedido completado' : step;

  const goBack = () => {
    if (step === 'confirmation') {
      resetCheckoutFlow();
      router.replace('/home' as never);
      return;
    }
    if (step === 'review') {
      setStep('payment');
      return;
    }
    if (step === 'payment') {
      setStep('shipping');
      return;
    }
    router.back();
  };

  const goForward = async () => {
    if (isPlacingOrder) return;

    if (step === 'shipping') {
      setStep('payment');
      return;
    }
    if (step === 'payment') {
      setStep('review');
      return;
    }
    if (step === 'review') {
      setIsPlacingOrder(true);
      setOrderSnapshot({
        items: cart.items,
        itemCount: cart.itemCount,
        shippingCost,
        total,
      });

      try {
        for (const item of cart.items) {
          await removeItem(item.id);
        }
        setStep('confirmation');
      } finally {
        setIsPlacingOrder(false);
      }
    }
  };

  const confirmationSnapshot = orderSnapshot ?? {
    items: cart.items,
    itemCount: cart.itemCount,
    shippingCost,
    total,
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.appBar}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            onPress={goBack}
          >
            <Ionicons
              name={step === 'confirmation' ? 'close' : 'chevron-back'}
              size={step === 'confirmation' ? 22 : 28}
              color={colors.foreground}
            />
          </Pressable>
          <Text style={styles.appBarTitle}>{title}</Text>
          <View style={styles.iconButtonSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            step === 'confirmation' ? styles.confirmationScrollContent : null,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 'confirmation' ? (
            <ConfirmationStep
              cartItems={confirmationSnapshot.items}
              itemCount={confirmationSnapshot.itemCount}
              shippingCost={confirmationSnapshot.shippingCost}
              total={confirmationSnapshot.total}
              styles={styles}
              colors={colors}
              onShop={() => router.replace('/catalog' as never)}
            />
          ) : (
            <>
              {step === 'shipping' ? (
                <HeaderOrderSummary
                  cartItems={cart.items}
                  itemCount={cart.itemCount}
                  subtotal={cart.total}
                  expanded={summaryExpanded}
                  onToggle={() => setSummaryExpanded((value) => !value)}
                  styles={styles}
                  colors={colors}
                />
              ) : (
                <CompactOrderSummary
                  cartItems={cart.items}
                  itemCount={cart.itemCount}
                  subtotal={cart.total}
                  shippingCost={shippingCost}
                  total={total}
                  expanded={summaryExpanded}
                  onToggle={() => setSummaryExpanded((value) => !value)}
                  styles={styles}
                  colors={colors}
                />
              )}

              <CheckoutProgress step={step} styles={styles} colors={colors} />

              {step === 'shipping' ? (
                <ShippingStep
                  selected={shippingMethod}
                  onSelect={setShippingMethod}
                  styles={styles}
                  colors={colors}
                />
              ) : null}

              {step === 'payment' ? (
                <PaymentStep
                  paymentMethod={paymentMethod}
                  savePayment={savePayment}
                  onSelectPayment={setPaymentMethod}
                  onToggleSave={() => setSavePayment((value) => !value)}
                  styles={styles}
                  colors={colors}
                />
              ) : null}

              {step === 'review' ? (
                <ReviewStep
                  cartItems={cart.items}
                  subtotal={cart.total}
                  shippingCost={shippingCost}
                  total={total}
                  shippingMethod={shippingMethod}
                  paymentMethod={paymentMethod}
                  onEditShipping={() => setStep('shipping')}
                  onEditPayment={() => setStep('payment')}
                  styles={styles}
                  colors={colors}
                />
              ) : null}
            </>
          )}
        </ScrollView>

        {step !== 'confirmation' ? (
          <CheckoutBottomBar
            step={step}
            subtotal={cart.total}
            shippingCost={shippingCost}
            total={total}
            onPress={goForward}
            isProcessing={isPlacingOrder}
            styles={styles}
            colors={colors}
          />
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function HeaderOrderSummary({
  cartItems,
  itemCount,
  subtotal,
  expanded,
  onToggle,
  styles,
  colors,
}: {
  cartItems: CartApiItem[];
  itemCount: number;
  subtotal: number;
  expanded: boolean;
  onToggle: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  const previewItems = cartItems.slice(0, 1);
  const remainingCount = Math.max(itemCount - previewItems.length, 0);

  return (
    <View style={styles.summaryPanel}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={({ pressed }) => [styles.summaryToggle, pressed && styles.pressedSoft]}
        onPress={onToggle}
      >
        <View style={styles.summaryLeft}>
          <View style={styles.previewStack}>
            {previewItems.map((item) => (
              <CartPreviewImage key={item.id} item={item} styles={styles} />
            ))}
            {remainingCount > 0 ? (
              <View style={[styles.previewImage, styles.previewCount]}>
                <Text style={styles.previewCountText}>+{remainingCount}</Text>
              </View>
            ) : null}
            {cartItems.length === 0 ? (
              <View style={[styles.previewImage, styles.previewCount]}>
                <Ionicons name="bag-outline" size={18} color={colors.muted} />
              </View>
            ) : null}
          </View>
          <View>
            <Text style={styles.summaryTitle}>Resumen del pedido</Text>
            <Text style={styles.summaryMeta}>{itemCount} productos</Text>
          </View>
        </View>
        <View style={styles.summaryRight}>
          <Text style={styles.summaryTotal}>{formatPrice(subtotal)}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
        </View>
      </Pressable>

      {expanded ? (
        <SummaryItems cartItems={cartItems} styles={styles} />
      ) : null}
    </View>
  );
}

function CompactOrderSummary({
  cartItems,
  itemCount,
  subtotal,
  shippingCost,
  total,
  expanded,
  onToggle,
  styles,
  colors,
}: {
  cartItems: CartApiItem[];
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <View style={styles.compactSummaryWrap}>
      <View style={styles.compactSummary}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          style={({ pressed }) => [styles.compactSummaryHeader, pressed && styles.pressedSoft]}
          onPress={onToggle}
        >
          <View style={styles.compactSummaryTitle}>
            <Ionicons name="bag-outline" size={20} color={colors.accent} />
            <Text style={styles.summaryTitle}>
              Resumen <Text style={styles.summaryCount}>({itemCount})</Text>
            </Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryTotal}>{formatPrice(total)}</Text>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
          </View>
        </Pressable>
        {expanded ? (
          <View style={styles.compactSummaryBody}>
            <SummaryItems cartItems={cartItems} styles={styles} />
            <View style={styles.miniTotals}>
              <TotalLine label="Subtotal" value={formatPrice(subtotal)} styles={styles} />
              <TotalLine label="Envio" value={shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)} styles={styles} />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function SummaryItems({
  cartItems,
  styles,
}: {
  cartItems: CartApiItem[];
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.summaryItems}>
      {cartItems.map((item) => (
        <View key={item.id} style={styles.summaryItem}>
          <CartPreviewImage item={item} styles={styles} />
          <View style={styles.summaryItemInfo}>
            <Text style={styles.summaryItemName} numberOfLines={1}>
              {item.productName}
            </Text>
            <Text style={styles.summaryItemMeta} numberOfLines={1}>
              {item.colorName ?? 'Producto'} x {item.quantity}
            </Text>
          </View>
          <Text style={styles.summaryItemPrice}>{formatPrice(item.subtotal)}</Text>
        </View>
      ))}
    </View>
  );
}

function ShippingStep({
  selected,
  onSelect,
  styles,
  colors,
}: {
  selected: ShippingMethod;
  onSelect: (method: ShippingMethod) => void;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles de envio</Text>
        <Text style={styles.sectionSubtitle}>Completa la informacion para la entrega.</Text>

        <View style={styles.form}>
          <CheckoutInput label="NOMBRE COMPLETO" placeholder="Julian Vane" styles={styles} colors={colors} />
          <CheckoutInput label="DIRECCION" placeholder="Av. Artesanos 123" styles={styles} colors={colors} />
          <View style={styles.inputGrid}>
            <CheckoutInput label="CIUDAD" placeholder="Lima" styles={styles} colors={colors} />
            <CheckoutInput label="CODIGO POSTAL" placeholder="15074" styles={styles} colors={colors} />
          </View>
          <CheckoutInput
            label="TELEFONO"
            placeholder="+51 999 999 999"
            keyboardType="phone-pad"
            styles={styles}
            colors={colors}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>METODO DE ENVIO</Text>
        <View style={styles.shippingList}>
          <ShippingOption
            title="Entrega estandar"
            subtitle="5-7 dias habiles"
            price="Gratis"
            selected={selected === 'standard'}
            onPress={() => onSelect('standard')}
            styles={styles}
            colors={colors}
          />
          <ShippingOption
            title="Envio express"
            subtitle="1-2 dias habiles"
            price={formatPrice(EXPRESS_SHIPPING)}
            selected={selected === 'express'}
            onPress={() => onSelect('express')}
            styles={styles}
            colors={colors}
          />
        </View>
      </View>
    </>
  );
}

function PaymentStep({
  paymentMethod,
  savePayment,
  onSelectPayment,
  onToggleSave,
  styles,
  colors,
}: {
  paymentMethod: PaymentMethod;
  savePayment: boolean;
  onSelectPayment: (method: PaymentMethod) => void;
  onToggleSave: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.fieldLabel}>METODO DE PAGO</Text>
      <View style={styles.paymentCard}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.paymentOption, pressed && styles.pressedSoft]}
          onPress={() => onSelectPayment('whatsapp')}
        >
          <View style={styles.paymentOptionLeft}>
            <View style={styles.whatsappIcon}>
              <Ionicons name="logo-whatsapp" size={24} color="#ffffff" />
            </View>
            <View style={styles.paymentOptionText}>
              <Text style={styles.paymentTitle}>Pagar por WhatsApp</Text>
              <Text style={styles.paymentSubtitle}>Finaliza tu pedido con un asesor</Text>
            </View>
          </View>
          <View style={[styles.paymentRadio, paymentMethod === 'whatsapp' && styles.paymentRadioActive]}>
            {paymentMethod === 'whatsapp' ? <View style={styles.radioInner} /> : null}
          </View>
        </Pressable>

        <View style={styles.cardPaymentBody}>
          <Pressable
            accessibilityRole="button"
            style={styles.cardPaymentHeader}
            onPress={() => onSelectPayment('card')}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="card" size={20} color={colors.background} />
            </View>
            <Text style={styles.paymentTitle}>Tarjeta de credito o debito</Text>
            <View style={[styles.paymentRadio, paymentMethod === 'card' && styles.paymentRadioActive]}>
              {paymentMethod === 'card' ? <View style={styles.radioInner} /> : null}
            </View>
          </Pressable>

          <View style={styles.form}>
            <CheckoutInput
              label="NUMERO DE TARJETA"
              placeholder="0000 0000 0000 0000"
              keyboardType="number-pad"
              styles={styles}
              colors={colors}
            />
            <CheckoutInput label="NOMBRE EN LA TARJETA" placeholder="JULIAN VANE" styles={styles} colors={colors} />
            <View style={styles.inputGrid}>
              <CheckoutInput label="EXPIRA" placeholder="MM / YY" styles={styles} colors={colors} />
              <CheckoutInput
                label="CVV"
                placeholder="000"
                keyboardType="number-pad"
                secureTextEntry
                styles={styles}
                colors={colors}
              />
            </View>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: savePayment }}
              style={({ pressed }) => [styles.checkboxRow, pressed && styles.pressedSoft]}
              onPress={onToggleSave}
            >
              <View style={[styles.checkbox, savePayment && styles.checkboxActive]}>
                {savePayment ? <Ionicons name="checkmark" size={14} color={colors.background} /> : null}
              </View>
              <Text style={styles.checkboxLabel}>Guardar datos para futuras compras</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function ReviewStep({
  cartItems,
  subtotal,
  shippingCost,
  total,
  shippingMethod,
  paymentMethod,
  onEditShipping,
  onEditPayment,
  styles,
  colors,
}: {
  cartItems: CartApiItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  onEditShipping: () => void;
  onEditPayment: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <View style={styles.reviewContent}>
      <Text style={styles.reviewTitle}>Revisar pedido</Text>

      <ReviewBlock title="ENVIAR A" onEdit={onEditShipping} styles={styles}>
        <Text style={styles.reviewText}>Av. Artesanos 123</Text>
        <Text style={styles.reviewText}>Lima, 15074</Text>
        <Text style={styles.reviewText}>Peru</Text>
        <Text style={styles.reviewMuted}>
          {shippingMethod === 'standard' ? 'Entrega estandar' : 'Envio express'}
        </Text>
      </ReviewBlock>

      <ReviewBlock title="METODO DE PAGO" onEdit={onEditPayment} styles={styles}>
        <View style={styles.inlineRow}>
          <Ionicons name={paymentMethod === 'card' ? 'card-outline' : 'logo-whatsapp'} size={20} color={colors.muted} />
          <Text style={styles.reviewText}>
            {paymentMethod === 'card' ? 'Visa terminada en 1234' : 'Pago por WhatsApp'}
          </Text>
        </View>
      </ReviewBlock>

      <View style={styles.reviewBlock}>
        <Text style={styles.reviewBlockTitle}>RESUMEN DEL PEDIDO</Text>
        <View style={styles.reviewItems}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.reviewItem}>
              <View style={styles.reviewImageFrame}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.reviewImage}
                    contentFit="cover"
                    accessibilityLabel={item.productName}
                  />
                ) : (
                  <Ionicons name="wallet-outline" size={26} color={colors.muted} />
                )}
              </View>
              <View style={styles.reviewItemInfo}>
                <Text style={styles.reviewItemName}>{item.productName}</Text>
                <Text style={styles.reviewMuted}>Color: {item.colorName ?? 'Producto'}</Text>
                <Text style={styles.reviewMuted}>Cantidad: {item.quantity}</Text>
                <Text style={styles.reviewPrice}>{formatPrice(item.subtotal)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.reviewTotals}>
        <TotalLine label="Subtotal" value={formatPrice(subtotal)} styles={styles} />
        <TotalLine label="Envio" value={shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)} styles={styles} />
        <View style={styles.grandTotalLine}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>{formatPrice(total)}</Text>
        </View>
      </View>
    </View>
  );
}

function ReviewBlock({
  title,
  children,
  onEdit,
  styles,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.reviewBlock}>
      <View style={styles.reviewBlockHeader}>
        <Text style={styles.reviewBlockTitle}>{title}</Text>
        <Pressable accessibilityRole="button" onPress={onEdit}>
          <Text style={styles.editButtonText}>EDITAR</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

function ConfirmationStep({
  cartItems,
  itemCount,
  shippingCost,
  total,
  onShop,
  styles,
  colors,
}: {
  cartItems: CartApiItem[];
  itemCount: number;
  shippingCost: number;
  total: number;
  onShop: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <View style={styles.confirmationContent}>
      <View style={styles.successHero}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={48} color="#ffffff" />
        </View>
        <Text style={styles.successTitle}>Todo listo</Text>
        <Text style={styles.successText}>
          Gracias por confiar en Mila Raffo. Tu pedido ya esta listo para coordinarse.
        </Text>
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>{ORDER_NUMBER}</Text>
        </View>
      </View>

      <View style={styles.confirmationCard}>
        <View style={styles.confirmationCardHeader}>
          <Text style={styles.reviewBlockTitle}>RESUMEN DEL PEDIDO</Text>
          <Text style={styles.reviewMuted}>{itemCount} articulos</Text>
        </View>
        <View style={styles.confirmationItems}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.confirmationItem}>
              <View style={styles.confirmationImageFrame}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.reviewImage}
                    contentFit="cover"
                    accessibilityLabel={item.productName}
                  />
                ) : (
                  <Text style={styles.previewPlaceholder}>MR</Text>
                )}
              </View>
              <View style={styles.confirmationItemInfo}>
                <Text style={styles.reviewItemName}>{item.productName}</Text>
                <Text style={styles.reviewMuted}>Color {item.colorName ?? 'Producto'}</Text>
                <Text style={styles.summaryItemPrice}>{formatPrice(item.subtotal)}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.miniTotals}>
          <TotalLine label="Envio" value={shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)} styles={styles} />
          <View style={styles.grandTotalLine}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.confirmationCard}>
        <View style={styles.deliveryRow}>
          <View style={styles.deliveryIcon}>
            <Ionicons name="car-outline" size={22} color={colors.accent} />
          </View>
          <View style={styles.deliveryText}>
            <Text style={styles.fieldLabel}>ENTREGA ESTIMADA</Text>
            <Text style={styles.deliveryTitle}>5 - 7 dias habiles</Text>
            <Text style={styles.reviewMuted}>Av. Artesanos 123, Lima</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
          <Text style={styles.secondaryActionText}>RASTREAR PEDIDO</Text>
        </Pressable>
      </View>

      <View style={styles.promiseCard}>
        <Image source={{ uri: PROMISE_IMAGE }} style={styles.promiseImage} contentFit="cover" />
        <View style={styles.promiseBody}>
          <Text style={styles.promiseTitle}>Nuestra promesa</Text>
          <Text style={styles.promiseText}>
            Cada pieza es confeccionada con cuidado y materiales seleccionados para acompanar tu dia a dia.
          </Text>
          <View style={styles.promiseBadges}>
            <PromiseBadge icon="leaf-outline" label="MATERIALES" styles={styles} colors={colors} />
            <PromiseBadge icon="hand-left-outline" label="HECHO A MANO" styles={styles} colors={colors} />
          </View>
        </View>
      </View>

      <View style={styles.confirmationActions}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.shopButton, pressed && styles.pressed]}
          onPress={onShop}
        >
          <Text style={styles.shopButtonText}>SEGUIR COMPRANDO</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.receiptButton, pressed && styles.pressedSoft]}>
          <Text style={styles.receiptButtonText}>Descargar recibo (PDF)</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PromiseBadge({
  icon,
  label,
  styles,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <View style={styles.promiseBadge}>
      <Ionicons name={icon} size={17} color={colors.accent} />
      <Text style={styles.promiseBadgeText}>{label}</Text>
    </View>
  );
}

function CheckoutBottomBar({
  step,
  subtotal,
  shippingCost,
  total,
  onPress,
  isProcessing,
  styles,
  colors,
}: {
  step: CheckoutStep;
  subtotal: number;
  shippingCost: number;
  total: number;
  onPress: () => void;
  isProcessing: boolean;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  const buttonLabel = isProcessing
    ? 'PROCESANDO...'
    : step === 'review' ? 'REALIZAR PEDIDO' : step === 'payment' ? 'FINALIZAR COMPRA' : 'CONTINUAR';

  return (
    <View style={styles.bottomBar}>
      {step === 'shipping' ? (
        <View style={styles.costRow}>
          <View>
            <Text style={styles.costLabel}>SUBTOTAL</Text>
            <Text style={styles.costValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.costRight}>
            <Text style={styles.costLabel}>ENVIO</Text>
            <Text style={styles.shippingCost}>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.totalRow}>
        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>{step === 'payment' ? 'TOTAL A PAGAR' : 'TOTAL'}</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={isProcessing}
          style={({ pressed }) => [
            styles.continueButton,
            isProcessing && styles.continueButtonDisabled,
            pressed && styles.pressed,
          ]}
          onPress={onPress}
        >
          <Text style={styles.continueButtonText}>{buttonLabel}</Text>
          {isProcessing ? null : <Ionicons name="arrow-forward" size={18} color={colors.background} />}
        </Pressable>
      </View>
    </View>
  );
}

function CartPreviewImage({
  item,
  styles,
}: {
  item: CartApiItem;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.previewImage}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.previewImageContent}
          contentFit="cover"
          accessibilityLabel={item.productName}
        />
      ) : (
        <Text style={styles.previewPlaceholder}>MR</Text>
      )}
    </View>
  );
}

function CheckoutProgress({
  step,
  styles,
  colors,
}: {
  step: CheckoutStep;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  const index = step === 'shipping' ? 0 : step === 'payment' ? 1 : 2;

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack} />
      <View style={[styles.progressFill, { width: `${index * 50}%` }]} />
      <ProgressStep icon="car-outline" label="ENVIO" state={index > 0 ? 'done' : 'active'} styles={styles} colors={colors} />
      <ProgressStep
        icon="card-outline"
        label="PAGO"
        state={index > 1 ? 'done' : index === 1 ? 'active' : 'pending'}
        styles={styles}
        colors={colors}
      />
      <ProgressStep
        icon="checkmark-done-outline"
        label="REVISION"
        state={index === 2 ? 'active' : 'pending'}
        styles={styles}
        colors={colors}
      />
    </View>
  );
}

function ProgressStep({
  icon,
  label,
  state,
  styles,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  state: 'done' | 'active' | 'pending';
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  const isActive = state === 'active';
  const isDone = state === 'done';

  return (
    <View style={styles.progressStep}>
      <View style={[styles.progressIcon, (isActive || isDone) && styles.progressIconActive]}>
        {isDone ? (
          <Ionicons name="checkmark" size={16} color={colors.background} />
        ) : isActive ? (
          <View style={styles.activeProgressDot} />
        ) : (
          <Ionicons name={icon} size={16} color={colors.muted} />
        )}
      </View>
      <Text style={[styles.progressLabel, (isActive || isDone) && styles.progressLabelActive]}>{label}</Text>
    </View>
  );
}

function CheckoutInput({
  label,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  styles,
  colors,
}: {
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad';
  secureTextEntry?: boolean;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        selectionColor={colors.accent}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

function ShippingOption({
  title,
  subtitle,
  price,
  selected,
  onPress,
  styles,
  colors,
}: {
  title: string;
  subtitle: string;
  price: string;
  selected: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.shippingCard,
        selected && styles.shippingCardActive,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.shippingMain}>
        <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
          {selected ? <View style={styles.radioInner} /> : null}
        </View>
        <View style={styles.shippingText}>
          <Text style={styles.shippingTitle}>{title}</Text>
          <Text style={styles.shippingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.shippingPrice}>{price}</Text>
    </Pressable>
  );
}

function TotalLine({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.totalLine}>
      <Text style={styles.totalLineLabel}>{label}</Text>
      <Text style={styles.totalLineValue}>{value}</Text>
    </View>
  );
}

function createStyles(colors: typeof Colors.light | typeof Colors.dark) {
  const isDark = colors.background === Colors.dark.background;
  const surfaceLow = isDark ? '#151518' : '#fbf9f9';
  const surfaceContainer = isDark ? colors.backgroundElement : '#f5f3f3';
  const surfaceCard = isDark ? colors.backgroundElement : '#ffffff';
  const activeSurface = isDark ? '#2a211d' : '#fff8f4';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: surfaceLow,
    },
    keyboardView: {
      flex: 1,
    },
    appBar: {
      minHeight: 56,
      paddingHorizontal: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: surfaceLow,
    },
    iconButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: -Spacing.two,
    },
    iconButtonSpacer: {
      width: 40,
    },
    appBarTitle: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.base,
      color: colors.foreground,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    scrollContent: {
      paddingBottom: 176,
    },
    confirmationScrollContent: {
      paddingBottom: Spacing.five,
    },
    summaryPanel: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    summaryToggle: {
      minHeight: 78,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.three,
    },
    summaryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      flex: 1,
    },
    previewStack: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 48,
    },
    previewImage: {
      width: 42,
      height: 42,
      borderRadius: Radius.sm,
      overflow: 'hidden',
      backgroundColor: surfaceContainer,
      borderWidth: 2,
      borderColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: -12,
    },
    previewImageContent: {
      width: '100%',
      height: '100%',
    },
    previewPlaceholder: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    previewCount: {
      marginRight: 0,
    },
    previewCountText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    summaryTitle: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    summaryCount: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    summaryMeta: {
      marginTop: Spacing.half,
      fontFamily: FontFamily.bodyBold,
      fontSize: 10,
      color: colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    summaryRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
    },
    summaryTotal: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    summaryItems: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.three,
      gap: Spacing.two,
    },
    summaryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
    },
    summaryItemInfo: {
      flex: 1,
      marginLeft: Spacing.two,
    },
    summaryItemName: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    summaryItemMeta: {
      marginTop: Spacing.half,
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    summaryItemPrice: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    compactSummaryWrap: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
    },
    compactSummary: {
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: surfaceContainer,
      overflow: 'hidden',
    },
    compactSummaryHeader: {
      minHeight: 60,
      paddingHorizontal: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.two,
    },
    compactSummaryTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      flex: 1,
    },
    compactSummaryBody: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: Spacing.three,
    },
    miniTotals: {
      marginHorizontal: Spacing.three,
      marginTop: Spacing.three,
      paddingTop: Spacing.three,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: Spacing.two,
    },
    progressWrap: {
      marginHorizontal: Spacing.three,
      marginTop: Spacing.four,
      marginBottom: Spacing.two,
      minHeight: 64,
      flexDirection: 'row',
      justifyContent: 'space-between',
      position: 'relative',
    },
    progressTrack: {
      position: 'absolute',
      left: 28,
      right: 28,
      top: 15,
      height: 2,
      backgroundColor: colors.border,
    },
    progressFill: {
      position: 'absolute',
      left: 28,
      top: 15,
      height: 2,
      backgroundColor: colors.accent,
    },
    progressStep: {
      alignItems: 'center',
      gap: Spacing.two,
      width: 82,
    },
    progressIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: surfaceContainer,
      borderWidth: 4,
      borderColor: surfaceLow,
    },
    progressIconActive: {
      backgroundColor: colors.accent,
      shadowColor: colors.accent,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    activeProgressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.background,
    },
    progressLabel: {
      fontFamily: FontFamily.bodyBold,
      fontSize: 10,
      color: colors.muted,
      letterSpacing: 1,
    },
    progressLabelActive: {
      color: colors.accent,
    },
    section: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.four,
    },
    sectionTitle: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
    },
    sectionSubtitle: {
      marginTop: Spacing.one,
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      lineHeight: FontSize.sm * 1.5,
      color: colors.muted,
    },
    form: {
      marginTop: Spacing.four,
      gap: Spacing.four,
    },
    inputGrid: {
      flexDirection: 'row',
      gap: Spacing.three,
    },
    inputGroup: {
      flex: 1,
      gap: Spacing.one,
    },
    fieldLabel: {
      fontFamily: FontFamily.bodyBold,
      fontSize: 10,
      color: colors.muted,
      letterSpacing: 1,
    },
    input: {
      height: 48,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 0,
      paddingVertical: Spacing.two,
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    shippingList: {
      marginTop: Spacing.three,
      gap: Spacing.two,
    },
    shippingCard: {
      minHeight: 86,
      padding: Spacing.three,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: surfaceLow,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.three,
    },
    shippingCardActive: {
      borderColor: colors.accent,
      backgroundColor: activeSurface,
    },
    shippingMain: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
    },
    radioOuter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterActive: {
      borderColor: colors.accent,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.accent,
    },
    shippingText: {
      flex: 1,
      gap: Spacing.half,
    },
    shippingTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    shippingSubtitle: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    shippingPrice: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    paymentCard: {
      marginTop: Spacing.three,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: surfaceContainer,
      overflow: 'hidden',
    },
    paymentOption: {
      minHeight: 76,
      padding: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: Spacing.three,
    },
    paymentOptionLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
    },
    whatsappIcon: {
      width: 42,
      height: 42,
      borderRadius: Radius.md,
      backgroundColor: Palette.greenWsp,
      alignItems: 'center',
      justifyContent: 'center',
    },
    paymentOptionText: {
      flex: 1,
      gap: Spacing.half,
    },
    paymentTitle: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    paymentSubtitle: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    paymentRadio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    paymentRadioActive: {
      borderColor: colors.accent,
    },
    cardPaymentBody: {
      padding: Spacing.three,
    },
    cardPaymentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
    },
    cardIcon: {
      width: 42,
      height: 42,
      borderRadius: Radius.md,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingVertical: Spacing.one,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    checkboxLabel: {
      flex: 1,
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    reviewContent: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.four,
    },
    reviewTitle: {
      paddingBottom: Spacing.two,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
      textTransform: 'uppercase',
    },
    reviewBlock: {
      paddingVertical: Spacing.four,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: Spacing.one,
    },
    reviewBlockHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: Spacing.one,
    },
    reviewBlockTitle: {
      fontFamily: FontFamily.bodyBold,
      fontSize: 10,
      letterSpacing: 1,
      color: colors.accent,
    },
    editButtonText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: 10,
      letterSpacing: 1,
      color: colors.accent,
      textDecorationLine: 'underline',
    },
    reviewText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: colors.foreground,
      lineHeight: FontSize.base * 1.45,
    },
    reviewMuted: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
      lineHeight: FontSize.xs * 1.5,
    },
    inlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    reviewItems: {
      gap: Spacing.three,
      marginTop: Spacing.three,
    },
    reviewItem: {
      flexDirection: 'row',
      gap: Spacing.three,
      alignItems: 'center',
    },
    reviewImageFrame: {
      width: 88,
      height: 88,
      borderRadius: Radius.sm,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: surfaceContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reviewImage: {
      width: '100%',
      height: '100%',
    },
    reviewItemInfo: {
      flex: 1,
      gap: Spacing.half,
    },
    reviewItemName: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    reviewPrice: {
      marginTop: Spacing.half,
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.base,
      color: colors.accent,
    },
    reviewTotals: {
      paddingVertical: Spacing.four,
      gap: Spacing.two,
    },
    totalLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    totalLineLabel: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    totalLineValue: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    grandTotalLine: {
      marginTop: Spacing.two,
      paddingTop: Spacing.three,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    grandTotalLabel: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.lg,
      color: colors.foreground,
    },
    grandTotalValue: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.lg,
      color: colors.accent,
    },
    bottomBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
      paddingBottom: Platform.OS === 'ios' ? Spacing.five : Spacing.three,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      shadowColor: '#000000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -4 },
      elevation: 8,
    },
    costRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.three,
    },
    costRight: {
      alignItems: 'flex-end',
    },
    costLabel: {
      fontFamily: FontFamily.bodyBold,
      fontSize: 10,
      letterSpacing: 1,
      color: colors.muted,
    },
    costValue: {
      marginTop: Spacing.half,
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    shippingCost: {
      marginTop: Spacing.half,
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.accent,
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
    },
    totalBlock: {
      minWidth: 104,
    },
    totalLabel: {
      fontFamily: FontFamily.bodyBold,
      fontSize: 10,
      letterSpacing: 1,
      color: colors.foreground,
    },
    totalValue: {
      marginTop: Spacing.half,
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.lg,
      color: colors.foreground,
    },
    continueButton: {
      flex: 1,
      minHeight: 56,
      borderRadius: Radius.md,
      backgroundColor: colors.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      shadowColor: colors.accent,
      shadowOpacity: 0.28,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    continueButtonDisabled: {
      opacity: 0.7,
    },
    continueButtonText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.sm,
      color: colors.background,
      letterSpacing: 1,
    },
    confirmationContent: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.four,
      gap: Spacing.four,
    },
    successHero: {
      alignItems: 'center',
      paddingVertical: Spacing.four,
    },
    successIcon: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.four,
      shadowColor: colors.accent,
      shadowOpacity: 0.22,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 5,
    },
    successTitle: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['2xl'],
      color: colors.foreground,
    },
    successText: {
      marginTop: Spacing.two,
      maxWidth: 320,
      textAlign: 'center',
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      lineHeight: FontSize.base * 1.5,
      color: colors.muted,
    },
    orderBadge: {
      marginTop: Spacing.three,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: activeSurface,
    },
    orderBadgeText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.xs,
      color: colors.accent,
      letterSpacing: 1.2,
    },
    confirmationCard: {
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: surfaceCard,
      padding: Spacing.three,
      shadowColor: '#000000',
      shadowOpacity: 0.03,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 1,
    },
    confirmationCardHeader: {
      paddingBottom: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    confirmationItems: {
      gap: Spacing.three,
      marginTop: Spacing.three,
    },
    confirmationItem: {
      flexDirection: 'row',
      gap: Spacing.three,
    },
    confirmationImageFrame: {
      width: 80,
      height: 80,
      borderRadius: Radius.md,
      overflow: 'hidden',
      backgroundColor: surfaceContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmationItemInfo: {
      flex: 1,
      justifyContent: 'center',
      gap: Spacing.half,
    },
    deliveryRow: {
      flexDirection: 'row',
      gap: Spacing.three,
      alignItems: 'flex-start',
      marginBottom: Spacing.three,
    },
    deliveryIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: surfaceContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deliveryText: {
      flex: 1,
      gap: Spacing.half,
    },
    deliveryTitle: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    secondaryAction: {
      minHeight: 44,
      borderRadius: Radius.md,
      backgroundColor: activeSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryActionText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.xs,
      color: colors.accent,
      letterSpacing: 1,
    },
    promiseCard: {
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: surfaceCard,
      overflow: 'hidden',
    },
    promiseImage: {
      width: '100%',
      height: 176,
    },
    promiseBody: {
      padding: Spacing.three,
    },
    promiseTitle: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.lg,
      color: colors.foreground,
    },
    promiseText: {
      marginTop: Spacing.one,
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      lineHeight: FontSize.sm * 1.55,
      color: colors.muted,
    },
    promiseBadges: {
      marginTop: Spacing.three,
      flexDirection: 'row',
      gap: Spacing.three,
      flexWrap: 'wrap',
    },
    promiseBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
    },
    promiseBadgeText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: 10,
      color: colors.muted,
      letterSpacing: 0.8,
    },
    confirmationActions: {
      gap: Spacing.two,
      paddingTop: Spacing.two,
    },
    shopButton: {
      minHeight: 54,
      borderRadius: Radius.md,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.accent,
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    shopButtonText: {
      fontFamily: FontFamily.bodyBold,
      fontSize: FontSize.sm,
      color: colors.background,
      letterSpacing: 1.2,
    },
    receiptButton: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    receiptButtonText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    pressed: {
      opacity: 0.78,
      transform: [{ scale: 0.99 }],
    },
    pressedSoft: {
      opacity: 0.82,
    },
  });
}
