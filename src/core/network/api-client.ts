import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { ENV } from '@/core/config/env';
import { secureStorage } from '@/core/storage/secure-storage';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth.access_token',
  REFRESH_TOKEN: 'auth.refresh_token',
} as const;

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function drainQueue(newToken: string) {
  refreshQueue.forEach((resolve) => resolve(newToken));
  refreshQueue = [];
}

function clearQueue() {
  refreshQueue = [];
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await secureStorage.get(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 → try silent refresh once
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't retry auth endpoints (avoids infinite loops)
    const isAuthEndpoint = original?.url?.startsWith('/auth/');
    if (error.response?.status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      // Queue request until the ongoing refresh resolves
      return new Promise<AxiosResponse>((resolve, reject) => {
        refreshQueue.push((newToken: string) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(original));
        });
        // Reject queue if refresh ultimately fails
        setTimeout(() => reject(error), 30000);
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await secureStorage.get(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post<RefreshResponse>(
        `${ENV.API_URL}/auth/refresh`,
        { refreshToken },
      );

      await Promise.all([
        secureStorage.set(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken),
        secureStorage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken),
      ]);

      drainQueue(data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      clearQueue();
      // Signal the auth store to clear session
      await Promise.all([
        secureStorage.delete(STORAGE_KEYS.ACCESS_TOKEN),
        secureStorage.delete(STORAGE_KEYS.REFRESH_TOKEN),
        secureStorage.delete('auth.user'),
      ]);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
