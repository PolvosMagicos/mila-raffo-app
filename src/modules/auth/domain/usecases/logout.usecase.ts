import type { AuthRepository } from '../repositories/auth.repository';

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(accessToken: string, refreshToken?: string): Promise<void> {
    await this.authRepository.logout(accessToken, refreshToken);
    await this.authRepository.clearSession();
  }
}
