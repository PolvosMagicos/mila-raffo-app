import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useCartStore } from '@/modules/cart';
import { useProductsStore, type Product } from '@/modules/products';

const PAGE_SIZE = 12;

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function CatalogScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const items = useProductsStore((s) => s.items);
  const total = useProductsStore((s) => s.total);
  const isLoading = useProductsStore((s) => s.isLoading);
  const error = useProductsStore((s) => s.error);
  const fetchProducts = useProductsStore((s) => s.fetchProducts);
  const clearError = useProductsStore((s) => s.clearError);
  const addItem = useCartStore((s) => s.addItem);
  const isAddingToCart = useCartStore((s) => s.isLoading);

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const loadProducts = useCallback(
    (query = appliedSearch) => fetchProducts({
      search: query.trim() || undefined,
      page: 1,
      limit: PAGE_SIZE,
      available: true,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    }),
    [appliedSearch, fetchProducts],
  );

  useEffect(() => {
    void fetchProducts({
      page: 1,
      limit: PAGE_SIZE,
      available: true,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
  }, [fetchProducts]);

  const handleSubmitSearch = useCallback(() => {
    clearError();
    const query = search.trim();
    setAppliedSearch(query);
    loadProducts(query);
  }, [clearError, loadProducts, search]);

  const handleClearSearch = useCallback(() => {
    setSearch('');
    setAppliedSearch('');
    clearError();
    loadProducts('');
  }, [clearError, loadProducts]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      void addItem(product);
    },
    [addItem],
  );

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        disabled={isAddingToCart}
        onAdd={handleAddToCart}
        styles={styles}
      />
    ),
    [handleAddToCart, isAddingToCart, styles],
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderProduct}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.listContent}
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            tintColor={colors.accent}
            onRefresh={() => loadProducts()}
          />
        )}
        ListHeaderComponent={(
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Mila Raffo</Text>
            <Text style={styles.title}>Catálogo</Text>
            <Text style={styles.subtitle}>{total ? `${total} productos disponibles` : 'Explora piezas seleccionadas'}</Text>

            <View style={styles.searchRow}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={handleSubmitSearch}
                placeholder="Buscar productos"
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                style={styles.searchInput}
              />
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
                onPress={handleSubmitSearch}
              >
                <Text style={styles.searchButtonText}>Buscar</Text>
              </Pressable>
            </View>

            {appliedSearch ? (
              <Pressable accessibilityRole="button" onPress={handleClearSearch}>
                <Text style={styles.clearSearch}>Limpiar busqueda</Text>
              </Pressable>
            ) : null}

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable accessibilityRole="button" onPress={() => loadProducts()}>
                  <Text style={styles.retryText}>Reintentar</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            {isLoading ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <Text style={styles.emptyTitle}>No hay productos</Text>
                <Text style={styles.emptyText}>Cuando el backend tenga productos activos van a aparecer aca.</Text>
              </>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function ProductCard({
  product,
  disabled,
  onAdd,
  styles,
}: {
  product: Product;
  disabled: boolean;
  onAdd: (product: Product) => void;
  styles: ReturnType<typeof createStyles>;
}) {
  const image = product.images[0];
  const category = product.category?.name;

  return (
    <View style={styles.productCard}>
      <View style={styles.imageFrame}>
        {image ? (
          <Image
            source={{ uri: image.url }}
            style={styles.productImage}
            contentFit="cover"
            accessibilityLabel={image.alt ?? product.name}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>MR</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        {category ? <Text style={styles.category}>{category}</Text> : null}
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <Text style={styles.stock}>{product.stock > 0 ? `${product.stock} en stock` : 'Consultar stock'}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        style={({ pressed }) => [
          styles.addButton,
          disabled && styles.addButtonDisabled,
          pressed && styles.pressed,
        ]}
        onPress={() => onAdd(product)}
      >
        <Text style={styles.addButtonText}>Agregar</Text>
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
    },
    header: {
      paddingTop: Spacing.two,
      paddingBottom: Spacing.three,
      gap: Spacing.two,
    },
    eyebrow: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.accent,
      textTransform: 'uppercase',
    },
    title: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['3xl'],
      color: colors.foreground,
    },
    subtitle: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: colors.muted,
    },
    searchRow: {
      flexDirection: 'row',
      gap: Spacing.two,
      marginTop: Spacing.two,
    },
    searchInput: {
      flex: 1,
      minHeight: 44,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      color: colors.foreground,
      backgroundColor: colors.background,
    },
    searchButton: {
      minHeight: 44,
      justifyContent: 'center',
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      backgroundColor: colors.accent,
    },
    searchButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: '#ffffff',
    },
    clearSearch: {
      alignSelf: 'flex-start',
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.accent,
    },
    errorBox: {
      gap: Spacing.one,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      padding: Spacing.three,
      backgroundColor: colors.backgroundElement,
    },
    errorText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    retryText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.accent,
    },
    productRow: {
      gap: Spacing.two,
      marginBottom: Spacing.two,
    },
    productCard: {
      flex: 1,
      maxWidth: '49%',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      backgroundColor: colors.background,
    },
    imageFrame: {
      aspectRatio: 0.82,
      backgroundColor: colors.backgroundElement,
    },
    productImage: {
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
      fontSize: FontSize['2xl'],
      color: colors.muted,
    },
    cardBody: {
      minHeight: 112,
      gap: Spacing.one,
      padding: Spacing.two,
    },
    category: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
    },
    productName: {
      minHeight: 40,
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.lg,
      lineHeight: FontSize.lg,
      color: colors.foreground,
    },
    price: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.base,
      color: colors.accent,
    },
    stock: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.xs,
      color: colors.muted,
    },
    addButton: {
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: Spacing.two,
      marginBottom: Spacing.two,
      borderRadius: Radius.sm,
      backgroundColor: colors.foreground,
    },
    addButtonDisabled: {
      opacity: 0.6,
    },
    addButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.background,
    },
    emptyState: {
      minHeight: 280,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      padding: Spacing.four,
    },
    emptyTitle: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
    },
    emptyText: {
      maxWidth: 280,
      textAlign: 'center',
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      lineHeight: FontSize.base * 1.45,
      color: colors.muted,
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
