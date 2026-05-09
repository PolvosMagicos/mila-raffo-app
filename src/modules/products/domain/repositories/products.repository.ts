import type { Product } from '../entities/product.entity';

export interface ProductsFilters {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductsRepository {
  getAll(filters?: ProductsFilters): Promise<PaginatedProducts>;
  getById(id: string): Promise<Product>;
  getBySlug(slug: string): Promise<Product>;
}
