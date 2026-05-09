import type { OrdersRepository, CreateOrderInput } from '../repositories/orders.repository';
import type { Order } from '../entities/order.entity';

export class CreateOrderUseCase {
  constructor(private readonly repository: OrdersRepository) {}

  execute(input: CreateOrderInput): Promise<Order> {
    return this.repository.create(input);
  }
}
