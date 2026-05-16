import { apiClient } from '@/modules/auth';
import type { Wishlist } from '../../domain/entities/wishlist.entity';

export class WishlistApiDataSource {
  async getWishlist(): Promise<Wishlist> {
    const { data } = await apiClient.get<Wishlist>('/wishlist');
    return data;
  }

  async addItem(variantId: string): Promise<Wishlist> {
    const { data } = await apiClient.post<Wishlist>('/wishlist/items', { variantId });
    return data;
  }

  async removeItem(itemId: string): Promise<void> {
    await apiClient.delete(`/wishlist/items/${itemId}`);
  }
}
