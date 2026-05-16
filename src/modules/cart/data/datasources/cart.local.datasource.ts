import type { Cart } from '../../domain/entities/cart.entity';

const EMPTY_CART: Cart = { items: [], total: 0, itemCount: 0 };

export class CartLocalDataSource {
  async getCart(): Promise<Cart> {
    return EMPTY_CART;
  }

  async saveCart(_cart: Cart): Promise<void> {}

  async clearCart(): Promise<void> {}
}
