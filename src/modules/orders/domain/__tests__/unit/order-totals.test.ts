import type { Order } from '../../entities/order.entity';
import { calculateOrderItemTotal, calculateOrderTotals, canCancelOrder, shipmentStatusForOrder } from '../../order-totals';

describe('order totals unit suite', () => {
  it('UC-ORD-01 calculates item total without discount', () => {
    expect(calculateOrderItemTotal({ quantity: 2, unitPrice: 70 })).toBe(140);
  });

  it('UC-ORD-02 calculates item total with discount', () => {
    expect(calculateOrderItemTotal({ quantity: 2, unitPrice: 70, discount: 15 })).toBe(125);
  });

  it('UC-ORD-03 rejects negative item values', () => {
    expect(() => calculateOrderItemTotal({ quantity: 1, unitPrice: -1 })).toThrow('negativos');
  });

  it('UC-ORD-04 calculates subtotal discount tax shipping and total', () => {
    expect(
      calculateOrderTotals(
        [
          { quantity: 2, unitPrice: 50, discount: 10 },
          { quantity: 1, unitPrice: 80 },
        ],
        24,
        0.18,
      ),
    ).toEqual({
      subtotal: 180,
      discountAmount: 10,
      shippingCost: 24,
      taxAmount: 30.6,
      total: 224.6,
    });
  });

  it('UC-ORD-05 clamps taxable base at zero when discounts exceed subtotal', () => {
    expect(calculateOrderTotals([{ quantity: 1, unitPrice: 10, discount: 20 }], 0, 0.18)).toMatchObject({
      taxAmount: 0,
      total: 0,
    });
  });

  it('UC-ORD-06 rejects negative shipping', () => {
    expect(() => calculateOrderTotals([], -1, 0)).toThrow('costos');
  });

  it('UC-ORD-07 rejects negative tax rate', () => {
    expect(() => calculateOrderTotals([], 0, -0.1)).toThrow('tasas');
  });

  it('UC-ORD-08 allows pending orders to be cancelled', () => {
    expect(canCancelOrder('pending', 'pending')).toBe(true);
  });

  it('UC-ORD-09 allows confirmed paid orders to be cancelled before shipment', () => {
    expect(canCancelOrder('confirmed', 'paid')).toBe(true);
  });

  it('UC-ORD-10 blocks shipped orders from cancellation', () => {
    expect(canCancelOrder('shipped', 'paid')).toBe(false);
  });

  it('UC-ORD-11 blocks refunded orders from cancellation', () => {
    expect(canCancelOrder('confirmed', 'refunded')).toBe(false);
  });

  it('UC-ORD-12 resolves shipment status from explicit shipment first', () => {
    const order = { status: 'pending', shipment: { id: 's-1', status: 'Enviado' } } satisfies Pick<Order, 'status' | 'shipment'>;
    expect(shipmentStatusForOrder(order)).toBe('Enviado');
  });

  it('UC-ORD-13 derives shipment status from delivered order status', () => {
    expect(shipmentStatusForOrder({ status: 'delivered', shipment: null })).toBe('Entregado');
  });

  it('UC-ORD-14 defaults shipment status to preparation', () => {
    expect(shipmentStatusForOrder({ status: 'processing', shipment: null })).toBe('En preparacion');
  });
});
