import type { WishlistRepository } from '../repositories/wishlist.repository';
import type { Wishlist } from '../entities/wishlist.entity';

export class GetWishlistUseCase {
  constructor(private readonly repository: WishlistRepository) {}

  execute(): Promise<Wishlist> {
    return this.repository.getWishlist();
  }
}
