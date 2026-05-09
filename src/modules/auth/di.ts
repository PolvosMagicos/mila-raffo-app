import { apiClient } from '@/core/network/api-client';
import { AuthRemoteDataSource } from './data/datasources/auth.remote.datasource';
import { AuthLocalDataSource } from './data/datasources/auth.local.datasource';
import { AuthRepositoryImpl } from './data/repositories/auth.repository.impl';
import { LoginUseCase } from './domain/usecases/login.usecase';
import { RegisterUseCase } from './domain/usecases/register.usecase';
import { LogoutUseCase } from './domain/usecases/logout.usecase';
import { RefreshTokenUseCase } from './domain/usecases/refresh-token.usecase';

const remoteDataSource = new AuthRemoteDataSource(apiClient);
const localDataSource = new AuthLocalDataSource();
const authRepository = new AuthRepositoryImpl(remoteDataSource, localDataSource);

export const authModule = {
  authRepository,
  loginUseCase: new LoginUseCase(authRepository),
  registerUseCase: new RegisterUseCase(authRepository),
  logoutUseCase: new LogoutUseCase(authRepository),
  refreshTokenUseCase: new RefreshTokenUseCase(authRepository),
} as const;
