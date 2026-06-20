import type { Order, OrderAddress } from '../entities/order.entity';

export interface CreateOrderItemInput {
  variantId: string;
  quantity: number;
  customization?: string;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  couponCode?: string;
  notes?: string;
}

export interface OrdersRepository {
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order>;
  create(input: CreateOrderInput): Promise<Order>;
  cancel(id: string): Promise<Order>;
}
