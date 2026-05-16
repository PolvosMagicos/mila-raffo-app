import type { CartRepository } from '../repositories/cart.repository';

export class RemoveFromCartUseCase {
  constructor(private readonly repository: CartRepository) {}

  execute(itemId: string): Promise<void> {
    return this.repository.removeItem(itemId);
  }
}
