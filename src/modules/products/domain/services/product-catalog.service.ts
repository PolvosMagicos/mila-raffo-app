import type { Product } from '../entities/product.entity';
import type { PaginatedProducts, ProductsFilters, ProductsRepository } from '../repositories/products.repository';
import { filterProducts, paginateProducts, sortProducts } from '../product-filters';

export class ProductCatalogService {
  constructor(
    private readonly primaryRepository: ProductsRepository,
    private readonly fallbackProducts: Product[] = [],
  ) {}

  async getProducts(filters: ProductsFilters = {}): Promise<PaginatedProducts> {
    try {
      return await this.primaryRepository.getAll(filters);
    } catch {
      const filtered = sortProducts(filterProducts(this.fallbackProducts, filters), filters);
      const limit = filters.limit ?? 12;
      const offset = filters.offset ?? 0;
      return {
        data: paginateProducts(filtered, limit, offset),
        total: filtered.length,
        page: Math.floor(offset / limit) + 1,
        limit,
      };
    }
  }

  async getProductDetail(id: string): Promise<Product> {
    try {
      return await this.primaryRepository.getById(id);
    } catch {
      const product = this.fallbackProducts.find((item) => item.id === id || item.slug === id);
      if (!product) {
        throw new Error('Producto no disponible.');
      }
      return product;
    }
  }
}
