import { apiClient } from '@/core/network/api-client';
import { ProductsRemoteDataSource } from './data/datasources/products.remote.datasource';
import { ProductsRepositoryImpl } from './data/repositories/products.repository.impl';
import { GetProductsUseCase } from './domain/usecases/get-products.usecase';
import { GetProductDetailUseCase } from './domain/usecases/get-product-detail.usecase';

const remoteDataSource = new ProductsRemoteDataSource(apiClient);
const productsRepository = new ProductsRepositoryImpl(remoteDataSource);

export const productsModule = {
  productsRepository,
  getProductsUseCase: new GetProductsUseCase(productsRepository),
  getProductDetailUseCase: new GetProductDetailUseCase(productsRepository),
} as const;
