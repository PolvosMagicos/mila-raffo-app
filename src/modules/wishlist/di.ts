import { WishlistApiDataSource } from './data/datasources/wishlist.api.datasource';
import { WishlistRepositoryImpl } from './data/repositories/wishlist.repository.impl';
import { GetWishlistUseCase } from './domain/usecases/get-wishlist.usecase';
import { AddToWishlistUseCase } from './domain/usecases/add-to-wishlist.usecase';
import { RemoveFromWishlistUseCase } from './domain/usecases/remove-from-wishlist.usecase';

const apiDataSource = new WishlistApiDataSource();
const wishlistRepository = new WishlistRepositoryImpl(apiDataSource);

export const wishlistModule = {
  wishlistRepository,
  getWishlistUseCase: new GetWishlistUseCase(wishlistRepository),
  addToWishlistUseCase: new AddToWishlistUseCase(wishlistRepository),
  removeFromWishlistUseCase: new RemoveFromWishlistUseCase(wishlistRepository),
} as const;
