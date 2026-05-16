import type { WishlistRepository } from '../../domain/repositories/wishlist.repository';
import type { Wishlist } from '../../domain/entities/wishlist.entity';
import type { WishlistApiDataSource } from '../datasources/wishlist.api.datasource';

export class WishlistRepositoryImpl implements WishlistRepository {
  constructor(private readonly api: WishlistApiDataSource) {}

  getWishlist(): Promise<Wishlist> {
    return this.api.getWishlist();
  }

  addItem(variantId: string): Promise<Wishlist> {
    return this.api.addItem(variantId);
  }

  removeItem(itemId: string): Promise<void> {
    return this.api.removeItem(itemId);
  }
}
