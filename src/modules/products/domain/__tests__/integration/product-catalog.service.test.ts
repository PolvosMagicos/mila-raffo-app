import type { Product } from '../../entities/product.entity';
import type { ProductsRepository } from '../../repositories/products.repository';
import { ProductCatalogService } from '../../services/product-catalog.service';

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 'p-1',
  name: 'Vestido Lino',
  description: 'Lino premium',
  price: 120,
  images: [],
  categories: [{ id: 'cat-dresses', name: 'Vestidos', slug: 'vestidos' }],
  category: { id: 'cat-dresses', name: 'Vestidos', slug: 'vestidos' },
  stock: 4,
  isActive: true,
  slug: 'vestido-lino',
  isCustomizable: false,
  characteristics: [],
  variants: [{ id: 'v-1', sku: 'SKU-1', price: 120, stock: 4, isAvailable: true, image: null }],
  ...overrides,
});

const repository = (overrides: Partial<jest.Mocked<ProductsRepository>> = {}): jest.Mocked<ProductsRepository> => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  getBySlug: jest.fn(),
  ...overrides,
});

describe('product catalog service integration suite', () => {
  it('IC-PROD-01 returns primary repository results when service is available', async () => {
    const repo = repository({
      getAll: jest.fn().mockResolvedValue({ data: [product()], total: 1, page: 1, limit: 12 }),
    });
    await expect(new ProductCatalogService(repo, []).getProducts({ limit: 12 })).resolves.toMatchObject({ total: 1 });
    expect(repo.getAll).toHaveBeenCalledWith({ limit: 12 });
  });

  it('IC-PROD-02 falls back to local products when primary list fails', async () => {
    const repo = repository({ getAll: jest.fn().mockRejectedValue(new Error('offline')) });
    const service = new ProductCatalogService(repo, [
      product(),
      product({ id: 'p-2', name: 'Blusa Seda', price: 90 }),
      product({ id: 'p-3', name: 'Pantalon Urbano', price: 150, isActive: false }),
    ]);

    await expect(service.getProducts({ search: 'blusa', available: true })).resolves.toMatchObject({
      data: [expect.objectContaining({ id: 'p-2' })],
      total: 1,
      page: 1,
      limit: 12,
    });
  });

  it('IC-PROD-03 applies fallback sorting and pagination together', async () => {
    const repo = repository({ getAll: jest.fn().mockRejectedValue(new Error('offline')) });
    const service = new ProductCatalogService(repo, [
      product({ id: 'p-1', price: 120 }),
      product({ id: 'p-2', price: 90 }),
      product({ id: 'p-3', price: 150 }),
    ]);

    await expect(service.getProducts({ sortBy: 'basePrice', sortOrder: 'ASC', limit: 1, offset: 1 })).resolves.toMatchObject({
      data: [expect.objectContaining({ id: 'p-1' })],
      total: 3,
      page: 2,
      limit: 1,
    });
  });

  it('IC-PROD-04 returns primary detail before consulting fallback', async () => {
    const repo = repository({ getById: jest.fn().mockResolvedValue(product({ id: 'remote' })) });
    await expect(new ProductCatalogService(repo, [product({ id: 'local' })]).getProductDetail('remote')).resolves.toMatchObject({
      id: 'remote',
    });
  });

  it('IC-PROD-05 falls back to product detail by id or slug', async () => {
    const repo = repository({ getById: jest.fn().mockRejectedValue(new Error('offline')) });
    await expect(new ProductCatalogService(repo, [product({ id: 'local', slug: 'fallback-slug' })]).getProductDetail('fallback-slug')).resolves.toMatchObject({
      id: 'local',
    });
  });

  it('IC-PROD-06 surfaces a deterministic error when no fallback detail exists', async () => {
    const repo = repository({ getById: jest.fn().mockRejectedValue(new Error('offline')) });
    await expect(new ProductCatalogService(repo, []).getProductDetail('missing')).rejects.toThrow('Producto no disponible.');
  });
});
