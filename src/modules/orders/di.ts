import { apiClient } from '@/core/network/api-client';
import { OrdersRemoteDataSource } from './data/datasources/orders.remote.datasource';
import { OrdersRepositoryImpl } from './data/repositories/orders.repository.impl';
import { GetOrdersUseCase } from './domain/usecases/get-orders.usecase';
import { CreateOrderUseCase } from './domain/usecases/create-order.usecase';

const remoteDataSource = new OrdersRemoteDataSource(apiClient);
const ordersRepository = new OrdersRepositoryImpl(remoteDataSource);

export const ordersModule = {
  ordersRepository,
  getOrdersUseCase: new GetOrdersUseCase(ordersRepository),
  createOrderUseCase: new CreateOrderUseCase(ordersRepository),
} as const;
