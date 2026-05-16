import type { WishlistRepository } from '../repositories/wishlist.repository';

export class RemoveFromWishlistUseCase {
  constructor(private readonly repository: WishlistRepository) {}

  execute(itemId: string): Promise<void> {
    return this.repository.removeItem(itemId);
  }
}
