import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Web doesn't support SecureStore — fallback to in-memory (no persistence)
const memoryStore = new Map<string, string>();

export const secureStorage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return memoryStore.get(key) ?? null;
    return SecureStore.getItemAsync(key);
  },

  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      memoryStore.set(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async delete(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      memoryStore.delete(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
