import type { CartRepository } from '../../domain/repositories/cart.repository';
import type { Cart } from '../../domain/entities/cart.entity';
import type { CartLocalDataSource } from '../datasources/cart.local.datasource';
import type { Product } from '@/modules/products/domain/entities/product.entity';

function recalculate(items: Cart['items']): Cart {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  return { items, subtotal, total: subtotal };
}

export class CartRepositoryImpl implements CartRepository {
  constructor(private readonly local: CartLocalDataSource) {}

  getCart(): Promise<Cart> {
    return this.local.getCart();
  }

  async addItem(productId: string, quantity: number): Promise<Cart> {
    const cart = await this.local.getCart();
    const existing = cart.items.find((i) => i.product.id === productId);

    let updatedItems: Cart['items'];
    if (existing) {
      updatedItems = cart.items.map((i) =>
        i.product.id === productId ? { ...i, quantity: i.quantity + quantity } : i,
      );
    } else {
      // Product must be provided by caller with full data; handled in store layer
      updatedItems = cart.items;
    }

    const updated = recalculate(updatedItems);
    await this.local.saveCart(updated);
    return updated;
  }

  async updateItem(productId: string, quantity: number): Promise<Cart> {
    const cart = await this.local.getCart();
    const updatedItems = quantity === 0
      ? cart.items.filter((i) => i.product.id !== productId)
      : cart.items.map((i) => i.product.id === productId ? { ...i, quantity } : i);

    const updated = recalculate(updatedItems);
    await this.local.saveCart(updated);
    return updated;
  }

  async removeItem(productId: string): Promise<Cart> {
    const cart = await this.local.getCart();
    const updatedItems = cart.items.filter((i) => i.product.id !== productId);
    const updated = recalculate(updatedItems);
    await this.local.saveCart(updated);
    return updated;
  }

  async clearCart(): Promise<void> {
    await this.local.clearCart();
  }
}
