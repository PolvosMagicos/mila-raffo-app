import { secureStorage } from '@/core/storage/secure-storage';

const ONBOARDING_KEY = 'onboarding.completed';

export const onboardingLocalDatasource = {
  async isCompleted(): Promise<boolean> {
    const value = await secureStorage.get(ONBOARDING_KEY);
    return value === 'true';
  },

  async markCompleted(): Promise<void> {
    await secureStorage.set(ONBOARDING_KEY, 'true');
  },

  async reset(): Promise<void> {
    await secureStorage.delete(ONBOARDING_KEY);
  },
};
