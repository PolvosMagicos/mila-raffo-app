import type { OrdersRepository } from '../repositories/orders.repository';
import type { Order } from '../entities/order.entity';

export class GetOrdersUseCase {
  constructor(private readonly repository: OrdersRepository) {}

  execute(): Promise<Order[]> {
    return this.repository.getAll();
  }
}
