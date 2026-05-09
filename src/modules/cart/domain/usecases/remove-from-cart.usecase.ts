import type { CartRepository } from '../repositories/cart.repository';
import type { Cart } from '../entities/cart.entity';

export class RemoveFromCartUseCase {
  constructor(private readonly repository: CartRepository) {}

  execute(productId: string): Promise<Cart> {
    return this.repository.removeItem(productId);
  }
}
