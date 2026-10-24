const nativeModule = {
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: 'ExponentPushToken[test]' })),
};

const remoteDataSource = {
  registerToken: jest.fn(),
  updatePreferences: jest.fn(),
};

beforeEach(() => {
  jest.resetModules();
  jest.doMock('expo-device', () => ({ isDevice: true }));
  jest.doMock('../../di', () => ({ notificationsModule: { remoteDataSource } }));
});

it.each([
  ['android', true, false],
  ['android', false, true],
  ['ios', true, true],
  ['ios', false, true],
  ['web', false, false],
])('loads notifications safely on %s (Expo Go: %s)', async (platform, expoGo, supported) => {
  jest.doMock('react-native', () => ({ Platform: { OS: platform } }));
  jest.doMock('expo', () => ({ isRunningInExpoGo: () => expoGo }));
  const loadNativeModule = jest.fn(() => {
    if (!supported) throw new Error('Notifications must not load in this environment');
    return nativeModule;
  });
  jest.doMock('expo-notifications', loadNativeModule);

  const { useNotificationsStore } = await import('../../presentation/store/notifications.store');
  await useNotificationsStore.getState().registerPushToken();

  expect(loadNativeModule).toHaveBeenCalledTimes(supported ? 1 : 0);
  expect(remoteDataSource.registerToken).toHaveBeenCalledTimes(supported ? 1 : 0);
  expect(useNotificationsStore.getState().pushToken).toBe(supported ? 'ExponentPushToken[test]' : null);
  expect(useNotificationsStore.getState().error).toBeNull();

  await useNotificationsStore.getState().updatePreferences({ notifyOffers: false });
  expect(remoteDataSource.updatePreferences).toHaveBeenCalledWith({ notifyOffers: false });
  expect(useNotificationsStore.getState().notifyOffers).toBe(false);
});
