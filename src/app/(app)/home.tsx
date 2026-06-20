import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { Shimmer } from '@/components/ui/animations';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { useProductsStore, type Product, type ProductCategory } from '@/modules/products';

const FEATURED_LIMIT = 6;
const HOME_PRODUCTS_LIMIT = 48;
const FEATURED_SKELETON_COUNT = 4;
const HOME_BANNER_IMAGE = require('../../../assets/images/home-banner.jpeg');

const COLLECTIONS = [
  { label: 'Carteras', aliases: ['carteras', 'cartera'], icon: 'bag-handle-outline' },
  { label: 'Bolsos', aliases: ['bolsos', 'bolso'], icon: 'briefcase-outline' },
  { label: 'Billeteras', aliases: ['billeteras', 'billetera'], icon: 'wallet-outline' },
  { label: 'Accesorios', aliases: ['accesorios', 'accesorio'], icon: 'sparkles-outline' },
] as const;

const SERVICE_ITEMS = [
  { title: 'Hecho a mano', text: 'Piezas seleccionadas con acabados cuidados.', icon: 'cut-outline' },
  { title: 'Envíos nacionales', text: 'Despacho coordinado para todo el país.', icon: 'cube-outline' },
  { title: 'Compra segura', text: 'Tu carrito y pedidos se mantienen en tu cuenta.', icon: 'shield-checkmark-outline' },
] as const;

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

function getUniqueCategories(products: Product[], limit?: number): ProductCategory[] {
  const categories = new Map<string, ProductCategory>();

  products.forEach((product) => {
    product.categories.forEach((category) => categories.set(category.id, category));
    if (product.category) categories.set(product.category.id, product.category);
  });

  const uniqueCategories = Array.from(categories.values());

  return typeof limit === 'number' ? uniqueCategories.slice(0, limit) : uniqueCategories;
}

function normalizeCategoryToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function findCategoryByAliases(
  categories: ProductCategory[],
  aliases: readonly string[],
): ProductCategory | undefined {
  const normalizedAliases = aliases.map(normalizeCategoryToken);

  return categories.find((category) => {
    const normalizedName = normalizeCategoryToken(category.name);
    const normalizedSlug = normalizeCategoryToken(category.slug);

    return normalizedAliases.some((alias) =>
      normalizedName === alias || normalizedSlug === alias,
    );
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const products = useProductsStore((s) => s.homeItems);
  const total = useProductsStore((s) => s.homeTotal);
  const isLoading = useProductsStore((s) => s.isHomeLoading);
  const error = useProductsStore((s) => s.homeError);
  const fetchHomeProducts = useProductsStore((s) => s.fetchHomeProducts);
  const clearError = useProductsStore((s) => s.clearError);

  useEffect(() => {
    void fetchHomeProducts({
      available: true,
      limit: HOME_PRODUCTS_LIMIT,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
  }, [fetchHomeProducts]);

  const featuredProducts = useMemo(() => products.slice(0, FEATURED_LIMIT), [products]);
  const categories = useMemo(() => getUniqueCategories(products, 4), [products]);
  const availableCategories = useMemo(() => getUniqueCategories(products), [products]);

  const openCatalog = useCallback(() => {
    router.push('/catalog' as never);
  }, [router]);

  const openSearch = useCallback((query: string) => {
    router.push(`/catalog?q=${encodeURIComponent(query)}` as never);
  }, [router]);

  const openCategory = useCallback((category: ProductCategory) => {
    router.push(`/catalog?categoryId=${encodeURIComponent(category.id)}` as never);
  }, [router]);

  const openCollectionCategory = useCallback((aliases: readonly string[]) => {
    const category = findCategoryByAliases(availableCategories, aliases);

    if (category) {
      openCategory(category);
      return;
    }

    router.push(`/catalog?categorySlug=${encodeURIComponent(aliases[0])}` as never);
  }, [availableCategories, openCategory, router]);

  const openProduct = useCallback((product: Product) => {
    router.push(`/catalog/${product.id}` as never);
  }, [router]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.topBanner, pressed && styles.pressed]}
          onPress={openCatalog}
        >
          <Image
            source={HOME_BANNER_IMAGE}
            style={styles.topBannerImage}
            contentFit="cover"
            accessibilityLabel="Mila Raffo"
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
          onPress={openCatalog}
        >
          <View style={styles.heroBody}>
            <Text style={styles.eyebrow}>Nueva colección</Text>
            <Text style={styles.heroTitle}>Mila Raffo</Text>
            <Text style={styles.heroText}>
              Carteras, bolsos y accesorios de cuero para llevar todos los días.
            </Text>
            <View style={styles.heroAction}>
              <Text style={styles.heroActionText}>Ver catálogo</Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </View>
          </View>
        </Pressable>

        <View style={styles.quickGrid}>
          {COLLECTIONS.map((collection) => (
            <Pressable
              key={collection.label}
              accessibilityRole="button"
              style={({ pressed }) => [styles.quickButton, pressed && styles.pressed]}
              onPress={() => openCollectionCategory(collection.aliases)}
            >
              <Ionicons name={collection.icon} size={22} color={colors.accent} />
              <Text style={styles.quickText}>{collection.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recién llegados</Text>
            <Text style={styles.sectionSubtitle}>
              {total ? `${total} productos disponibles` : 'Piezas disponibles en el catálogo'}
            </Text>
          </View>
          <Pressable accessibilityRole="button" onPress={openCatalog}>
            <Text style={styles.linkText}>Ver todo</Text>
          </Pressable>
        </View>

        {isLoading && featuredProducts.length === 0 ? (
          <FeaturedProductsSkeleton styles={styles} />
        ) : error && featuredProducts.length === 0 ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>No pudimos cargar productos</Text>
            <Text style={styles.messageText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
              onPress={() => {
                clearError();
                void fetchHomeProducts({
                  available: true,
                  limit: HOME_PRODUCTS_LIMIT,
                  sortBy: 'createdAt',
                  sortOrder: 'DESC',
                });
              }}
            >
              <Text style={styles.outlineButtonText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : featuredProducts.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          >
            {featuredProducts.map((product) => (
              <FeaturedProductCard
                key={product.id}
                product={product}
                styles={styles}
                onPress={() => openProduct(product)}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>Catálogo en preparación</Text>
            <Text style={styles.messageText}>Cuando haya productos activos, aparecerán destacados acá.</Text>
          </View>
        )}

        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="gift-outline" size={22} color={colors.accent} />
          </View>
          <View style={styles.bannerCopy}>
            <Text style={styles.bannerTitle}>Regalos con identidad</Text>
            <Text style={styles.bannerText}>Elegí una pieza lista para usar o consultá opciones personalizables.</Text>
          </View>
          <Pressable accessibilityRole="button" style={styles.bannerAction} onPress={() => openSearch('personalizable')}>
            <Ionicons name="chevron-forward" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        {categories.length ? (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Explorar por categoría</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}
                  onPress={() => openCategory(category)}
                >
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.muted} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.serviceList}>
          {SERVICE_ITEMS.map((item) => (
            <View key={item.title} style={styles.serviceItem}>
              <View style={styles.serviceIcon}>
                <Ionicons name={item.icon} size={20} color={colors.accent} />
              </View>
              <View style={styles.serviceText}>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.serviceDescription}>{item.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeaturedProductsSkeleton({
  styles,
}: {
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.featuredList}
      accessibilityLabel="Cargando productos recientes"
    >
      {Array.from({ length: FEATURED_SKELETON_COUNT }, (_, index) => (
        <View key={index} style={styles.productCard}>
          <Shimmer style={styles.skeletonProductImage} borderRadius={0} />
          <View style={styles.skeletonProductBody}>
            <Shimmer style={styles.skeletonLineSmall} />
            <Shimmer style={styles.skeletonLineLarge} />
            <Shimmer style={styles.skeletonLineMedium} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function FeaturedProductCard({
  product,
  styles,
  onPress,
}: {
  product: Product;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
}) {
  const image = product.images[0]?.url ?? product.variants[0]?.image?.url;
  const category = product.category?.name ?? product.categories[0]?.name;

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.productCard, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.productImageFrame}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.productImage}
            contentFit="cover"
            accessibilityLabel={product.name}
          />
        ) : (
          <View style={styles.productPlaceholder}>
            <Text style={styles.productPlaceholderText}>MR</Text>
          </View>
        )}
      </View>
      <View style={styles.productBody}>
        {category ? <Text style={styles.productCategory} numberOfLines={1}>{category}</Text> : null}
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
      </View>
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
      paddingVertical: Spacing.four,
      gap: Spacing.three,
    },
    topBanner: {
      height: 160,
      overflow: 'hidden',
      borderRadius: Radius.md,
      backgroundColor: colors.backgroundElement,
    },
    topBannerImage: {
      width: '100%',
      height: '100%',
    },
    hero: {
      minHeight: 230,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      backgroundColor: colors.background,
    },
    heroBody: {
      flex: 1,
      justifyContent: 'center',
      gap: Spacing.two,
      padding: Spacing.four,
      backgroundColor: colors.background,
    },
    eyebrow: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.accent,
      textTransform: 'uppercase',
    },
    heroTitle: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['4xl'],
      lineHeight: FontSize['4xl'],
      color: colors.foreground,
    },
    heroText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.base,
      lineHeight: FontSize.base * 1.45,
      color: colors.muted,
    },
    heroAction: {
      alignSelf: 'flex-start',
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      backgroundColor: colors.accent,
    },
    heroActionText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: '#ffffff',
    },
    quickGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    quickButton: {
      width: '48%',
      minHeight: 74,
      gap: Spacing.two,
      justifyContent: 'center',
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      backgroundColor: colors.background,
    },
    quickText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: Spacing.three,
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
      color: colors.muted,
    },
    linkText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.accent,
    },
    messageBox: {
      gap: Spacing.two,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      padding: Spacing.three,
      backgroundColor: colors.backgroundElement,
    },
    messageTitle: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.xl,
      color: colors.foreground,
    },
    messageText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      lineHeight: FontSize.sm * 1.45,
      color: colors.muted,
    },
    outlineButton: {
      alignSelf: 'flex-start',
      minHeight: 40,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      backgroundColor: colors.background,
    },
    outlineButtonText: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    featuredList: {
      gap: Spacing.two,
      paddingRight: Spacing.three,
    },
    productCard: {
      width: 160,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      backgroundColor: colors.background,
    },
    productImageFrame: {
      aspectRatio: 0.82,
      backgroundColor: colors.backgroundElement,
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    productPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    productPlaceholderText: {
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize['2xl'],
      color: colors.muted,
    },
    productBody: {
      minHeight: 104,
      gap: Spacing.one,
      padding: Spacing.two,
    },
    productCategory: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.xs,
      color: colors.muted,
      textTransform: 'uppercase',
    },
    productName: {
      minHeight: 38,
      fontFamily: FontFamily.editorialBold,
      fontSize: FontSize.lg,
      lineHeight: FontSize.lg,
      color: colors.foreground,
    },
    productPrice: {
      fontFamily: FontFamily.accentBold,
      fontSize: FontSize.base,
      color: colors.accent,
    },
    skeletonProductImage: {
      aspectRatio: 0.82,
      backgroundColor: colors.backgroundElement,
    },
    skeletonProductBody: {
      minHeight: 104,
      gap: Spacing.two,
      padding: Spacing.two,
    },
    skeletonLineSmall: {
      width: '48%',
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
      width: '62%',
      height: 12,
      borderRadius: Radius.sm,
      backgroundColor: colors.backgroundElement,
    },
    banner: {
      minHeight: 96,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      padding: Spacing.three,
      backgroundColor: colors.backgroundElement,
    },
    bannerIcon: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.full,
      backgroundColor: colors.background,
    },
    bannerCopy: {
      flex: 1,
      gap: Spacing.one,
    },
    bannerTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    bannerText: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      lineHeight: FontSize.sm * 1.45,
      color: colors.muted,
    },
    bannerAction: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.full,
      backgroundColor: colors.background,
    },
    categoriesSection: {
      gap: Spacing.two,
    },
    categoriesGrid: {
      gap: Spacing.two,
    },
    categoryCard: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.three,
      backgroundColor: colors.background,
    },
    categoryName: {
      flex: 1,
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.base,
      color: colors.foreground,
    },
    serviceList: {
      gap: Spacing.two,
      paddingTop: Spacing.one,
    },
    serviceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      paddingVertical: Spacing.two,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    serviceIcon: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.full,
      backgroundColor: colors.backgroundElement,
    },
    serviceText: {
      flex: 1,
      gap: Spacing.one,
    },
    serviceTitle: {
      fontFamily: FontFamily.bodySemiBold,
      fontSize: FontSize.sm,
      color: colors.foreground,
    },
    serviceDescription: {
      fontFamily: FontFamily.body,
      fontSize: FontSize.sm,
      lineHeight: FontSize.sm * 1.35,
      color: colors.muted,
    },
    pressed: {
      opacity: 0.78,
    },
  });
}
