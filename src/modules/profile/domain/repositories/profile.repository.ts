import type { Profile, UpdateProfileInput, ChangePasswordInput } from '../entities/profile.entity';

export interface ProfileRepository {
  getProfile(): Promise<Profile>;
  updateProfile(input: UpdateProfileInput): Promise<Profile>;
  changePassword(input: ChangePasswordInput): Promise<void>;
}
