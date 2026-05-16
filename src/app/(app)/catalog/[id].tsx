import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useCartStore } from '@/modules/cart';
import { useProductsStore, type ProductVariant } from '@/modules/products';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatCharacteristicValue(value: string, units?: string): string {
  return units ? `${value} ${units}` : value;
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
  const addItem = useCartStore((s) => s.addItem);
  const isAddingToCart = useCartStore((s) => s.isLoading);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const productId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    if (productId) {
      void fetchProductById(productId);
    }

    return () => {
      clearSelected();
    };
  }, [clearSelected, fetchProductById, productId]);

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

  const handleAddToCart = useCallback(() => {
    if (product && canAddToCart) {
      void addItem(product);
    }
  }, [addItem, canAddToCart, product]);

  const handleRetry = useCallback(() => {
    if (productId) {
      void fetchProductById(productId);
    }
  }, [fetchProductById, productId]);

  if (isLoadingProduct && !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (productError && !product) {
    return (
      <SafeAreaView style={styles.container}>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>Producto no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </Pressable>
          <Text style={[styles.status, canAddToCart ? styles.statusAvailable : styles.statusUnavailable]}>
            {canAddToCart ? 'Disponible' : 'No disponible'}
          </Text>
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
          <Section title="Variantes" styles={styles}>
            <View style={styles.variantList}>
              {product.variants.map((variant) => (
                <VariantOption
                  key={variant.id}
                  variant={variant}
                  selected={variant.id === selectedVariant?.id}
                  styles={styles}
                  onPress={() => setSelectedVariantId(variant.id)}
                />
              ))}
            </View>
          </Section>
        ) : null}

        {product.characteristics.length ? (
          <Section title="Características" styles={styles}>
            <View style={styles.specGrid}>
              {product.characteristics.map((characteristic) => (
                <View key={characteristic.id} style={styles.specItem}>
                  <Text style={styles.specLabel}>{characteristic.name}</Text>
                  <Text style={styles.specValue}>
                    {formatCharacteristicValue(characteristic.value, characteristic.units)}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canAddToCart || isAddingToCart}
          style={({ pressed }) => [
            styles.primaryButton,
            (!canAddToCart || isAddingToCart) && styles.primaryButtonDisabled,
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

function VariantOption({
  variant,
  selected,
  styles,
  onPress,
}: {
  variant: ProductVariant;
  selected: boolean;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.variantOption,
        selected && styles.variantOptionSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.variantTextBlock}>
        <Text style={styles.variantName}>{variant.sku}</Text>
        <Text style={styles.variantAvailability}>{variant.isAvailable ? 'Disponible' : 'No disponible'}</Text>
      </View>
      <Text style={styles.variantPrice}>{formatPrice(variant.price)}</Text>
    </Pressable>
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
    variantList: {
      gap: Spacing.two,
    },
    variantOption: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.two,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      padding: Spacing.three,
      backgroundColor: colors.background,
    },
    variantOptionSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.backgroundElement,
    },
    variantTextBlock: {
      flex: 1,
      gap: Spacing.one,
    },
    variantName: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    variantAvailability: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    variantPrice: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.base,
      color: colors.accent,
    },
    specGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    specItem: {
      minWidth: '47%',
      flex: 1,
      gap: Spacing.one,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      padding: Spacing.three,
      backgroundColor: colors.background,
    },
    specLabel: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
    },
    specValue: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.lg,
      color: colors.foreground,
    },
    primaryButton: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      backgroundColor: colors.foreground,
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
