import type { WishlistRepository } from '../repositories/wishlist.repository';
import type { Wishlist } from '../entities/wishlist.entity';

export class AddToWishlistUseCase {
  constructor(private readonly repository: WishlistRepository) {}

  execute(variantId: string): Promise<Wishlist> {
    return this.repository.addItem(variantId);
  }
}
