import type { ProductsRepository } from '../repositories/products.repository';
import type { Product } from '../entities/product.entity';

export class GetProductDetailUseCase {
  constructor(private readonly repository: ProductsRepository) {}

  execute(id: string): Promise<Product> {
    return this.repository.getById(id);
  }
}
