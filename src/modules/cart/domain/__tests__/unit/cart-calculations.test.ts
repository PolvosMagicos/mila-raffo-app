import type { CartApiItem } from '../../entities/cart.entity';
import {
  buildCart,
  calculateCartSummary,
  calculateLineSubtotal,
  canAddQuantity,
  normalizeQuantity,
} from '../../cart-calculations';

const item = (overrides: Partial<CartApiItem> = {}): CartApiItem => ({
  id: 'item-1',
  productId: 'product-1',
  variantId: 'variant-1',
  productName: 'Vestido Alana',
  colorName: 'Arena',
  colorHex: '#d9c3a5',
  quantity: 2,
  unitPrice: 80,
  subtotal: 160,
  imageUrl: null,
  stockAvailable: 6,
  ...overrides,
});

describe('cart calculations unit suite', () => {
  it('UC-CART-01 calculates a line subtotal with decimal precision', () => {
    expect(calculateLineSubtotal(39.9, 3)).toBe(119.7);
  });

  it('UC-CART-02 rejects negative prices', () => {
    expect(() => calculateLineSubtotal(-1, 1)).toThrow('precio unitario');
  });

  it('UC-CART-03 rejects negative quantities', () => {
    expect(() => calculateLineSubtotal(10, -1)).toThrow('cantidad');
  });

  it('UC-CART-04 totals cart subtotals and item counts', () => {
    expect(calculateCartSummary([item(), item({ id: 'item-2', quantity: 1, subtotal: 45 })])).toEqual({
      total: 205,
      itemCount: 3,
    });
  });

  it('UC-CART-05 derives missing subtotal from price and quantity', () => {
    expect(calculateCartSummary([item({ subtotal: 0, unitPrice: 12.5, quantity: 4 })])).toEqual({
      total: 50,
      itemCount: 4,
    });
  });

  it('UC-CART-06 normalizes fractional quantities down to whole units', () => {
    expect(normalizeQuantity(3.8, 10)).toBe(3);
  });

  it('UC-CART-07 normalizes invalid quantities to one', () => {
    expect(normalizeQuantity(Number.NaN, 10)).toBe(1);
  });

  it('UC-CART-08 caps quantity by available stock', () => {
    expect(normalizeQuantity(12, 5)).toBe(5);
  });

  it('UC-CART-09 allows adding quantity inside stock', () => {
    expect(canAddQuantity(2, 3, 5)).toBe(true);
  });

  it('UC-CART-10 blocks zero or negative additions', () => {
    expect(canAddQuantity(2, 0, 5)).toBe(false);
    expect(canAddQuantity(2, -1, 5)).toBe(false);
  });

  it('UC-CART-11 blocks additions above stock', () => {
    expect(canAddQuantity(4, 2, 5)).toBe(false);
  });

  it('UC-CART-12 builds a cart summary from item rows', () => {
    expect(buildCart([item(), item({ id: 'item-2', quantity: 3, subtotal: 90 })])).toMatchObject({
      total: 250,
      itemCount: 5,
    });
  });
});
