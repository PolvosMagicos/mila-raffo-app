import type { AuthRepository } from '../repositories/auth.repository';
import type { AuthSession } from '../entities/auth.entity';

export class RefreshTokenUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(refreshToken: string): Promise<AuthSession> {
    return this.authRepository.refreshSession(refreshToken);
  }
}
