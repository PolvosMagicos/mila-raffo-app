import type { AuthRepository } from '../repositories/auth.repository';
import type { AuthSession, LoginCredentials } from '../entities/auth.entity';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(credentials: LoginCredentials): Promise<AuthSession> {
    return this.authRepository.login(credentials);
  }
}
