import type { CartApiItem } from '@/modules/cart';
import type { OrderAddress } from '../../entities/order.entity';
import {
  buildCreateOrderItems,
  calculateCheckoutTotal,
  calculateShippingCost,
  resolvePaymentChannel,
  validateCheckoutStep,
} from '../../checkout-rules';

const address: OrderAddress = {
  firstName: 'Mila',
  lastName: 'Raffo',
  streetAddress: 'Av. Larco 123',
  city: 'Lima',
  stateProvince: 'Lima',
  postalCode: '15074',
  country: 'PE',
};

const cartItem = (overrides: Partial<CartApiItem> = {}): CartApiItem => ({
  id: 'item-1',
  productId: 'p-1',
  variantId: 'v-1',
  productName: 'Vestido Lino',
  colorName: null,
  colorHex: null,
  quantity: 1,
  unitPrice: 120,
  subtotal: 120,
  imageUrl: null,
  stockAvailable: 5,
  ...overrides,
});

describe('checkout rules unit suite', () => {
  it('UC-CHK-01 calculates free standard shipping', () => {
    expect(calculateShippingCost('standard')).toBe(0);
  });

  it('UC-CHK-02 calculates express shipping cost', () => {
    expect(calculateShippingCost('express')).toBe(24);
  });

  it('UC-CHK-03 calculates checkout total with shipping', () => {
    expect(calculateCheckoutTotal(120.5, 'express')).toBe(144.5);
  });

  it('UC-CHK-04 rejects negative checkout subtotal', () => {
    expect(() => calculateCheckoutTotal(-1, 'standard')).toThrow('subtotal');
  });

  it('UC-CHK-05 blocks shipping step without address', () => {
    expect(validateCheckoutStep({ step: 'shipping', items: [cartItem()], deliveryAddress: null })).toBe(
      'Agrega una direccion de entrega antes de continuar.',
    );
  });

  it('UC-CHK-06 blocks review step without address', () => {
    expect(validateCheckoutStep({ step: 'review', items: [cartItem()], deliveryAddress: null })).toBe(
      'Agrega una direccion de entrega antes de realizar el pedido.',
    );
  });

  it('UC-CHK-07 blocks empty carts before checkout advances', () => {
    expect(validateCheckoutStep({ step: 'shipping', items: [], deliveryAddress: address })).toBe('Tu carrito esta vacio.');
  });

  it('UC-CHK-08 returns no error for valid review input', () => {
    expect(validateCheckoutStep({ step: 'review', items: [cartItem()], deliveryAddress: address })).toBeNull();
  });

  it('UC-CHK-09 blocks duplicate placement while an order is processing', () => {
    expect(validateCheckoutStep({ step: 'review', items: [cartItem()], deliveryAddress: address, isPlacingOrder: true })).toBe(
      'Ya estamos procesando tu pedido.',
    );
  });

  it('UC-CHK-10 builds order item payloads from cart rows', () => {
    expect(buildCreateOrderItems([cartItem({ variantId: 'v-2', quantity: 3 })])).toEqual([{ variantId: 'v-2', quantity: 3 }]);
  });

  it('UC-CHK-11 rejects cart rows without variant ids', () => {
    expect(() => buildCreateOrderItems([cartItem({ variantId: '' })])).toThrow('variante');
  });

  it('UC-CHK-12 rejects non-positive order quantities', () => {
    expect(() => buildCreateOrderItems([cartItem({ quantity: 0 })])).toThrow('mayor a cero');
  });

  it('UC-CHK-13 resolves app payment methods to backend payment channels', () => {
    expect(resolvePaymentChannel('card')).toBe('test');
    expect(resolvePaymentChannel('whatsapp')).toBe('bank_transfer');
  });
});
