import { apiClient } from '@/core/network/api-client';
import { NotificationsRemoteDataSource } from './data/datasources/notifications.remote.datasource';

const remoteDataSource = new NotificationsRemoteDataSource(apiClient);

export const notificationsModule = {
  remoteDataSource,
} as const;
