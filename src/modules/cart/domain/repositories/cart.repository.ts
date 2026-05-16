import type { Cart } from '../entities/cart.entity';

export interface CartRepository {
  getCart(): Promise<Cart>;
  addItem(variantId: string, quantity: number): Promise<Cart>;
  updateItem(itemId: string, quantity: number): Promise<Cart>;
  removeItem(itemId: string): Promise<void>;
  clearCart(): Promise<void>;
}
