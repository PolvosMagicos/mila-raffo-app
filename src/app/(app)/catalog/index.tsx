import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { AppHeader } from '@/components/app-header';
import { Float, Shimmer, StaggerItem } from '@/components/ui/animations';
import { useProductsStore, type Product, type ProductCategory } from '@/modules/products';
import { useWishlistStore } from '@/modules/wishlist';

const PAGE_SIZE = 12;
const FILTERS_PANEL_MAX_HEIGHT = 700;
const SKELETON_CARD_COUNT = 6;

type AvailabilityFilter = 'available' | 'unavailable' | 'all';
type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'nameAsc';

const AVAILABILITY_OPTIONS: { label: string; value: AvailabilityFilter }[] = [
  { label: 'Disponibles', value: 'available' },
  { label: 'Agotados', value: 'unavailable' },
  { label: 'Todos', value: 'all' },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Recientes', value: 'newest' },
  { label: 'Menor precio', value: 'priceAsc' },
  { label: 'Mayor precio', value: 'priceDesc' },
  { label: 'Nombre A-Z', value: 'nameAsc' },
];

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

function parsePriceFilter(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function resolveSort(option: SortOption): { sortBy: 'name' | 'basePrice' | 'createdAt'; sortOrder: 'ASC' | 'DESC' } {
  if (option === 'priceAsc') return { sortBy: 'basePrice', sortOrder: 'ASC' };
  if (option === 'priceDesc') return { sortBy: 'basePrice', sortOrder: 'DESC' };
  if (option === 'nameAsc') return { sortBy: 'name', sortOrder: 'ASC' };
  return { sortBy: 'createdAt', sortOrder: 'DESC' };
}

function normalizeCategoryToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchesCategoryToken(category: ProductCategory, token: string): boolean {
  const normalizedToken = normalizeCategoryToken(token);
  const normalizedName = normalizeCategoryToken(category.name);
  const normalizedSlug = normalizeCategoryToken(category.slug);

  return normalizedName === normalizedToken || normalizedSlug === normalizedToken;
}

export default function CatalogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string; categorySlug?: string; q?: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const items = useProductsStore((s) => s.items);
  const total = useProductsStore((s) => s.total);
  const isLoading = useProductsStore((s) => s.isLoading);
  const isLoadingMore = useProductsStore((s) => s.isLoadingMore);
  const hasMore = useProductsStore((s) => s.hasMore);
  const error = useProductsStore((s) => s.error);
  const fetchProducts = useProductsStore((s) => s.fetchProducts);
  const loadMoreProducts = useProductsStore((s) => s.loadMoreProducts);
  const clearError = useProductsStore((s) => s.clearError);

  const wishlist = useWishlistStore((s) => s.wishlist);
  const addToWishlist = useWishlistStore((s) => s.addToWishlist);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  const initialSearch = typeof params.q === 'string' ? params.q : '';
  const initialCategoryId = typeof params.categoryId === 'string' ? params.categoryId : undefined;
  const requestedCategorySlug = typeof params.categorySlug === 'string' ? params.categorySlug : undefined;

  const [search, setSearch] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  const [categoryOptions, setCategoryOptions] = useState<ProductCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(initialCategoryId);
  const [availability, setAvailability] = useState<AvailabilityFilter>('available');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>();
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>();
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);
  const [colorOptions, setColorOptions] = useState<{ id: string; hex: string; name: string }[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const filtersAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSearch(initialSearch);
    setAppliedSearch(initialSearch);
    setSelectedCategoryId(initialCategoryId);
  }, [initialCategoryId, initialSearch]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setAppliedSearch('');
    setSelectedCategoryId(undefined);
    setAvailability('available');
    setSortOption('newest');
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice(undefined);
    setAppliedMaxPrice(undefined);
    setSelectedColorIds([]);
    setFiltersVisible(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return resetFilters;
    }, [resetFilters]),
  );

  useEffect(() => {
    Animated.timing(filtersAnimation, {
      toValue: filtersVisible ? 1 : 0,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [filtersAnimation, filtersVisible]);

  const animatedFiltersStyle = useMemo(() => ({
    maxHeight: filtersAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, FILTERS_PANEL_MAX_HEIGHT],
    }),
    opacity: filtersAnimation,
    transform: [{
      translateY: filtersAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-8, 0],
      }),
    }],
  }), [filtersAnimation]);

  const productFilters = useMemo(() => {
    const sort = resolveSort(sortOption);

    return {
      q: appliedSearch.trim() || undefined,
      limit: PAGE_SIZE,
      categoryId: selectedCategoryId,
      colorIds: selectedColorIds.length ? selectedColorIds : undefined,
      available: availability === 'all' ? undefined : availability === 'available',
      minBasePrice: appliedMinPrice,
      maxBasePrice: appliedMaxPrice,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
    };
  }, [appliedMaxPrice, appliedMinPrice, appliedSearch, availability, selectedCategoryId, selectedColorIds, sortOption]);

  const loadProducts = useCallback(() => fetchProducts(productFilters), [fetchProducts, productFilters]);

  useEffect(() => {
    void fetchProducts(productFilters);
  }, [fetchProducts, productFilters]);

  useEffect(() => {
    void fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    const nextCategories = items.flatMap((product) => product.categories);

    if (!nextCategories.length) return;

    setCategoryOptions((current) => {
      const categoriesById = new Map(current.map((category) => [category.id, category]));

      nextCategories.forEach((category) => {
        categoriesById.set(category.id, category);
      });

      return categoriesById.size === current.length ? current : Array.from(categoriesById.values());
    });
  }, [items]);

  useEffect(() => {
    if (!requestedCategorySlug || selectedCategoryId) return;

    const matchedCategory = categoryOptions.find((category) =>
      matchesCategoryToken(category, requestedCategorySlug),
    );

    if (matchedCategory) {
      setSelectedCategoryId(matchedCategory.id);
    }
  }, [categoryOptions, requestedCategorySlug, selectedCategoryId]);

  useEffect(() => {
    const nextColors = items.flatMap((p) =>
      p.variants.flatMap((v) =>
        v.color ? [{ id: v.color.id, hex: v.color.hex, name: v.color.name }] : [],
      ),
    );
    if (!nextColors.length) return;
    setColorOptions((current) => {
      const map = new Map(current.map((c) => [c.id, c]));
      nextColors.forEach((c) => map.set(c.id, c));
      return map.size === current.length ? current : Array.from(map.values());
    });
  }, [items]);

  const handleSubmitSearch = useCallback(() => {
    clearError();
    const query = search.trim();
    setAppliedSearch(query);
  }, [clearError, search]);

  const handleClearSearch = useCallback(() => {
    setSearch('');
    setAppliedSearch('');
    clearError();
  }, [clearError]);

  const handleApplyPriceFilters = useCallback(() => {
    clearError();
    setAppliedMinPrice(parsePriceFilter(minPrice));
    setAppliedMaxPrice(parsePriceFilter(maxPrice));
  }, [clearError, maxPrice, minPrice]);

  const handleClearFilters = useCallback(() => {
    clearError();
    resetFilters();
  }, [clearError, resetFilters]);

  const handleToggleColor = useCallback((id: string) => {
    setSelectedColorIds((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id],
    );
  }, []);

  const handleOpenProduct = useCallback(
    (product: Product) => {
      router.push(`/catalog/${product.id}` as never);
    },
    [router],
  );

  const handleToggleWishlist = useCallback(
    (product: Product) => {
      const firstVariant = product.variants[0];
      if (!firstVariant) return;

      const existingItem = wishlist?.items.find((i) => i.variantId === firstVariant.id);
      if (existingItem) {
        void removeFromWishlist(existingItem.id);
      } else {
        void addToWishlist(firstVariant.id);
      }
    },
    [wishlist, addToWishlist, removeFromWishlist],
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      void loadMoreProducts(productFilters);
    }
  }, [hasMore, isLoadingMore, loadMoreProducts, productFilters]);

  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => {
      const firstVariantId = item.variants[0]?.id;
      const inWishlist = firstVariantId
        ? (wishlist?.items.some((i) => i.variantId === firstVariantId) ?? false)
        : false;

      return (
        <StaggerItem index={index} style={styles.productCardWrapper}>
          <ProductCard
            product={item}
            inWishlist={inWishlist}
            onToggleWishlist={handleToggleWishlist}
            onOpen={handleOpenProduct}
            styles={styles}
            colors={colors}
          />
        </StaggerItem>
      );
    },
    [handleToggleWishlist, handleOpenProduct, wishlist, styles, colors],
  );

  const listFooter = useMemo(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }, [isLoadingMore, colors.accent, styles.loadingMore]);

  const listData = isLoading ? [] : items;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <AppHeader />
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderProduct}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={listFooter}
        refreshControl={(
          <RefreshControl
            refreshing={isLoading && items.length > 0}
            tintColor={colors.accent}
            onRefresh={loadProducts}
          />
        )}
        ListHeaderComponent={(
          <View style={styles.header}>
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

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: filtersVisible }}
              style={({ pressed }) => [styles.filtersToggle, pressed && styles.pressed]}
              onPress={() => setFiltersVisible((visible) => !visible)}
            >
              <View style={styles.filtersToggleContent}>
                <Ionicons name="options-outline" size={18} color={colors.foreground} />
                <Text style={styles.filtersToggleText}>Filtros</Text>
              </View>
              <Ionicons name={filtersVisible ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
            </Pressable>

            <Animated.View
              importantForAccessibility={filtersVisible ? 'auto' : 'no-hide-descendants'}
              pointerEvents={filtersVisible ? 'auto' : 'none'}
              style={[styles.filtersPanel, animatedFiltersStyle]}
            >
              <View style={styles.filters}>
                <Text style={styles.filterLabel}>Ordenar</Text>
                <View style={styles.chipRow}>
                  {SORT_OPTIONS.map((option) => {
                    const isSelected = sortOption === option.value;

                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        style={({ pressed }) => [
                          styles.filterChip,
                          isSelected && styles.filterChipActive,
                          pressed && styles.pressed,
                        ]}
                        onPress={() => {
                          clearError();
                          setSortOption(option.value);
                        }}
                      >
                        <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.filterLabel}>Disponibilidad</Text>
                <View style={styles.chipRow}>
                  {AVAILABILITY_OPTIONS.map((option) => {
                    const isSelected = availability === option.value;

                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        style={({ pressed }) => [
                          styles.filterChip,
                          isSelected && styles.filterChipActive,
                          pressed && styles.pressed,
                        ]}
                        onPress={() => {
                          clearError();
                          setAvailability(option.value);
                        }}
                      >
                        <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {categoryOptions.length ? (
                  <>
                    <Text style={styles.filterLabel}>Categoría</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChips}>
                      <Pressable
                        accessibilityRole="button"
                        style={({ pressed }) => [
                          styles.filterChip,
                          !selectedCategoryId && styles.filterChipActive,
                          pressed && styles.pressed,
                        ]}
                        onPress={() => {
                          clearError();
                          setSelectedCategoryId(undefined);
                        }}
                      >
                        <Text style={[styles.filterChipText, !selectedCategoryId && styles.filterChipTextActive]}>
                          Todas
                        </Text>
                      </Pressable>

                      {categoryOptions.map((category) => {
                        const isSelected = selectedCategoryId === category.id;

                        return (
                          <Pressable
                            key={category.id}
                            accessibilityRole="button"
                            style={({ pressed }) => [
                              styles.filterChip,
                              isSelected && styles.filterChipActive,
                              pressed && styles.pressed,
                            ]}
                            onPress={() => {
                              clearError();
                              setSelectedCategoryId(category.id);
                            }}
                          >
                            <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                              {category.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </>
                ) : null}

                {colorOptions.length ? (
                  <>
                    <Text style={styles.filterLabel}>Color</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChips}>
                      {colorOptions.map((color) => {
                        const isSelected = selectedColorIds.includes(color.id);

                        return (
                          <Pressable
                            key={color.id}
                            accessibilityRole="button"
                            accessibilityLabel={color.name}
                            accessibilityState={{ selected: isSelected }}
                            style={({ pressed }) => [
                              styles.colorSwatch,
                              { backgroundColor: color.hex },
                              isSelected && styles.colorSwatchSelected,
                              pressed && styles.pressed,
                            ]}
                            onPress={() => handleToggleColor(color.id)}
                          />
                        );
                      })}
                    </ScrollView>
                  </>
                ) : null}

                <Text style={styles.filterLabel}>Precio base</Text>
                <View style={styles.priceRow}>
                  <TextInput
                    value={minPrice}
                    onChangeText={setMinPrice}
                    placeholder="Min"
                    placeholderTextColor={colors.muted}
                    keyboardType="decimal-pad"
                    style={styles.priceInput}
                  />
                  <TextInput
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    placeholder="Max"
                    placeholderTextColor={colors.muted}
                    keyboardType="decimal-pad"
                    style={styles.priceInput}
                  />
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.applyButton, pressed && styles.pressed]}
                    onPress={handleApplyPriceFilters}
                  >
                    <Ionicons name="checkmark" size={18} color="#ffffff" />
                  </Pressable>
                </View>

                <Pressable accessibilityRole="button" onPress={handleClearFilters}>
                  <Text style={styles.clearSearch}>Limpiar filtros</Text>
                </Pressable>
              </View>
            </Animated.View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable accessibilityRole="button" onPress={loadProducts}>
                  <Text style={styles.retryText}>Reintentar</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={(
          isLoading ? (
            <CatalogLoadingState styles={styles} colors={colors} />
          ) : (
            <View style={styles.emptyState}>
              <Float>
                <Ionicons
                  name={selectedColorIds.length > 0 ? 'color-filter-outline' : 'grid-outline'}
                  size={64}
                  color={colors.border}
                />
              </Float>
              {selectedColorIds.length > 0 ? (
                <>
                  <Text style={styles.emptyTitle}>Sin resultados</Text>
                  <Text style={styles.emptyText}>Ningún producto tiene variantes en el color seleccionado.</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setSelectedColorIds([])}
                  >
                    <Text style={styles.clearSearch}>Limpiar filtro de color</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.emptyTitle}>No hay productos</Text>
                  <Text style={styles.emptyText}>Cuando el backend tenga productos activos van a aparecer aca.</Text>
                </>
              )}
            </View>
          )
        )}
      />
    </SafeAreaView>
  );
}

function CatalogLoadingState({
  styles,
  colors,
}: {
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  return (
    <View style={styles.loadingState}>
      <View style={styles.loadingStateHeader}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingStateText}>Cargando productos</Text>
      </View>
      <View style={styles.skeletonGrid}>
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <View key={index} style={styles.skeletonCard}>
            <Shimmer style={styles.skeletonImage} borderRadius={0} />
            <View style={styles.skeletonBody}>
              <Shimmer style={styles.skeletonLineSmall} />
              <Shimmer style={styles.skeletonLineLarge} />
              <Shimmer style={styles.skeletonLineMedium} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProductCard({
  product,
  inWishlist,
  onToggleWishlist,
  onOpen,
  styles,
  colors,
}: {
  product: Product;
  inWishlist: boolean;
  onToggleWishlist: (product: Product) => void;
  onOpen: (product: Product) => void;
  styles: ReturnType<typeof createStyles>;
  colors: typeof Colors.light | typeof Colors.dark;
}) {
  const image = product.images[0];
  const category = product.category?.name;
  const hasVariants = product.variants.length > 0;

  return (
    <View style={styles.productCard}>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => pressed && styles.pressed}
        onPress={() => onOpen(product)}
      >
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

          {hasVariants ? (
            <Pressable
              accessibilityRole="button"
              style={styles.heartButton}
              onPress={() => onToggleWishlist(product)}
              hitSlop={8}
            >
              <Ionicons
                name={inWishlist ? 'heart' : 'heart-outline'}
                size={20}
                color={inWishlist ? colors.accent : '#ffffff'}
              />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.cardBody}>
          {category ? <Text style={styles.category}>{category}</Text> : null}
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <Text style={styles.stock}>{product.stock > 0 ? `${product.stock} en stock` : 'Consultar stock'}</Text>
        </View>
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
    filtersToggle: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      backgroundColor: colors.background,
    },
    filtersToggleContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    filtersToggleText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    filtersPanel: {
      overflow: 'hidden',
    },
    filters: {
      gap: Spacing.two,
      paddingTop: Spacing.one,
    },
    filterLabel: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    horizontalChips: {
      gap: Spacing.two,
      paddingRight: Spacing.three,
    },
    filterChip: {
      minHeight: 36,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      backgroundColor: colors.background,
    },
    filterChipActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    filterChipText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    filterChipTextActive: {
      color: '#ffffff',
    },
    colorSwatch: {
      width: 32,
      height: 32,
      borderRadius: Radius.sm,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorSwatchSelected: {
      borderColor: colors.accent,
      borderWidth: 3,
    },
    priceRow: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
    priceInput: {
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
    applyButton: {
      width: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.sm,
      backgroundColor: colors.accent,
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
    productCardWrapper: {
      flex: 1,
      maxWidth: '49%',
    },
    productCard: {
      flex: 1,
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
    heartButton: {
      position: 'absolute',
      top: Spacing.two,
      right: Spacing.two,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
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
    loadingMore: {
      paddingVertical: Spacing.four,
      alignItems: 'center',
    },
    loadingState: {
      gap: Spacing.three,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.four,
    },
    loadingStateHeader: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
    },
    loadingStateText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.muted,
    },
    skeletonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    skeletonCard: {
      width: '48.5%',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      backgroundColor: colors.background,
    },
    skeletonImage: {
      aspectRatio: 0.82,
      backgroundColor: colors.backgroundElement,
    },
    skeletonBody: {
      minHeight: 112,
      gap: Spacing.two,
      padding: Spacing.two,
    },
    skeletonLineSmall: {
      width: '44%',
      height: 10,
      borderRadius: Radius.sm,
      backgroundColor: colors.backgroundElement,
    },
    skeletonLineLarge: {
      width: '86%',
      height: 16,
      borderRadius: Radius.sm,
      backgroundColor: colors.backgroundElement,
    },
    skeletonLineMedium: {
      width: '60%',
      height: 12,
      borderRadius: Radius.sm,
      backgroundColor: colors.backgroundElement,
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
