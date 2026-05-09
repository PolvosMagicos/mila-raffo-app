import type { AxiosInstance } from 'axios';
import type { PaginatedProducts, ProductsFilters } from '../../domain/repositories/products.repository';
import type { Product } from '../../domain/entities/product.entity';

export class ProductsRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  getAll(filters?: ProductsFilters): Promise<{ data: PaginatedProducts }> {
    return this.http.get('/products', { params: filters });
  }

  getById(id: string): Promise<{ data: Product }> {
    return this.http.get(`/products/${id}`);
  }

  getBySlug(slug: string): Promise<{ data: Product }> {
    return this.http.get(`/products/slug/${slug}`);
  }
}
