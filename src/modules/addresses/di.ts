import { apiClient } from '@/core/network/api-client';
import { AddressesRemoteDataSource } from './data/datasources/addresses.remote.datasource';
import { AddressesRepositoryImpl } from './data/repositories/addresses.repository.impl';
import { GetAddressesUseCase } from './domain/usecases/get-addresses.usecase';
import { CreateAddressUseCase } from './domain/usecases/create-address.usecase';

const remoteDataSource = new AddressesRemoteDataSource(apiClient);
const addressesRepository = new AddressesRepositoryImpl(remoteDataSource);

export const addressesModule = {
  addressesRepository,
  getAddressesUseCase: new GetAddressesUseCase(addressesRepository),
  createAddressUseCase: new CreateAddressUseCase(addressesRepository),
} as const;
