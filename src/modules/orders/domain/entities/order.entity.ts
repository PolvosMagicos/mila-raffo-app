import type { Address } from '@/modules/addresses/domain/entities/address.entity';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type ShipmentStatus = 'En preparacion' | 'Enviado' | 'Entregado';

export interface OrderItem {
  id: string;
  productId?: string;
  variantId?: string;
  productName: string;
  productImage?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount?: number;
  total?: number;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Shipment {
  id: string;
  status: ShipmentStatus;
  courier?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  items: OrderItem[];
  subtotal?: number;
  discountAmount?: number;
  shippingCost?: number;
  taxAmount?: number;
  total: number;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  address?: Address;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  shipment?: Shipment | null;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
