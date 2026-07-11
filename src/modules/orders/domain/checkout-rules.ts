import type { CartApiItem } from '@/modules/cart';
import type { CreateOrderItemInput } from './repositories/orders.repository';
import type { OrderAddress } from './entities/order.entity';

export type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation';
export type ShippingMethod = 'standard' | 'express';
export type PaymentMethod = 'whatsapp' | 'card';

export interface CheckoutValidationInput {
  step: CheckoutStep;
  items: CartApiItem[];
  deliveryAddress: OrderAddress | null;
  isPlacingOrder?: boolean;
}

export const EXPRESS_SHIPPING_COST = 24;

export function calculateShippingCost(method: ShippingMethod): number {
  return method === 'express' ? EXPRESS_SHIPPING_COST : 0;
}

export function calculateCheckoutTotal(subtotal: number, method: ShippingMethod): number {
  if (subtotal < 0) {
    throw new Error('El subtotal no puede ser negativo.');
  }
  return Number((subtotal + calculateShippingCost(method)).toFixed(2));
}

export function validateCheckoutStep(input: CheckoutValidationInput): string | null {
  if (input.isPlacingOrder) return 'Ya estamos procesando tu pedido.';
  if ((input.step === 'shipping' || input.step === 'review') && !input.deliveryAddress) {
    return input.step === 'shipping'
      ? 'Agrega una direccion de entrega antes de continuar.'
      : 'Agrega una direccion de entrega antes de realizar el pedido.';
  }
  if ((input.step === 'shipping' || input.step === 'review') && input.items.length === 0) {
    return 'Tu carrito esta vacio.';
  }
  return null;
}

export function buildCreateOrderItems(items: Pick<CartApiItem, 'variantId' | 'quantity'>[]): CreateOrderItemInput[] {
  return items.map((item) => {
    if (!item.variantId) {
      throw new Error('Cada item debe tener una variante.');
    }
    if (item.quantity <= 0) {
      throw new Error('La cantidad de cada item debe ser mayor a cero.');
    }
    return {
      variantId: item.variantId,
      quantity: item.quantity,
    };
  });
}

export function resolvePaymentChannel(method: PaymentMethod): 'test' | 'bank_transfer' {
  return method === 'card' ? 'test' : 'bank_transfer';
}
