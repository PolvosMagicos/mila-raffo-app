import type { ProfileRepository } from '../../domain/repositories/profile.repository';
import type { Profile, UpdateProfileInput, ChangePasswordInput } from '../../domain/entities/profile.entity';
import type { ProfileRemoteDataSource } from '../datasources/profile.remote.datasource';

export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(private readonly remote: ProfileRemoteDataSource) {}

  async getProfile(): Promise<Profile> {
    const { data } = await this.remote.getProfile();
    return data;
  }

  async updateProfile(input: UpdateProfileInput): Promise<Profile> {
    const { data } = await this.remote.updateProfile(input);
    return data;
  }

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await this.remote.changePassword(input);
  }
}
