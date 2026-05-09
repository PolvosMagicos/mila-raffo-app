import type { AuthRepository } from '../repositories/auth.repository';
import type { AuthSession, RegisterCredentials } from '../entities/auth.entity';

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(credentials: RegisterCredentials): Promise<AuthSession> {
    return this.authRepository.register(credentials);
  }
}
