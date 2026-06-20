import type { AxiosInstance } from 'axios';
import type { Order } from '../../domain/entities/order.entity';
import type { CreateOrderInput } from '../../domain/repositories/orders.repository';

export type OrdersListResponse = Order[] | { data: Order[] };

export class OrdersRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  getAll(): Promise<{ data: OrdersListResponse }> {
    return this.http.get('/orders');
  }

  getById(id: string): Promise<{ data: Order }> {
    return this.http.get(`/orders/${id}`);
  }

  create(input: CreateOrderInput): Promise<{ data: Order }> {
    return this.http.post('/orders', input);
  }

  cancel(id: string): Promise<{ data: Order }> {
    return this.http.patch(`/orders/${id}/cancel`);
  }
}
