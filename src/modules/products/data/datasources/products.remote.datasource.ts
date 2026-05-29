import type { AxiosInstance } from 'axios';
import type { ProductsFilters } from '../../domain/repositories/products.repository';
import type { PaginatedProductsResponse, ProductResponse } from '../models/product-response.model';

export class ProductsRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  getAll(filters?: ProductsFilters): Promise<{ data: PaginatedProductsResponse }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 12;
    const offset = filters?.offset ?? (page - 1) * limit;
    const q = filters?.q ?? filters?.search;

    return this.http.get('/products', {
      params: {
        limit,
        offset,
        q,
        name: filters?.name,
        categoryId: filters?.categoryId,
        available: filters?.available === undefined ? undefined : String(filters.available),
        minBasePrice: filters?.minBasePrice,
        maxBasePrice: filters?.maxBasePrice,
        sortBy: filters?.sortBy,
        sortOrder: filters?.sortOrder,
      },
    });
  }

  getById(id: string): Promise<{ data: ProductResponse }> {
    return this.http.get(`/products/${id}`);
  }

  getBySlug(slug: string): Promise<{ data: ProductResponse }> {
    return this.http.get(`/products/${slug}`);
  }
}
