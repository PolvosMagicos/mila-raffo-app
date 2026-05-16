import type { CartRepository } from '../../domain/repositories/cart.repository';
import type { Cart } from '../../domain/entities/cart.entity';
import type { CartApiDataSource } from '../datasources/cart.api.datasource';

export class CartRepositoryImpl implements CartRepository {
  constructor(private readonly api: CartApiDataSource) {}

  getCart(): Promise<Cart> {
    return this.api.getCart();
  }

  addItem(variantId: string, quantity: number): Promise<Cart> {
    return this.api.addItem(variantId, quantity);
  }

  updateItem(itemId: string, quantity: number): Promise<Cart> {
    return this.api.updateItem(itemId, quantity);
  }

  async removeItem(itemId: string): Promise<void> {
    return this.api.removeItem(itemId);
  }

  clearCart(): Promise<void> {
    return this.api.clearCart();
  }
}
