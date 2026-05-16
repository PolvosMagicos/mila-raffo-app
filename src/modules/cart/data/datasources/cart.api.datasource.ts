import { apiClient } from '@/modules/auth';
import type { Cart } from '../../domain/entities/cart.entity';

export class CartApiDataSource {
  async getCart(): Promise<Cart> {
    const { data } = await apiClient.get<Cart>('/cart');
    return data;
  }

  async addItem(variantId: string, quantity: number): Promise<Cart> {
    const { data } = await apiClient.post<Cart>('/cart/items', { variantId, quantity });
    return data;
  }

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    const { data } = await apiClient.patch<Cart>(`/cart/items/${itemId}`, { quantity });
    return data;
  }

  async removeItem(itemId: string): Promise<void> {
    await apiClient.delete(`/cart/items/${itemId}`);
  }

  async clearCart(): Promise<void> {
    await apiClient.delete('/cart');
  }
}
