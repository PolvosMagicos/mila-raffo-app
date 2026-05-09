import { CartLocalDataSource } from './data/datasources/cart.local.datasource';
import { CartRepositoryImpl } from './data/repositories/cart.repository.impl';
import { AddToCartUseCase } from './domain/usecases/add-to-cart.usecase';
import { RemoveFromCartUseCase } from './domain/usecases/remove-from-cart.usecase';

const localDataSource = new CartLocalDataSource();
const cartRepository = new CartRepositoryImpl(localDataSource);

export const cartModule = {
  cartRepository,
  addToCartUseCase: new AddToCartUseCase(cartRepository),
  removeFromCartUseCase: new RemoveFromCartUseCase(cartRepository),
} as const;
