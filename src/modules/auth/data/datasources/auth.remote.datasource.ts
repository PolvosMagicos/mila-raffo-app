import type { AxiosInstance } from 'axios';
import type { AuthResponseModel } from '../models/auth-response.model';
import type { LoginCredentials, RegisterCredentials } from '../../domain/entities/auth.entity';

export class AuthRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  async login(credentials: LoginCredentials): Promise<AuthResponseModel> {
    const { data } = await this.http.post<AuthResponseModel>('/auth/login', credentials);
    return data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponseModel> {
    const { data } = await this.http.post<AuthResponseModel>('/auth/register', credentials);
    return data;
  }

  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    await this.http.post(
      '/auth/logout',
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseModel> {
    const { data } = await this.http.post<AuthResponseModel>('/auth/refresh', { refreshToken });
    return data;
  }
}
