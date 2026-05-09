import type { OrdersRepository, CreateOrderInput } from '../../domain/repositories/orders.repository';
import type { Order } from '../../domain/entities/order.entity';
import type { OrdersRemoteDataSource } from '../datasources/orders.remote.datasource';

export class OrdersRepositoryImpl implements OrdersRepository {
  constructor(private readonly remote: OrdersRemoteDataSource) {}

  async getAll(): Promise<Order[]> {
    const { data } = await this.remote.getAll();
    return data;
  }

  async getById(id: string): Promise<Order> {
    const { data } = await this.remote.getById(id);
    return data;
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const { data } = await this.remote.create(input);
    return data;
  }

  async cancel(id: string): Promise<Order> {
    const { data } = await this.remote.cancel(id);
    return data;
  }
}
