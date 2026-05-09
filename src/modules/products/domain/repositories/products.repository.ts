import type { Product } from '../entities/product.entity';

export interface ProductsFilters {
  categoryId?: string;
  search?: string;
  page?: number;
  offset?: number;
  limit?: number;
  available?: boolean;
  sortBy?: 'name' | 'basePrice' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
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
