import type { Order, OrderItem, OrderStatus, PaymentStatus, ShipmentStatus } from './entities/order.entity';

export interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
}

export function calculateOrderItemTotal(item: Pick<OrderItem, 'quantity' | 'unitPrice' | 'discount'>): number {
  if (item.quantity < 0 || item.unitPrice < 0 || (item.discount ?? 0) < 0) {
    throw new Error('Los importes del pedido no pueden ser negativos.');
  }
  return Number((item.quantity * item.unitPrice - (item.discount ?? 0)).toFixed(2));
}

export function calculateOrderTotals(
  items: Pick<OrderItem, 'quantity' | 'unitPrice' | 'discount'>[],
  shippingCost = 0,
  taxRate = 0,
): OrderTotals {
  if (shippingCost < 0 || taxRate < 0) {
    throw new Error('Los costos y tasas no pueden ser negativos.');
  }
  const subtotal = Number(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2));
  const discountAmount = Number(items.reduce((sum, item) => sum + (item.discount ?? 0), 0).toFixed(2));
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxableBase * taxRate).toFixed(2));
  const total = Number((taxableBase + shippingCost + taxAmount).toFixed(2));

  return { subtotal, discountAmount, shippingCost, taxAmount, total };
}

export function canCancelOrder(status: OrderStatus, paymentStatus: PaymentStatus = 'pending'): boolean {
  if (paymentStatus === 'refunded') return false;
  return status === 'pending' || status === 'confirmed';
}

export function shipmentStatusForOrder(order: Pick<Order, 'status' | 'shipment'>): ShipmentStatus {
  if (order.shipment?.status) return order.shipment.status;
  if (order.status === 'delivered') return 'Entregado';
  if (order.status === 'shipped') return 'Enviado';
  return 'En preparacion';
}
