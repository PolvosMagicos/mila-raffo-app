import type { Cart, CartItem } from '../entities/cart.entity';

export interface CartRepository {
  getCart(): Promise<Cart>;
  addItem(productId: string, quantity: number): Promise<Cart>;
  updateItem(productId: string, quantity: number): Promise<Cart>;
  removeItem(productId: string): Promise<Cart>;
  clearCart(): Promise<void>;
}
