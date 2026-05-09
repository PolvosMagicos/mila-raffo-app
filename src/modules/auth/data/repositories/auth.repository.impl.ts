import type { AuthRepository } from '../../domain/repositories/auth.repository';
import type { AuthSession, AuthTokens, LoginCredentials, RegisterCredentials } from '../../domain/entities/auth.entity';
import type { User } from '../../domain/entities/user.entity';
import type { AuthRemoteDataSource } from '../datasources/auth.remote.datasource';
import type { AuthLocalDataSource } from '../datasources/auth.local.datasource';
import { mapAuthResponseToSession } from '../models/auth-response.model';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private readonly remote: AuthRemoteDataSource,
    private readonly local: AuthLocalDataSource,
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const response = await this.remote.login(credentials);
    const session = mapAuthResponseToSession(response);
    await Promise.all([
      this.local.saveTokens(session.tokens),
      this.local.saveUser(session.user),
    ]);
    return session;
  }

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    const response = await this.remote.register(credentials);
    const session = mapAuthResponseToSession(response);
    await Promise.all([
      this.local.saveTokens(session.tokens),
      this.local.saveUser(session.user),
    ]);
    return session;
  }

  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    await this.remote.logout(accessToken, refreshToken);
  }

  async refreshSession(refreshToken: string): Promise<AuthSession> {
    const response = await this.remote.refreshToken(refreshToken);
    const session = mapAuthResponseToSession(response);
    await Promise.all([
      this.local.saveTokens(session.tokens),
      this.local.saveUser(session.user),
    ]);
    return session;
  }

  async getStoredTokens(): Promise<AuthTokens | null> {
    return this.local.getTokens();
  }

  async getStoredUser(): Promise<User | null> {
    return this.local.getUser();
  }

  async clearSession(): Promise<void> {
    await this.local.clearAll();
  }
}
