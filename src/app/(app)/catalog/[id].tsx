import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { PressScale } from '@/components/ui/animations';
import { useCartStore } from '@/modules/cart';
import { useProductsStore } from '@/modules/products';
import { useWishlistStore } from '@/modules/wishlist';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatCharValue(value: string, dataType: string, units?: string): string {
  if (dataType === 'bool') return value === 'true' ? 'Sí' : 'No';
  if (units) return `${value} ${units}`;
  return value;
}

const CHAR_ICON_MAP: Array<[string, React.ComponentProps<typeof Ionicons>['name']]> = [
  ['material', 'layers-outline'],
  ['color', 'color-palette-outline'],
  ['dimensi', 'resize-outline'],
  ['tamaño', 'resize-outline'],
  ['medida', 'resize-outline'],
  ['largo', 'resize-outline'],
  ['ancho', 'resize-outline'],
  ['alto', 'resize-outline'],
  ['peso', 'scale-outline'],
  ['cierre', 'lock-closed-outline'],
  ['capacidad', 'bag-outline'],
  ['correa', 'link-outline'],
  ['acabado', 'brush-outline'],
  ['forro', 'shirt-outline'],
  ['bolsillo', 'layers-outline'],
];

function getCharIcon(name: string): React.ComponentProps<typeof Ionicons>['name'] {
  const lower = name.toLowerCase();
  for (const [key, icon] of CHAR_ICON_MAP) {
    if (lower.includes(key)) return icon;
  }
  return 'checkmark-circle-outline';
}

export default function CatalogProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const product = useProductsStore((s) => s.selectedProduct);
  const isLoadingProduct = useProductsStore((s) => s.isLoading);
  const productError = useProductsStore((s) => s.error);
  const fetchProductById = useProductsStore((s) => s.fetchProductById);
  const clearSelected = useProductsStore((s) => s.clearSelected);

  const cartItems = useCartStore((s) => s.cart.items);
  const loadCart = useCartStore((s) => s.loadCart);
  const addItem = useCartStore((s) => s.addItem);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const isAddingToCart = useCartStore((s) => s.isLoading);

  const wishlist = useWishlistStore((s) => s.wishlist);
  const addToWishlist = useWishlistStore((s) => s.addToWishlist);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const isWishlistLoading = useWishlistStore((s) => s.isLoading);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const productId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    if (productId) {
      void fetchProductById(productId);
    }
    if (!wishlist) {
      void fetchWishlist();
    }
    void loadCart();
    return () => {
      clearSelected();
    };
  }, [clearSelected, fetchProductById, fetchWishlist, loadCart, productId, wishlist]);

  useEffect(() => {
    setSelectedVariantId(product?.variants[0]?.id ?? null);
  }, [product?.id, product?.variants]);

  const selectedVariant = useMemo(
    () => product?.variants.find((variant) => variant.id === selectedVariantId) ?? product?.variants[0] ?? null,
    [product?.variants, selectedVariantId],
  );

  const image = selectedVariant?.image ?? product?.images[0] ?? null;
  const displayPrice = selectedVariant?.price && selectedVariant.price > 0 ? selectedVariant.price : product?.price ?? 0;
  const canAddToCart = Boolean(product?.isActive && (selectedVariant ? selectedVariant.isAvailable : true));

  const wishlistItemForVariant = useMemo(
    () => wishlist?.items.find((i) => i.variantId === (selectedVariant?.id ?? '')),
    [wishlist, selectedVariant?.id],
  );
  const inWishlist = Boolean(wishlistItemForVariant);

  const cartItemForVariant = useMemo(
    () => selectedVariantId ? cartItems.find((i) => i.variantId === selectedVariantId) ?? null : null,
    [cartItems, selectedVariantId],
  );

  const handleAddToCart = useCallback(() => {
    if (product && canAddToCart && selectedVariant) {
      void addItem(selectedVariant.id, 1);
    }
  }, [addItem, canAddToCart, product, selectedVariant]);

  const handleIncrement = useCallback(() => {
    if (!cartItemForVariant) return;
    if (cartItemForVariant.quantity < cartItemForVariant.stockAvailable) {
      void updateItem(cartItemForVariant.id, cartItemForVariant.quantity + 1);
    }
  }, [cartItemForVariant, updateItem]);

  const handleDecrement = useCallback(() => {
    if (!cartItemForVariant) return;
    if (cartItemForVariant.quantity <= 1) {
      void removeItem(cartItemForVariant.id);
    } else {
      void updateItem(cartItemForVariant.id, cartItemForVariant.quantity - 1);
    }
  }, [cartItemForVariant, removeItem, updateItem]);

  const handleToggleWishlist = useCallback(() => {
    if (!selectedVariant) return;
    if (wishlistItemForVariant) {
      void removeFromWishlist(wishlistItemForVariant.id);
    } else {
      void addToWishlist(selectedVariant.id);
    }
  }, [addToWishlist, removeFromWishlist, selectedVariant, wishlistItemForVariant]);

  const handleRetry = useCallback(() => {
    if (productId) {
      void fetchProductById(productId);
    }
  }, [fetchProductById, productId]);

  const handleShare = useCallback(async () => {
    if (!product || !productId) return;
    const deepLink = Linking.createURL(`/catalog/${productId}`);
    await Share.share({ message: `Mirá este producto: ${product.name}\n${deepLink}` });
  }, [product, productId]);

  if (isLoadingProduct && !product) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (productError && !product) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>No pudimos cargar el producto</Text>
          <Text style={styles.emptyText}>{productError}</Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={handleRetry}
          >
            <Text style={styles.primaryButtonText}>Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>Producto no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </Pressable>

          <View style={styles.topBarRight}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.heartButtonTop, pressed && styles.pressed]}
              onPress={() => void handleShare()}
            >
              <Ionicons name="share-outline" size={22} color={colors.foreground} />
            </Pressable>
            {selectedVariant ? (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.heartButtonTop, pressed && styles.pressed]}
                onPress={handleToggleWishlist}
                disabled={isWishlistLoading}
              >
                <Ionicons
                  name={inWishlist ? 'heart' : 'heart-outline'}
                  size={22}
                  color={inWishlist ? colors.accent : colors.foreground}
                />
              </Pressable>
            ) : null}
            <Text style={[styles.status, canAddToCart ? styles.statusAvailable : styles.statusUnavailable]}>
              {canAddToCart ? 'Disponible' : 'No disponible'}
            </Text>
          </View>
        </View>

        <View style={styles.imageFrame}>
          {image ? (
            <Image
              source={{ uri: image.url }}
              style={styles.image}
              contentFit="cover"
              accessibilityLabel={image.alt ?? product.name}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>MR</Text>
            </View>
          )}
        </View>

        <View style={styles.summary}>
          <View style={styles.categoryRow}>
            {product.categories.map((category) => (
              <Text key={category.id} style={styles.category}>{category.name}</Text>
            ))}
          </View>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>{formatPrice(displayPrice)}</Text>
          {product.description ? (
            <Text style={styles.description}>{product.description}</Text>
          ) : (
            <Text style={styles.description}>Pieza seleccionada de la colección Mila Raffo.</Text>
          )}
        </View>

        {product.variants.length ? (
          <Section title="Color" styles={styles}>
            <View style={styles.swatchRow}>
              {product.variants.map((variant) => (
                <Pressable
                  key={variant.id}
                  accessibilityRole="button"
                  accessibilityLabel={variant.color?.name ?? variant.sku}
                  accessibilityState={{ selected: variant.id === selectedVariant?.id }}
                  style={({ pressed }) => [
                    styles.colorSwatch,
                    variant.color
                      ? { backgroundColor: variant.color.hex }
                      : styles.colorSwatchNoColor,
                    variant.id === selectedVariant?.id && styles.colorSwatchSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setSelectedVariantId(variant.id)}
                >
                  {!variant.color ? (
                    <Text style={styles.colorSwatchLabel} numberOfLines={1}>{variant.sku}</Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
            {selectedVariant ? (
              <Text style={styles.selectedVariantInfo}>
                {selectedVariant.color?.name ?? selectedVariant.sku}
                {' · '}
                {selectedVariant.isAvailable ? 'Disponible' : 'No disponible'}
              </Text>
            ) : null}
          </Section>
        ) : null}

        {cartItemForVariant ? (
          <View style={styles.cartControls}>
            <View style={styles.inCartRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
              <Text style={styles.inCartLabel}>En tu carrito</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                accessibilityRole="button"
                style={styles.stepperBtn}
                onPress={handleDecrement}
                disabled={isAddingToCart}
              >
                <Ionicons
                  name={cartItemForVariant.quantity <= 1 ? 'trash-outline' : 'remove'}
                  size={20}
                  color={colors.foreground}
                />
              </Pressable>
              <View style={styles.stepperDivider} />
              {isAddingToCart ? (
                <ActivityIndicator style={styles.stepperCount} color={colors.accent} size="small" />
              ) : (
                <Text style={styles.stepperCount}>{cartItemForVariant.quantity}</Text>
              )}
              <View style={styles.stepperDivider} />
              <Pressable
                accessibilityRole="button"
                style={styles.stepperBtn}
                onPress={handleIncrement}
                disabled={isAddingToCart || cartItemForVariant.quantity >= cartItemForVariant.stockAvailable}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={cartItemForVariant.quantity >= cartItemForVariant.stockAvailable ? colors.muted : colors.foreground}
                />
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.goToCartButton, pressed && styles.pressed]}
              onPress={() => router.push('/cart' as never)}
            >
              <Text style={styles.goToCartText}>Ver carrito →</Text>
            </Pressable>
          </View>
        ) : (
          <PressScale>
            <Pressable
              accessibilityRole="button"
              disabled={!canAddToCart || isAddingToCart || !selectedVariant}
              style={({ pressed }) => [
                styles.primaryButton,
                (!canAddToCart || isAddingToCart || !selectedVariant) && styles.primaryButtonDisabled,
                pressed && styles.pressed,
              ]}
              onPress={handleAddToCart}
            >
              {isAddingToCart ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.primaryButtonText}>Agregar al carrito</Text>
              )}
            </Pressable>
          </PressScale>
        )}

        {product.characteristics.length ? (
          <Section title="Características" styles={styles}>
            <View style={styles.charList}>
              {product.characteristics.map((char, index) => (
                <React.Fragment key={char.id}>
                  {index > 0 && <View style={styles.charDivider} />}
                  <View style={styles.charRow}>
                    <View style={styles.charIconBox}>
                      <Ionicons
                        name={getCharIcon(char.name)}
                        size={17}
                        color={colors.accent}
                      />
                    </View>
                    <Text style={styles.charName}>{char.name}</Text>
                    <Text style={styles.charValue} numberOfLines={2}>
                      {formatCharValue(char.value, char.dataType, char.units)}
                    </Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </Section>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
  styles,
}: {
  title: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
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
      paddingTop: Spacing.two,
      paddingBottom: Spacing.six,
      gap: Spacing.three,
    },
    topBar: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.two,
    },
    backButton: {
      minHeight: 36,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
    },
    backButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    heartButtonTop: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    status: {
      overflow: 'hidden',
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.one,
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      textTransform: 'uppercase',
    },
    statusAvailable: {
      color: colors.background,
      backgroundColor: colors.accent,
    },
    statusUnavailable: {
      color: colors.muted,
      backgroundColor: colors.backgroundElement,
    },
    imageFrame: {
      overflow: 'hidden',
      width: '100%',
      aspectRatio: 0.9,
      borderRadius: Radius.sm,
      backgroundColor: colors.backgroundElement,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePlaceholderText: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      color: colors.muted,
    },
    summary: {
      gap: Spacing.two,
    },
    categoryRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    category: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.accent,
      textTransform: 'uppercase',
    },
    title: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      lineHeight: FontSize['3xl'] * 1.05,
      color: colors.foreground,
    },
    price: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
    },
    description: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      lineHeight: FontSize.base * 1.5,
      color: colors.muted,
    },
    section: {
      gap: Spacing.two,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: Spacing.three,
    },
    sectionTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
      textTransform: 'uppercase',
    },
    swatchRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    colorSwatch: {
      width: 48,
      height: 48,
      borderRadius: Radius.sm,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    colorSwatchSelected: {
      borderColor: colors.accent,
      borderWidth: 3,
    },
    colorSwatchNoColor: {
      backgroundColor: colors.backgroundElement,
      borderColor: colors.border,
    },
    colorSwatchLabel: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs - 2,
      color: colors.foreground,
      textAlign: 'center',
    },
    selectedVariantInfo: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    charList: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      overflow: 'hidden',
    },
    charRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      backgroundColor: colors.background,
    },
    charDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: Spacing.three + 17 + Spacing.three,
    },
    charIconBox: {
      width: 17,
      alignItems: 'center',
    },
    charName: {
      flex: 1,
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    charValue: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
      textAlign: 'right',
      maxWidth: '55%',
    },
    cartControls: {
      gap: Spacing.two,
    },
    inCartRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
    },
    inCartLabel: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.accent,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.accent,
      borderRadius: Radius.sm,
      overflow: 'hidden',
      minHeight: 52,
    },
    stepperBtn: {
      width: 56,
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperDivider: {
      width: 1,
      height: 28,
      backgroundColor: colors.border,
    },
    stepperCount: {
      flex: 1,
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
      textAlign: 'center',
    },
    goToCartButton: {
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goToCartText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.accent,
    },
    primaryButton: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      backgroundColor: colors.accent,
    },
    primaryButtonDisabled: {
      opacity: 0.55,
    },
    primaryButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.background,
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      padding: Spacing.four,
    },
    emptyTitle: {
      textAlign: 'center',
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
    },
    emptyText: {
      textAlign: 'center',
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: colors.muted,
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
