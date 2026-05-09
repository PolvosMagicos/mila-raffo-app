import { secureStorage } from '@/core/storage/secure-storage';
import type { AuthTokens } from '../../domain/entities/auth.entity';
import type { User } from '../../domain/entities/user.entity';

const KEYS = {
  ACCESS_TOKEN: 'auth.access_token',
  REFRESH_TOKEN: 'auth.refresh_token',
  USER: 'auth.user',
} as const;

export class AuthLocalDataSource {
  async getTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      secureStorage.get(KEYS.ACCESS_TOKEN),
      secureStorage.get(KEYS.REFRESH_TOKEN),
    ]);

    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  }

  async saveTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      secureStorage.set(KEYS.ACCESS_TOKEN, tokens.accessToken),
      secureStorage.set(KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);
  }

  async getUser(): Promise<User | null> {
    const raw = await secureStorage.get(KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  async saveUser(user: User): Promise<void> {
    await secureStorage.set(KEYS.USER, JSON.stringify(user));
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      secureStorage.delete(KEYS.ACCESS_TOKEN),
      secureStorage.delete(KEYS.REFRESH_TOKEN),
      secureStorage.delete(KEYS.USER),
    ]);
  }
}
