import { secureStorage } from '@/core/storage/secure-storage';
import type { Cart, CartItem } from '../../domain/entities/cart.entity';

const KEY = 'cart.data';

const EMPTY_CART: Cart = { items: [], subtotal: 0, total: 0 };

function recalculate(items: CartItem[]): Cart {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  return { items, subtotal, total: subtotal };
}

export class CartLocalDataSource {
  async getCart(): Promise<Cart> {
    const raw = await secureStorage.get(KEY);
    if (!raw) return EMPTY_CART;
    try {
      return JSON.parse(raw) as Cart;
    } catch {
      return EMPTY_CART;
    }
  }

  async saveCart(cart: Cart): Promise<void> {
    await secureStorage.set(KEY, JSON.stringify(cart));
  }

  async clearCart(): Promise<void> {
    await secureStorage.delete(KEY);
  }
}
