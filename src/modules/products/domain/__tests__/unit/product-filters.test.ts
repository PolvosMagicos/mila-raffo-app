import type { Product } from '../../entities/product.entity';
import { filterProducts, hasAvailableVariant, paginateProducts, productMatchesSearch, sortProducts } from '../../product-filters';

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 'p-1',
  name: 'Vestido Lino',
  description: 'Pieza de verano hecha a mano',
  price: 120,
  images: [],
  categories: [{ id: 'cat-dresses', name: 'Vestidos', slug: 'vestidos' }],
  category: { id: 'cat-dresses', name: 'Vestidos', slug: 'vestidos' },
  stock: 4,
  isActive: true,
  slug: 'vestido-lino',
  isCustomizable: false,
  characteristics: [{ id: 'ch-1', name: 'Material', dataType: 'text', value: 'Lino' }],
  variants: [
    {
      id: 'v-1',
      sku: 'LIN-S',
      price: 120,
      stock: 4,
      isAvailable: true,
      image: null,
      color: { id: 'color-cream', name: 'Crema', hex: '#eee2ca' },
    },
  ],
  ...overrides,
});

describe('product filters unit suite', () => {
  const catalog = [
    product(),
    product({
      id: 'p-2',
      name: 'Blusa Seda',
      price: 90,
      categories: [{ id: 'cat-blouses', name: 'Blusas', slug: 'blusas' }],
      category: { id: 'cat-blouses', name: 'Blusas', slug: 'blusas' },
      variants: [{ id: 'v-2', sku: 'SED-M', price: 90, stock: 0, isAvailable: true, image: null }],
    }),
    product({
      id: 'p-3',
      name: 'Pantalon Urbano',
      price: 150,
      isActive: false,
      variants: [{ id: 'v-3', sku: 'URB-M', price: 150, stock: 5, isAvailable: true, image: null }],
    }),
  ];

  it('UC-PROD-01 matches search by product name without accents or case sensitivity', () => {
    expect(productMatchesSearch(product({ name: 'Pantalón Ámbar' }), 'pantalon ambar')).toBe(true);
  });

  it('UC-PROD-02 matches search by description', () => {
    expect(productMatchesSearch(product(), 'verano')).toBe(true);
  });

  it('UC-PROD-03 matches search by characteristic value', () => {
    expect(productMatchesSearch(product(), 'lino')).toBe(true);
  });

  it('UC-PROD-04 treats empty search as a match', () => {
    expect(productMatchesSearch(product(), '   ')).toBe(true);
  });

  it('UC-PROD-05 filters by category id', () => {
    expect(filterProducts(catalog, { categoryId: 'cat-blouses' }).map((item) => item.id)).toEqual(['p-2']);
  });

  it('UC-PROD-06 filters by price range boundaries inclusively', () => {
    expect(filterProducts(catalog, { minBasePrice: 100, maxBasePrice: 150 }).map((item) => item.id)).toEqual(['p-1', 'p-3']);
  });

  it('UC-PROD-07 filters by variant color ids', () => {
    expect(filterProducts(catalog, { colorIds: ['color-cream'] }).map((item) => item.id)).toEqual(['p-1']);
  });

  it('UC-PROD-08 available filter requires active product and stocked variant', () => {
    expect(filterProducts(catalog, { available: true }).map((item) => item.id)).toEqual(['p-1']);
  });

  it('UC-PROD-09 detects available variants only when stock is positive', () => {
    expect(hasAvailableVariant(catalog[1])).toBe(false);
  });

  it('UC-PROD-10 sorts products by ascending price', () => {
    expect(sortProducts(catalog, { sortBy: 'basePrice', sortOrder: 'ASC' }).map((item) => item.id)).toEqual(['p-2', 'p-1', 'p-3']);
  });

  it('UC-PROD-11 sorts products by descending name', () => {
    expect(sortProducts(catalog, { sortBy: 'name', sortOrder: 'DESC' }).map((item) => item.id)).toEqual(['p-1', 'p-3', 'p-2']);
  });

  it('UC-PROD-12 paginates using limit and offset', () => {
    expect(paginateProducts(catalog, 1, 1).map((item) => item.id)).toEqual(['p-2']);
  });
});
