import type { Order, OrderStatus } from '../entities/order.entity';

export interface CreateOrderInput {
  addressId: string;
  notes?: string;
}

export interface OrdersRepository {
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order>;
  create(input: CreateOrderInput): Promise<Order>;
  cancel(id: string): Promise<Order>;
}
