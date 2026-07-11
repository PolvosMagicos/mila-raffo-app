import type { Cart, CartApiItem } from './entities/cart.entity';

export interface CartSummary {
  total: number;
  itemCount: number;
}

export function normalizeQuantity(quantity: number, stockAvailable = Number.POSITIVE_INFINITY): number {
  if (!Number.isFinite(quantity)) return 1;
  const wholeQuantity = Math.trunc(quantity);
  const boundedByMinimum = Math.max(1, wholeQuantity);
  return Math.min(boundedByMinimum, Math.max(0, stockAvailable));
}

export function calculateLineSubtotal(unitPrice: number, quantity: number): number {
  if (unitPrice < 0) {
    throw new Error('El precio unitario no puede ser negativo.');
  }
  if (quantity < 0) {
    throw new Error('La cantidad no puede ser negativa.');
  }
  return Number((unitPrice * quantity).toFixed(2));
}

export function calculateCartSummary(items: Pick<CartApiItem, 'quantity' | 'unitPrice' | 'subtotal'>[]): CartSummary {
  return items.reduce<CartSummary>(
    (summary, item) => ({
      total: Number((summary.total + (item.subtotal || calculateLineSubtotal(item.unitPrice, item.quantity))).toFixed(2)),
      itemCount: summary.itemCount + item.quantity,
    }),
    { total: 0, itemCount: 0 },
  );
}

export function canAddQuantity(currentQuantity: number, quantityToAdd: number, stockAvailable: number): boolean {
  if (quantityToAdd <= 0) return false;
  return currentQuantity + quantityToAdd <= stockAvailable;
}

export function buildCart(items: CartApiItem[]): Cart {
  const summary = calculateCartSummary(items);
  return {
    items,
    total: summary.total,
    itemCount: summary.itemCount,
  };
}
