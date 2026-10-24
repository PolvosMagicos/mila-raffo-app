import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

export const Notifications: typeof import('expo-notifications') | null =
  Platform.OS === 'web' || (Platform.OS === 'android' && isRunningInExpoGo())
    ? null
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- Android Expo Go throws on import.
    : require('expo-notifications');
