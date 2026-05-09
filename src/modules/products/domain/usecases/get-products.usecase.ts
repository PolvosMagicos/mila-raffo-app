import type { ProductsRepository, ProductsFilters, PaginatedProducts } from '../repositories/products.repository';

export class GetProductsUseCase {
  constructor(private readonly repository: ProductsRepository) {}

  execute(filters?: ProductsFilters): Promise<PaginatedProducts> {
    return this.repository.getAll(filters);
  }
}
