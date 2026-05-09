import type { ProfileRepository } from '../repositories/profile.repository';
import type { Profile, UpdateProfileInput } from '../entities/profile.entity';

export class UpdateProfileUseCase {
  constructor(private readonly repository: ProfileRepository) {}

  execute(input: UpdateProfileInput): Promise<Profile> {
    return this.repository.updateProfile(input);
  }
}
