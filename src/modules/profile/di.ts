import { apiClient } from '@/core/network/api-client';
import { ProfileRemoteDataSource } from './data/datasources/profile.remote.datasource';
import { ProfileRepositoryImpl } from './data/repositories/profile.repository.impl';
import { GetProfileUseCase } from './domain/usecases/get-profile.usecase';
import { UpdateProfileUseCase } from './domain/usecases/update-profile.usecase';

const remoteDataSource = new ProfileRemoteDataSource(apiClient);
const profileRepository = new ProfileRepositoryImpl(remoteDataSource);

export const profileModule = {
  profileRepository,
  getProfileUseCase: new GetProfileUseCase(profileRepository),
  updateProfileUseCase: new UpdateProfileUseCase(profileRepository),
} as const;
