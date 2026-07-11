import type { Cart, CartApiItem } from '../../../domain/entities/cart.entity';
import { buildCart, calculateLineSubtotal } from '../../../domain/cart-calculations';
import { CartRepositoryImpl } from '../../repositories/cart.repository.impl';

class InMemoryCartApi {
  private rows: CartApiItem[] = [];

  async getCart(): Promise<Cart> {
    return buildCart(this.rows);
  }

  async addItem(variantId: string, quantity: number): Promise<Cart> {
    const existing = this.rows.find((item) => item.variantId === variantId);
    if (existing) {
      existing.quantity += quantity;
      existing.subtotal = calculateLineSubtotal(existing.unitPrice, existing.quantity);
    } else {
      this.rows.push({
        id: `item-${this.rows.length + 1}`,
        productId: `product-${variantId}`,
        variantId,
        productName: `Product ${variantId}`,
        colorName: null,
        colorHex: null,
        quantity,
        unitPrice: variantId === 'v-premium' ? 150 : 80,
        subtotal: calculateLineSubtotal(variantId === 'v-premium' ? 150 : 80, quantity),
        imageUrl: null,
        stockAvailable: 10,
      });
    }
    return this.getCart();
  }

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    const item = this.rows.find((row) => row.id === itemId);
    if (!item) throw new Error('Item no encontrado');
    item.quantity = quantity;
    item.subtotal = calculateLineSubtotal(item.unitPrice, quantity);
    return this.getCart();
  }

  async removeItem(itemId: string): Promise<void> {
    this.rows = this.rows.filter((item) => item.id !== itemId);
  }

  async clearCart(): Promise<void> {
    this.rows = [];
  }
}

describe('cart repository complete flow integration suite', () => {
  it('IC-CART-01 completes add update remove and clear flow through repository and data source', async () => {
    const repository = new CartRepositoryImpl(new InMemoryCartApi());

    await expect(repository.getCart()).resolves.toEqual({ items: [], total: 0, itemCount: 0 });
    await expect(repository.addItem('v-basic', 2)).resolves.toMatchObject({ total: 160, itemCount: 2 });
    await expect(repository.addItem('v-premium', 1)).resolves.toMatchObject({ total: 310, itemCount: 3 });
    await expect(repository.updateItem('item-1', 3)).resolves.toMatchObject({ total: 390, itemCount: 4 });
    await repository.removeItem('item-2');
    await expect(repository.getCart()).resolves.toMatchObject({ total: 240, itemCount: 3 });
    await repository.clearCart();
    await expect(repository.getCart()).resolves.toEqual({ items: [], total: 0, itemCount: 0 });
  });

  it('IC-CART-02 merges repeated variant additions in the data source flow', async () => {
    const repository = new CartRepositoryImpl(new InMemoryCartApi());

    await repository.addItem('v-basic', 1);
    const cart = await repository.addItem('v-basic', 2);

    expect(cart.items).toHaveLength(1);
    expect(cart).toMatchObject({ total: 240, itemCount: 3 });
  });

  it('IC-CART-03 propagates deterministic update errors from the data source', async () => {
    const repository = new CartRepositoryImpl(new InMemoryCartApi());

    await expect(repository.updateItem('missing', 1)).rejects.toThrow('Item no encontrado');
  });
});
