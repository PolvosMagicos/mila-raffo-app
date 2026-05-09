import type { ProductsRepository, ProductsFilters, PaginatedProducts } from '../../domain/repositories/products.repository';
import type { Product } from '../../domain/entities/product.entity';
import type { ProductsRemoteDataSource } from '../datasources/products.remote.datasource';
import { mapPaginatedProductsResponse, mapProductResponse } from '../models/product-response.model';

export class ProductsRepositoryImpl implements ProductsRepository {
  constructor(private readonly remote: ProductsRemoteDataSource) {}

  async getAll(filters?: ProductsFilters): Promise<PaginatedProducts> {
    const { data } = await this.remote.getAll(filters);
    return mapPaginatedProductsResponse(data);
  }

  async getById(id: string): Promise<Product> {
    const { data } = await this.remote.getById(id);
    return mapProductResponse(data);
  }

  async getBySlug(slug: string): Promise<Product> {
    const { data } = await this.remote.getBySlug(slug);
    return mapProductResponse(data);
  }
}
