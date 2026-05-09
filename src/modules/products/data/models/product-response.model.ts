import type { Product, ProductCategory, ProductImage, ProductVariant } from '../../domain/entities/product.entity';
import type { PaginatedProducts } from '../../domain/repositories/products.repository';

interface ProductImageResponse {
  url: string;
  alt?: string;
}

interface ProductCategoryResponse {
  id?: string;
  name?: string;
  slug?: string;
}

interface ProductVariantResponse {
  id: string;
  sku: string;
  price?: number | string;
  stock?: number;
  isAvailable?: boolean;
  image?: ProductImageResponse | null;
}

export interface ProductResponse {
  id: string;
  name: string;
  description?: string | null;
  basePrice?: number | string;
  available?: boolean;
  isCustomizable?: boolean;
  image?: ProductImageResponse | null;
  categories?: ProductCategoryResponse[];
  variants?: ProductVariantResponse[];
}

export interface PaginatedProductsResponse {
  data: ProductResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

function toNumber(value: number | string | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
}

function mapImage(image: ProductImageResponse | null | undefined, fallbackId: string): ProductImage | null {
  if (!image?.url) return null;
  return {
    id: fallbackId,
    url: image.url,
    alt: image.alt,
  };
}

function mapVariant(variant: ProductVariantResponse): ProductVariant {
  const image = mapImage(variant.image, variant.id);

  return {
    id: variant.id,
    sku: variant.sku,
    price: toNumber(variant.price),
    stock: variant.stock ?? 0,
    isAvailable: variant.isAvailable ?? false,
    image,
  };
}

function mapCategory(category: ProductCategoryResponse): ProductCategory | null {
  if (!category.id || !category.name || !category.slug) return null;
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
  };
}

export function mapProductResponse(response: ProductResponse): Product {
  const variants = (response.variants ?? []).map(mapVariant);
  const primaryImage = mapImage(response.image, response.id);
  const variantImages = variants.flatMap((variant) => (variant.image ? [variant.image] : []));
  const images = primaryImage ? [primaryImage, ...variantImages] : variantImages;
  const categories = (response.categories ?? []).map(mapCategory).filter((category): category is ProductCategory => Boolean(category));
  const stock = variants.reduce((total, variant) => total + variant.stock, 0);
  const price = toNumber(response.basePrice) || variants.find((variant) => variant.price > 0)?.price || 0;

  return {
    id: response.id,
    name: response.name,
    description: response.description ?? '',
    price,
    images,
    categories,
    category: categories[0] ?? null,
    stock,
    isActive: response.available ?? true,
    slug: response.id,
    isCustomizable: response.isCustomizable ?? false,
    variants,
  };
}

export function mapPaginatedProductsResponse(response: PaginatedProductsResponse): PaginatedProducts {
  return {
    data: response.data.map(mapProductResponse),
    total: response.pagination.total,
    page: Math.floor(response.pagination.offset / response.pagination.limit) + 1,
    limit: response.pagination.limit,
  };
}
