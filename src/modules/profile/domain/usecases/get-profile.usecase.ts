import type { ProfileRepository } from '../repositories/profile.repository';
import type { Profile } from '../entities/profile.entity';

export class GetProfileUseCase {
  constructor(private readonly repository: ProfileRepository) {}

  execute(): Promise<Profile> {
    return this.repository.getProfile();
  }
}
