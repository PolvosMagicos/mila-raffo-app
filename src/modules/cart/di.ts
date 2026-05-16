import { CartApiDataSource } from './data/datasources/cart.api.datasource';
import { CartRepositoryImpl } from './data/repositories/cart.repository.impl';

const apiDataSource = new CartApiDataSource();
const cartRepository = new CartRepositoryImpl(apiDataSource);

export const cartModule = {
  cartRepository,
} as const;
