import type { AuthSession, AuthTokens, LoginCredentials, RegisterCredentials } from '../entities/auth.entity';
import type { User } from '../entities/user.entity';

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  register(credentials: RegisterCredentials): Promise<AuthSession>;
  logout(accessToken: string, refreshToken?: string): Promise<void>;
  refreshSession(refreshToken: string): Promise<AuthSession>;
  getStoredTokens(): Promise<AuthTokens | null>;
  getStoredUser(): Promise<User | null>;
  clearSession(): Promise<void>;
}
