import type { CartRepository } from '../repositories/cart.repository';
import type { Cart } from '../entities/cart.entity';

export class AddToCartUseCase {
  constructor(private readonly repository: CartRepository) {}

  execute(variantId: string, quantity: number): Promise<Cart> {
    return this.repository.addItem(variantId, quantity);
  }
}
