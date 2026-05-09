import type { AxiosInstance } from 'axios';
import type { Profile, UpdateProfileInput, ChangePasswordInput } from '../../domain/entities/profile.entity';

export class ProfileRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  getProfile(): Promise<{ data: Profile }> {
    return this.http.get('/users/me');
  }

  updateProfile(input: UpdateProfileInput): Promise<{ data: Profile }> {
    return this.http.patch('/users/me', input);
  }

  changePassword(input: ChangePasswordInput): Promise<void> {
    return this.http.patch('/users/me/password', input);
  }
}
