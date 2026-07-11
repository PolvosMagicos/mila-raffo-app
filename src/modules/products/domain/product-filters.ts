import type { Product } from './entities/product.entity';
import type { ProductsFilters } from './repositories/products.repository';

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function hasAvailableVariant(product: Product): boolean {
  return product.variants.some((variant) => variant.isAvailable && variant.stock > 0);
}

export function productMatchesSearch(product: Product, term?: string): boolean {
  const query = normalizeText(term ?? '');
  if (!query) return true;

  const searchableText = normalizeText(
    [
      product.name,
      product.description,
      product.category?.name,
      ...product.categories.map((category) => category.name),
      ...product.characteristics.map((characteristic) => characteristic.value),
    ]
      .filter(Boolean)
      .join(' '),
  );

  return searchableText.includes(query);
}

export function filterProducts(products: Product[], filters: ProductsFilters = {}): Product[] {
  const searchTerm = filters.search ?? filters.q ?? filters.name;
  return products.filter((product) => {
    if (filters.available === true && (!product.isActive || !hasAvailableVariant(product))) return false;
    if (filters.categoryId && !product.categories.some((category) => category.id === filters.categoryId)) return false;
    if (filters.minBasePrice !== undefined && product.price < filters.minBasePrice) return false;
    if (filters.maxBasePrice !== undefined && product.price > filters.maxBasePrice) return false;
    if (filters.colorIds?.length && !product.variants.some((variant) => variant.color && filters.colorIds?.includes(variant.color.id))) {
      return false;
    }
    return productMatchesSearch(product, searchTerm);
  });
}

export function sortProducts(products: Product[], filters: ProductsFilters = {}): Product[] {
  const sorted = [...products];
  const direction = filters.sortOrder === 'DESC' ? -1 : 1;

  if (filters.sortBy === 'basePrice') {
    return sorted.sort((a, b) => (a.price - b.price) * direction);
  }
  if (filters.sortBy === 'name') {
    return sorted.sort((a, b) => a.name.localeCompare(b.name, 'es') * direction);
  }
  return sorted;
}

export function paginateProducts<T>(items: T[], limit = 12, offset = 0): T[] {
  return items.slice(offset, offset + limit);
}
