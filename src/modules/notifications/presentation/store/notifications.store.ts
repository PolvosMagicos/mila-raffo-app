import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { notificationsModule } from '../../di';
import type { NotificationPreferences } from '../../domain/entities/notification-preferences.entity';
import { extractErrorMessage } from '@/core/network/extract-error';

interface NotificationsState {
  pushToken: string | null;
  notifyOffers: boolean;
  notifyOrders: boolean;
  isLoading: boolean;
  error: string | null;
}

interface NotificationsActions {
  registerPushToken: () => Promise<void>;
  unregisterPushToken: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  clearError: () => void;
}

const initialState: NotificationsState = {
  pushToken: null,
  notifyOffers: true,
  notifyOrders: true,
  isLoading: false,
  error: null,
};

export const useNotificationsStore = create<NotificationsState & NotificationsActions>((set, get) => ({
  ...initialState,

  registerPushToken: async () => {
    try {
      if (!Device.isDevice) return;

      let { granted } = await Notifications.getPermissionsAsync();

      if (!granted) {
        const result = await Notifications.requestPermissionsAsync();
        granted = result.granted;
      }

      if (!granted) return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';

      await notificationsModule.remoteDataSource.registerToken(token, platform);
      set({ pushToken: token });
    } catch (err) {
      set({ error: extractErrorMessage(err, 'Error al registrar notificaciones') });
    }
  },

  unregisterPushToken: async () => {
    const { pushToken } = get();
    if (!pushToken) return;
    try {
      await notificationsModule.remoteDataSource.unregisterToken(pushToken);
    } catch {
      // Silencioso — siempre limpiar token local
    } finally {
      set({ pushToken: null });
    }
  },

  fetchPreferences: async () => {
    set({ isLoading: true });
    try {
      const prefs = await notificationsModule.remoteDataSource.getPreferences();
      set({ notifyOffers: prefs.notifyOffers, notifyOrders: prefs.notifyOrders });
    } catch {
      // Mantener defaults
    } finally {
      set({ isLoading: false });
    }
  },

  updatePreferences: async (prefs: Partial<NotificationPreferences>) => {
    set({ isLoading: true });
    try {
      await notificationsModule.remoteDataSource.updatePreferences(prefs);
      set(prefs);
    } catch (err) {
      set({ error: extractErrorMessage(err, 'Error al actualizar preferencias') });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export const notificationsStore = {
  getState: () => useNotificationsStore.getState(),
};
