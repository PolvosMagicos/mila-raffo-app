import type { Wishlist } from '../entities/wishlist.entity';

export interface WishlistRepository {
  getWishlist(): Promise<Wishlist>;
  addItem(variantId: string): Promise<Wishlist>;
  removeItem(itemId: string): Promise<void>;
}
