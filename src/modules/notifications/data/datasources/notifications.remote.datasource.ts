import type { AxiosInstance } from 'axios';
import type { NotificationPreferences } from '../../domain/entities/notification-preferences.entity';

export class NotificationsRemoteDataSource {
  constructor(private readonly client: AxiosInstance) {}

  async registerToken(token: string, platform: 'ios' | 'android'): Promise<void> {
    await this.client.post('/notifications/register', { token, platform });
  }

  async unregisterToken(token: string): Promise<void> {
    await this.client.delete('/notifications/register', { data: { token } });
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const { data } = await this.client.get<NotificationPreferences>('/notifications/preferences');
    return data;
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    await this.client.patch('/notifications/preferences', preferences);
  }
}
